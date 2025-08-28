#!/usr/bin/env python3
"""
Script de diagnóstico para verificar a conexão com o banco de dados
e a criação do usuário admin no Railway
"""

import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime

# Configuração básica da aplicação para teste
app = Flask(__name__)

# Configuração do banco usando variáveis de ambiente
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith('postgres://'):
    database_url = database_url.replace('postgres://', 'postgresql://', 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'test-key'

# Inicializar extensões
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Modelo Usuario simplificado para teste
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    tipo = db.Column(db.String(20), nullable=False)
    ultimo_login = db.Column(db.DateTime)
    tentativas_login = db.Column(db.Integer, default=0)
    bloqueado_ate = db.Column(db.DateTime)
    ativo = db.Column(db.Boolean, default=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)

def verificar_banco():
    """Verifica a conectividade e estado do banco de dados"""
    
    print("🔍 DIAGNÓSTICO DO BANCO DE DADOS")
    print("=" * 50)
    
    try:
        # 1. Verificar URL do banco
        print(f"📊 URL do Banco: {app.config['SQLALCHEMY_DATABASE_URI'][:50]}...")
        
        # 2. Verificar conexão
        with app.app_context():
            db.engine.execute('SELECT 1')
            print("✅ Conexão com banco: OK")
            
            # 3. Criar tabelas
            db.create_all()
            print("✅ Criação de tabelas: OK")
            
            # 4. Verificar usuário admin
            admin = Usuario.query.filter_by(username='admin').first()
            if admin:
                print(f"✅ Usuário admin encontrado: {admin.nome}")
                print(f"   - Email: {admin.email}")
                print(f"   - Tipo: {admin.tipo}")
                print(f"   - Ativo: {admin.ativo}")
            else:
                print("❌ Usuário admin não encontrado")
                print("🔧 Criando usuário admin...")
                
                # Criar usuário admin
                hashed_password = bcrypt.generate_password_hash('admin123').decode('utf-8')
                admin = Usuario(
                    username='admin',
                    password=hashed_password,
                    nome='Administrador',
                    email='admin@sistema.com',
                    tipo='admin'
                )
                db.session.add(admin)
                db.session.commit()
                print("✅ Usuário admin criado com sucesso!")
            
            # 5. Testar query de login
            try:
                admin = Usuario.query.filter_by(username='admin').first()
                if admin and bcrypt.check_password_hash(admin.password, 'admin123'):
                    print("✅ Teste de login admin: OK")
                else:
                    print("❌ Teste de login admin: FALHOU")
            except Exception as e:
                print(f"❌ Erro no teste de login: {str(e)}")
                
            # 6. Contar usuários
            total_usuarios = Usuario.query.count()
            print(f"📊 Total de usuários no banco: {total_usuarios}")
            
            print("\n🎯 DIAGNÓSTICO CONCLUÍDO!")
            
    except Exception as e:
        print(f"❌ ERRO CRÍTICO: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    verificar_banco()
