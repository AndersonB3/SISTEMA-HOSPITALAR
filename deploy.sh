#!/bin/bash

# Script de Deploy Automático para Sistema Hospitalar
# Execute com: bash deploy.sh

echo "🏥 Sistema Hospitalar - Deploy Automático"
echo "========================================"

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Este diretório não é um repositório Git!"
    echo "📝 Executando: git init"
    git init
    
    echo "📝 Adicionando arquivos..."
    git add .
    
    echo "📝 Primeiro commit..."
    git commit -m "Initial commit - Sistema Hospitalar completo"
    
    echo ""
    echo "🔗 Agora você precisa:"
    echo "1. Criar um repositório no GitHub"
    echo "2. Executar: git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git"
    echo "3. Executar: git push -u origin main"
    echo ""
    exit 1
fi

# Verificar se há mudanças para commit
if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Fazendo commit das mudanças..."
    git add .
    git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')"
fi

# Push para o repositório
echo "🚀 Enviando para GitHub..."
git push

echo ""
echo "✅ Deploy preparado com sucesso!"
echo ""
echo "🎯 Próximos passos para cada plataforma:"
echo ""
echo "📡 RAILWAY (Recomendado - Gratuito):"
echo "1. Acesse: https://railway.app"
echo "2. Conecte com GitHub"
echo "3. Selecione 'Deploy from GitHub'"
echo "4. Escolha seu repositório"
echo "5. Adicione PostgreSQL (Add service > Database > PostgreSQL)"
echo "6. Configure variáveis de ambiente:"
echo "   - FLASK_ENV=production"
echo "   - SECRET_KEY=sua-chave-secreta-aqui"
echo ""
echo "🔥 HEROKU:"
echo "1. heroku create nome-do-app"
echo "2. heroku addons:create heroku-postgresql:essential-0"
echo "3. heroku config:set FLASK_ENV=production"
echo "4. heroku config:set SECRET_KEY=sua-chave-secreta"
echo "5. git push heroku main"
echo ""
echo "💧 DIGITALOCEAN:"
echo "1. Acesse: https://cloud.digitalocean.com/apps"
echo "2. Create App > GitHub"
echo "3. Selecione repositório"
echo "4. Configure build: gunicorn app:app"
echo ""
echo "🌐 Seu sistema estará disponível em minutos!"
