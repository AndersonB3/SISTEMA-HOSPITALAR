// Variáveis globais
let pacienteSelecionado = null;

// Sistema de Notificações Toast
function showToast(type, title, message, duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    
    // Criar elemento toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Ícones para diferentes tipos
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div class="toast-header">
            <div class="toast-title">
                <i class="${icons[type]}"></i>
                ${title}
            </div>
            <button class="toast-close" onclick="removeToast(this.closest('.toast'))">&times;</button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
        <div class="toast-progress">
            <div class="toast-progress-bar"></div>
        </div>
    `;
    
    // Adicionar ao container
    toastContainer.appendChild(toast);
    
    // Animação de entrada
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto-remover após o tempo especificado
    setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    return toast;
}

function removeToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

// Funções específicas para cada tipo de notificação
function showSuccess(title, message, duration = 3000) {
    return showToast('success', title, message, duration);
}

function showError(title, message, duration = 5000) {
    return showToast('error', title, message, duration);
}

function showWarning(title, message, duration = 4000) {
    return showToast('warning', title, message, duration);
}

function showInfo(title, message, duration = 3000) {
    return showToast('info', title, message, duration);
}

// Função para remover notificações por tipo
function removeToastsByType(type) {
    const toasts = document.querySelectorAll(`.toast-${type}`);
    toasts.forEach(toast => removeToast(toast));
}

document.addEventListener('DOMContentLoaded', function() {
    // Controle dos botões de alternância
    const btnToggles = document.querySelectorAll('.btn-toggle');
    const formContainers = document.querySelectorAll('.form-section-container');

    btnToggles.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove a classe active de todos os botões e containers
            btnToggles.forEach(b => b.classList.remove('active'));
            formContainers.forEach(c => c.classList.remove('active'));

            // Adiciona a classe active ao botão clicado e ao container correspondente
            const formId = this.getAttribute('data-form');
            this.classList.add('active');
            document.getElementById(formId).classList.add('active');
            
            // Se mudou para aba de movimentação, verificar se há paciente selecionado
            if (formId === 'movimentacao') {
                const paciente = verificarPacienteSelecionado();
                if (paciente) {
                    console.log('🔄 Aba movimentação ativada - sincronizando paciente:', paciente.nome);
                    updateMovementTabWithPatient(paciente);
                }
            }
        });
    });

    // NOVA FUNCIONALIDADE: Recuperar paciente do localStorage na inicialização
    initializePatientFromStorage();

    // Inicializar funcionalidades específicas
    initCepConsulta();
    initCpfValidation();
    initProntuarioGenerator();
    initMascaras();
    initFormValidation();
    initPatientSearch();
    
    // Formulário principal de cadastro de paciente
    const patientForm = document.getElementById('patientForm');
    
    // Handler para submissão do formulário principal
    if (patientForm) {
        patientForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const dados = Object.fromEntries(formData.entries());
                
                console.log('📋 Dados coletados do formulário:', dados);
                console.log('📋 Quantidade de campos coletados:', Object.keys(dados).length);
                
                // Converter data para formato ISO
                if (dados.data_nascimento) {
                    dados.data_nascimento = new Date(dados.data_nascimento).toISOString().split('T')[0];
                }
                
                // Validar campos obrigatórios - trim para remover espaços
                const nome = dados.nome ? dados.nome.trim() : '';
                const dataNascimento = dados.data_nascimento ? dados.data_nascimento.trim() : '';
                
                if (!nome || !dataNascimento) {
                    showWarning('Campos Obrigatórios', 'Por favor, preencha pelo menos o nome e a data de nascimento.');
                    return;
                }
                
                // Verificar se está em modo de edição
                console.log('🔍 Verificando modo:', {
                    isEditMode: window.isEditMode,
                    editingPatientId: window.editingPatientId,
                    pacienteSelecionado: window.pacienteSelecionado
                });
                
                if (window.isEditMode && window.editingPatientId) {
                    console.log('✏️ Modo edição identificado - Atualizando paciente...');
                    // Modo edição - atualizar paciente existente
                    await updatePatient(window.editingPatientId, dados);
                } else {
                    console.log('➕ Modo cadastro identificado - Criando novo paciente...');
                    // Modo cadastro - criar novo paciente
                    await createNewPatient(dados);
                }
                
            } catch (error) {
                console.error('Erro no cadastro/atualização:', error);
                showError('Erro na Operação', 'Não foi possível realizar a operação: ' + error.message);
            }
        });
    }
});

// Função para criar novo paciente
async function createNewPatient(dados) {
    const response = await fetch('/api/pacientes', {
        method: 'POST',
        credentials: 'include',  // Incluir cookies de sessão
        body: JSON.stringify(dados),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        let errorMessage = 'Erro ao cadastrar paciente';
        try {
            const responseText = await response.text();
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    
    const resultado = await response.json();
    
    // Exibir notificação de sucesso
    showSuccess(
        'Cadastro Realizado!', 
        `Paciente ${dados.nome} foi cadastrado com sucesso!<br><strong>Prontuário:</strong> ${resultado.prontuario}`,
        5000
    );
    
    // Oferecer opção de imprimir etiqueta
    showEtiquetaOption(resultado.id, resultado.nome);
    
    // Limpar formulário e gerar novo prontuário
    document.getElementById('patientForm').reset();
    gerarNumeroProntuario();
}

// Função para atualizar paciente existente
async function updatePatient(patientId, dados) {
    console.log('🔄 Atualizando paciente:', patientId);
    
    // Verificar se data_nascimento está presente
    if (!dados.data_nascimento) {
        const campoData = document.getElementById('dataNascimento');
        if (campoData && campoData.value) {
            dados.data_nascimento = campoData.value;
        }
    }
    
    const response = await fetch(`/api/paciente/${patientId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });
    
    if (!response.ok) {
        let errorMessage = 'Erro ao atualizar paciente';
        try {
            const responseText = await response.text();
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
    }
    
    const resultado = await response.json();
    
    // Exibir notificação de sucesso
    showSuccess(
        'Paciente Atualizado!', 
        `Os dados de ${dados.nome} foram atualizados com sucesso!`,
        5000
    );
    
    // Atualizar dados globais do paciente selecionado
    if (window.pacienteSelecionado) {
        window.pacienteSelecionado = { ...window.pacienteSelecionado, ...resultado };
        console.log('🔄 Dados globais atualizados:', window.pacienteSelecionado);
    }
    
    // Sair do modo de edição mantendo os dados atualizados na tela
    exitEditModeKeepingData();
    
    // Recarregar os dados atualizados do servidor na interface
    await selectPatientForView(patientId);
    
    return resultado;
}

// Função para inicializar consulta de CEP
function initCepConsulta() {
    const cepInput = document.getElementById('cep');
    if (!cepInput) return;

    cepInput.addEventListener('blur', async function() {
        const cep = this.value.replace(/\D/g, '');
        
        if (cep.length === 8) {
            try {
                showInfo('Consultando CEP', 'Buscando informações do endereço...');
                
                const response = await fetch(`/api/consultar-cep/${cep}`, {
                    credentials: 'include'  // Incluir cookies de sessão
                });
                const dados = await response.json();
                
                if (dados.success) {
                    // Preencher campos automaticamente
                    document.getElementById('estado').value = dados.estado;
                    document.getElementById('cidade').value = dados.cidade;
                    document.getElementById('bairro').value = dados.bairro;
                    document.getElementById('logradouro').value = dados.logradouro;
                    
                    showSuccess('CEP Encontrado', 'Endereço preenchido automaticamente!');
                } else {
                    showWarning('CEP não encontrado', dados.error || 'Verifique o CEP informado');
                }
                
            } catch (error) {
                showError('Erro na Consulta', 'Não foi possível consultar o CEP. Preencha manualmente.');
            }
        }
    });
}

