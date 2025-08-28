@echo off
chcp 65001 > nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║           🔐 CORREÇÃO DE AUTENTICAÇÃO GITHUB              ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 🔍 Problema Identificado:
echo    - GitHub está usando credenciais de outro usuário (NutechAI)
echo    - Erro 403: Permission denied
echo.

echo 🚀 Executando correção automática...
echo.

echo 📋 Configurações atuais:
git config --global user.name
git config --global user.email
echo.

echo 🧹 Limpando credenciais antigas...
git config --global --unset-all credential.helper 2>nul
git config --system --unset-all credential.helper 2>nul
git config --global credential.helper manager-core
echo ✅ Credenciais limpas
echo.

echo 🔑 ATENÇÃO: Você precisará inserir suas credenciais:
echo    - Username: AndersonB3
echo    - Password: Use um Personal Access Token do GitHub
echo.
echo 📱 Para criar um token:
echo    1. Acesse: https://github.com/settings/tokens
echo    2. "Generate new token (classic)"
echo    3. Marque: repo, workflow
echo    4. Copie o token e use como senha
echo.

echo ⏳ Tentando push para o GitHub...
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCESSO! Código enviado para o GitHub
    echo.
    echo 🌐 Seu repositório: https://github.com/AndersonB3/SISTEMA-HOSPITALAR
    echo.
    echo 🚀 Próximos passos:
    echo    - Deploy no Railway: https://railway.app
    echo    - Deploy no Heroku: https://dashboard.heroku.com
    echo    - Deploy no Vercel: https://vercel.com
    echo.
) else (
    echo.
    echo ❌ Ainda há problemas de autenticação
    echo.
    echo 🔧 Soluções alternativas:
    echo.
    echo 1. Personal Access Token via URL:
    echo    git remote remove origin
    echo    git remote add origin https://ghp_SEUTOKEN@github.com/AndersonB3/SISTEMA-HOSPITALAR.git
    echo    git push -u origin main
    echo.
    echo 2. Verificar Credential Manager do Windows:
    echo    - Abrir "Credential Manager"
    echo    - Windows Credentials → Generic Credentials
    echo    - Remover entradas do GitHub
    echo    - Tentar novamente
    echo.
)

echo.
echo ════════════════════════════════════════════════════════════
echo Pressione qualquer tecla para fechar...
pause > nul
