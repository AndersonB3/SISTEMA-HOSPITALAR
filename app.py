# ================================
# IMPORTAÇÕES
# ================================
from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded
from database.models import db, Paciente, Endereco, Movimentacao
from datetime import datetime, timedelta
from logging.handlers import RotatingFileHandler
from functools import wraps
import pyotp
import requests
import os
import re
import logging
import secrets
import hmac
import hashlib

# ================================
# CONFIGURAÇÃO DA APLICAÇÃO
# ================================

app = Flask(__name__)

# Carregar configurações baseadas no ambiente
from config import config
config_name = os.environ.get('FLASK_ENV', 'development')
app.config.from_object(config.get(config_name, config['default']))

# Configuração de logging
if not os.path.exists('logs'):
    os.mkdir('logs')

file_handler = RotatingFileHandler('logs/hospital.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Inicializando sistema hospitalar...')

# Inicialização dos componentes
db.init_app(app)
bcrypt = Bcrypt(app)
csrf = CSRFProtect(app)

# Configuração do CSRF
app.config['WTF_CSRF_TIME_LIMIT'] = None
app.config['WTF_CSRF_SSL_STRICT'] = False

login_manager = LoginManager(app)
login_manager.login_view = 'index'
login_manager.login_message = 'Por favor, faça login para acessar esta página.'

# Configuração do Rate Limiter
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Função para comparação segura de strings (proteção contra timing attacks)
def comparacao_segura(val1, val2):
    return hmac.compare_digest(str(val1).encode(), str(val2).encode())

# Modelo de Log de Auditoria
class LogAuditoria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_hora = db.Column(db.DateTime, default=datetime.utcnow)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    ip_address = db.Column(db.String(45))
    acao = db.Column(db.String(50))
    detalhes = db.Column(db.Text)
    
    def __init__(self, usuario_id, ip_address, acao, detalhes):
        self.usuario_id = usuario_id
        self.ip_address = ip_address
        self.acao = acao
        self.detalhes = detalhes

# Modelo de Usuário
class Usuario(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # admin, medico, enfermeiro, etc.
    ultimo_login = db.Column(db.DateTime)
    tentativas_login = db.Column(db.Integer, default=0)
    bloqueado_ate = db.Column(db.DateTime)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    ultima_alteracao_senha = db.Column(db.DateTime, default=datetime.utcnow)
    token_reset_senha = db.Column(db.String(100), unique=True)
    token_expiracao = db.Column(db.DateTime)
    
    # Campos para 2FA
    two_factor_secret = db.Column(db.String(32))
    two_factor_enabled = db.Column(db.Boolean, default=False)
    backup_codes = db.Column(db.Text)  # Códigos de backup em JSON
    
    # Campos para segurança adicional
    ultimo_ip = db.Column(db.String(45))
    dispositivos_autorizados = db.Column(db.Text)  # Lista de dispositivos em JSON
    ultima_alteracao = db.Column(db.DateTime, default=datetime.utcnow)
    alterado_por = db.Column(db.Integer, db.ForeignKey('usuario.id'))
    
    # Relacionamento para auditoria
    logs = db.relationship('LogAuditoria', backref='usuario', lazy=True)
    
    def gerar_secret_2fa(self):
        """Gera um novo segredo para 2FA"""
        self.two_factor_secret = pyotp.random_base32()
        self.gerar_codigos_backup()
        return self.two_factor_secret
    
    def gerar_codigos_backup(self, quantidade=8):
        """Gera códigos de backup para 2FA"""
        codigos = [secrets.token_hex(4).upper() for _ in range(quantidade)]
        self.backup_codes = ','.join(codigos)
        return codigos
    
    def verificar_2fa(self, codigo):
        """Verifica o código 2FA ou código de backup"""
        if codigo in self.backup_codes.split(','):
            # Remove o código de backup usado
            codigos = self.backup_codes.split(',')
            codigos.remove(codigo)
            self.backup_codes = ','.join(codigos)
            db.session.commit()
            return True
            
        totp = pyotp.TOTP(self.two_factor_secret)
        return comparacao_segura(codigo, totp.now())
    
    def registrar_atividade(self, ip_address, acao, detalhes):
        """Registra uma atividade do usuário no log de auditoria"""
        log = LogAuditoria(
            usuario_id=self.id,
            ip_address=ip_address,
            acao=acao,
            detalhes=detalhes
        )
        db.session.add(log)
        db.session.commit()
    
    def registrar_dispositivo(self, user_agent, ip_address):
        """Registra um novo dispositivo autorizado"""
        import json
        dispositivos = json.loads(self.dispositivos_autorizados or '[]')
        novo_dispositivo = {
            'user_agent': user_agent,
            'ip': ip_address,
            'data_registro': datetime.utcnow().isoformat(),
            'token': secrets.token_hex(16)
        }
        dispositivos.append(novo_dispositivo)
        self.dispositivos_autorizados = json.dumps(dispositivos)
        db.session.commit()
        return novo_dispositivo['token']
    
    @staticmethod
    def validar_senha(senha):
        if len(senha) < 8:
            return False, "A senha deve ter pelo menos 8 caracteres."
        if not re.search(r"[A-Z]", senha):
            return False, "A senha deve conter pelo menos uma letra maiúscula."
        if not re.search(r"[a-z]", senha):
            return False, "A senha deve conter pelo menos uma letra minúscula."
        if not re.search(r"\d", senha):
            return False, "A senha deve conter pelo menos um número."
        if not re.search(r"[ !@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", senha):
            return False, "A senha deve conter pelo menos um caractere especial."
        return True, "Senha válida."
    
    def verificar_senha(self, senha):
        return bcrypt.check_password_hash(self.password, senha)
    
    def bloquear_temporariamente(self):
        self.tentativas_login += 1
        if self.tentativas_login >= 3:  # Bloqueia após 3 tentativas
            self.bloqueado_ate = datetime.now() + timedelta(minutes=15)
        db.session.commit()
    
    def esta_bloqueado(self):
        if self.bloqueado_ate and self.bloqueado_ate > datetime.now():
            return True
        return False
    
    def resetar_tentativas(self):
        self.tentativas_login = 0
        self.bloqueado_ate = None
        db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# Middleware para verificar a necessidade de alteração de senha
@app.before_request
def verificar_senha_expirada():
    if current_user.is_authenticated:
        # Verifica se a senha tem mais de 90 dias
        prazo_expiracao = timedelta(days=90)
        if datetime.utcnow() - current_user.ultima_alteracao_senha > prazo_expiracao:
            if request.endpoint != 'alterar_senha' and request.endpoint != 'logout':
                return jsonify({
                    'status': 'warning',
                    'message': 'Sua senha expirou. Por favor, altere sua senha para continuar.',
                    'redirect': url_for('alterar_senha')
                })

# Manipulador de erro para Rate Limit excedido
@app.errorhandler(RateLimitExceeded)
def handle_ratelimit_error(e):
    return jsonify({
        'status': 'error',
        'message': 'Limite de tentativas excedido. Por favor, aguarde alguns minutos.'
    }), 429

# ================================
# DECORADORES DE SEGURANÇA
# ================================

# Decorador para verificar permissões de admin
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'status': 'error', 'message': 'Acesso não autorizado!'}), 403
        
        if current_user.tipo != 'admin':
            return jsonify({'status': 'error', 'message': 'Acesso não autorizado!'}), 403
            
        return f(*args, **kwargs)
    return decorated_function

