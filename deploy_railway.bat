@echo off
chcp 65001 > nul
echo.
echo ██████╗  █████╗ ██╗██╗    ██╗ █████╗ ██╗   ██╗
echo ██╔══██╗██╔══██╗██║██║    ██║██╔══██╗╚██╗ ██╔╝
echo ██████╔╝███████║██║██║ █╗ ██║███████║ ╚████╔╝ 
echo ██╔══██╗██╔══██║██║██║███╗██║██╔══██║  ╚██╔╝  
echo ██║  ██║██║  ██║██║╚███╔███╔╝██║  ██║   ██║   
echo ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   
echo.
echo ════════════════════════════════════════════════════════════
echo          DEPLOY SISTEMA HOSPITALAR - RAILWAY
echo ════════════════════════════════════════════════════════════
echo.

echo 🎯 PROJETO: Sistema Hospitalar
echo 📁 GITHUB: https://github.com/AndersonB3/SISTEMA-HOSPITALAR
echo 🚂 PLATAFORMA: Railway (Recomendado)
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    ✅ STATUS DO PROJETO                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo ✅ Código no GitHub: PRONTO
echo ✅ Procfile: CONFIGURADO
echo ✅ requirements.txt: ATUALIZADO
echo ✅ railway.json: OTIMIZADO
echo ✅ config.py: PRODUÇÃO PRONTA
echo ✅ Banco de dados: SUPORTE POSTGRESQL
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   🚀 PASSOS PARA DEPLOY                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.

echo 1️⃣  ACESSE: https://railway.app
echo     - Clique em "Login"
echo     - Selecione "Login with GitHub"
echo     - Autorize o Railway
echo.

echo 2️⃣  CRIAR PROJETO:
echo     - Clique em "New Project"
echo     - Selecione "Deploy from GitHub repo"
echo     - Escolha: AndersonB3/SISTEMA-HOSPITALAR
echo.

echo 3️⃣  ADICIONAR BANCO:
echo     - Clique em "+ New"
echo     - Selecione "Database" → "PostgreSQL"
echo     - Railway criará DATABASE_URL automaticamente
echo.

echo 4️⃣  CONFIGURAR VARIÁVEIS (Variables):
echo     FLASK_ENV=production
echo     SECRET_KEY=sua_chave_secreta_aqui_123456789
echo     FLASK_DEBUG=False
echo.

echo 5️⃣  AGUARDAR DEPLOY:
echo     - Deploy iniciará automaticamente
echo     - Acompanhe logs em "Deployments"
echo     - Aguarde "Deployment completed successfully"
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                    🎯 RESULTADO FINAL                     ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🌐 URL: https://seu-projeto.up.railway.app
echo 👤 LOGIN: admin
echo 🔑 SENHA: admin123
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   📋 RECURSOS INCLUÍDOS                   ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo ✨ Módulo Recepção: Cadastro de pacientes
echo ✨ Classificação de Risco: Triagem
echo ✨ Módulos Médicos: Consultas e procedimentos
echo ✨ Sistema de Usuários: Diferentes permissões
echo ✨ API Completa: Integração com outras sistemas
echo ✨ Logs de Auditoria: Rastreabilidade total
echo ✨ 2FA Opcional: Segurança adicional
echo ✨ Backup Automático: Dados protegidos
echo.

echo ╔═══════════════════════════════════════════════════════════╗
echo ║                   🔄 UPDATES AUTOMÁTICOS                  ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 🔄 Cada push no GitHub = Deploy automático
echo 🔄 Zero downtime deployment
echo 🔄 Rollback automático em caso de erro
echo.

echo 🚀 PRONTO PARA DEPLOY NO RAILWAY!
echo.

echo Pressione ENTER para abrir Railway no navegador...
pause > nul

echo Abrindo Railway...
start https://railway.app

echo.
echo ════════════════════════════════════════════════════════════
echo Pressione qualquer tecla para fechar...
pause > nul
