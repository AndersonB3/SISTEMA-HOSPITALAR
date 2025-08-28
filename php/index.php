<?php
/**
 * Página Principal PHP do Sistema Hospitalar
 * Integração com Sistema Flask
 */

// Verificar se o usuário está logado (integração com Flask)
session_start();

// Se não houver sessão ativa, redirecionar para o Flask
if (!isset($_SESSION['user_id']) && !isset($_COOKIE['flask_session'])) {
    // Redirecionar para o sistema Flask principal
    header('Location: ../modulos');
    exit();
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Módulos PHP - Sistema Hospitalar</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .main-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 3rem;
            padding: 2rem;
        }
        
        .integration-badge {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 1rem;
        }
        
        .module-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 1rem 0;
        }
        
        .module-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 2rem;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        
        .module-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
        }
        
        .module-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }
        
        .module-icon {
            width: 80px;
            height: 80px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            color: white;
            margin-bottom: 1.5rem;
            position: relative;
        }
        
        .icon-dashboard { background: linear-gradient(45deg, #667eea, #764ba2); }
        .icon-reports { background: linear-gradient(45deg, #f093fb, #f5576c); }
        .icon-analytics { background: linear-gradient(45deg, #4facfe, #00f2fe); }
        .icon-integration { background: linear-gradient(45deg, #43e97b, #38f9d7); }
        
        .module-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 1rem;
        }
        
        .module-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        
        .module-features {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .module-features li {
            padding: 0.5rem 0;
            color: #555;
            position: relative;
            padding-left: 1.5rem;
        }
        
        .module-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #28a745;
            font-weight: bold;
        }
        
        .back-button {
            background: linear-gradient(45deg, #6c757d, #495057);
            border: none;
            border-radius: 10px;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(108, 117, 125, 0.4);
            color: white;
            text-decoration: none;
        }
        
        .status-indicator {
            position: absolute;
            top: 1rem;
            right: 1rem;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #28a745;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <!-- Header -->
        <div class="main-header text-center">
            <div class="integration-badge">
                <i class="fas fa-plug me-2"></i>
                Integração PHP + Flask Ativa
            </div>
            <h1 class="mb-3">
                <i class="fab fa-php text-primary me-3"></i>
                Módulos PHP - Sistema Hospitalar
            </h1>
            <p class="text-muted mb-4">
                Extensões e funcionalidades adicionais desenvolvidas em PHP, 
                integradas ao sistema principal Flask
            </p>
            <a href="../modulos" class="back-button">
                <i class="fas fa-arrow-left"></i>
                Voltar ao Sistema Principal
            </a>
        </div>
        
        <!-- Grid de Módulos -->
        <div class="module-grid">
            <!-- Dashboard e Estatísticas -->
            <div class="module-card" onclick="openModule('dashboard')">
                <div class="status-indicator"></div>
                <div class="module-icon icon-dashboard">
                    <i class="fas fa-chart-line"></i>
                </div>
                <h3 class="module-title">Dashboard Avançado</h3>
                <p class="module-description">
                    Painel de controle com estatísticas detalhadas, gráficos interativos 
                    e análises em tempo real dos dados hospitalares.
                </p>
                <ul class="module-features">
                    <li>Estatísticas em tempo real</li>
                    <li>Gráficos interativos com Chart.js</li>
                    <li>Análise de convênios e faixas etárias</li>
                    <li>Dados atualizados automaticamente</li>
                </ul>
            </div>
            
            <!-- Sistema de Relatórios -->
            <div class="module-card" onclick="openModule('reports')">
                <div class="status-indicator"></div>
                <div class="module-icon icon-reports">
                    <i class="fas fa-file-alt"></i>
                </div>
                <h3 class="module-title">Relatórios Avançados</h3>
                <p class="module-description">
                    Geração de relatórios personalizados com filtros avançados, 
                    exportação em múltiplos formatos e agendamento automático.
                </p>
                <ul class="module-features">
                    <li>Relatórios personalizáveis</li>
                    <li>Exportação PDF, Excel, CSV</li>
                    <li>Filtros avançados por período</li>
                    <li>Agendamento de relatórios</li>
                </ul>
            </div>
            
            <!-- Analytics e BI -->
            <div class="module-card" onclick="openModule('analytics')">
                <div class="status-indicator"></div>
                <div class="module-icon icon-analytics">
                    <i class="fas fa-analytics"></i>
                </div>
                <h3 class="module-title">Business Intelligence</h3>
                <p class="module-description">
                    Análises avançadas com inteligência artificial, predições 
                    e insights para tomada de decisões estratégicas.
                </p>
                <ul class="module-features">
                    <li>Análises preditivas</li>
                    <li>Machine Learning básico</li>
                    <li>Tendências e padrões</li>
                    <li>Insights automatizados</li>
                </ul>
            </div>
            
            <!-- API e Integrações -->
            <div class="module-card" onclick="openModule('integrations')">
                <div class="status-indicator"></div>
                <div class="module-icon icon-integration">
                    <i class="fas fa-plug"></i>
                </div>
                <h3 class="module-title">API e Integrações</h3>
                <p class="module-description">
                    APIs RESTful para integração com sistemas externos, 
                    webhooks e sincronização de dados em tempo real.
                </p>
                <ul class="module-features">
                    <li>API REST completa</li>
                    <li>Webhooks configuráveis</li>
                    <li>Integração com sistemas externos</li>
                    <li>Sincronização automática</li>
                </ul>
            </div>
        </div>
    </div>
    
    <script>
        // Função para abrir módulos
        function openModule(moduleId) {
            switch(moduleId) {
                case 'dashboard':
                    window.open('modules/dashboard.php', '_blank');
                    break;
                case 'reports':
                    alert('Módulo de Relatórios em desenvolvimento...\n\nRecursos planejados:\n• Relatórios PDF\n• Filtros avançados\n• Agendamento automático');
                    break;
                case 'analytics':
                    alert('Módulo de Analytics em desenvolvimento...\n\nRecursos planejados:\n• Análises preditivas\n• Machine Learning\n• Insights automáticos');
                    break;
                case 'integrations':
                    // Mostrar documentação da API
                    window.open('api/hospital.php?endpoint=documentation', '_blank');
                    break;
                default:
                    alert('Módulo não encontrado!');
            }
        }
        
        // Verificar conectividade com a API
        async function checkAPIConnection() {
            try {
                const response = await fetch('api/hospital.php?endpoint=statistics');
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ API PHP conectada com sucesso!');
                    showConnectionStatus(true);
                } else {
                    console.warn('⚠️ API respondeu com erro:', data.error);
                    showConnectionStatus(false);
                }
            } catch (error) {
                console.error('❌ Erro de conexão com API:', error);
                showConnectionStatus(false);
            }
        }
        
        // Mostrar status da conexão
        function showConnectionStatus(connected) {
            const indicators = document.querySelectorAll('.status-indicator');
            indicators.forEach(indicator => {
                indicator.style.background = connected ? '#28a745' : '#dc3545';
            });
        }
        
        // Verificar conexão ao carregar a página
        document.addEventListener('DOMContentLoaded', function() {
            checkAPIConnection();
        });
    </script>
</body>
</html>