# Decorator para APIs que retorna JSON quando não autenticado
def api_login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({
                'error': 'Usuário não autenticado',
                'status': 'auth_required'
            }), 401
        return f(*args, **kwargs)
    return decorated_function

# ================================
# DEFINIÇÃO DOS MÓDULOS DO SISTEMA
# ================================
MODULOS = [
    {'id': 'reception', 'titulo': 'Recepção', 'icone': 'fas fa-user-plus', 'permissoes': ['admin', 'recepcionista']},
    {'id': 'risk', 'titulo': 'Classificação', 'icone': 'fas fa-exclamation-triangle', 'permissoes': ['admin', 'enfermeiro']},
    {'id': 'doctor', 'titulo': 'Clínico Geral', 'icone': 'fas fa-user-md', 'permissoes': ['admin', 'medico']},
    {'id': 'nurse', 'titulo': 'Enfermagem', 'icone': 'fas fa-heartbeat', 'permissoes': ['admin', 'enfermeiro']},
    {'id': 'pharmacy', 'titulo': 'Farmácia', 'icone': 'fas fa-pills', 'permissoes': ['admin', 'farmaceutico']},
    {'id': 'caf', 'titulo': 'CAF', 'icone': 'fas fa-capsules', 'permissoes': ['admin', 'farmaceutico']},
    {'id': 'lab', 'titulo': 'Laboratório', 'icone': 'fas fa-flask', 'permissoes': ['admin', 'laboratorista']},
    {'id': 'nutrition', 'titulo': 'Nutrição', 'icone': 'fas fa-apple-alt', 'permissoes': ['admin', 'nutricionista']},
    {'id': 'inventory', 'titulo': 'Almoxarifado', 'icone': 'fas fa-boxes', 'permissoes': ['admin', 'almoxarife']},
    {'id': 'purchase', 'titulo': 'Compras', 'icone': 'fas fa-shopping-cart', 'permissoes': ['admin', 'comprador']},
    {'id': 'finance', 'titulo': 'Financeiro', 'icone': 'fas fa-dollar-sign', 'permissoes': ['admin', 'financeiro']},
    {'id': 'contracts', 'titulo': 'Contratos', 'icone': 'fas fa-file-contract', 'permissoes': ['admin', 'juridico']},
    {'id': 'accounting', 'titulo': 'Prestação', 'icone': 'fas fa-chart-pie', 'permissoes': ['admin', 'contador']},
    {'id': 'medical-accounts', 'titulo': 'Contas Médicas', 'icone': 'fas fa-file-medical-alt', 'permissoes': ['admin', 'faturista']},
    {'id': 'it', 'titulo': 'TI', 'icone': 'fas fa-laptop-code', 'permissoes': ['admin', 'ti']},
    {'id': 'xray', 'titulo': 'Raio-X', 'icone': 'fas fa-x-ray', 'permissoes': ['admin', 'radiologista']},
    {'id': 'billing', 'titulo': 'Faturamento', 'icone': 'fas fa-file-invoice-dollar', 'permissoes': ['admin', 'faturista']}
]

# Funções auxiliares para os módulos
def get_module_priority(module_id):
    """Define a prioridade de cada módulo"""
    high_priority = ['reception', 'risk', 'doctor', 'nurse', 'pharmacy']
    medium_priority = ['lab', 'xray', 'nutrition', 'medical-accounts']
    
    if module_id in high_priority:
        return 'priority-high'
    elif module_id in medium_priority:
        return 'priority-medium'
    return 'priority-low'

