@echo off
REM Script de Deploy para Windows - Sistema Hospitalar

echo 🏥 Sistema Hospitalar - Deploy Automatico
echo =========================================

REM Verificar se está em um repositório git
if not exist ".git" (
    echo ❌ Este diretorio nao e um repositorio Git!
    echo 📝 Executando: git init
    git init
    
    echo 📝 Adicionando arquivos...
    git add .
    
    echo 📝 Primeiro commit...
    git commit -m "Initial commit - Sistema Hospitalar completo"
    
    echo.
    echo 🔗 Agora voce precisa:
    echo 1. Criar um repositorio no GitHub
    echo 2. Executar: git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
    echo 3. Executar: git push -u origin main
    echo.
    pause
    exit /b 1
)

REM Verificar se há mudanças para commit
git status --porcelain > temp.txt
set /p changes=<temp.txt
del temp.txt

if not "%changes%"=="" (
    echo 📝 Fazendo commit das mudancas...
    git add .
    git commit -m "Deploy: %date% %time%"
)

REM Push para o repositório
echo 🚀 Enviando para GitHub...
git push

echo.
echo ✅ Deploy preparado com sucesso!
echo.
echo 🎯 Proximos passos para cada plataforma:
echo.
echo 📡 RAILWAY ^(Recomendado - Gratuito^):
echo 1. Acesse: https://railway.app
echo 2. Conecte com GitHub
echo 3. Selecione 'Deploy from GitHub'
echo 4. Escolha seu repositorio
echo 5. Adicione PostgreSQL ^(Add service ^> Database ^> PostgreSQL^)
echo 6. Configure variaveis de ambiente:
echo    - FLASK_ENV=production
echo    - SECRET_KEY=sua-chave-secreta-aqui
echo.
echo 🔥 HEROKU:
echo 1. heroku create nome-do-app
echo 2. heroku addons:create heroku-postgresql:essential-0
echo 3. heroku config:set FLASK_ENV=production
echo 4. heroku config:set SECRET_KEY=sua-chave-secreta
echo 5. git push heroku main
echo.
echo 🌐 Seu sistema estara disponivel em minutos!
echo.
pause
