<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard PHP - Sistema Hospitalar</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .dashboard-header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            margin-bottom: 2rem;
            padding: 2rem;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            height: 100%;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .stat-icon {
            width: 60px;
            height: 60px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            margin-bottom: 1rem;
        }
        
        .icon-patients { background: linear-gradient(45deg, #4CAF50, #45a049); }
        .icon-today { background: linear-gradient(45deg, #2196F3, #1976D2); }
        .icon-convenio { background: linear-gradient(45deg, #FF9800, #F57C00); }
        .icon-age { background: linear-gradient(45deg, #9C27B0, #7B1FA2); }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            height: 400px;
        }
        
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .btn-refresh {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            border-radius: 10px;
            color: white;
            padding: 10px 20px;
            transition: all 0.3s ease;
        }
        
        .btn-refresh:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            color: white;
        }
    </style>
</head>
<body>
    <div class="container-fluid py-4">
        <!-- Header -->
        <div class="dashboard-header text-center">
            <h1 class="mb-3">
                <i class="fas fa-chart-line text-primary me-3"></i>
                Dashboard PHP - Sistema Hospitalar
            </h1>
            <p class="text-muted mb-0">Integração PHP com Sistema Flask - Estatísticas e Relatórios</p>
            <button class="btn btn-refresh mt-3" onclick="loadDashboard()">
                <i class="fas fa-sync-alt me-2"></i>
                Atualizar Dados
            </button>
        </div>
        
        <!-- Estatísticas Principais -->
        <div class="row mb-4" id="statsContainer">
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card p-4">
                    <div class="stat-icon icon-patients">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="mb-2" id="totalPacientes">-</h3>
                    <p class="text-muted mb-0">Total de Pacientes</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card p-4">
                    <div class="stat-icon icon-today">
                        <i class="fas fa-calendar-day"></i>
                    </div>
                    <h3 class="mb-2" id="pacientesHoje">-</h3>
                    <p class="text-muted mb-0">Cadastros Hoje</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card p-4">
                    <div class="stat-icon icon-convenio">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                    <h3 class="mb-2" id="convenioMaisComum">-</h3>
                    <p class="text-muted mb-0">Convênio Mais Comum</p>
                </div>
            </div>
            <div class="col-lg-3 col-md-6 mb-3">
                <div class="stat-card p-4">
                    <div class="stat-icon icon-age">
                        <i class="fas fa-birthday-cake"></i>
                    </div>
                    <h3 class="mb-2" id="faixaEtariaPrincipal">-</h3>
                    <p class="text-muted mb-0">Faixa Etária Principal</p>
                </div>
            </div>
        </div>
        
        <!-- Gráficos -->
        <div class="row">
            <div class="col-lg-6 mb-4">
                <div class="chart-container">
                    <h5 class="mb-3">
                        <i class="fas fa-chart-pie me-2"></i>
                        Distribuição por Convênio
                    </h5>
                    <canvas id="convenioChart" style="max-height: 300px;"></canvas>
                </div>
            </div>
            <div class="col-lg-6 mb-4">
                <div class="chart-container">
                    <h5 class="mb-3">
                        <i class="fas fa-chart-bar me-2"></i>
                        Distribuição por Faixa Etária
                    </h5>
                    <canvas id="ageChart" style="max-height: 300px;"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Loading -->
        <div id="loadingContainer" class="loading" style="display: none;">
            <div class="text-center">
                <div class="spinner mb-3"></div>
                <p>Carregando dados...</p>
            </div>
        </div>
    </div>
    
    <script>
        let convenioChart = null;
        let ageChart = null;
        
        // Função para carregar dados do dashboard
        async function loadDashboard() {
            try {
                showLoading();
                
                // Buscar estatísticas da API PHP
                const response = await fetch('api/hospital.php?endpoint=statistics');
                const data = await response.json();
                
                if (data.success) {
                    updateStats(data.data);
                    updateCharts(data.data);
                } else {
                    showError('Erro ao carregar dados: ' + data.error);
                }
                
            } catch (error) {
                showError('Erro de conexão: ' + error.message);
            } finally {
                hideLoading();
            }
        }
        
        // Atualizar estatísticas principais
        function updateStats(data) {
            document.getElementById('totalPacientes').textContent = data.total_pacientes || 0;
            document.getElementById('pacientesHoje').textContent = data.pacientes_hoje || 0;
            
            // Convênio mais comum
            if (data.pacientes_por_convenio && data.pacientes_por_convenio.length > 0) {
                const convenioMaisComum = data.pacientes_por_convenio[0];
                document.getElementById('convenioMaisComum').textContent = 
                    convenioMaisComum.convenio.toUpperCase();
            }
            
            // Faixa etária principal
            if (data.pacientes_por_idade && data.pacientes_por_idade.length > 0) {
                const faixaPrincipal = data.pacientes_por_idade.reduce((prev, current) => 
                    (prev.total > current.total) ? prev : current
                );
                document.getElementById('faixaEtariaPrincipal').textContent = 
                    faixaPrincipal.faixa_etaria;
            }
        }
        
        // Atualizar gráficos
        function updateCharts(data) {
            // Gráfico de Convênios
            if (data.pacientes_por_convenio) {
                const convenioLabels = data.pacientes_por_convenio.map(item => item.convenio.toUpperCase());
                const convenioData = data.pacientes_por_convenio.map(item => item.total);
                
                updateConvenioChart(convenioLabels, convenioData);
            }
            
            // Gráfico de Faixa Etária
            if (data.pacientes_por_idade) {
                const ageLabels = data.pacientes_por_idade.map(item => item.faixa_etaria);
                const ageData = data.pacientes_por_idade.map(item => item.total);
                
                updateAgeChart(ageLabels, ageData);
            }
        }
        
        // Atualizar gráfico de convênios
        function updateConvenioChart(labels, data) {
            const ctx = document.getElementById('convenioChart').getContext('2d');
            
            if (convenioChart) {
                convenioChart.destroy();
            }
            
            convenioChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF',
                            '#FF9F40'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Atualizar gráfico de faixa etária
        function updateAgeChart(labels, data) {
            const ctx = document.getElementById('ageChart').getContext('2d');
            
            if (ageChart) {
                ageChart.destroy();
            }
            
            ageChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Número de Pacientes',
                        data: data,
                        backgroundColor: 'rgba(102, 126, 234, 0.8)',
                        borderColor: 'rgba(102, 126, 234, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
        
        // Mostrar loading
        function showLoading() {
            document.getElementById('loadingContainer').style.display = 'flex';
            document.getElementById('statsContainer').style.opacity = '0.5';
        }
        
        // Esconder loading
        function hideLoading() {
            document.getElementById('loadingContainer').style.display = 'none';
            document.getElementById('statsContainer').style.opacity = '1';
        }
        
        // Mostrar erro
        function showError(message) {
            alert('Erro: ' + message);
        }
        
        // Carregar dados ao inicializar a página
        document.addEventListener('DOMContentLoaded', function() {
            loadDashboard();
        });
    </script>
</body>
</html>