// Função para inicializar validação de CPF
function initCpfValidation() {
    const cpfInput = document.getElementById('cpf');
    if (!cpfInput) return;

    cpfInput.addEventListener('blur', async function() {
        const cpf = this.value.replace(/\D/g, '');
        
        if (cpf.length === 11) {
            try {
                const response = await fetch('/api/validar-cpf', {
                    method: 'POST',
                    credentials: 'include',  // Incluir cookies de sessão
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cpf: cpf })
                });
                
                const resultado = await response.json();
                
                if (resultado.valid) {
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                    showSuccess('CPF Válido', 'CPF verificado com sucesso!');
                } else {
                    this.classList.remove('is-valid');
                    this.classList.add('is-invalid');
                    showError('CPF Inválido', resultado.message);
                }
                
            } catch (error) {
                showError('Erro na Validação', 'Não foi possível validar o CPF');
            }
        }
    });
}

// Função para gerar número do prontuário
async function gerarNumeroProntuario() {
    try {
        const response = await fetch('/api/proximo-prontuario', {
            credentials: 'include'  // Incluir cookies de sessão
        });
        const dados = await response.json();
        
        if (dados.success) {
            const prontuarioInput = document.getElementById('prontuario');
            if (prontuarioInput) {
                prontuarioInput.value = dados.numero;
            }
        }
    } catch (error) {
        console.error('Erro ao gerar prontuário:', error);
    }
}

function initProntuarioGenerator() {
    gerarNumeroProntuario();
    
    // Botão novo cadastro
    const btnNovo = document.getElementById('btnNovoCadastro');
    if (btnNovo) {
        btnNovo.addEventListener('click', function() {
            document.getElementById('patientForm').reset();
            gerarNumeroProntuario();
            showInfo('Novo Cadastro', 'Formulário limpo para novo cadastro');
        });
    }
}

// Função para inicializar máscaras de entrada
function initMascaras() {
    // Máscara CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
            this.value = value;
        });
    }

    // Máscara Telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            if (value.length === 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
            } else if (value.length === 10) {
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
            }
            this.value = value;
        });
    }

    // Máscara CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            value = value.replace(/(\d{5})(\d{3})/, "$1-$2");
            this.value = value;
        });
    }
}

// Função para validação do formulário
function initFormValidation() {
    // Checkbox mãe desconhecida
    const maeDesconhecida = document.getElementById('maeDesconhecida');
    const nomeMae = document.getElementById('nomeMae');
    
    if (maeDesconhecida && nomeMae) {
        maeDesconhecida.addEventListener('change', function() {
            nomeMae.disabled = this.checked;
            if (this.checked) {
                nomeMae.value = 'MÃE DESCONHECIDA';
                nomeMae.removeAttribute('required');
            } else {
                nomeMae.value = '';
                nomeMae.setAttribute('required', 'required');
            }
        });
    }

    // Validação em tempo real
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    });
}

// Função para mostrar opção de etiqueta
function showEtiquetaOption(pacienteId, nomeParaciente) {
    const toastEtiqueta = showToast('info', 'Imprimir Etiqueta?', 
        `Deseja imprimir a etiqueta para ${nomeParaciente}?<br>
        <button onclick="imprimirEtiqueta(${pacienteId})" class="btn btn-primary btn-sm mt-2">
            <i class="fas fa-print"></i> Imprimir
        </button>`, 8000);
}

// Função para imprimir etiqueta
async function imprimirEtiqueta(pacienteId) {
    try {
        const response = await fetch(`/api/imprimir-etiqueta/${pacienteId}`, {
            method: 'GET',
            credentials: 'include',  // Incluir cookies de sessão
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const dados = await response.json();
        
        if (dados.error) {
            showError('Erro', dados.error);
            return;
        }
        
        // Criar janela de impressão
        const janelaImpressao = window.open('', '_blank', 'width=400,height=300');
        janelaImpressao.document.write(`
            <html>
            <head>
                <title>Etiqueta - ${dados.nome}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .etiqueta { border: 2px solid #000; padding: 10px; width: 300px; }
                    .hospital { text-align: center; font-weight: bold; font-size: 14px; margin-bottom: 10px; }
                    .prontuario { font-size: 16px; font-weight: bold; }
                    .info { margin: 5px 0; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="etiqueta">
                    <div class="hospital">SISTEMA HOSPITALAR</div>
                    <div class="prontuario">Prontuário: ${dados.prontuario}</div>
                    <div class="info"><strong>Nome:</strong> ${dados.nome}</div>
                    <div class="info"><strong>Nascimento:</strong> ${dados.data_nascimento} (${dados.idade})</div>
                    <div class="info"><strong>Sexo:</strong> ${dados.sexo}</div>
                    <div class="info"><strong>Mãe:</strong> ${dados.nome_mae}</div>
                    <div class="info" style="font-size: 10px; margin-top: 10px;">
                        Impresso em: ${dados.data_impressao} por ${dados.usuario}
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
                </script>
            </body>
            </html>
        `);
        
        showSuccess('Etiqueta Enviada', 'Etiqueta enviada para impressão!');
        
    } catch (error) {
        showError('Erro na Impressão', 'Não foi possível imprimir a etiqueta');
    }
}

// Função para confirmar ação
function confirmarAcao(mensagem, callback) {
    if (typeof bootstrap !== 'undefined' && document.getElementById('modalConfirmacao')) {
        document.getElementById('mensagemConfirmacao').textContent = mensagem;
        const modal = new bootstrap.Modal(document.getElementById('modalConfirmacao'));
        
        document.getElementById('btnConfirmarAcao').onclick = function() {
            modal.hide();
            callback();
        };
        
        modal.show();
    } else {
        // Fallback para confirm simples
        if (confirm(mensagem)) {
            callback();
        }
    }
}

// Função para formatar data e hora
function formatarDataHora(data) {
    if (!data) return '-';
    
    const opcoes = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    return new Intl.DateTimeFormat('pt-BR', opcoes).format(new Date(data));
}

// Função para criar badge de status
function criarBadgeStatus(status) {
    const statusConfig = {
        'aguardando_acolhimento': { class: 'bg-warning text-dark', text: 'Aguardando Acolhimento' },
        'em_acolhimento': { class: 'bg-info', text: 'Em Acolhimento' },
        'aguardando_atendimento': { class: 'bg-warning text-dark', text: 'Aguardando Atendimento' },
        'em_atendimento': { class: 'bg-primary', text: 'Em Atendimento' },
        'concluido': { class: 'bg-success', text: 'Concluído' },
        'cancelado': { class: 'bg-danger', text: 'Cancelado' },
        'acompanhamento_ambulatorial': { class: 'bg-secondary', text: 'Acompanhamento Ambulatorial' },
        'transferencia': { class: 'bg-dark', text: 'Transferência' },
        'alta_medica': { class: 'bg-success', text: 'Alta Médica' },
        'internado': { class: 'bg-danger', text: 'Internado' },
        'em_observacao': { class: 'bg-info', text: 'Em Observação' },
        'aguardando_internamento': { class: 'bg-warning text-dark', text: 'Aguardando Internamento' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

// Função para inicializar pesquisa de pacientes
function initPatientSearch() {
    const searchInput = document.getElementById('searchPatientInput');
    const btnSearch = document.getElementById('btnSearchPatient');
    const btnClear = document.getElementById('btnClearSearch');
    const searchResults = document.getElementById('searchResults');
    const btnNewPatient = document.getElementById('btnNewPatient');
    
    if (!searchInput || !btnSearch) return;

    // Variável para controlar o timeout da pesquisa
    let searchTimeout;
    
    // Event listeners
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (this.value.trim().length >= 2) {
                searchPatients(this.value.trim());
            } else {
                hideSearchResults();
            }
        }, 300); // Debounce de 300ms
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (this.value.trim().length >= 2) {
                searchPatients(this.value.trim());
            }
        }
    });

    btnSearch.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query.length >= 2) {
            searchPatients(query);
        } else {
            showWarning('Pesquisa', 'Digite pelo menos 2 caracteres para pesquisar');
        }
    });

    btnClear.addEventListener('click', function() {
        clearPatientSearch();
    });

    btnNewPatient.addEventListener('click', function() {
        // Verificar se está em modo visualização
        const viewModeIndicator = document.getElementById('viewModeIndicator');
        if (viewModeIndicator && viewModeIndicator.classList.contains('active')) {
            // Obter paciente selecionado atual
            const paciente = verificarPacienteSelecionado();
            if (paciente) {
                // Redirecionar para aba de movimentação com dados do paciente
                redirectToMovementTab(paciente);
            } else {
                showError('Erro', 'Nenhum paciente selecionado para movimentação');
            }
        } else {
            // Se não está em modo visualização, manter comportamento original
            exitViewMode();
        }
    });
}

