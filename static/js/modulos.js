// ================================
// SISTEMA DE MÓDULOS - JAVASCRIPT MODERNO
// ================================

class ModulesSystem {
    constructor() {
        this.modules = [];
        this.filteredModules = [];
        this.searchInput = null;
        this.userDropdown = null;
        this.userMenuToggle = null;
        
        this.init();
    }

    init() {
        this.setupDOMElements();
        this.setupEventListeners();
        this.loadModulesData();
        this.setupAnimations();
        this.startPeriodicUpdates();
    }

    setupDOMElements() {
        this.searchInput = document.getElementById('moduleSearch');
        this.userDropdown = document.getElementById('userDropdown');
        this.userMenuToggle = document.getElementById('userMenuToggle');
        
        // Selecionar todos os cards de módulos
        this.modules = Array.from(document.querySelectorAll('.module-card'));
    }

    setupEventListeners() {
        // Busca em tempo real
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            
            this.searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearchEnter(e.target.value);
                }
            });
        }

        // Menu dropdown do usuário
        if (this.userMenuToggle) {
            this.userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }

        // Fechar dropdown ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.userDropdown && !this.userDropdown.contains(e.target)) {
                this.userDropdown.classList.remove('show');
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Scroll suave para seções
        this.setupSmoothScrolling();

        // Lazy loading para animações
        this.setupIntersectionObserver();
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        this.modules.forEach(module => {
            const searchData = module.getAttribute('data-search');
            const moduleTitle = module.querySelector('h4')?.textContent.toLowerCase() || '';
            const moduleDescription = module.querySelector('.module-description')?.textContent.toLowerCase() || '';
            
            const isVisible = !searchTerm || 
                            searchData?.includes(searchTerm) ||
                            moduleTitle.includes(searchTerm) ||
                            moduleDescription.includes(searchTerm);
            
            if (isVisible) {
                module.style.display = 'block';
                module.style.animation = 'fadeInScale 0.3s ease-out';
            } else {
                module.style.display = 'none';
            }
        });

        // Mostrar/ocultar seções vazias
        this.updateSectionVisibility();
    }

    handleSearchEnter(query) {
        const visibleModules = this.modules.filter(module => 
            module.style.display !== 'none'
        );
        
        if (visibleModules.length === 1) {
            const moduleId = visibleModules[0].getAttribute('data-module');
            this.openModule(moduleId);
        }
    }

    updateSectionVisibility() {
        const sections = document.querySelectorAll('.module-section');
        
        sections.forEach(section => {
            const visibleModules = section.querySelectorAll('.module-card[style*="display: block"], .module-card:not([style*="display: none"])');
            
            if (visibleModules.length === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        });
    }

    toggleUserDropdown() {
        if (this.userDropdown) {
            this.userDropdown.classList.toggle('show');
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K para focar na busca
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.searchInput) {
                this.searchInput.focus();
                this.searchInput.select();
            }
        }

        // Escape para limpar busca
        if (e.key === 'Escape') {
            if (this.searchInput && this.searchInput.value) {
                this.searchInput.value = '';
                this.handleSearch('');
                this.searchInput.blur();
            }
        }

        // Atalhos numéricos para módulos (1-9)
        if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const index = parseInt(e.key) - 1;
            const visibleModules = this.modules.filter(module => 
                module.style.display !== 'none'
            );
            
            if (visibleModules[index]) {
                const moduleId = visibleModules[index].getAttribute('data-module');
                this.openModule(moduleId);
            }
        }
    }

    setupSmoothScrolling() {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        
        internalLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observar cards de módulos
        this.modules.forEach((module, index) => {
            module.style.animationDelay = `${index * 0.1}s`;
            observer.observe(module);
        });
    }

    setupAnimations() {
        // Animação de entrada sequencial para os cards
        this.modules.forEach((module, index) => {
            module.style.animationDelay = `${index * 0.05}s`;
        });

        // Adicionar efeito hover personalizado
        this.modules.forEach(module => {
            module.addEventListener('mouseenter', () => {
                this.addHoverEffect(module);
            });
            
            module.addEventListener('mouseleave', () => {
                this.removeHoverEffect(module);
            });
        });
    }

    addHoverEffect(module) {
        const icon = module.querySelector('.module-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    removeHoverEffect(module) {
        const icon = module.querySelector('.module-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    }

    loadModulesData() {
        // Carregar dados dos módulos do servidor
        this.modules.forEach(module => {
            const moduleId = module.getAttribute('data-module');
            this.loadModuleStats(moduleId);
        });
    }

    async loadModuleStats(moduleId) {
        try {
            // Simular dados até implementar endpoint real
            const stats = this.generateMockStats();
            const countElement = document.getElementById(`count-${moduleId}`);
            
            if (countElement) {
                this.animateNumber(countElement, 0, stats.accessCount, 1000);
            }
        } catch (error) {
            console.warn(`Erro ao carregar estatísticas do módulo ${moduleId}:`, error);
        }
    }

    generateMockStats() {
        return {
            accessCount: Math.floor(Math.random() * 50) + 5,
            activeUsers: Math.floor(Math.random() * 10) + 1,
            lastAccess: new Date()
        };
    }

    async loadQuickStats() {
        // Função removida - dashboard de estatísticas foi removido
        return;
    }

    animateNumber(element, start, end, duration) {
        if (!element) return;
        
        const startTime = performance.now();
        const difference = end - start;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (difference * easeOut));
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    startPeriodicUpdates() {
        // Atualizar contadores de acesso a cada 2 minutos
        setInterval(() => {
            this.loadModulesData();
        }, 2 * 60 * 1000);
    }

    openModule(moduleId) {
        if (!moduleId) return;
        
        // Adicionar efeito de loading
        const moduleCard = document.querySelector(`[data-module="${moduleId}"]`);
        if (moduleCard) {
            moduleCard.style.transform = 'scale(0.95)';
            moduleCard.style.opacity = '0.7';
            
            setTimeout(() => {
                window.location.href = `/modulo/${moduleId}`;
            }, 200);
        } else {
            window.location.href = `/modulo/${moduleId}`;
        }
    }

    // Método público para ser chamado pelos cards
    handleModuleClick(moduleId) {
        this.openModule(moduleId);
    }
}

// ================================
// FUNÇÕES GLOBAIS (COMPATIBILIDADE)
// ================================

function openModule(moduleId) {
    if (window.modulesSystem) {
        window.modulesSystem.handleModuleClick(moduleId);
    }
}

async function logout() {
    try {
        // Mostrar loading
        const logoutBtn = document.querySelector('.logout-item');
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saindo...';
        }

        const response = await fetch('/logout', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });

        const data = await response.json();

        if (data.status === 'success') {
            // Animação de fade out
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '0';
            
            setTimeout(() => {
                window.location.href = '/';
            }, 300);
        } else {
            showError('Erro de Logout', 'Erro ao fazer logout. Por favor, tente novamente.');
            
            // Restaurar botão
            if (logoutBtn) {
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
            }
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Erro de Sistema', 'Erro ao fazer logout. Por favor, tente novamente.');
        
        // Restaurar botão
        const logoutBtn = document.querySelector('.logout-item');
        if (logoutBtn) {
            logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Sair';
        }
    }
}

// ================================
// INICIALIZAÇÃO
// ================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de módulos
    window.modulesSystem = new ModulesSystem();
    
    // Adicionar dicas de atalhos
    const searchInput = document.getElementById('moduleSearch');
    if (searchInput) {
        searchInput.setAttribute('title', 'Buscar módulos (Ctrl+K)');
        searchInput.setAttribute('placeholder', 'Buscar módulo... (Ctrl+K)');
    }
    
    console.log('Sistema de Módulos inicializado com sucesso!');
});

// ================================
// UTILITÁRIOS
// ================================

// Função para mostrar erros (integração com sistema de notificações)
function showError(title, message) {
    if (typeof showToast === 'function') {
        showToast(message, 'error');
    } else {
        alert(`${title}: ${message}`);
    }
}

// Função para mostrar sucesso
function showSuccess(title, message) {
    if (typeof showToast === 'function') {
        showToast(message, 'success');
    } else {
        console.log(`${title}: ${message}`);
    }
}

// Debounce para otimizar busca
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Função para detectar dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Service Worker para cache (futuro)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js'); // Implementar futuramente
    });
}
