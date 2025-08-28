/**
 * SISTEMA HOSPITALAR - JavaScript Responsivo
 * Funcionalidades para dispositivos móveis e tablets
 */

document.addEventListener('DOMContentLoaded', function() {
    initResponsiveFeatures();
    initMobileNavigation();
    initTouchOptimizations();
    initResponsiveTables();
    initMobileModals();
});

/**
 * Inicializa recursos responsivos gerais
 */
function initResponsiveFeatures() {
    // Detecta tipo de dispositivo
    const isMobile = window.innerWidth <= 767;
    const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1023;
    const isDesktop = window.innerWidth >= 1024;
    
    // Adiciona classes no body
    document.body.classList.add(
        isMobile ? 'is-mobile' : 
        isTablet ? 'is-tablet' : 'is-desktop'
    );
    
    // Ajusta viewport em orientação
    window.addEventListener('orientationchange', function() {
        setTimeout(adjustViewportForOrientation, 100);
    });
    
    // Redimensionamento de janela
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 250);
    });
}

/**
 * Navegação móvel com menu hambúrguer
 */
function initMobileNavigation() {
    // Criar botão hambúrguer se não existir
    createMobileMenuButton();
    
    // Event listeners para navegação móvel
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu, .module-nav, .header-actions');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        // Fechar menu ao clicar em links
        const navLinks = navMenu.querySelectorAll('a, button');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

/**
 * Cria botão hambúrguer para mobile
 */
function createMobileMenuButton() {
    const headerContent = document.querySelector('.header-content, .header-container');
    
    if (headerContent && !document.querySelector('.mobile-menu-btn')) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileBtn.setAttribute('aria-label', 'Menu');
        
        headerContent.appendChild(mobileBtn);
    }
}

/**
 * Toggle do menu mobile
 */
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu, .module-nav, .header-actions');
    const btn = document.querySelector('.mobile-menu-btn i');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
        
        if (btn) {
            btn.className = navMenu.classList.contains('active') ? 
                'fas fa-times' : 'fas fa-bars';
        }
        
        // Prevenir scroll do body quando menu está aberto
        document.body.style.overflow = navMenu.classList.contains('active') ? 
            'hidden' : '';
    }
}

/**
 * Fecha menu mobile
 */
function closeMobileMenu() {
    const navMenu = document.querySelector('.nav-menu, .module-nav, .header-actions');
    const btn = document.querySelector('.mobile-menu-btn i');
    
    if (navMenu && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        
        if (btn) {
            btn.className = 'fas fa-bars';
        }
        
        document.body.style.overflow = '';
    }
}

/**
 * Otimizações para touch
 */
function initTouchOptimizations() {
    // Melhora área de toque para botões pequenos
    const smallButtons = document.querySelectorAll('.btn-sm, .btn-xs, .icon-btn');
    smallButtons.forEach(btn => {
        if (window.innerWidth <= 767) {
            btn.style.minHeight = '44px';
            btn.style.minWidth = '44px';
        }
    });
    
    // Melhora campos de formulário para mobile
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (window.innerWidth <= 767) {
            input.style.fontSize = '16px'; // Previne zoom no iOS
        }
    });
    
    // Adiciona feedback tátil para botões
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        btn.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });
}

/**
 * Torna tabelas responsivas
 */
function initResponsiveTables() {
    const tables = document.querySelectorAll('table:not(.table-responsive table)');
    
    tables.forEach(table => {
        if (!table.closest('.table-responsive')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-responsive';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
        
        // Adiciona labels móveis para colunas
        if (window.innerWidth <= 767) {
            addMobileTableLabels(table);
        }
    });
}

/**
 * Adiciona labels para células em mobile
 */
function addMobileTableLabels(table) {
    const headers = table.querySelectorAll('th');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        cells.forEach((cell, index) => {
            if (headers[index] && !cell.getAttribute('data-label')) {
                cell.setAttribute('data-label', headers[index].textContent);
            }
        });
    });
}

/**
 * Modais responsivos
 */
function initMobileModals() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Ajusta altura para mobile
        if (window.innerWidth <= 767) {
            const modalContent = modal.querySelector('.modal-content, .modal-dialog');
            if (modalContent) {
                modalContent.style.maxHeight = '95vh';
                modalContent.style.overflowY = 'auto';
            }
        }
        
        // Melhora scroll em dispositivos touch
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.webkitOverflowScrolling = 'touch';
        }
    });
}

/**
 * Ajusta viewport na mudança de orientação
 */
function adjustViewportForOrientation() {
    // Força recálculo do viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
        );
        
        setTimeout(() => {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0'
            );
        }, 500);
    }
}

/**
 * Lida com redimensionamento
 */
function handleResize() {
    const currentWidth = window.innerWidth;
    
    // Atualiza classes do body
    document.body.className = document.body.className
        .replace(/is-(mobile|tablet|desktop)/g, '');
        
    if (currentWidth <= 767) {
        document.body.classList.add('is-mobile');
    } else if (currentWidth <= 1023) {
        document.body.classList.add('is-tablet');
    } else {
        document.body.classList.add('is-desktop');
    }
    
    // Reajusta elementos
    initTouchOptimizations();
    initResponsiveTables();
    
    // Fecha menu mobile se mudou para desktop
    if (currentWidth > 767) {
        closeMobileMenu();
    }
}

/**
 * Utilitários de detecção de dispositivo
 */
const DeviceUtils = {
    isMobile: () => window.innerWidth <= 767,
    isTablet: () => window.innerWidth >= 768 && window.innerWidth <= 1023,
    isDesktop: () => window.innerWidth >= 1024,
    isTouchDevice: () => 'ontouchstart' in window || navigator.maxTouchPoints > 0,
    
    // Detecta se é iOS
    isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent),
    
    // Detecta se é Android
    isAndroid: () => /Android/.test(navigator.userAgent),
    
    // Orientação
    isLandscape: () => window.innerHeight < window.innerWidth,
    isPortrait: () => window.innerHeight >= window.innerWidth
};

/**
 * Função para scroll suave para elemento
 */
function scrollToElement(element, offset = 0) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (element) {
        const top = element.offsetTop - offset;
        window.scrollTo({
            top: top,
            behavior: 'smooth'
        });
    }
}

/**
 * Função para notificações toast responsivas
 */
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Posicionamento responsivo
    if (DeviceUtils.isMobile()) {
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 10px;
            right: 10px;
            z-index: 9999;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        `;
    } else {
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            padding: 15px 20px;
            border-radius: 8px;
            min-width: 300px;
        `;
    }
    
    document.body.appendChild(toast);
    
    // Remove após duração
    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Expor utilitários globalmente
window.DeviceUtils = DeviceUtils;
window.scrollToElement = scrollToElement;
window.showToast = showToast;
