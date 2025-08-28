@echo off
echo 🚀 Sistema Hospitalar - Setup GitHub Automatico
echo ================================================

echo.
echo 📋 Verificando configuracao atual...
git status

echo.
echo 🔗 Configuracoes do usuario:
git config user.name
git config user.email

echo.
echo 📝 Instrucoes:
echo 1. Va para https://github.com e crie um novo repositorio
echo 2. Nome: SISTEMA-HOSPITALAR
echo 3. Nao marque "Add README file"
echo 4. Copie a URL do repositorio criado
echo.

set /p github_url="Cole a URL do seu repositorio GitHub aqui: "

if "%github_url%"=="" (
    echo ❌ URL nao fornecida. Execute o script novamente.
    pause
    exit /b 1
)

echo.
echo 🔗 Conectando ao repositorio: %github_url%
git remote add origin %github_url%

echo.
echo 📤 Enviando codigo para o GitHub...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCESSO! Seu codigo foi enviado para o GitHub!
    echo.
    echo 🌐 Repositorio disponivel em: %github_url%
    echo.
    echo 🚀 Proximos passos para deploy:
    echo 1. Railway: https://railway.app
    echo 2. Heroku: https://heroku.com  
    echo 3. DigitalOcean: https://digitalocean.com
    echo.
) else (
    echo.
    echo ❌ Erro ao enviar para o GitHub.
    echo.
    echo 💡 Solucoes:
    echo 1. Verifique se o repositorio foi criado corretamente
    echo 2. Configure Personal Access Token como senha
    echo 3. Verifique suas permissoes no repositorio
    echo.
)

pause