// Função para pesquisar pacientes
window.searchPatients = async function(query) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    try {
        // Mostrar loading
        showSearchLoading();
        
        const url = `/api/pacientes?search=${encodeURIComponent(query)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include',  // Incluir cookies de sessão
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro HTTP:', response.status, errorText);
            
            // Verificar se é erro de autenticação
            if (response.status === 401) {
                showError('Sessão Expirada', 'Sua sessão expirou. Faça login novamente.');
                // Redirecionar para login após alguns segundos
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
                return;
            }
            
            throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        
        const patients = data.pacientes || data; // Compatibilidade com ambos os formatos
        
        if (patients.length === 0) {
            showSearchEmpty();
        } else {
            displaySearchResults(patients);
        }
        
    } catch (error) {
        console.error('Erro na pesquisa:', error);
        showError('Erro na Pesquisa', `Erro: ${error.message}`);
        hideSearchResults();
    }
}

// Função para mostrar loading na pesquisa
function showSearchLoading() {
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    searchResultsList.innerHTML = `
        <div class="search-loading">
            <i class="fas fa-spinner"></i>
            <div>Pesquisando pacientes...</div>
        </div>
    `;
    
    searchResults.style.display = 'block';
}

// Função para mostrar estado vazio
function showSearchEmpty() {
    const searchResultsList = document.getElementById('searchResultsList');
    
    searchResultsList.innerHTML = `
        <div class="search-empty">
            <i class="fas fa-user-slash"></i>
            <div>Nenhum paciente encontrado</div>
            <small>Tente uma pesquisa diferente</small>
        </div>
    `;
}

// Função para exibir resultados da pesquisa
function displaySearchResults(patients) {
    const searchResults = document.getElementById('searchResults');
    const searchResultsList = document.getElementById('searchResultsList');
    
    let html = '';
    
    patients.forEach(patient => {
        // Calcular idade
        const age = calculateAge(patient.data_nascimento);
        const formattedDate = formatDate(patient.data_nascimento);
        
        html += `
            <div class="search-result-item" onclick="selectPatientForView(${patient.id})">
                <div class="patient-name">${patient.nome}</div>
                <div class="patient-details">
                    <div class="patient-info">
                        <span><i class="fas fa-id-card"></i> ${patient.prontuario}</span>
                        ${patient.cpf ? `<span><i class="fas fa-fingerprint"></i> ${formatCPF(patient.cpf)}</span>` : ''}
                        <span><i class="fas fa-birthday-cake"></i> ${formattedDate} (${age})</span>
                        <span><i class="fas fa-venus-mars"></i> ${patient.sexo === 'M' ? 'Masculino' : 'Feminino'}</span>
                    </div>
                    <div class="view-badge">
                        <i class="fas fa-eye"></i> Visualizar
                    </div>
                </div>
            </div>
        `;
    });
    
    searchResultsList.innerHTML = html;
    searchResults.style.display = 'block';
    
    // Mostrar botão limpar
    document.getElementById('btnClearSearch').style.display = 'block';
}

// Função para esconder resultados da pesquisa
function hideSearchResults() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    // Esconder botão limpar
    const btnClearSearch = document.getElementById('btnClearSearch');
    if (btnClearSearch) {
        btnClearSearch.style.display = 'none';
    }
}

// Função para selecionar paciente para visualização
async function selectPatientForView(patientId) {
    try {
        console.log(`🔍 Iniciando carregamento do paciente ID: ${patientId}`);
        showInfo('Carregando', 'Carregando dados do paciente...');
        
        const response = await fetch(`/api/paciente/${patientId}`, {
            method: 'GET',
            credentials: 'include',  // Incluir cookies de sessão
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log(`📡 Resposta da API - Status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erro na resposta da API:', errorText);
            throw new Error(`Erro ${response.status}: ${errorText}`);
        }

        const patient = await response.json();
        console.log('📄 Dados do paciente recebidos:', patient);
        
        // Verificar se os dados do paciente são válidos
        if (!patient || !patient.id) {
            console.error('❌ Dados do paciente inválidos:', patient);
            throw new Error('Dados do paciente inválidos recebidos da API - paciente sem ID');
        }
        
        // Armazenar paciente selecionado globalmente
        pacienteSelecionado = patient;
        
        // NOVA FUNCIONALIDADE: Sincronizar com todas as abas
        syncPatientDataToAllTabs(patient);
        
        console.log('💾 Paciente armazenado globalmente e sincronizado');
        
        // Preencher formulário em modo visualização
        console.log('📋 Preenchendo formulário...');
        fillFormForView(patient);
        
        // Esconder resultados da pesquisa
        hideSearchResults();
        
        // Remover notificação de carregamento antes de mostrar sucesso
        removeToastsByType('info');
        
        console.log('✅ Processo concluído com sucesso');
        showSuccess('Paciente Carregado', `Dados de ${patient.nome} carregados para visualização`);
        
    } catch (error) {
        console.error('❌ Erro crítico ao carregar paciente:', error);
        // Remover notificação de carregamento antes de mostrar erro
        removeToastsByType('info');
        showError('Erro', `Não foi possível carregar os dados do paciente: ${error.message}`);
    }
}

