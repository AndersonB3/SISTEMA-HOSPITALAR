from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Paciente(db.Model):
    __tablename__ = 'pacientes'
    
    id = db.Column(db.Integer, primary_key=True)
    prontuario = db.Column(db.String(20), unique=True, nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    data_nascimento = db.Column(db.Date, nullable=False)
    rg = db.Column(db.String(20))
    cpf = db.Column(db.String(14))
    sexo = db.Column(db.String(1), nullable=False)
    raca = db.Column(db.String(20), nullable=False)
    nacionalidade = db.Column(db.String(50), nullable=False, default='brasileiro')
    nome_mae = db.Column(db.String(100))
    mae_desconhecida = db.Column(db.Boolean, default=False)
    nome_pai = db.Column(db.String(100))
    email = db.Column(db.String(100))
    telefone = db.Column(db.String(20))
    
    # Campos de convênio
    convenio = db.Column(db.String(50), default='sus')
    numero_cartao = db.Column(db.String(50))
    titular_cartao = db.Column(db.String(100))
    
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    ativo = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'prontuario': self.prontuario,
            'nome': self.nome,
            'data_nascimento': self.data_nascimento.isoformat() if self.data_nascimento else None,
            'rg': self.rg,
            'cpf': self.cpf,
            'sexo': self.sexo,
            'raca': self.raca,
            'nacionalidade': self.nacionalidade,
            'nome_mae': self.nome_mae,
            'mae_desconhecida': self.mae_desconhecida,
            'nome_pai': self.nome_pai,
            'email': self.email,
            'telefone': self.telefone,
            'convenio': self.convenio,
            'numero_cartao': self.numero_cartao,
            'titular_cartao': self.titular_cartao,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'ativo': self.ativo
        }

class Endereco(db.Model):
    __tablename__ = 'enderecos'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    cep = db.Column(db.String(9), nullable=False)
    estado = db.Column(db.String(2), nullable=False)
    cidade = db.Column(db.String(100), nullable=False)
    bairro = db.Column(db.String(100), nullable=False)
    logradouro = db.Column(db.String(100), nullable=False)
    numero = db.Column(db.String(10), nullable=False)
    complemento = db.Column(db.String(100))
    ponto_referencia = db.Column(db.String(200))
    principal = db.Column(db.Boolean, default=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    paciente = db.relationship('Paciente', backref=db.backref('enderecos', lazy=True))

class Movimentacao(db.Model):
    __tablename__ = 'movimentacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)  # emergencia, consulta, exame, etc.
    status = db.Column(db.String(50), nullable=False)  # aguardando_acolhimento, em_atendimento, finalizado, etc.
    prioridade = db.Column(db.String(50))  # idoso_60, gestante, crianca, etc.
    profissional_responsavel = db.Column(db.String(100))  # Nome do profissional
    observacoes = db.Column(db.Text)
    data_entrada = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    data_saida = db.Column(db.DateTime)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)
    atualizado_em = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    usuario_id = db.Column(db.Integer, nullable=False)  # ID do usuário que criou a movimentação
    ativo = db.Column(db.Boolean, default=True)
    
    paciente = db.relationship('Paciente', backref=db.backref('movimentacoes', lazy=True, order_by='Movimentacao.data_entrada.desc()'))
    
    def to_dict(self):
        return {
            'id': self.id,
            'paciente_id': self.paciente_id,
            'tipo': self.tipo,
            'status': self.status,
            'prioridade': self.prioridade,
            'profissional_responsavel': self.profissional_responsavel,
            'observacoes': self.observacoes,
            'data_entrada': self.data_entrada.isoformat() if self.data_entrada else None,
            'data_saida': self.data_saida.isoformat() if self.data_saida else None,
            'data_movimentacao': self.data_entrada.isoformat() if self.data_entrada else None,  # Alias para compatibilidade
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None,
            'usuario_id': self.usuario_id,
            'ativo': self.ativo
        }
