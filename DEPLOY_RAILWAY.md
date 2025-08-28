# 🚂 Deploy no Railway - Sistema Hospitalar

## ✅ Status: Pronto para Deploy
- ✅ Código no GitHub: https://github.com/AndersonB3/SISTEMA-HOSPITALAR
- ✅ Procfile configurado
- ✅ requirements.txt atualizado
- ✅ railway.json configurado
- ✅ config.py com suporte a produção

## 🚀 Passo a Passo - Deploy no Railway

### 1. Acessar Railway
🌐 **Acesse**: https://railway.app

### 2. Fazer Login
- Clique em **"Login"**
- Escolha **"Login with GitHub"**
- Autorize o Railway a acessar seus repositórios

### 3. Criar Novo Projeto
- Clique em **"New Project"**
- Selecione **"Deploy from GitHub repo"**
- Escolha: **`AndersonB3/SISTEMA-HOSPITALAR`**

### 4. Configurar Variáveis de Ambiente
Na dashboard do Railway, vá para **Variables** e adicione:

```bash
# Configurações obrigatórias
FLASK_ENV=production
SECRET_KEY=seu_secret_key_super_seguro_aqui_123456789
DATABASE_URL=postgresql://[será_gerado_automaticamente]

# Configurações opcionais
FLASK_DEBUG=False
PORT=5000
```

### 5. Adicionar Banco PostgreSQL
- No Railway, clique em **"+ New"**
- Selecione **"Database"** → **"PostgreSQL"**
- O Railway criará automaticamente a variável `DATABASE_URL`

### 6. Deploy Automático
- O deploy iniciará automaticamente
- Acompanhe os logs na aba **"Deployments"**
- Aguarde até ver **"Deployment completed successfully"**

## 🎯 URL do Sistema
Após o deploy, você receberá uma URL como:
```
https://sistema-hospitalar-production.up.railway.app
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente Recomendadas
```bash
# Essenciais
FLASK_ENV=production
SECRET_KEY=chave_super_secreta_de_32_caracteres_ou_mais
DATABASE_URL=postgresql://usuario:senha@host:porta/database

# Segurança
SESSION_COOKIE_SECURE=True
SESSION_COOKIE_HTTPONLY=True
PERMANENT_SESSION_LIFETIME=1800

# Cache (opcional)
REDIS_URL=redis://usuario:senha@host:porta

# Email (opcional - para recuperação de senha)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=seu_email@gmail.com
MAIL_PASSWORD=sua_senha_app
```

### Domínio Personalizado (Opcional)
1. Vá para **Settings** → **Domains**
2. Clique em **"Custom Domain"**
3. Digite seu domínio (ex: `hospital.seudominio.com`)
4. Configure o DNS conforme instruções

## 📊 Monitoramento

### Logs em Tempo Real
```bash
# No Railway, aba "Deployments" → "View Logs"
# Ou use Railway CLI:
railway logs
```

### Métricas
- CPU e RAM em tempo real
- Número de requests
- Tempo de resposta
- Erros 4xx/5xx

## 🔄 Updates Automáticos
- Cada push para `main` no GitHub
- Dispara deploy automático no Railway
- Zero downtime deployment

## 💡 Comandos Railway CLI (Opcional)

### Instalar CLI
```bash
npm install -g @railway/cli
```

### Comandos Úteis
```bash
# Login
railway login

# Deploy manual
railway up

# Ver logs
railway logs

# Abrir no browser
railway open

# Ver status
railway status
```

## 🆘 Troubleshooting

### Erro de Build
```bash
# Verificar requirements.txt
# Adicionar versões específicas se necessário
Flask==3.0.0
gunicorn==21.2.0
```

### Erro de Banco
```bash
# Verificar se PostgreSQL foi adicionado
# Confirmar variável DATABASE_URL
# Reiniciar deployment
```

### Erro de Importação
```bash
# Verificar estrutura de pastas
# Confirmar que database/models.py existe
# Verificar imports no app.py
```

## 🎉 Resultado Final

Após deploy bem-sucedido:
- ✅ Sistema acessível via URL pública
- ✅ Banco PostgreSQL configurado
- ✅ Deploy automático ativo
- ✅ HTTPS habilitado
- ✅ Logs e métricas disponíveis

---

## 📞 Próximos Passos

1. **Testar Login**: `admin` / `admin123`
2. **Cadastrar Pacientes**: Módulo Recepção
3. **Configurar Usuários**: Diferentes tipos (médico, enfermeiro, etc.)
4. **Personalizar**: Adicionar logo, cores, etc.

**🚀 Seu Sistema Hospitalar estará rodando em produção!**