def get_module_status(module_id):
    """Define o status de cada módulo"""
    # Aqui você pode implementar lógica real verificando o status do módulo
    # Por enquanto, vamos simular alguns status
    maintenance = ['it']  # Módulos em manutenção
    offline = []  # Módulos offline
    
    if module_id in maintenance:
        return 'status-maintenance'
    elif module_id in offline:
        return 'status-offline'
    return 'status-active'

# ================================
# ROTAS PRINCIPAIS
# ================================

@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('modulos'))
    return render_template('index.html')


@app.route('/test_edits.html')
def test_edits():
    """Página de teste para edição de pacientes"""
    return send_from_directory('.', 'test_edits.html')

@app.route('/teste_simples.html')
def teste_simples():
    """Página de teste simplificada"""
    return send_from_directory('.', 'teste_simples.html')

@app.route('/test_api_frontend.html')
def test_api_frontend():
    """Página de teste da API frontend"""
    return send_from_directory('.', 'test_api_frontend.html')

@app.route('/modulos')
@login_required
def modulos():
    """Página principal com os módulos do sistema"""
    for modulo in MODULOS:
        modulo['priority_class'] = get_module_priority(modulo['id'])
        modulo['status_class'] = get_module_status(modulo['id'])
    return render_template('modulos.html', modulos=MODULOS)

@app.route('/modulo/<modulo_id>')
@login_required
def modulo(modulo_id):
    """Rota para acessar um módulo específico"""
    modulo = next((m for m in MODULOS if m['id'] == modulo_id), None)
    
    if not modulo:
        flash('Módulo não encontrado.', 'error')
        return redirect(url_for('modulos'))
    
    if current_user.tipo not in modulo['permissoes']:
        flash('Você não tem permissão para acessar este módulo.', 'error')
        return redirect(url_for('modulos'))
    
    # Adiciona prioridade e status ao módulo
    modulo['priority_class'] = get_module_priority(modulo['id'])
    modulo['status_class'] = get_module_status(modulo['id'])
    
    return render_template(f'modulos/{modulo_id}.html', modulo=modulo)

# ================================
# ROTAS DE AUTENTICAÇÃO
# ================================

@app.route('/configurar-2fa', methods=['POST'])
@login_required
def configurar_2fa():
    """Configura a autenticação de dois fatores para o usuário"""
    if not current_user.two_factor_enabled:
        secret = current_user.gerar_secret_2fa()
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            current_user.email,
            issuer_name="Sistema Hospitalar"
        )
        
        current_user.registrar_atividade(
            request.remote_addr,
            "2FA_SETUP",
            "Configuração de autenticação de dois fatores iniciada"
        )
        
        return jsonify({
            'status': 'success',
            'qr_code': provisioning_uri,
            'backup_codes': current_user.backup_codes.split(',')
        })
    
    return jsonify({
        'status': 'error',
        'message': '2FA já está configurado'
    })

@app.route('/verificar-2fa', methods=['POST'])
def verificar_2fa():
    """Verifica o código 2FA durante o login"""
    codigo = request.form.get('codigo')
    token_sessao = request.form.get('token_sessao')
    
    if not codigo or not token_sessao:
        return jsonify({
            'status': 'error',
            'message': 'Código 2FA e token de sessão são obrigatórios'
        })
    
    usuario_id = session.get('usuario_2fa')
    if not usuario_id:
        return jsonify({
            'status': 'error',
            'message': 'Sessão 2FA inválida'
        })
    
    usuario = Usuario.query.get(usuario_id)
    if not usuario or not comparacao_segura(token_sessao, session.get('token_2fa')):
        return jsonify({
            'status': 'error',
            'message': 'Sessão 2FA inválida'
        })
    
    if usuario.verificar_2fa(codigo):
        login_user(usuario)
        session.permanent = True
        
        # Registra o login bem-sucedido
        usuario.registrar_atividade(
            request.remote_addr,
            "LOGIN_2FA",
            "Login com 2FA bem-sucedido"
        )
        
        return jsonify({
            'status': 'success',
            'message': 'Login realizado com sucesso!',
            'tipo': usuario.tipo
        })
    
    return jsonify({
        'status': 'error',
        'message': 'Código 2FA inválido'
    })

