// Sistema de Login Modernizado - Funções Principais
// Este arquivo contém todas as funcionalidades da nova página de login

// =========== FUNCIONALIDADES DE TABS ===========
function switchTab(tabId) {
    // Remove a classe active de todas as abas e conteúdos
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Encontra a aba clicada e adiciona active
    const clickedTab = event.target.closest('.tab');
    clickedTab.classList.add('active');
    
    // Mostra o conteúdo da aba selecionada
    document.getElementById(tabId).classList.add('active');
    
    // Limpa campos e mensagens de erro
    clearFormFields();
    clearMessages();
}

// =========== GERENCIAMENTO DE FORMULÁRIOS ===========
function clearFormFields() {
    document.querySelectorAll('input[type="text"], input[type="password"]').forEach(input => {
        input.value = '';
    });
    document.getElementById('selected-certificate').style.display = 'none';
}

function clearMessages() {
    const messageContainer = document.getElementById('mensagem');
    if (messageContainer) {
        messageContainer.innerHTML = '';
    }
}

// =========== FUNCIONALIDADES DE SENHA ===========
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// =========== CERTIFICADO DIGITAL ===========
function selectCertificate() {
    // Simular seleção de certificado digital
    // Em produção, isso seria integrado com a API de certificados do navegador
    const certificateInfo = {
        name: "Dr. João Silva",
        cpf: "123.456.789-00",
        issuer: "AC-VALID",
        validUntil: "2026-08-19"
    };
    
    displayCertificateInfo(certificateInfo);
    showSuccess('Certificado Selecionado', 'Certificado digital selecionado com sucesso!');
}

function displayCertificateInfo(certificateInfo) {
    const certificateElement = document.getElementById('selected-certificate');
    const infoElement = document.getElementById('certificate-info');
    
    infoElement.textContent = `${certificateInfo.name} - CPF: ${certificateInfo.cpf}`;
    certificateElement.style.display = 'block';
}

function loginWithCertificate() {
    const certificateInfo = document.getElementById('certificate-info').textContent;
    
    if (!certificateInfo) {
        showError('Certificado Obrigatório', 'Por favor, selecione um certificado digital primeiro.');
        return;
    }
    
    // Simular loading
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando Certificado...';
    btn.disabled = true;
    
    // Simulação de login com certificado
    fetch('/login/certificado', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken()
        },
        body: JSON.stringify({
            certificateData: 'sample-certificate-data'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccess('Login Realizado', 'Autenticação com certificado realizada com sucesso!');
            setTimeout(() => {
                window.location.href = '/modulos';
            }, 1500);
        } else {
            showError('Erro de Autenticação', data.message || 'Erro ao fazer login com certificado');
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        showError('Erro de Sistema', 'Erro ao processar o login com certificado');
    })
    .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
    });
}

// =========== PAINEL DE AJUDA ===========
function toggleHelp() {
    const helpContent = document.getElementById('helpContent');
    helpContent.classList.toggle('active');
}

// =========== POLÍTICA E TERMOS ===========
function showPrivacyPolicy() {
    showInfo('Política de Privacidade', 'Funcionalidade em desenvolvimento. Aguarde futuras atualizações.');
}

function showTerms() {
    showInfo('Termos de Uso', 'Funcionalidade em desenvolvimento. Aguarde futuras atualizações.');
}

// =========== UTILITÁRIOS ===========
function getCsrfToken() {
    const token = document.querySelector('input[name="csrf_token"]');
    return token ? token.value : '';
}

function validateForm(formData) {
    const username = formData.get('username');
    const password = formData.get('password');
    
    if (!username || username.trim() === '') {
        showError('Campo Obrigatório', 'Por favor, digite seu nome de usuário.');
        return false;
    }
    
    if (!password || password.trim() === '') {
        showError('Campo Obrigatório', 'Por favor, digite sua senha.');
        return false;
    }
    
    if (password.length < 3) {
        showError('Senha Inválida', 'A senha deve ter pelo menos 3 caracteres.');
        return false;
    }
    
    return true;
}

// =========== ANIMAÇÕES E EFEITOS ===========
function addLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    button.disabled = true;
    return originalText;
}

function removeLoadingState(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function animateOnLoad() {
    const elements = document.querySelectorAll('.login-card, .info-card, .help-trigger');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            el.style.transition = 'all 0.6s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// =========== EVENT LISTENERS ===========
document.addEventListener('DOMContentLoaded', function() {
    // Animações de entrada
    animateOnLoad();
    
    // Form submission do login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            // Validar formulário
            if (!validateForm(formData)) {
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = addLoadingState(submitBtn);
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': getCsrfToken()
                },
                body: new URLSearchParams(formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    showSuccess('Login Realizado', 'Login realizado com sucesso! Redirecionando...');
                    setTimeout(() => {
                        window.location.href = '/modulos';
                    }, 1500);
                } else if (data.status === 'pending_2fa') {
                    showWarning('Autenticação 2FA', data.message);
                    // Implementar modal de 2FA aqui se necessário
                } else {
                    showError('Erro de Login', data.message);
                    // Limpar senha em caso de erro
                    document.getElementById('password').value = '';
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showError('Erro de Conexão', 'Erro ao realizar login. Verifique sua conexão e tente novamente.');
            })
            .finally(() => {
                removeLoadingState(submitBtn, originalText);
            });
        });
    }
    
    // Fechar painel de ajuda ao clicar fora
    document.addEventListener('click', function(event) {
        const helpContent = document.getElementById('helpContent');
        const helpTrigger = document.querySelector('.help-trigger');
        
        if (helpContent && helpContent.classList.contains('active') && 
            !helpContent.contains(event.target) && 
            !helpTrigger.contains(event.target)) {
            helpContent.classList.remove('active');
        }
    });
    
    // Enter key nos campos de input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                if (this.closest('#login-tab')) {
                    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
                } else if (this.closest('#certificate-tab')) {
                    loginWithCertificate();
                }
            }
        });
    });
    
    // Validação em tempo real
    document.getElementById('username')?.addEventListener('input', function() {
        this.classList.toggle('is-invalid', this.value.length > 0 && this.value.length < 3);
    });
    
    document.getElementById('password')?.addEventListener('input', function() {
        this.classList.toggle('is-invalid', this.value.length > 0 && this.value.length < 3);
    });
});

// =========== FUNÇÕES LEGADAS (COMPATIBILIDADE) ===========
// Manter compatibilidade com código existente
function openSideContent(contentId) {
    console.warn('openSideContent é uma função legada. Use toggleHelp() para o novo design.');
    toggleHelp();
}

function closeSideContent(contentId) {
    console.warn('closeSideContent é uma função legada. Use toggleHelp() para o novo design.');
    const helpContent = document.getElementById('helpContent');
    if (helpContent) {
        helpContent.classList.remove('active');
    }
}

// =========== EXPORTAR FUNÇÕES GLOBAIS ===========
window.switchTab = switchTab;
window.togglePassword = togglePassword;
window.selectCertificate = selectCertificate;
window.loginWithCertificate = loginWithCertificate;
window.toggleHelp = toggleHelp;
window.showPrivacyPolicy = showPrivacyPolicy;
window.showTerms = showTerms;
window.openSideContent = openSideContent;
window.closeSideContent = closeSideContent;