// Função para preencher formulário em modo visualização
function fillFormForView(patient) {
    try {
        // Entrar no modo visualização
        enterViewMode(patient.nome);
        
        // Garantir que todos os containers de seção estejam visíveis
        ensureFormSectionsVisible();
        
        // Preencher campos básicos
        setFieldValue('prontuario', patient.prontuario);
        setFieldValue('nome', patient.nome);
        
        // Garantir que a data esteja no formato correto (YYYY-MM-DD) para input type="date"
        let dataFormatada = patient.data_nascimento;
        if (dataFormatada && !dataFormatada.match(/^\d{4}-\d{2}-\d{2}$/)) {
            try {
                const data = new Date(dataFormatada);
                dataFormatada = data.toISOString().split('T')[0];
            } catch (e) {
                console.warn('⚠️ Erro ao formatar data de nascimento:', dataFormatada);
                dataFormatada = '';
            }
        }
        setFieldValue('dataNascimento', dataFormatada);
        
        setFieldValue('rg', patient.rg);
        setFieldValue('cpf', patient.cpf);
        setFieldValue('sexo', patient.sexo);
        
        // Preencher raça (mapear para os valores corretos do select)
        const racaSelect = document.getElementById('raca');
        if (racaSelect && patient.raca) {
            const racaValue = patient.raca.toLowerCase();
            racaSelect.value = racaValue;
        }
        
        // Preencher nacionalidade
        const nacionalidadeSelect = document.getElementById('nacionalidade');
        if (nacionalidadeSelect && patient.nacionalidade) {
            const nacionalidade = patient.nacionalidade.toLowerCase();
            if (nacionalidade === 'brasileiro' || nacionalidade === 'brasileira') {
                nacionalidadeSelect.value = 'brasileiro';
            } else {
                nacionalidadeSelect.value = 'estrangeiro';
            }
        }
        
        // Preencher campos de família
        setFieldValue('nomeMae', patient.nome_mae);
        setFieldValue('nomePai', patient.nome_pai);
        
        setFieldValue('email', patient.email);
        setFieldValue('telefone', patient.telefone);
        
        // Marcar checkbox mãe desconhecida se aplicável
        const maeDesconhecidaCheck = document.getElementById('maeDesconhecida');
        if (maeDesconhecidaCheck) {
            maeDesconhecidaCheck.checked = patient.mae_desconhecida || false;
            
            // Se mãe é desconhecida, ajustar campo nome da mãe
            const nomeMae = document.getElementById('nomeMae');
            if (nomeMae && maeDesconhecidaCheck.checked) {
                nomeMae.value = patient.nome_mae || 'MÃE DESCONHECIDA';
            }
        }
        
        // Preencher campos de convênio
        const convenioSelect = document.getElementById('convenio');
        if (convenioSelect && patient.convenio) {
            convenioSelect.value = patient.convenio;
        }
        
        const numeroCartaoField = document.getElementById('numeroCartao');
        if (numeroCartaoField) {
            numeroCartaoField.value = patient.numero_cartao || '';
        }
        
        const titularCartaoField = document.getElementById('titularCartao');
        if (titularCartaoField) {
            titularCartaoField.value = patient.titular_cartao || '';
        }
        
        // Preencher campos de endereço
        const cepField = document.getElementById('cep');
        if (cepField) {
            cepField.value = patient.cep || '';
        }
        
        const estadoField = document.getElementById('estado');
        if (estadoField && patient.estado) {
            estadoField.value = patient.estado;
        }
        
        const cidadeField = document.getElementById('cidade');
        if (cidadeField) {
            cidadeField.value = patient.cidade || '';
        }
        
        const bairroField = document.getElementById('bairro');
        if (bairroField) {
            bairroField.value = patient.bairro || '';
        }
        
        const logradouroField = document.getElementById('logradouro');
        if (logradouroField) {
            logradouroField.value = patient.logradouro || '';
        }
        
        const numeroField = document.getElementById('numero');
        if (numeroField) {
            numeroField.value = patient.numero || '';
        }
        
        const complementoField = document.getElementById('complemento');
        if (complementoField) {
            complementoField.value = patient.complemento || '';
        }
        
        setFieldValue('pontoReferencia', patient.ponto_referencia);
        
        // Desabilitar todos os campos para visualização
        disableAllFormFields();
        
        // Mostrar botão de editar
        const btnEditar = document.getElementById('btnEditar');
        if (btnEditar) {
            btnEditar.style.display = 'inline-block';
        }
        
    } catch (error) {
        console.error('Erro ao preencher formulário:', error);
        showToast('Erro ao preencher alguns campos do formulário', 'warning');
        // NÃO re-propagar o erro para evitar notificação de erro falsa
    }
}

// Função para garantir que todas as seções do formulário sejam visíveis
function ensureFormSectionsVisible() {
    const formSections = document.querySelectorAll('.form-section');
    formSections.forEach(section => {
        section.style.display = 'block';
        section.style.visibility = 'visible';
    });
}

// Função auxiliar para definir valor em campo de forma segura
function setFieldValue(fieldId, value) {
    const field = document.getElementById(fieldId);
    
    if (field && value !== undefined && value !== null) {
        field.value = value;
    } else if (field) {
        field.value = '';
    }
}

// Função para entrar no modo visualização
function enterViewMode(patientName) {
    const viewPatientName = document.getElementById('viewPatientName');
    const viewModeIndicator = document.getElementById('viewModeIndicator');
    
    if (viewPatientName) {
        viewPatientName.textContent = patientName;
    }
    
    if (viewModeIndicator) {
        viewModeIndicator.style.display = 'block';
        viewModeIndicator.classList.add('active');
    }
}

// Função para sair do modo visualização
function exitViewMode() {
    const viewModeIndicator = document.getElementById('viewModeIndicator');
    
    viewModeIndicator.classList.remove('active');
    
    // Limpar e reabilitar formulário
    clearAndEnableForm();
    
    // Limpar pesquisa
    clearPatientSearch();
    
    showInfo('Novo Cadastro', 'Formulário limpo para novo cadastro');
}

// Função para entrar no modo de edição
function enterEditMode() {
    // Verificar se há dados de paciente para editar
    if (!pacienteSelecionado) {
        showWarning('Nenhum Paciente Selecionado', 'Selecione um paciente para editar primeiro.');
        return;
    }

    console.log('Entrando no modo de edição para paciente:', pacienteSelecionado);

    // Mostrar indicador de modo edição
    const viewModeIndicator = document.getElementById('viewModeIndicator');
    const viewPatientName = document.getElementById('viewPatientName');
    
    if (viewModeIndicator && viewPatientName) {
        viewModeIndicator.classList.add('active');
        viewModeIndicator.classList.add('edit-mode');
        viewPatientName.textContent = `EDITANDO: ${pacienteSelecionado.nome}`;
    }

    // Habilitar todos os campos do formulário
    enableAllFormFields();
    
    // Alterar o texto e comportamento dos botões
    const btnSalvar = document.getElementById('btnSalvar');
    const btnEditar = document.getElementById('btnEditar');
    
    if (btnSalvar) {
        btnSalvar.innerHTML = '<i class="fas fa-save"></i> Atualizar';
        btnSalvar.className = 'btn btn-success';
        btnSalvar.title = 'Salvar alterações do paciente';
    }
    
    if (btnEditar) {
        btnEditar.style.display = 'none';
    }

    // Garantir visibilidade das seções
    ensureFormSectionsVisible();
    
    // Armazenar estado de edição
    window.isEditMode = true;
    window.editingPatientId = pacienteSelecionado.id;
    
    showInfo('Modo Edição', `Editando dados de ${pacienteSelecionado.nome}. Faça as alterações necessárias e clique em "Atualizar".`);
}

