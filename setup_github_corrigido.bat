@echo off
chcp 65001 > nul
echo.
echo ██████╗ ██╗████████╗██╗  ██╗██╗   ██╗██████╗ 
echo ██╔════╝ ██║╚══██╔══╝██║  ██║██║   ██║██╔══██╗
echo ██║  ███╗██║   ██║   ███████║██║   ██║██████╔╝
echo ██║   ██║██║   ██║   ██╔══██║██║   ██║██╔══██╗
echo ╚██████╔╝██║   ██║   ██║  ██║╚██████╔╝██████╔╝
echo  ╚═════╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
echo.
echo ════════════════════════════════════════════════════════════
echo            SISTEMA HOSPITALAR - CONFIGURACAO GITHUB
echo ════════════════════════════════════════════════════════════
echo.

echo 🔍 Verificando configuracao atual...
echo.

echo 📁 Verificando remote:
git remote -v
echo.

echo 📊 Status do repositorio:
git status
echo.

echo ⚠️  ATENCAO: REPOSITORIO NAO CRIADO NO GITHUB
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    🚨 ACAO REQUERIDA                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 1. ACESSE: https://github.com/AndersonB3
echo 2. CLIQUE no botao verde "New" para criar repositorio
echo 3. NOME DO REPOSITORIO: SISTEMA-HOSPITALAR
echo 4. DESCRICAO: Sistema Hospitalar desenvolvido em Flask
echo 5. VISIBILIDADE: Public (recomendado)
echo 6. NAO marque nenhuma opcao adicional (README, .gitignore, etc)
echo 7. CLIQUE em "Create repository"
echo.

echo ⏳ Aguardando criacao do repositorio...
echo.
echo Pressione ENTER depois de criar o repositorio no GitHub...
pause > nul

echo.
echo 🚀 Tentando enviar codigo para o GitHub...
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCESSO! Codigo enviado para o GitHub
    echo.
    echo 🌐 URL do repositorio: https://github.com/AndersonB3/SISTEMA-HOSPITALAR
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                   🎉 PROXIMOS PASSOS                      ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo 1. DEPLOY NO RAILWAY:
    echo    - Acesse: https://railway.app
    echo    - Conecte com GitHub
    echo    - Selecione: AndersonB3/SISTEMA-HOSPITALAR
    echo    - Deploy automatico sera iniciado
    echo.
    echo 2. DEPLOY NO HEROKU:
    echo    - Acesse: https://dashboard.heroku.com
    echo    - Create new app
    echo    - Deploy method: GitHub
    echo    - Conecte ao repositorio SISTEMA-HOSPITALAR
    echo.
    echo 3. DEPLOY NO VERCEL:
    echo    - Acesse: https://vercel.com
    echo    - Import Git Repository
    echo    - Selecione SISTEMA-HOSPITALAR
    echo.
    echo ✨ ARQUIVOS DE DEPLOY JA INCLUIDOS:
    echo    - requirements.txt (dependencias)
    echo    - Procfile (configuracao deploy)
    echo    - runtime.txt (versao Python)
    echo    - config.py (configuracoes ambiente)
    echo    - railway.json (configuracao Railway)
    echo.
) else (
    echo.
    echo ❌ ERRO ao enviar para o GitHub
    echo.
    echo ╔═══════════════════════════════════════════════════════════╗
    echo ║                    🔧 SOLUCOES                            ║
    echo ╚═══════════════════════════════════════════════════════════╝
    echo.
    echo 1. VERIFIQUE se o repositorio foi criado:
    echo    https://github.com/AndersonB3/SISTEMA-HOSPITALAR
    echo.
    echo 2. ERRO DE AUTENTICACAO:
    echo    - GitHub -^> Settings -^> Developer settings
    echo    - Personal access tokens -^> Tokens (classic)
    echo    - Generate new token (classic)
    echo    - Marque: repo, workflow
    echo    - Use o token como senha
    echo.
    echo 3. CONFIGURAR CREDENCIAIS:
    echo    git config --global user.name "AndersonB3"
    echo    git config --global user.email "seu-email@example.com"
    echo.
    echo 4. TENTAR NOVAMENTE:
    echo    git push -u origin main
    echo.
)

echo.
echo 📋 VERIFICACAO FINAL:
echo.
echo Remote configurado:
git remote -v
echo.
echo Ultimo commit:
git log --oneline -1
echo.

echo ════════════════════════════════════════════════════════════
echo Pressione qualquer tecla para fechar...
pause > nul
