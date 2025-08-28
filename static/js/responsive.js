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
    initPortraitModeFeatures(); // Nova função para modo portrait
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
 * Funcionalidades específicas para modo portrait
 */
function initPortraitModeFeatures() {
    // Detecta orientação portrait
    function isPortraitMode() {
        return window.innerHeight > window.innerWidth && window.innerWidth <= 767;
    }
    
    // Aplica ajustes para portrait
    function applyPortraitOptimizations() {
        const isPortrait = isPortraitMode();
        document.body.classList.toggle('portrait-mode', isPortrait);
        
        if (isPortrait) {
            // Ajustes específicos para portrait
            optimizeFormLayoutPortrait();
            optimizeTableScrollPortrait();
            optimizeModalSizePortrait();
            adjustHeaderForPortrait();
            handleKeyboardPortrait();
        }
    }
    
    // Otimiza formulários em portrait
    function optimizeFormLayoutPortrait() {
        const forms = document.querySelectorAll('.form-container, .login-card');
        forms.forEach(form => {
            // Força layout de coluna única
            const formRows = form.querySelectorAll('.form-row');
            formRows.forEach(row => {
                row.style.gridTemplateColumns = '1fr';
                row.style.gap = '0.75rem';
            });
            
            // Ajusta botões para largura total
            const buttons = form.querySelectorAll('.btn');
            buttons.forEach(btn => {
                if (!btn.classList.contains('btn-toggle')) {
                    btn.style.width = '100%';
                    btn.style.marginBottom = '0.5rem';
                }
            });
        });
    }
    
    // Otimiza scroll de tabelas em portrait
    function optimizeTableScrollPortrait() {
        const tableContainers = document.querySelectorAll('.table-responsive');
        tableContainers.forEach(container => {
            // Adiciona indicador de scroll
            const scrollIndicator = document.createElement('div');
            scrollIndicator.className = 'scroll-indicator portrait-only';
            scrollIndicator.innerHTML = '<i class="fas fa-arrows-alt-h"></i> Deslize para ver mais';
            scrollIndicator.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: rgba(59, 130, 246, 0.9);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.7rem;
                z-index: 10;
                opacity: 0.8;
            `;
            
            if (!container.querySelector('.scroll-indicator')) {
                container.style.position = 'relative';
                container.appendChild(scrollIndicator);
            }
            
            // Oculta colunas menos importantes em portrait
            const table = container.querySelector('table');
            if (table) {
                const headers = table.querySelectorAll('th');
                const cells = table.querySelectorAll('td');
                
                // Define quais colunas ocultar (últimas colunas geralmente)
                const columnsToHide = Math.max(0, headers.length - 3);
                
                headers.forEach((header, index) => {
                    if (index >= headers.length - columnsToHide) {
                        header.classList.add('mobile-portrait-hidden');
                    }
                });
                
                cells.forEach((cell, index) => {
                    const columnIndex = index % headers.length;
                    if (columnIndex >= headers.length - columnsToHide) {
                        cell.classList.add('mobile-portrait-hidden');
                    }
                });
            }
        });
    }
    
    // Otimiza modais em portrait
    function optimizeModalSizePortrait() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                // Força modal fullscreen em portrait
                modalContent.style.width = '100%';
                modalContent.style.height = '100vh';
                modalContent.style.maxHeight = '100vh';
                modalContent.style.margin = '0';
                modalContent.style.borderRadius = '0';
                modalContent.style.display = 'flex';
                modalContent.style.flexDirection = 'column';
                
                // Ajusta body do modal para scroll
                const modalBody = modal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.style.flex = '1';
                    modalBody.style.overflowY = 'auto';
                    modalBody.style.webkitOverflowScrolling = 'touch';
                }
            }
        });
    }
    
    // Ajusta header em portrait
    function adjustHeaderForPortrait() {
        const headers = document.querySelectorAll('.login-header, .modern-header, .main-header');
        headers.forEach(header => {
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.zIndex = '100';
            
            // Compacta elementos do header
            const headerContent = header.querySelector('.header-content, .header-container');
            if (headerContent) {
                headerContent.style.flexDirection = 'column';
                headerContent.style.gap = '0.5rem';
                headerContent.style.padding = '0 1rem';
                headerContent.style.textAlign = 'center';
            }
            
            // Oculta elementos secundários
            const elementsToHide = header.querySelectorAll('.header-info, .status-indicator, .version, .user-profile');
            elementsToHide.forEach(el => el.style.display = 'none');
        });
    }
    
    // Manipula teclado virtual em portrait
    function handleKeyboardPortrait() {
        let initialViewportHeight = window.innerHeight;
        
        // Detecta quando teclado abre/fecha
        window.addEventListener('resize', function() {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            // Se altura diminuiu significativamente, teclado provavelmente abriu
            if (heightDifference > 150) {
                document.body.classList.add('keyboard-open');
                
                // Ajusta modais com teclado aberto
                const activeModal = document.querySelector('.modal.show');
                if (activeModal) {
                    const modalContent = activeModal.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.height = currentHeight + 'px';
                    }
                }
            } else {
                document.body.classList.remove('keyboard-open');
            }
        });
        
        // Scroll para campo focado
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                setTimeout(() => {
                    if (isPortraitMode()) {
                        this.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }, 300); // Aguarda teclado aparecer
            });
        });
    }
    
    // Monitora mudanças de orientação
    function handleOrientationChange() {
        setTimeout(() => {
            applyPortraitOptimizations();
            
            // Força recálculo de layout
            const elements = document.querySelectorAll('.modal-content, .form-container, .table-responsive');
            elements.forEach(el => {
                el.style.display = 'none';
                el.offsetHeight; // Force reflow
                el.style.display = '';
            });
        }, 100);
    }
    
    // Event listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', applyPortraitOptimizations);
    
    // Aplicação inicial
    applyPortraitOptimizations();
    
    // Adiciona CSS dinâmico para correções específicas
    addPortraitDynamicCSS();
}

/**
 * Adiciona CSS dinâmico específico para portrait
 */
function addPortraitDynamicCSS() {
    const style = document.createElement('style');
    style.id = 'portrait-dynamic-css';
    style.textContent = `
        /* Correções dinâmicas para portrait mode */
        .portrait-mode .keyboard-open {
            position: fixed !important;
            overflow: hidden !important;
        }
        
        .portrait-mode .keyboard-open .modal-content {
            height: auto !important;
            max-height: 60vh !important;
        }
        
        .portrait-mode .scroll-indicator {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        
        /* Otimizações de toque para portrait */
        .portrait-mode .btn,
        .portrait-mode .form-control,
        .portrait-mode .card {
            min-height: 44px !important;
        }
        
        .portrait-mode .btn:active,
        .portrait-mode .card:active {
            transform: scale(0.98);
            transition: transform 0.1s ease;
        }
        
        /* Melhor contraste em portrait */
        .portrait-mode .table th {
            background: #f1f5f9 !important;
            font-weight: 600 !important;
        }
        
        /* Scroll suave em portrait */
        .portrait-mode .modal-body,
        .portrait-mode .table-responsive {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
        }
    `;
    
    // Remove estilo anterior se existir
    const existingStyle = document.getElementById('portrait-dynamic-css');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
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