// Função para habilitar todos os campos do formulário
function enableAllFormFields() {
    const form = document.getElementById('patientForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Não alterar o campo prontuário (deve permanecer readonly)
        if (input.id === 'prontuario') {
            return;
        }
        
        input.disabled = false;
        input.readOnly = false;
        input.classList.remove('readonly-view');
        
        // Adicionar classes de foco para indicar campos editáveis
        input.classList.add('editable-field');
    });
    
    console.log('Todos os campos do formulário foram habilitados para edição');
}

// Função para desabilitar todos os campos do formulário (modo visualização)
function disableAllFormFields() {
    const form = document.getElementById('patientForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Não alterar o campo prontuário (já é readonly por padrão)
        if (input.id === 'prontuario') {
            return;
        }
        
        // Para inputs de texto, usar readonly ao invés de disabled
        if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.tagName === 'TEXTAREA') {
            input.readOnly = true;
            input.disabled = false;
        } else {
            // Para selects e checkboxes, usar disabled
            input.disabled = true;
        }
        
        input.classList.add('readonly-view');
        input.classList.remove('editable-field');
    });
    
    console.log('Todos os campos do formulário foram colocados em modo visualização');
}

// Função para sair do modo de edição
function exitEditMode() {
    const viewModeIndicator = document.getElementById('viewModeIndicator');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnEditar = document.getElementById('btnEditar');
    
    // Restaurar indicador de visualização
    if (viewModeIndicator) {
        viewModeIndicator.classList.remove('edit-mode');
    }
    
    // Restaurar botões
    if (btnSalvar) {
        btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
        btnSalvar.className = 'btn btn-primary';
        btnSalvar.title = 'Salvar novo paciente';
    }
    
    if (btnEditar) {
        btnEditar.style.display = 'none';
    }
    
    // Limpar estado de edição
    window.isEditMode = false;
    window.editingPatientId = null;
    
    // Limpar formulário
    clearAndEnableForm();
    
    // Limpar pesquisa
    clearPatientSearch();
    
    showInfo('Modo Edição Cancelado', 'Retornando ao modo de cadastro normal');
}

// Nova função para sair do modo de edição mantendo os dados
function exitEditModeKeepingData() {
    const viewModeIndicator = document.getElementById('viewModeIndicator');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnEditar = document.getElementById('btnEditar');
    
    // Restaurar indicador de visualização (mas manter em modo view)
    if (viewModeIndicator) {
        viewModeIndicator.classList.remove('edit-mode');
    }
    
    // Restaurar botões para modo de visualização
    if (btnSalvar) {
        btnSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar';
        btnSalvar.className = 'btn btn-primary';
        btnSalvar.title = 'Salvar novo paciente';
    }
    
    if (btnEditar) {
        btnEditar.style.display = 'inline-block';
    }
    
    // Limpar estado de edição
    window.isEditMode = false;
    window.editingPatientId = null;
    
    // NÃO limpar formulário - manter os dados atualizados
    // NÃO limpar pesquisa - manter o contexto
    // NÃO chamar enterViewMode() aqui - será feito pelo selectPatientForView
}

// Função para limpar e habilitar formulário
function clearAndEnableForm() {
    const form = document.getElementById('patientForm');
    
    if (form) {
        // Limpar formulário
        form.reset();
        
        // Gerar novo prontuário
        gerarNumeroProntuario();
        
        // Habilitar todos os campos
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            // Não alterar o campo prontuário (deve permanecer readonly)
            if (input.id === 'prontuario') {
                return;
            }
            
            input.disabled = false;
            input.readOnly = false;
            input.classList.remove('readonly-view');
            input.classList.remove('editable-field');
        });
        
        // Esconder indicador de modo visualização
        const viewModeIndicator = document.getElementById('viewModeIndicator');
        if (viewModeIndicator) {
            viewModeIndicator.style.display = 'none';
            viewModeIndicator.classList.remove('active');
            viewModeIndicator.classList.remove('edit-mode');
        }
        
        // Limpar variáveis globais
        window.pacienteSelecionado = null;
        window.isEditMode = false;
        window.editingPatientId = null;
        
        console.log('Formulário limpo e habilitado para novo cadastro');
    }
}

