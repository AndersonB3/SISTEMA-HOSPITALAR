import os
from datetime import timedelta

class Config:
    """Configurações base da aplicação"""
    
    # Chave secreta
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    
    # Configurações de sessão
    PERMANENT_SESSION_LIFETIME = timedelta(minutes=int(os.environ.get('SESSION_LIFETIME_MINUTES', 30)))
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # Configurações de banco de dados
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Rate limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # Configurações de segurança
    WTF_CSRF_TIME_LIMIT = None
    WTF_CSRF_SSL_STRICT = False

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///hospital.db'
    SESSION_COOKIE_SECURE = False  # Para desenvolvimento local sem HTTPS

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    
    # Banco de dados PostgreSQL
    database_url = os.environ.get('DATABASE_URL')
    if database_url and database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    SQLALCHEMY_DATABASE_URI = database_url or 'sqlite:///hospital.db'
    
    # Configurações de segurança aprimoradas
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True
    REMEMBER_COOKIE_HTTPONLY = True
    REMEMBER_COOKIE_SAMESITE = 'Lax'

class TestingConfig(Config):
    """Configurações para testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

# Dicionário de configurações
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