@app.route('/login', methods=['POST'])
@limiter.limit("5 per minute")  # Rate limiting para prevenção de força bruta
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # Validações básicas
        if not username or not password:
            return jsonify({
                'status': 'error',
                'message': 'Todos os campos são obrigatórios!'
            })
        
        # Busca o usuário no banco de dados
        usuario = Usuario.query.filter_by(username=username).first()
        
        # Verifica se o usuário existe
        if not usuario:
            app.logger.warning(f'Tentativa de login com usuário inexistente: {username}')
            return jsonify({
                'status': 'error',
                'message': 'Usuário ou senha inválidos!'
            })
            
        # Verifica se o usuário está ativo
        if not usuario.ativo:
            return jsonify({
                'status': 'error',
                'message': 'Esta conta está desativada. Entre em contato com o administrador.'
            })
            
        # Verifica se a conta está bloqueada
        if usuario.esta_bloqueado():
            tempo_restante = (usuario.bloqueado_ate - datetime.now()).total_seconds() / 60
            return jsonify({
                'status': 'error',
                'message': f'Conta temporariamente bloqueada. Tente novamente em {int(tempo_restante)} minutos.'
            })
        # Verifica a senha
        if usuario.verificar_senha(password):
            # Login bem sucedido - primeira etapa
            usuario.resetar_tentativas()
            usuario.ultimo_login = datetime.now()
            usuario.ultimo_ip = request.remote_addr
            db.session.commit()
            
            # Se 2FA está habilitado, inicia processo de verificação
            if usuario.two_factor_enabled:
                token_sessao = secrets.token_hex(32)
                session['usuario_2fa'] = usuario.id
                session['token_2fa'] = token_sessao
                
                usuario.registrar_atividade(
                    request.remote_addr,
                    "LOGIN_PRIMEIRA_ETAPA",
                    "Primeira etapa do login bem-sucedida, aguardando 2FA"
                )
                
                return jsonify({
                    'status': 'pending_2fa',
                    'message': 'Por favor, insira o código 2FA',
                    'token': token_sessao
                })
            
            # Se não tem 2FA, completa o login
            login_user(usuario)
            session.permanent = True
            
            # Registra a atividade de login
            usuario.registrar_atividade(
                request.remote_addr,
                "LOGIN",
                "Login bem-sucedido"
            )
            
            return jsonify({
                'status': 'success',
                'message': 'Login realizado com sucesso!',
                'tipo': usuario.tipo
            })
        
        # Senha incorreta
        usuario.bloquear_temporariamente()
        
        msg = 'Usuário ou senha inválidos!'
        if usuario.tentativas_login >= 2:  # Aviso na penúltima tentativa
            msg += f' Mais {4 - usuario.tentativas_login} tentativa(s) antes do bloqueio temporário.'
            
        return jsonify({
            'status': 'error',
            'message': msg
        })

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({
        'status': 'success',
        'message': 'Logout realizado com sucesso!'
    })

@app.route('/alterar-senha', methods=['POST'])
@login_required
def alterar_senha():
    senha_atual = request.form.get('senha_atual')
    nova_senha = request.form.get('nova_senha')
    
    # Validação da senha atual
    if not current_user.verificar_senha(senha_atual):
        return jsonify({
            'status': 'error',
            'message': 'Senha atual incorreta!'
        })
    
    # Validação da nova senha
    valida, mensagem = Usuario.validar_senha(nova_senha)
    if not valida:
        return jsonify({
            'status': 'error',
            'message': mensagem
        })
    
    # Atualiza a senha
    current_user.password = bcrypt.generate_password_hash(nova_senha).decode('utf-8')
    current_user.ultima_alteracao_senha = db.func.now()
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Senha alterada com sucesso!'
    })

@app.route('/login/certificado', methods=['POST'])
def login_certificado():
    # Aqui será implementada a lógica de autenticação com certificado digital
    return jsonify({
        'status': 'success',
        'message': 'Login com certificado realizado com sucesso!'
    })

def criar_admin_padrao():
    """Cria usuário administrador padrão se não existir"""
    admin = Usuario.query.filter_by(username='admin').first()
    if not admin:
        hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
        
        admin = Usuario(
            username='admin',
            password=hashed_password,
            nome='Administrador',
            email='admin@sistema.com',
            tipo='admin',
            ultimo_login=None,
            tentativas_login=0,
            bloqueado_ate=None
        )
        db.session.add(admin)
        db.session.commit()
        print("Usuário administrador criado com sucesso!")

