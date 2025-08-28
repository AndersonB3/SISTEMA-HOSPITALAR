// Sistema de Notificações Toast Global
// Este arquivo contém funções padronizadas para exibir notificações em todo o sistema

// Função principal para criar toasts
function showToast(type, title, message, duration = 3000) {
    // Verificar se já existe um container toast na página
    let toastContainer = document.getElementById('toastContainer');
    
    // Se não existir, criar um
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
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

// Função para remover toast
function removeToast(toast) {
    if (!toast) return;
    
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

// Função para confirmar ação com toast personalizado
function confirmarAcao(mensagem, callback, titulo = 'Confirmação') {
    const toast = showToast('warning', titulo, `
        ${mensagem}
        <div class="toast-actions" style="margin-top: 15px; text-align: center;">
            <button onclick="confirmarToastAction(this, true)" class="btn btn-sm btn-primary" style="margin-right: 10px;">
                <i class="fas fa-check"></i> Confirmar
            </button>
            <button onclick="confirmarToastAction(this, false)" class="btn btn-sm btn-secondary">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
    `, 0); // Duration 0 = não remove automaticamente
    
    // Guardar callback no elemento
    toast.confirmCallback = callback;
    
    return toast;
}

// Função auxiliar para confirmação
function confirmarToastAction(button, confirmed) {
    const toast = button.closest('.toast');
    const callback = toast.confirmCallback;
    
    removeToast(toast);
    
    if (confirmed && callback) {
        callback();
    }
}

// Adicionar estilos CSS se não existirem
function addToastStyles() {
    if (document.getElementById('toastStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.innerHTML = `
        /* Sistema de Notificações Toast Global - Posicionamento Inferior Direito */
        .toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 400px;
            display: flex;
            flex-direction: column-reverse;
        }
        
        .toast {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            margin-bottom: 12px;
            border-left: 4px solid #ccc;
            opacity: 0;
            transform: translateX(100%) translateY(20px);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.3);
            min-width: 320px;
        }
        
        .toast.show {
            opacity: 1;
            transform: translateX(0) translateY(0);
        }
        
        .toast.hide {
            opacity: 0;
            transform: translateX(100%) translateY(-20px);
        }
        
        .toast-success {
            border-left-color: #28a745;
        }
        
        .toast-error {
            border-left-color: #dc3545;
        }
        
        .toast-warning {
            border-left-color: #ffc107;
        }
        
        .toast-info {
            border-left-color: #17a2b8;
        }
        
        .toast-header {
            padding: 15px 20px 10px 20px;
            border-bottom: 1px solid rgba(233, 236, 240, 0.5);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, rgba(248, 249, 250, 0.8), rgba(233, 236, 240, 0.4));
        }
        
        .toast-title {
            font-weight: 700;
            font-size: 15px;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .toast-title i {
            font-size: 18px;
        }
        
        .toast-success .toast-title i {
            color: #28a745;
        }
        
        .toast-error .toast-title i {
            color: #dc3545;
        }
        
        .toast-warning .toast-title i {
            color: #ffc107;
        }
        
        .toast-info .toast-title i {
            color: #17a2b8;
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 20px;
            color: #6c757d;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .toast-close:hover {
            color: #2c3e50;
            background: rgba(0, 0, 0, 0.05);
        }
        
        .toast-body {
            padding: 10px 20px 15px 20px;
            color: #2c3e50;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: rgba(233, 236, 240, 0.5);
        }
        
        .toast-progress-bar {
            height: 100%;
            background: currentColor;
            width: 100%;
            transform-origin: left;
            animation: toastProgress var(--duration, 3s) linear forwards;
        }
        
        @keyframes toastProgress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
        }
        
        .toast-success .toast-progress-bar {
            background: #28a745;
        }
        
        .toast-error .toast-progress-bar {
            background: #dc3545;
        }
        
        .toast-warning .toast-progress-bar {
            background: #ffc107;
        }
        
        .toast-info .toast-progress-bar {
            background: #17a2b8;
        }
        
        .toast-actions {
            margin-top: 12px;
            display: flex;
            gap: 8px;
            justify-content: center;
        }
        
        .toast-actions .btn {
            padding: 6px 16px;
            font-size: 13px;
            border-radius: 6px;
            transition: all 0.3s ease;
            font-weight: 600;
            border: none;
        }
        
        .toast-actions .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        /* Responsividade para dispositivos móveis */
        @media (max-width: 480px) {
            .toast-container {
                left: 10px;
                right: 10px;
                bottom: 10px;
                max-width: none;
            }
            
            .toast {
                margin-bottom: 8px;
                min-width: auto;
                transform: translateY(100%);
            }
            
            .toast.show {
                transform: translateY(0);
            }
            
            .toast.hide {
                transform: translateY(100%);
            }
            
            .toast-header {
                padding: 12px 15px 8px 15px;
            }
            
            .toast-body {
                padding: 8px 15px 12px 15px;
                font-size: 13px;
            }
            
            .toast-title {
                font-size: 14px;
            }
        }
        
        @media (max-width: 768px) {
            .toast-container {
                left: 15px;
                right: 15px;
                bottom: 15px;
            }
            
            .toast {
                min-width: auto;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Função para remover toasts por tipo
function removeToastsByType(type) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toastsOfType = toastContainer.querySelectorAll(`.toast-${type}`);
    toastsOfType.forEach(toast => {
        removeToast(toast);
    });
}

// Inicializar estilos quando o script carregar
addToastStyles();

// Exportar funções para uso global
window.showToast = showToast;
window.removeToast = removeToast;
window.removeToastsByType = removeToastsByType;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
window.confirmarAcao = confirmarAcao;
window.confirmarToastAction = confirmarToastAction;