// Função para limpar pesquisa de pacientes
function clearPatientSearch() {
    const searchInput = document.getElementById('searchPatientInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    hideSearchResults();
}

// Funções auxiliares
function calculateAge(birthDate) {
    if (!birthDate) return 'N/A';
    
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return `${age} anos`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function formatDateForInput(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

function formatCPF(cpf) {
    if (!cpf) return '';
    
    // Remove caracteres não numéricos
    const numbers = cpf.replace(/\D/g, '');
    
    // Aplica a máscara
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função auxiliar para obter dados completos do paciente atual
function getCurrentPatientData() {
    const viewPatientName = document.getElementById('viewPatientName');
    
    if (!viewPatientName || !viewPatientName.textContent.trim()) {
        return null;
    }
    
    // Verificar se há paciente selecionado global
    const pacienteSelecionado = verificarPacienteSelecionado();
    if (pacienteSelecionado) {
        return pacienteSelecionado;
    }
    
    // Fallback: obter dados do formulário se não há paciente selecionado
    const patientName = viewPatientName.textContent.trim();
    return {
        nome: patientName,
        prontuario: document.getElementById('prontuario').value,
        cpf: document.getElementById('cpf').value,
        data_nascimento: document.getElementById('dataNascimento').value,
        convenio: document.getElementById('convenio').value,
        sexo: document.getElementById('sexo').value
    };
}

// Função para formatar convênio
function formatConvenio(convenio) {
    if (!convenio) return 'Não informado';
    
    const convenios = {
        'sus': 'SUS',
        'particular': 'Particular',
        'unimed': 'Unimed',
        'amil': 'Amil',
        'bradesco': 'Bradesco Saúde',
        'outros': 'Outros'
    };
    
    return convenios[convenio] || convenio.charAt(0).toUpperCase() + convenio.slice(1);
}

// Função para trocar paciente (chamada pelo botão)
function trocarPaciente() {
    // Voltar para aba de cadastro
    const movementTab = document.querySelector('[data-form="movimentacao"]');
    const registrationTab = document.querySelector('[data-form="cadastro"]');
    
    if (movementTab && registrationTab) {
        // Desativar aba de movimentação
        movementTab.classList.remove('active');
        document.getElementById('movimentacao').classList.remove('active');
        
        // Ativar aba de cadastro
        registrationTab.classList.add('active');
        document.getElementById('cadastro').classList.add('active');
        
        // Esconder container de informações do paciente
        const pacienteInfoContainer = document.getElementById('pacienteMovimentacaoInfo');
        if (pacienteInfoContainer) {
            pacienteInfoContainer.style.display = 'none';
            pacienteInfoContainer.classList.remove('show');
        }
        
        // Limpar dados do paciente selecionado
        pacienteSelecionado = null;
        
        // Focar no campo de pesquisa
        const searchInput = document.getElementById('searchPatientInput');
        if (searchInput) {
            searchInput.focus();
        }
        
        showInfo('Trocar Paciente', 'Selecione outro paciente para movimentação');
    }
}

// Função para atualizar status do atendimento
function updatePatientStatus(newStatus, movementType = null) {
    const statusElement = document.getElementById('infoStatus');
    const ultimaMovimentacaoElement = document.getElementById('infoUltimaMovimentacao');
    
    if (!statusElement) return;
    
    // Configurar badge do status
    const statusConfig = {
        'aguardando_acolhimento': { class: 'bg-warning text-dark', text: 'Aguardando Acolhimento' },
        'em_acolhimento': { class: 'bg-info', text: 'Em Acolhimento' },
        'aguardando_atendimento': { class: 'bg-warning text-dark', text: 'Aguardando Atendimento' },
        'em_atendimento': { class: 'bg-primary', text: 'Em Atendimento' },
        'concluido': { class: 'bg-success', text: 'Concluído' },
        'cancelado': { class: 'bg-danger', text: 'Cancelado' },
        'acompanhamento_ambulatorial': { class: 'bg-secondary', text: 'Acompanhamento Ambulatorial' },
        'transferencia': { class: 'bg-dark', text: 'Transferência' },
        'alta_medica': { class: 'bg-success', text: 'Alta Médica' },
        'internado': { class: 'bg-danger', text: 'Internado' },
        'em_observacao': { class: 'bg-info', text: 'Em Observação' },
        'aguardando_internamento': { class: 'bg-warning text-dark', text: 'Aguardando Internamento' }
    };
    
    const config = statusConfig[newStatus] || { class: 'bg-secondary', text: newStatus };
    
    statusElement.textContent = config.text;
    statusElement.className = `info-value badge ${config.class}`;
    
    // Atualizar última movimentação
    if (ultimaMovimentacaoElement && movementType) {
        const now = new Date();
        const timeString = now.toLocaleString('pt-BR');
        ultimaMovimentacaoElement.textContent = `${movementType} - ${timeString}`;
    }
}

// ================================
// SISTEMA DE MOVIMENTAÇÕES
// ================================

// Cache para armazenar movimentações
let movimentacoesCache = new Map();

// Função para salvar nova movimentação
async function salvarMovimentacao() {
    try {
        console.log('📝 [MOVIMENTACAO] Iniciando salvamento de movimentação...');
        
        // Verificar se há paciente selecionado usando nova função robusta
        const paciente = verificarPacienteSelecionado();
        
        if (!paciente) {
            console.error('❌ [MOVIMENTACAO] Nenhum paciente selecionado');
            showError(
                'Nenhum Paciente Selecionado', 
                'Para criar uma movimentação, você precisa:<br><br>' +
                '1️⃣ Ir para a aba <strong>"Cadastro de Paciente"</strong><br>' +
                '2️⃣ Pesquisar e selecionar um paciente existente<br>' +
                '3️⃣ Voltar para a aba <strong>"Movimentação"</strong><br>' +
                '4️⃣ Clicar em <strong>"Adicionar"</strong> novamente<br><br>' +
                '<em>💡 Dica: Você verá as informações do paciente aparecerem nesta aba quando ele estiver selecionado.</em>'
            );
            return;
        }
        
        console.log(`✅ [MOVIMENTACAO] Paciente selecionado: ID ${paciente.id} - ${paciente.nome}`);
        
        // Atualizar a variável global (caso tenha sido recuperada do localStorage)
        pacienteSelecionado = paciente;
        
        // Coletar dados do formulário (usando IDs corretos do modal customizado)
        const tipoElement = document.getElementById('tipoCustom');
        const statusElement = document.getElementById('statusCustom');
        const prioridadeElement = document.getElementById('prioridadeCustom');
        
        // Verificar se os elementos existem
        if (!tipoElement || !statusElement) {
            console.error('❌ [MOVIMENTACAO] Elementos do formulário não encontrados');
            showError('Erro', 'Formulário de movimentação não encontrado. Recarregue a página.');
            return;
        }
        
        const formData = {
            paciente_id: paciente.id,
            tipo: tipoElement.value || '',
            status: statusElement.value || '',
            prioridade: prioridadeElement ? prioridadeElement.value || null : null,
            profissional_responsavel: '', // Campo não existe no modal, será preenchido pelo backend
            observacoes: '' // Campo não existe no modal, será preenchido se necessário
        };
        
        console.log('📋 [MOVIMENTACAO] Dados coletados:', formData);
        
        // Validações
        if (!formData.tipo) {
            showError('Campos Obrigatórios', 'Tipo de movimentação é obrigatório');
            tipoElement.focus();
            return;
        }
        
        if (!formData.status) {
            showError('Campos Obrigatórios', 'Status é obrigatório');
            statusElement.focus();
            return;
        }
        
        console.log('🚀 [MOVIMENTACAO] Enviando requisição...');
        
        // Enviar para API
        const response = await fetch('/api/movimentacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });
        
        console.log(`📡 [MOVIMENTACAO] Resposta recebida: ${response.status}`);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ [MOVIMENTACAO] Movimentação salva com sucesso:', result);
            
            showSuccess('Movimentação Criada!', 
                `Movimentação de <strong>${formData.tipo}</strong> criada com sucesso para <strong>${paciente.nome}</strong>!<br>` +
                `<small>Status: ${formData.status}</small>`
            );
            
            // Fechar modal
            const modal = document.getElementById('modalCustomMovimentacao');
            if (modal) {
                modal.classList.remove('show');
                console.log('🔒 [MOVIMENTACAO] Modal fechado');
            }
            
            // Limpar formulário
            document.getElementById('formMovimentacaoCustom')?.reset();
            
            // Limpar cache e atualizar histórico com reload forçado
            movimentacoesCache.delete(paciente.id);
            await carregarHistoricoMovimentacoes(paciente.id, true);
            
            // Atualizar status do paciente
            updatePatientStatus(formData.status, formData.tipo);
            
        } else {
            const error = await response.json();
            console.error('❌ [MOVIMENTACAO] Erro da API:', error);
            showError('Erro ao Criar Movimentação', 
                error.error || 'Erro desconhecido ao salvar movimentação. Tente novamente.'
            );
        }
        
    } catch (error) {
        console.error('💥 [MOVIMENTACAO] Erro durante salvamento:', error);
        showError('Erro Interno', 
            'Ocorreu um erro interno ao salvar a movimentação.<br>' +
            'Verifique sua conexão e tente novamente.<br>' +
            `<small>Detalhes técnicos: ${error.message}</small>`
        );
    }
}

// Função para carregar histórico de movimentações
async function carregarHistoricoMovimentacoes(pacienteId, forceReload = false) {
    try {
        console.log(`🔍 [HISTORICO] Carregando histórico para paciente ${pacienteId}...`);
        
        if (!pacienteId) {
            console.error('❌ [HISTORICO] ID do paciente não fornecido');
            return;
        }
        
        // Verificar cache se não forçar reload
        if (!forceReload && movimentacoesCache.has(pacienteId)) {
            console.log('📊 [HISTORICO] Usando dados do cache');
            const movimentacoes = movimentacoesCache.get(pacienteId);
            exibirHistoricoMovimentacoes(movimentacoes);
            return;
        }
        
        const response = await fetch(`/api/movimentacoes/paciente/${pacienteId}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const movimentacoes = await response.json();
            console.log(`✅ [HISTORICO] ${movimentacoes.length} movimentações carregadas para paciente ${pacienteId}`);
            
            // Atualizar cache
            movimentacoesCache.set(pacienteId, movimentacoes);
            
            exibirHistoricoMovimentacoes(movimentacoes);
            
        } else {
            console.error(`❌ [HISTORICO] Erro ao carregar: ${response.status}`);
            showError('Erro', 'Erro ao carregar histórico de movimentações');
        }
        
    } catch (error) {
        console.error('💥 [HISTORICO] Erro durante carregamento:', error);
        showError('Erro', 'Erro interno ao carregar histórico');
    }
}

// Função para exibir histórico de movimentações
function exibirHistoricoMovimentacoes(movimentacoes) {
    const container = document.getElementById('historicoMovimentacoes');
    
    if (!container) {
        console.warn('⚠️ [HISTORICO] Container não encontrado');
        return;
    }
    
    if (!movimentacoes || movimentacoes.length === 0) {
        container.innerHTML = '<p class="text-muted">Nenhuma movimentação encontrada.</p>';
        return;
    }
    
    let html = '<div class="table-responsive"><table class="table table-sm table-striped">';
    html += '<thead><tr>';
    html += '<th>Data/Hora</th>';
    html += '<th>Tipo</th>';
    html += '<th>Status</th>';
    html += '<th>Profissional</th>';
    html += '<th>Observações</th>';
    html += '<th>Ações</th>';
    html += '</tr></thead><tbody>';
    
    movimentacoes.forEach(mov => {
        const dataFormatada = new Date(mov.data_entrada).toLocaleString('pt-BR');
        const statusBadge = getStatusBadge(mov.status);
        const tipoBadge = getTipoBadge(mov.tipo);
        
        html += '<tr>';
        html += `<td>${dataFormatada}</td>`;
        html += `<td>${tipoBadge}</td>`;
        html += `<td>${statusBadge}</td>`;
        html += `<td>${mov.profissional_responsavel || '-'}</td>`;
        html += `<td>${mov.observacoes || '-'}</td>`;
        html += '<td>';
        
        // Botão de editar (apenas se não finalizado)
        if (mov.status !== 'finalizado') {
            html += `<button class="btn btn-sm btn-outline-primary me-1" onclick="editarMovimentacao(${mov.id})" title="Editar">`;
            html += '<i class="fas fa-edit"></i>';
            html += '</button>';
            
            // Botão de excluir (apenas se não finalizado)
            html += `<button class="btn btn-sm btn-outline-danger" onclick="excluirMovimentacao(${mov.id})" title="Excluir">`;
            html += '<i class="fas fa-trash"></i>';
            html += '</button>';
        }
        
        html += '</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

// Função para excluir movimentação
async function excluirMovimentacao(movimentacaoId) {
    try {
        // Confirmação com aviso de exclusão física
        const confirmacao = confirm(
            '⚠️ ATENÇÃO: Esta ação irá EXCLUIR PERMANENTEMENTE a movimentação do banco de dados.\n\n' +
            'A movimentação será removida completamente e NÃO PODERÁ ser recuperada.\n\n' +
            'Deseja realmente continuar?'
        );
        
        if (!confirmacao) {
            return;
        }
        
        const response = await fetch(`/api/movimentacoes/${movimentacaoId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const result = await response.json();
            showSuccess('Sucesso', 'Movimentação excluída permanentemente!');
            
            // Limpar cache e recarregar histórico
            if (pacienteSelecionado && pacienteSelecionado.id) {
                movimentacoesCache.delete(pacienteSelecionado.id);
                await carregarHistoricoMovimentacoes(pacienteSelecionado.id, true);
            }
            
        } else {
            const errorData = await response.text();
            
            let errorMessage = 'Erro ao excluir movimentação';
            try {
                const errorObj = JSON.parse(errorData);
                errorMessage = errorObj.error || errorMessage;
            } catch (e) {
                // Resposta não é JSON válido
            }
            
            showError('Erro', errorMessage);
        }
        
    } catch (error) {
        console.error('💥 [EXCLUSAO] Erro durante exclusão:', error);
        showError('Erro', 'Erro interno. Verifique o console para detalhes.');
    }
}

// Tornar funções globais para uso nos botões HTML
window.excluirMovimentacao = excluirMovimentacao;
window.editarMovimentacao = editarMovimentacao;

// Função para editar movimentação
function editarMovimentacao(movimentacaoId) {
    // TODO: Implementar edição de movimentação
    showInfo('Edição', 'Funcionalidade de edição em desenvolvimento');
}

// Funções auxiliares para badges
function getStatusBadge(status) {
    const statusConfig = {
        'aguardando_acolhimento': { class: 'bg-warning text-dark', text: 'Aguardando Acolhimento' },
        'em_acolhimento': { class: 'bg-info', text: 'Em Acolhimento' },
        'aguardando_atendimento': { class: 'bg-warning text-dark', text: 'Aguardando Atendimento' },
        'em_atendimento': { class: 'bg-primary', text: 'Em Atendimento' },
        'finalizado': { class: 'bg-success', text: 'Finalizado' },
        'cancelado': { class: 'bg-danger', text: 'Cancelado' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status };
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

function getTipoBadge(tipo) {
    const tipoConfig = {
        'emergencia': { class: 'bg-danger', text: 'Emergência' },
        'consulta': { class: 'bg-primary', text: 'Consulta' },
        'exame': { class: 'bg-info', text: 'Exame' },
        'retorno': { class: 'bg-secondary', text: 'Retorno' },
        'procedimento': { class: 'bg-warning text-dark', text: 'Procedimento' }
    };
    
    const config = tipoConfig[tipo] || { class: 'bg-secondary', text: tipo };
    return `<span class="badge ${config.class}">${config.text}</span>`;
}

// Função para carregar informações do paciente na aba de movimentação
function loadPatientInfoInMovementTab(paciente) {
    if (!paciente || !paciente.id) {
        console.error('❌ [LOAD_INFO] Paciente inválido');
        return;
    }
    
    console.log(`📋 [LOAD_INFO] Carregando informações do paciente ID ${paciente.id}`);
    
    // Atualizar informações básicas do paciente
    const infoElements = {
        'infoNome': paciente.nome,
        'infoProntuario': paciente.prontuario,
        'infoIdade': calcularIdade(paciente.data_nascimento),
        'infoConvenio': paciente.convenio || 'SUS'
    };
    
    Object.entries(infoElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Carregar histórico de movimentações
    carregarHistoricoMovimentacoes(paciente.id);
}

// Função para calcular idade
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 'N/A';
    
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (hoje.getMonth() < nascimento.getMonth() || 
        (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    
    return `${idade} anos`;
}

// NOVA FUNÇÃO: Sincronizar dados do paciente em todas as abas
function syncPatientDataToAllTabs(patient) {
    try {
        console.log('🔄 [SYNC] Sincronizando dados do paciente em todas as abas...');
        
        // Atualizar aba de movimentação
        updateMovementTabWithPatient(patient);
        
        // Armazenar no localStorage como backup
        localStorage.setItem('pacienteSelecionado', JSON.stringify(patient));
        
        console.log('✅ [SYNC] Sincronização concluída');
        
    } catch (error) {
        console.error('❌ [SYNC] Erro na sincronização:', error);
    }
}

// NOVA FUNÇÃO: Atualizar aba de movimentação com dados do paciente
function updateMovementTabWithPatient(patient) {
    try {
        console.log('🔄 [MOVEMENT_TAB] Atualizando aba de movimentação...');
        
        // Atualizar container de informações compactas
        const pacienteInfoContainer = document.getElementById('pacienteMovimentacaoInfo');
        if (pacienteInfoContainer) {
            // Preencher campos compactos
            const nomeElement = document.getElementById('infoNomeCompact');
            if (nomeElement) nomeElement.textContent = patient.nome || 'N/A';
            
            const prontuarioElement = document.getElementById('infoProntuarioCompact');
            if (prontuarioElement) prontuarioElement.textContent = patient.prontuario || 'N/A';
            
            const cpfElement = document.getElementById('infoCpfCompact');
            if (cpfElement) cpfElement.textContent = patient.cpf ? formatCPF(patient.cpf) : 'Não informado';
            
            const idadeElement = document.getElementById('infoIdadeCompact');
            if (idadeElement) idadeElement.textContent = calcularIdade(patient.data_nascimento);
            
            const convenioElement = document.getElementById('infoConvenioCompact');
            if (convenioElement) convenioElement.textContent = formatConvenio(patient.convenio);
            
            // Mostrar o container
            pacienteInfoContainer.style.display = 'block';
            pacienteInfoContainer.classList.add('show');
            
            console.log('✅ [MOVEMENT_TAB] Container de informações atualizado');
        }
        
        // Carregar histórico de movimentações
        if (patient.id) {
            carregarHistoricoMovimentacoes(patient.id);
        }
        
    } catch (error) {
        console.error('❌ [MOVEMENT_TAB] Erro ao atualizar aba de movimentação:', error);
    }
}

// NOVA FUNÇÃO: Verificar se há paciente selecionado globalmente
function verificarPacienteSelecionado() {
    console.log('🔍 [VERIFY] Verificando paciente selecionado...');
    
    // Primeiro, verificar variável global
    if (pacienteSelecionado && pacienteSelecionado.id) {
        console.log(`✅ [VERIFY] Paciente em memória: ${pacienteSelecionado.nome} (ID: ${pacienteSelecionado.id})`);
        return pacienteSelecionado;
    }
    
    // Se não há na memória, tentar recuperar do localStorage
    try {
        const pacienteStorage = localStorage.getItem('pacienteSelecionado');
        if (pacienteStorage) {
            const paciente = JSON.parse(pacienteStorage);
            if (paciente && paciente.id) {
                console.log(`♻️ [VERIFY] Paciente recuperado do localStorage: ${paciente.nome} (ID: ${paciente.id})`);
                pacienteSelecionado = paciente; // Restaurar na variável global
                return paciente;
            }
        }
    } catch (error) {
        console.error('❌ [VERIFY] Erro ao recuperar do localStorage:', error);
    }
    
    console.log('❌ [VERIFY] Nenhum paciente selecionado encontrado');
    return null;
}

// NOVA FUNÇÃO: Inicializar paciente do localStorage
function initializePatientFromStorage() {
    try {
        console.log('🔄 [INIT] Inicializando dados do paciente...');
        
        const paciente = verificarPacienteSelecionado();
        if (paciente) {
            console.log(`♻️ [INIT] Paciente recuperado: ${paciente.nome} (ID: ${paciente.id})`);
            
            // Sincronizar com todas as abas
            syncPatientDataToAllTabs(paciente);
            
            showInfo('Paciente Recuperado', 
                `Dados de <strong>${paciente.nome}</strong> foram restaurados da sessão anterior.`
            );
        } else {
            console.log('ℹ️ [INIT] Nenhum paciente anterior encontrado');
        }
        
    } catch (error) {
        console.error('❌ [INIT] Erro na inicialização:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('pacienteSelecionado');
    }
}

// Função para limpar dados do paciente (útil para logout ou reset)
function clearPatientData() {
    console.log('🧹 [CLEAR] Limpando dados do paciente...');
    
    pacienteSelecionado = null;
    localStorage.removeItem('pacienteSelecionado');
    
    // Esconder container de informações
    const pacienteInfoContainer = document.getElementById('pacienteMovimentacaoInfo');
    if (pacienteInfoContainer) {
        pacienteInfoContainer.style.display = 'none';
        pacienteInfoContainer.classList.remove('show');
    }
    
    // Limpar histórico
    const historicoContainer = document.getElementById('historicoMovimentacoes');
    if (historicoContainer) {
        historicoContainer.innerHTML = '<p class="text-muted">Nenhum paciente selecionado.</p>';
    }
    
    console.log('✅ [CLEAR] Dados limpos');
}

// Função para redirecionar para aba de movimentação com paciente selecionado
function redirectToMovementTab(paciente) {
    if (!paciente || !paciente.id) {
        console.error('❌ [REDIRECT] Paciente inválido para redirecionamento');
        showError('Erro', 'Dados do paciente inválidos');
        return;
    }
    
    console.log(`🔄 [REDIRECT] Redirecionando para aba de movimentação - Paciente: ${paciente.nome} (ID: ${paciente.id})`);
    
    // Atualizar paciente selecionado global
    pacienteSelecionado = paciente;
    
    // Ativar aba de movimentação
    const btnMovimentacao = document.querySelector('[data-form="movimentacao"]');
    const allBtns = document.querySelectorAll('.btn-toggle');
    const allContainers = document.querySelectorAll('.form-section-container');
    
    if (btnMovimentacao) {
        // Remover active de todos
        allBtns.forEach(btn => btn.classList.remove('active'));
        allContainers.forEach(container => container.classList.remove('active'));
        
        // Ativar aba de movimentação
        btnMovimentacao.classList.add('active');
        document.getElementById('movimentacao').classList.add('active');
        
        // Carregar informações do paciente
        loadPatientInfoInMovementTab(paciente);
        
        console.log('✅ [REDIRECT] Redirecionamento concluído');
    } else {
        console.error('❌ [REDIRECT] Botão de movimentação não encontrado');
        showError('Erro', 'Interface de movimentação não encontrada');
    }
}

// NOVA FUNÇÃO: Inicializar paciente do localStorage
function initializePatientFromStorage() {
    try {
        console.log('🔄 [INIT] Inicializando dados do paciente...');
        
        const paciente = verificarPacienteSelecionado();
        if (paciente) {
            console.log(`♻️ [INIT] Paciente recuperado: ${paciente.nome} (ID: ${paciente.id})`);
            
            // Sincronizar com todas as abas
            syncPatientDataToAllTabs(paciente);
            
            showInfo('Paciente Recuperado', 
                `Dados de <strong>${paciente.nome}</strong> foram restaurados da sessão anterior.`
            );
        } else {
            console.log('ℹ️ [INIT] Nenhum paciente anterior encontrado');
        }
        
    } catch (error) {
        console.error('❌ [INIT] Erro na inicialização:', error);
        // Limpar dados corrompidos
        localStorage.removeItem('pacienteSelecionado');
    }
}

// Função para limpar dados do paciente (útil para logout ou reset)
function clearPatientData() {
    console.log('🧹 [CLEAR] Limpando dados do paciente...');
    
    pacienteSelecionado = null;
    localStorage.removeItem('pacienteSelecionado');
    
    // Esconder container de informações
    const pacienteInfoContainer = document.getElementById('pacienteMovimentacaoInfo');
    if (pacienteInfoContainer) {
        pacienteInfoContainer.style.display = 'none';
        pacienteInfoContainer.classList.remove('show');
    }
    
    // Limpar histórico
    const historicoContainer = document.getElementById('historicoMovimentacoes');
    if (historicoContainer) {
        historicoContainer.innerHTML = '<p class="text-muted">Nenhum paciente selecionado.</p>';
    }
    
    console.log('✅ [CLEAR] Dados limpos');
}