# ================================
# API DE PACIENTES
# ================================
@app.route('/api/pacientes', methods=['GET'])
@csrf.exempt  # Desabilitar CSRF para a API
@api_login_required
def buscar_pacientes():
    search = request.args.get('search', '')
    
    # Log detalhado para debug
    app.logger.info(f"[BUSCA_PACIENTES] Requisição recebida - Search: '{search}'")
    app.logger.info(f"[BUSCA_PACIENTES] Headers: {dict(request.headers)}")
    app.logger.info(f"[BUSCA_PACIENTES] User: {current_user.username if current_user.is_authenticated else 'Não autenticado'}")
    
    try:
        if search:
            app.logger.info(f"[BUSCA_PACIENTES] Buscando por: '{search}'")
            pacientes = Paciente.query.filter(
                db.or_(
                    Paciente.nome.ilike(f'%{search}%'),
                    Paciente.cpf.like(f'%{search}%'),
                    Paciente.prontuario.like(f'%{search}%')
                )
            ).all()
        else:
            app.logger.info("[BUSCA_PACIENTES] Buscando todos os pacientes")
            pacientes = Paciente.query.all()
        
        app.logger.info(f"[BUSCA_PACIENTES] Encontrados: {len(pacientes)} pacientes")
        
        resultado = [p.to_dict() for p in pacientes]
        app.logger.info(f"[BUSCA_PACIENTES] Retornando {len(resultado)} registros")
        
        return jsonify(resultado)
        
    except Exception as e:
        app.logger.error(f"[BUSCA_PACIENTES] Erro: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/pacientes', methods=['POST'])
@csrf.exempt  # Desabilitar CSRF para a API
@api_login_required
def cadastrar_paciente():
    try:
        # Verificar se o request contém JSON
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
            
        dados = request.get_json()
        
        # Verificar se dados foram recebidos
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        # Validar campos obrigatórios
        if not dados.get('nome'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
            
        if not dados.get('data_nascimento'):
            return jsonify({'error': 'Data de nascimento é obrigatória'}), 400
            
        # Converter data de string para objeto date
        try:
            from datetime import datetime
            data_nascimento_str = dados['data_nascimento']
            data_nascimento = datetime.strptime(data_nascimento_str, '%Y-%m-%d').date()
        except ValueError as e:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        # Gerar prontuário automaticamente
        ultimo_paciente = Paciente.query.order_by(Paciente.id.desc()).first()
        if ultimo_paciente:
            ultimo_numero = int(ultimo_paciente.prontuario) if ultimo_paciente.prontuario.isdigit() else 0
            novo_prontuario = str(ultimo_numero + 1).zfill(6)
        else:
            novo_prontuario = "000001"
        
        # Criar novo paciente
        novo_paciente = Paciente(
            prontuario=novo_prontuario,
            nome=dados['nome'],
            cpf=dados.get('cpf'),
            rg=dados.get('rg'),
            data_nascimento=data_nascimento,  # Usar objeto date convertido
            sexo=dados.get('sexo', 'M'),
            raca=dados.get('raca', 'NÃO INFORMADA'),
            nacionalidade=dados.get('nacionalidade', 'BRASILEIRA'),
            nome_mae=dados.get('nome_mae'),
            mae_desconhecida=dados.get('mae_desconhecida', False),
            nome_pai=dados.get('nome_pai'),
            email=dados.get('email'),
            telefone=dados.get('telefone'),
            convenio=dados.get('convenio', 'sus'),
            numero_cartao=dados.get('numero_cartao'),
            titular_cartao=dados.get('titular_cartao')
        )
        
        db.session.add(novo_paciente)
        db.session.commit()
        
        # Se tiver dados de endereço, criar o registro de endereço
        if 'cep' in dados and dados['cep']:
            endereco = Endereco(
                paciente_id=novo_paciente.id,
                cep=dados['cep'],
                estado=dados['estado'],
                cidade=dados['cidade'],
                bairro=dados.get('bairro', 'NÃO INFORMADO'),
                logradouro=dados.get('logradouro', 'NÃO INFORMADO'),
                numero=dados.get('numero', 'S/N'),
                complemento=dados.get('complemento'),
                ponto_referencia=dados.get('ponto_referencia')
            )
            db.session.add(endereco)
            db.session.commit()
        
        return jsonify(novo_paciente.to_dict()), 201
        
    except KeyError as e:
        db.session.rollback()
        return jsonify({'error': f'Campo obrigatório ausente: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

# Rotas auxiliares para o módulo de recepção
@app.route('/api/validar-cpf', methods=['POST'])
@csrf.exempt
@api_login_required
def validar_cpf():
    """Valida CPF usando algoritmo oficial"""
    try:
        dados = request.get_json()
        cpf = dados.get('cpf', '').replace('.', '').replace('-', '')
        
        if len(cpf) != 11 or not cpf.isdigit():
            return jsonify({'valid': False, 'message': 'CPF deve conter 11 dígitos'})
        
        # Verificar se todos os dígitos são iguais
        if cpf == cpf[0] * 11:
            return jsonify({'valid': False, 'message': 'CPF inválido'})
        
        # Validação do primeiro dígito verificador
        soma = sum(int(cpf[i]) * (10 - i) for i in range(9))
        resto = soma % 11
        digito1 = 0 if resto < 2 else 11 - resto
        
        if int(cpf[9]) != digito1:
            return jsonify({'valid': False, 'message': 'CPF inválido'})
        
        # Validação do segundo dígito verificador
        soma = sum(int(cpf[i]) * (11 - i) for i in range(10))
        resto = soma % 11
        digito2 = 0 if resto < 2 else 11 - resto
        
        if int(cpf[10]) != digito2:
            return jsonify({'valid': False, 'message': 'CPF inválido'})
        
        # Verificar se CPF já existe no banco
        paciente_existente = Paciente.query.filter_by(cpf=cpf).first()
        if paciente_existente:
            return jsonify({
                'valid': False, 
                'message': f'CPF já cadastrado para {paciente_existente.nome} (Prontuário: {paciente_existente.prontuario})'
            })
        
        return jsonify({'valid': True, 'message': 'CPF válido'})
        
    except Exception as e:
        return jsonify({'valid': False, 'message': f'Erro na validação: {str(e)}'}), 500

@app.route('/api/consultar-cep/<cep>')
@csrf.exempt
@api_login_required
def consultar_cep(cep):
    """Consulta CEP usando API ViaCEP"""
    try:
        # Remove caracteres não numéricos
        cep_limpo = ''.join(filter(str.isdigit, cep))
        
        if len(cep_limpo) != 8:
            return jsonify({'error': 'CEP deve conter 8 dígitos'}), 400
        
        # Formatar CEP
        cep_formatado = f"{cep_limpo[:5]}-{cep_limpo[5:]}"
        
        # Fazer requisição para ViaCEP
        response = requests.get(f'https://viacep.com.br/ws/{cep_limpo}/json/', timeout=5)
        
        if response.status_code != 200:
            return jsonify({'error': 'Erro ao consultar CEP'}), 400
        
        dados = response.json()
        
        if 'erro' in dados:
            return jsonify({'error': 'CEP não encontrado'}), 404
        
        return jsonify({
            'cep': cep_formatado,
            'logradouro': dados.get('logradouro', ''),
            'bairro': dados.get('bairro', ''),
            'cidade': dados.get('localidade', ''),
            'estado': dados.get('uf', ''),
            'complemento': dados.get('complemento', ''),
            'success': True
        })
        
    except requests.exceptions.RequestException:
        return jsonify({'error': 'Erro de conexão com o serviço de CEP'}), 500
    except Exception as e:
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/proximo-prontuario')
@csrf.exempt
@api_login_required
def proximo_prontuario():
    """Gera o próximo número de prontuário"""
    try:
        ultimo_paciente = Paciente.query.order_by(Paciente.id.desc()).first()
        if ultimo_paciente:
            ultimo_numero = int(ultimo_paciente.prontuario) if ultimo_paciente.prontuario.isdigit() else 0
            novo_numero = ultimo_numero + 1
        else:
            novo_numero = 1
        
        return jsonify({
            'numero': str(novo_numero).zfill(6),
            'success': True
        })
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar prontuário: {str(e)}'}), 500

@app.route('/api/imprimir-etiqueta/<int:paciente_id>')
@csrf.exempt
@login_required
def imprimir_etiqueta(paciente_id):
    """Gera dados para impressão de etiqueta do paciente"""
    try:
        paciente = Paciente.query.get_or_404(paciente_id)
        
        # Calcular idade
        from datetime import date
        hoje = date.today()
        idade = hoje.year - paciente.data_nascimento.year
        if hoje.month < paciente.data_nascimento.month or \
           (hoje.month == paciente.data_nascimento.month and hoje.day < paciente.data_nascimento.day):
            idade -= 1
        
        etiqueta_data = {
            'prontuario': paciente.prontuario,
            'nome': paciente.nome,
            'data_nascimento': paciente.data_nascimento.strftime('%d/%m/%Y'),
            'idade': f"{idade} anos",
            'sexo': 'Masculino' if paciente.sexo == 'M' else 'Feminino',
            'nome_mae': paciente.nome_mae or 'Não informado',
            'data_impressao': hoje.strftime('%d/%m/%Y %H:%M'),
            'usuario': current_user.nome
        }
        
        return jsonify(etiqueta_data)
        
    except Exception as e:
        return jsonify({'error': f'Erro ao gerar etiqueta: {str(e)}'}), 500

@app.route('/api/paciente/<int:paciente_id>')
@csrf.exempt
@api_login_required
def obter_paciente(paciente_id):
    """Obtém dados completos de um paciente"""
    try:
        paciente = Paciente.query.get_or_404(paciente_id)
        
        # Buscar endereço principal do paciente
        endereco = Endereco.query.filter_by(paciente_id=paciente.id, principal=True).first()
        
        dados_paciente = {
            'id': paciente.id,
            'prontuario': paciente.prontuario,
            'nome': paciente.nome,
            'cpf': paciente.cpf,
            'rg': paciente.rg,
            'data_nascimento': paciente.data_nascimento.strftime('%Y-%m-%d') if paciente.data_nascimento else '',
            'sexo': paciente.sexo,
            'raca': paciente.raca,
            'nacionalidade': paciente.nacionalidade,
            'telefone': paciente.telefone,
            'nome_mae': paciente.nome_mae,
            'nome_pai': paciente.nome_pai,
            'email': paciente.email,
            'mae_desconhecida': paciente.mae_desconhecida,
            'convenio': paciente.convenio,
            'numero_cartao': paciente.numero_cartao,
            'titular_cartao': paciente.titular_cartao,
            'data_cadastro': paciente.data_cadastro.strftime('%d/%m/%Y %H:%M') if paciente.data_cadastro else ''
        }
        
        # Adicionar dados de endereço se existir
        if endereco:
            dados_paciente.update({
                'cep': endereco.cep,
                'estado': endereco.estado,
                'cidade': endereco.cidade,
                'bairro': endereco.bairro,
                'logradouro': endereco.logradouro,
                'numero': endereco.numero,
                'complemento': endereco.complemento,
                'ponto_referencia': endereco.ponto_referencia
            })
        
        return jsonify(dados_paciente)
        
    except Exception as e:
        return jsonify({'error': f'Erro ao buscar paciente: {str(e)}'}), 500

@app.route('/api/paciente/<int:paciente_id>', methods=['PUT'])
@csrf.exempt
@api_login_required
def atualizar_paciente(paciente_id):
    """Atualiza dados de um paciente existente"""
    try:
        # Verificar se o request contém JSON
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
            
        dados = request.get_json()
        
        # Verificar se dados foram recebidos
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Buscar paciente existente
        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return jsonify({'error': 'Paciente não encontrado'}), 404
            
        # Validar campos obrigatórios
        if not dados.get('nome'):
            return jsonify({'error': 'Nome é obrigatório'}), 400
            
        # Validar e converter data de nascimento se fornecida
        # Validar e converter data de nascimento se fornecida
        data_nascimento = None
        if dados.get('data_nascimento'):
            try:
                from datetime import datetime
                data_nascimento_str = dados['data_nascimento']
                data_nascimento = datetime.strptime(data_nascimento_str, '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        else:
            # Manter data existente se não fornecida
            data_nascimento = paciente.data_nascimento
        
        # Atualizar dados do paciente
        paciente.nome = dados['nome']
        paciente.cpf = dados.get('cpf')
        paciente.rg = dados.get('rg')
        paciente.data_nascimento = data_nascimento
        paciente.sexo = dados.get('sexo', 'M')
        paciente.raca = dados.get('raca', 'NÃO INFORMADA')
        paciente.nacionalidade = dados.get('nacionalidade', 'BRASILEIRA')
        paciente.nome_mae = dados.get('nome_mae')
        paciente.mae_desconhecida = dados.get('mae_desconhecida', False)
        paciente.nome_pai = dados.get('nome_pai')
        paciente.email = dados.get('email')
        paciente.telefone = dados.get('telefone')
        paciente.convenio = dados.get('convenio', 'sus')
        paciente.numero_cartao = dados.get('numero_cartao')
        paciente.titular_cartao = dados.get('titular_cartao')
        
        # Atualizar/criar endereço se fornecido
        if 'cep' in dados and dados['cep']:
            endereco = Endereco.query.filter_by(paciente_id=paciente.id, principal=True).first()
            
            if endereco:
                # Atualizar endereço existente
                endereco.cep = dados['cep']
                endereco.estado = dados['estado']
                endereco.cidade = dados['cidade']
                endereco.bairro = dados.get('bairro', 'NÃO INFORMADO')
                endereco.logradouro = dados.get('logradouro', 'NÃO INFORMADO')
                endereco.numero = dados.get('numero', 'S/N')
                endereco.complemento = dados.get('complemento')
                endereco.ponto_referencia = dados.get('ponto_referencia')
            else:
                # Criar novo endereço
                endereco = Endereco(
                    paciente_id=paciente.id,
                    cep=dados['cep'],
                    estado=dados['estado'],
                    cidade=dados['cidade'],
                    bairro=dados.get('bairro', 'NÃO INFORMADA'),
                    logradouro=dados.get('logradouro', 'NÃO INFORMADA'),
                    numero=dados.get('numero', 'S/N'),
                    complemento=dados.get('complemento'),
                    ponto_referencia=dados.get('ponto_referencia'),
                    principal=True
                )
                db.session.add(endereco)
        
        # Salvar alterações
        db.session.commit()
        
        # Registrar log de auditoria
        if current_user:
            current_user.registrar_atividade(
                request.remote_addr,
                "PACIENTE_ATUALIZADO",
                f"Paciente {paciente.nome} (ID: {paciente.id}) foi atualizado"
            )
        
        return jsonify(paciente.to_dict()), 200
        
    except KeyError as e:
        db.session.rollback()
        return jsonify({'error': f'Campo obrigatório ausente: {str(e)}'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

# ================================
# API DE MOVIMENTAÇÕES
# ================================

@app.route('/api/movimentacoes', methods=['POST'])
@csrf.exempt
@api_login_required
def criar_movimentacao():
    """Cria uma nova movimentação para um paciente"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
            
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
            
        # Validar campos obrigatórios
        if not dados.get('paciente_id'):
            return jsonify({'error': 'ID do paciente é obrigatório'}), 400
            
        if not dados.get('tipo'):
            return jsonify({'error': 'Tipo de movimentação é obrigatório'}), 400
            
        if not dados.get('status'):
            return jsonify({'error': 'Status é obrigatório'}), 400
        
        # Verificar se o paciente existe
        paciente = Paciente.query.get(dados['paciente_id'])
        if not paciente:
            return jsonify({'error': 'Paciente não encontrado'}), 404
        
        # Criar nova movimentação
        nova_movimentacao = Movimentacao(
            paciente_id=dados['paciente_id'],
            tipo=dados['tipo'],
            status=dados['status'],
            prioridade=dados.get('prioridade'),
            profissional_responsavel=dados.get('profissional_responsavel'),
            observacoes=dados.get('observacoes'),
            usuario_id=current_user.id
        )
        
        db.session.add(nova_movimentacao)
        db.session.commit()
        
        # Log de auditoria
        current_user.registrar_atividade(
            request.remote_addr,
            "MOVIMENTACAO_CRIADA",
            f"Nova movimentação criada para paciente {paciente.nome} (ID: {paciente.id})"
        )
        
        app.logger.info(f"Movimentação criada: ID {nova_movimentacao.id} para paciente {paciente.nome}")
        
        return jsonify(nova_movimentacao.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar movimentação: {str(e)}")
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/movimentacoes/paciente/<int:paciente_id>', methods=['GET'])
@csrf.exempt
@api_login_required
def listar_movimentacoes_paciente(paciente_id):
    """Lista todas as movimentações de um paciente"""
    try:
        # Verificar se o paciente existe
        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return jsonify({'error': 'Paciente não encontrado'}), 404
        
        # Buscar movimentações do paciente (apenas as ativas para exclusão física)
        movimentacoes = Movimentacao.query.filter(
            Movimentacao.paciente_id == paciente_id
        ).order_by(Movimentacao.data_entrada.desc()).all()
        
        return jsonify([mov.to_dict() for mov in movimentacoes])
        
    except Exception as e:
        app.logger.error(f"Erro ao listar movimentações do paciente {paciente_id}: {str(e)}")
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/movimentacoes/<int:movimentacao_id>', methods=['PUT'])
@csrf.exempt
@api_login_required
def atualizar_movimentacao(movimentacao_id):
    """Atualiza uma movimentação existente"""
    try:
        if not request.is_json:
            return jsonify({'error': 'Content-Type deve ser application/json'}), 400
            
        dados = request.get_json()
        
        if not dados:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        # Buscar movimentação
        movimentacao = Movimentacao.query.get(movimentacao_id)
        if not movimentacao:
            return jsonify({'error': 'Movimentação não encontrada'}), 404
        
        # Atualizar campos fornecidos
        if 'status' in dados:
            movimentacao.status = dados['status']
        if 'prioridade' in dados:
            movimentacao.prioridade = dados['prioridade']
        if 'profissional_responsavel' in dados:
            movimentacao.profissional_responsavel = dados['profissional_responsavel']
        if 'observacoes' in dados:
            movimentacao.observacoes = dados['observacoes']
        if 'data_saida' in dados and dados['data_saida']:
            from datetime import datetime
            movimentacao.data_saida = datetime.fromisoformat(dados['data_saida'].replace('Z', '+00:00'))
        
        movimentacao.atualizado_em = datetime.utcnow()
        db.session.commit()
        
        # Log de auditoria
        current_user.registrar_atividade(
            request.remote_addr,
            "MOVIMENTACAO_ATUALIZADA",
            f"Movimentação ID {movimentacao.id} atualizada"
        )
        
        app.logger.info(f"Movimentação atualizada: ID {movimentacao.id}")
        
        return jsonify(movimentacao.to_dict())
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao atualizar movimentação {movimentacao_id}: {str(e)}")
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/movimentacoes/<int:movimentacao_id>', methods=['DELETE'])
@csrf.exempt
@api_login_required
def excluir_movimentacao(movimentacao_id):
    """Exclui permanentemente uma movimentação do banco de dados"""
    try:
        app.logger.info(f"[DELETE] Tentativa de exclusão da movimentação ID {movimentacao_id}")
        
        # Buscar movimentação
        movimentacao = Movimentacao.query.get(movimentacao_id)
        if not movimentacao:
            app.logger.warning(f"[DELETE] Movimentação ID {movimentacao_id} não encontrada")
            return jsonify({'error': 'Movimentação não encontrada'}), 404
        
        app.logger.info(f"[DELETE] Movimentação encontrada: {movimentacao.tipo} - {movimentacao.status}")
        
        # Verificar se pode ser excluída (não finalizada)
        if movimentacao.status == 'finalizado':
            app.logger.warning(f"[DELETE] Tentativa de excluir movimentação finalizada ID {movimentacao_id}")
            return jsonify({'error': 'Não é possível excluir movimentações finalizadas'}), 400
        
        paciente_nome = movimentacao.paciente.nome if movimentacao.paciente else "Desconhecido"
        
        # EXCLUSÃO FÍSICA - remover completamente do banco
        app.logger.info(f"[DELETE] Executando exclusão física da movimentação ID {movimentacao_id}")
        db.session.delete(movimentacao)
        db.session.commit()
        
        app.logger.info(f"[DELETE] Exclusão física concluída para movimentação ID {movimentacao_id}")
        
        # Verificar se realmente foi excluída
        verificacao = Movimentacao.query.get(movimentacao_id)
        if verificacao is None:
            app.logger.info(f"[DELETE] Verificação confirmada: movimentação ID {movimentacao_id} não existe mais no banco")
        else:
            app.logger.error(f"[DELETE] PROBLEMA: movimentação ID {movimentacao_id} ainda existe no banco após exclusão!")
        
        # Log de auditoria
        current_user.registrar_atividade(
            request.remote_addr,
            "MOVIMENTACAO_EXCLUIDA",
            f"Movimentação ID {movimentacao_id} excluída permanentemente para paciente {paciente_nome}"
        )
        
        return jsonify({
            'message': 'Movimentação excluída permanentemente',
            'id': movimentacao_id,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"[DELETE] Erro ao excluir movimentação {movimentacao_id}: {str(e)}")
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

@app.route('/api/debug/movimentacoes/paciente/<int:paciente_id>', methods=['GET'])
@csrf.exempt
@api_login_required
def debug_movimentacoes_paciente(paciente_id):
    """Debug: Mostra todas as movimentações no banco (incluindo inativas)"""
    try:
        # Buscar TODAS as movimentações do paciente (incluindo inativas)
        movimentacoes_ativas = db.session.query(Movimentacao).filter(
            Movimentacao.paciente_id == paciente_id,
            Movimentacao.ativo == True
        ).all()
        
        movimentacoes_inativas = db.session.query(Movimentacao).filter(
            Movimentacao.paciente_id == paciente_id,
            Movimentacao.ativo == False
        ).all()
        
        todas_movimentacoes = db.session.query(Movimentacao).filter(
            Movimentacao.paciente_id == paciente_id
        ).all()
        
        return jsonify({
            'paciente_id': paciente_id,
            'total_movimentacoes': len(todas_movimentacoes),
            'movimentacoes_ativas': len(movimentacoes_ativas),
            'movimentacoes_inativas': len(movimentacoes_inativas),
            'movimentacoes': [mov.to_dict() for mov in todas_movimentacoes],
            'timestamp_consulta': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': f'Erro no debug: {str(e)}'}), 500

# ================================
# INICIALIZAÇÃO DA APLICAÇÃO
# ================================

def inicializar_banco():
    """Inicializa o banco de dados e cria usuário admin"""
    try:
        with app.app_context():
            # Criar tabelas do banco de dados se não existirem
            app.logger.info("Criando tabelas do banco de dados...")
            db.create_all()
            app.logger.info("Tabelas criadas com sucesso!")
            
            # Criar usuário admin padrão se não existir
            app.logger.info("Verificando usuário admin...")
            criar_admin_padrao()
            app.logger.info("Inicialização do banco concluída!")
            
    except Exception as e:
        app.logger.error(f"Erro na inicialização do banco: {str(e)}")
        import traceback
        app.logger.error(traceback.format_exc())

# Inicializar banco sempre que o módulo for carregado
inicializar_banco()

if __name__ == '__main__':
    # Configuração para produção e desenvolvimento
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    app.run(host='0.0.0.0', port=port, debug=debug)
