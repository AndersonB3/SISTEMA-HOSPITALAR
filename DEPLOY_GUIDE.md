# 🚀 Guia de Deploy - Sistema Hospitalar

## 📋 Índice
1. [Preparação para Produção](#preparação-para-produção)
2. [Deploy com Railway (Recomendado)](#deploy-com-railway)
3. [Deploy com Heroku](#deploy-com-heroku)
4. [Deploy com DigitalOcean](#deploy-com-digitalocean)
5. [Deploy com VPS](#deploy-com-vps)
6. [Configuração de Banco PostgreSQL](#configuração-de-banco-postgresql)
7. [Configurações de Segurança](#configurações-de-segurança)

---

## 🔧 Preparação para Produção

### 1. Criar arquivo requirements.txt
```bash
pip freeze > requirements.txt
```

### 2. Configurar variáveis de ambiente
Criar arquivo `.env`:
```env
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/dbname
FLASK_ENV=production
FLASK_DEBUG=False
```

### 3. Configurar Procfile (para Heroku/Railway)
```
web: gunicorn app:app
```

### 4. Adicionar runtime.txt
```
python-3.11.5
```

---

## 🚄 Deploy com Railway (RECOMENDADO - GRATUITO)

### Vantagens:
- ✅ **GRATUITO** até 500 horas/mês
- ✅ Deploy automático via GitHub
- ✅ PostgreSQL incluído gratuitamente
- ✅ SSL/HTTPS automático
- ✅ Fácil configuração

### Passos:

1. **Criar conta no Railway**
   - Acesse: https://railway.app
   - Faça login com GitHub

2. **Subir código para GitHub**
   - Crie repositório no GitHub
   - Suba o código do sistema

3. **Conectar Railway ao GitHub**
   - No Railway: "New Project" → "Deploy from GitHub"
   - Selecione seu repositório

4. **Configurar variáveis de ambiente**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=sua-chave-secreta-aqui
   FLASK_ENV=production
   ```

5. **Deploy automático** ✨
   - Railway faz deploy automaticamente
   - URL disponível em minutos!

---

## 🔥 Deploy com Heroku

### Vantagens:
- ✅ Plataforma consolidada
- ✅ Add-ons disponíveis
- ⚠️ Não é mais gratuito

### Passos:

1. **Instalar Heroku CLI**
   ```bash
   # Windows
   winget install Heroku.CLI
   ```

2. **Login e criar app**
   ```bash
   heroku login
   heroku create nome-do-seu-app
   ```

3. **Adicionar PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

4. **Configurar variáveis**
   ```bash
   heroku config:set SECRET_KEY=sua-chave-secreta
   heroku config:set FLASK_ENV=production
   ```

5. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 🌊 Deploy com DigitalOcean App Platform

### Vantagens:
- ✅ $5/mês (básico)
- ✅ Boa performance
- ✅ Escalabilidade

### Passos:

1. **Criar conta DigitalOcean**
   - Acesse: https://digitalocean.com
   - Use cupom para créditos grátis

2. **App Platform**
   - Create → Apps
   - Conectar GitHub repository

3. **Configurar build**
   - Runtime: Python
   - Build command: `pip install -r requirements.txt`
   - Run command: `gunicorn app:app`

---

## 🖥️ Deploy com VPS (Mais Controle)

### Para quem quer controle total:

1. **Contratar VPS**
   - Contabo: €4/mês
   - Vultr: $5/mês
   - AWS Lightsail: $5/mês

2. **Configurar servidor**
   ```bash
   # Ubuntu 22.04
   sudo apt update && sudo apt upgrade -y
   sudo apt install python3 python3-pip nginx postgresql -y
   ```

3. **Configurar aplicação**
   ```bash
   git clone seu-repositorio
   cd sistema-hospitalar
   pip3 install -r requirements.txt
   ```

4. **Configurar Nginx**
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;
       
       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## 🐘 Configuração PostgreSQL

### Migração do SQLite para PostgreSQL:

1. **Instalar dependências**
   ```bash
   pip install psycopg2-binary
   ```

2. **Atualizar configuração** (arquivo `config.py`):
   ```python
   import os
   
   class Config:
       SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key'
       
       # Banco de dados
       if os.environ.get('DATABASE_URL'):
           # Produção - PostgreSQL
           SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL').replace('postgres://', 'postgresql://')
       else:
           # Desenvolvimento - SQLite
           SQLALCHEMY_DATABASE_URI = 'sqlite:///hospital.db'
   ```

3. **Script de migração**:
   ```python
   # migrate_to_postgres.py
   import sqlite3
   import psycopg2
   from urllib.parse import urlparse
   
   def migrate_data():
       # Conectar SQLite
       sqlite_conn = sqlite3.connect('hospital.db')
       sqlite_cursor = sqlite_conn.cursor()
       
       # Conectar PostgreSQL
       postgres_url = os.environ.get('DATABASE_URL')
       postgres_conn = psycopg2.connect(postgres_url)
       postgres_cursor = postgres_conn.cursor()
       
       # Migrar tabelas...
       # (código específico para cada tabela)
   ```

---

## 🔒 Configurações de Segurança

### 1. Variáveis de Ambiente Seguras
```python
# app.py - Configurações de produção
import os

if os.environ.get('FLASK_ENV') == 'production':
    app.config['SESSION_COOKIE_SECURE'] = True
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
```

### 2. SSL/HTTPS Obrigatório
```python
from flask_talisman import Talisman

if os.environ.get('FLASK_ENV') == 'production':
    Talisman(app, force_https=True)
```

### 3. Configurar CORS se necessário
```python
from flask_cors import CORS

if os.environ.get('FLASK_ENV') == 'production':
    CORS(app, origins=['https://seu-dominio.com'])
```

---

## 🎯 Recomendação Final

### **Para começar rapidamente: RAILWAY** 🚄
1. Gratuito e fácil
2. Deploy em 5 minutos
3. PostgreSQL incluído
4. SSL automático

### **Comandos para Railway:**
```bash
# 1. Instalar CLI (opcional)
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up
```

---

## 📞 Suporte

Se precisar de ajuda com algum deploy específico, posso te ajudar com:
- Configuração detalhada
- Resolução de problemas
- Otimizações de performance
- Configuração de domínio personalizado

**O sistema está pronto para produção! 🚀**
