// js/main.js

class FipeAPI {
    constructor() {
        this.baseURL = 'https://parallelum.com.br/fipe/api/v1';
        // Para usar com outra API FIPE, substitua a URL base acima
        // Exemplo: this.baseURL = 'https://fipeapi.appspot.com/api/1';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFavorites();
        this.animateCounters();
        this.setupNavigation();
    }

    // Configuração dos event listeners
    setupEventListeners() {
        // Navigation toggle para mobile
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Formulário de consulta
        const consultaForm = document.getElementById('consultaForm');
        if (consultaForm) {
            consultaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.consultarVeiculo();
            });
        }

        // Seleção de tipo de veículo
        const tipoVeiculo = document.getElementById('tipoVeiculo');
        if (tipoVeiculo) {
            tipoVeiculo.addEventListener('change', () => {
                this.carregarMarcas();
            });
        }

        // Seleção de marca
        const marca = document.getElementById('marca');
        if (marca) {
            marca.addEventListener('change', () => {
                this.carregarModelos();
            });
        }

        // Seleção de modelo
        const modelo = document.getElementById('modelo');
        if (modelo) {
            modelo.addEventListener('change', () => {
                this.carregarAnos();
            });
        }

        // Adicionar aos favoritos
        const addFavorito = document.getElementById('addFavorito');
        if (addFavorito) {
            addFavorito.addEventListener('click', () => {
                this.adicionarFavorito();
            });
        }

        // Limpar favoritos
        const clearFavoritos = document.getElementById('clearFavoritos');
        if (clearFavoritos) {
            clearFavoritos.addEventListener('click', () => {
                this.limparFavoritos();
            });
        }

        // Smooth scroll para links internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Navegação entre páginas (simulada)
    setupNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Método GET - Carregar marcas
    async carregarMarcas() {
        const tipoVeiculo = document.getElementById('tipoVeiculo').value;
        const marcaSelect = document.getElementById('marca');
        const modeloSelect = document.getElementById('modelo');
        const anoSelect = document.getElementById('ano');

        if (!tipoVeiculo) return;

        try {
            this.showLoading();
            
            // Reset dos selects dependentes
            this.resetSelect(marcaSelect, 'Carregando marcas...');
            this.resetSelect(modeloSelect, 'Primeiro selecione a marca', true);
            this.resetSelect(anoSelect, 'Primeiro selecione o modelo', true);

            // Requisição GET para marcas
            const response = await fetch(`${this.baseURL}/${tipoVeiculo}/marcas`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const marcas = await response.json();
            
            this.populateSelect(marcaSelect, marcas, 'Selecione a marca');
            marcaSelect.disabled = false;

            this.hideLoading();

        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
            this.showError('Erro ao carregar marcas. Tente novamente.');
            this.resetSelect(marcaSelect, 'Erro ao carregar');
            this.hideLoading();
        }
    }

    // Método GET - Carregar modelos
    async carregarModelos() {
        const tipoVeiculo = document.getElementById('tipoVeiculo').value;
        const marcaId = document.getElementById('marca').value;
        const modeloSelect = document.getElementById('modelo');
        const anoSelect = document.getElementById('ano');

        if (!marcaId) return;

        try {
            this.showLoading();

            // Reset do select de anos
            this.resetSelect(modeloSelect, 'Carregando modelos...');
            this.resetSelect(anoSelect, 'Primeiro selecione o modelo', true);

            // Requisição GET para modelos
            const response = await fetch(`${this.baseURL}/${tipoVeiculo}/marcas/${marcaId}/modelos`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            const modelos = data.modelos || data;
            
            this.populateSelect(modeloSelect, modelos, 'Selecione o modelo');
            modeloSelect.disabled = false;

            this.hideLoading();

        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            this.showError('Erro ao carregar modelos. Tente novamente.');
            this.resetSelect(modeloSelect, 'Erro ao carregar');
            this.hideLoading();
        }
    }

    // Método GET - Carregar anos
    async carregarAnos() {
        const tipoVeiculo = document.getElementById('tipoVeiculo').value;
        const marcaId = document.getElementById('marca').value;
        const modeloId = document.getElementById('modelo').value;
        const anoSelect = document.getElementById('ano');

        if (!modeloId) return;

        try {
            this.showLoading();

            this.resetSelect(anoSelect, 'Carregando anos...');

            // Requisição GET para anos
            const response = await fetch(`${this.baseURL}/${tipoVeiculo}/marcas/${marcaId}/modelos/${modeloId}/anos`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const anos = await response.json();
            
            this.populateSelect(anoSelect, anos, 'Selecione o ano');
            anoSelect.disabled = false;

            this.hideLoading();

        } catch (error) {
            console.error('Erro ao carregar anos:', error);
            this.showError('Erro ao carregar anos. Tente novamente.');
            this.resetSelect(anoSelect, 'Erro ao carregar');
            this.hideLoading();
        }
    }

    // Método GET - Consultar veículo
    async consultarVeiculo() {
        const form = document.getElementById('consultaForm');
        const formData = new FormData(form);
        
        const tipoVeiculo = document.getElementById('tipoVeiculo').value;
        const marcaId = document.getElementById('marca').value;
        const modeloId = document.getElementById('modelo').value;
        const anoId = document.getElementById('ano').value;

        if (!tipoVeiculo || !marcaId || !modeloId || !anoId) {
            this.showError('Por favor, preencha todos os campos.');
            return;
        }

        try {
            this.showLoading();
            this.hideResult();

            // Requisição GET para consultar preço
            const response = await fetch(`${this.baseURL}/${tipoVeiculo}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const veiculo = await response.json();
            
            // Salvar dados do veículo atual para favoritos
            this.currentVehicle = {
                ...veiculo,
                tipoVeiculo,
                marcaId,
                modeloId,
                anoId,
                consultadoEm: new Date().toLocaleString('pt-BR')
            };

            this.showResult(veiculo);
            this.hideLoading();

        } catch (error) {
            console.error('Erro na consulta:', error);
            this.showError('Erro ao consultar veículo. Tente novamente.');
            this.hideLoading();
        }
    }

    // Método POST - Adicionar favorito (simulado com localStorage)
    adicionarFavorito() {
        if (!this.currentVehicle) {
            this.showError('Nenhum veículo consultado para adicionar aos favoritos.');
            return;
        }

        try {
            const favorites = this.getFavorites();
            
            // Verificar se já existe
            const exists = favorites.some(fav => 
                fav.CodigoFipe === this.currentVehicle.CodigoFipe
            );

            if (exists) {
                this.showError('Este veículo já está nos favoritos.');
                return;
            }

            // Adicionar aos favoritos
            favorites.push({
                id: Date.now(),
                ...this.currentVehicle
            });

            this.saveFavorites(favorites);
            this.showSuccess('Veículo adicionado aos favoritos!');

        } catch (error) {
            console.error('Erro ao adicionar favorito:', error);
            this.showError('Erro ao adicionar aos favoritos.');
        }
    }

    // Método DELETE - Remover favorito
    removerFavorito(id) {
        try {
            let favorites = this.getFavorites();
            favorites = favorites.filter(fav => fav.id !== id);
            
            this.saveFavorites(favorites);
            this.loadFavorites();
            this.showSuccess('Favorito removido!');

        } catch (error) {
            console.error('Erro ao remover favorito:', error);
            this.showError('Erro ao remover favorito.');
        }
    }

    // Método PUT - Atualizar favorito (simular atualização de preço)
    async atualizarFavorito(id) {
        try {
            const favorites = this.getFavorites();
            const favorito = favorites.find(fav => fav.id === id);
            
            if (!favorito) {
                this.showError('Favorito não encontrado.');
                return;
            }

            this.showLoading();

            // Buscar preço atualizado
            const response = await fetch(`${this.baseURL}/${favorito.tipoVeiculo}/marcas/${favorito.marcaId}/modelos/${favorito.modeloId}/anos/${favorito.anoId}`);
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const dadosAtualizados = await response.json();
            
            // Atualizar o favorito
            const index = favorites.findIndex(fav => fav.id === id);
            favorites[index] = {
                ...favorites[index],
                Valor: dadosAtualizados.Valor,
                MesReferencia: dadosAtualizados.MesReferencia,
                consultadoEm: new Date().toLocaleString('pt-BR')
            };

            this.saveFavorites(favorites);
            this.loadFavorites();
            this.showSuccess('Favorito atualizado!');
            this.hideLoading();

        } catch (error) {
            console.error('Erro ao atualizar favorito:', error);
            this.showError('Erro ao atualizar favorito.');
            this.hideLoading();
        }
    }

    // Limpar todos os favoritos
    limparFavoritos() {
        if (confirm('Tem certeza que deseja limpar todos os favoritos?')) {
            this.saveFavorites([]);
            this.loadFavorites();
            this.showSuccess('Favoritos limpos!');
        }
    }

    // Carregar favoritos na interface
    loadFavorites() {
        const favoritosList = document.getElementById('favoritosList');
        const emptyState = document.getElementById('emptyFavoritos');
        
        if (!favoritosList) return;

        const favorites = this.getFavorites();

        if (favorites.length === 0) {
            favoritosList.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        favoritosList.innerHTML = favorites.map(fav => `
            <div class="favorito-item fade-in">
                <div class="favorito-info">
                    <h4>${fav.Marca} ${fav.Modelo}</h4>
                    <p><strong>Ano:</strong> ${fav.AnoModelo} | <strong>Combustível:</strong> ${fav.Combustivel}</p>
                    <p><small>Consultado em: ${fav.consultadoEm}</small></p>
                    <p><small>Mês Referência: ${fav.MesReferencia}</small></p>
                </div>
                <div class="favorito-actions">
                    <div class="favorito-preco">${fav.Valor}</div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button onclick="fipeApp.atualizarFavorito(${fav.id})" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-sync"></i> Atualizar
                        </button>
                        <button onclick="fipeApp.removerFavorito(${fav.id})" class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Utilities
    getFavorites() {
        const favs = localStorage.getItem('fipeFavorites');
        return favs ? JSON.parse(favs) : [];
    }

    saveFavorites(favorites) {
        localStorage.setItem('fipeFavorites', JSON.stringify(favorites));
    }

    resetSelect(selectElement, placeholder, disabled = false) {
        selectElement.innerHTML = `<option value="">${placeholder}</option>`;
        selectElement.disabled = disabled;
    }

    populateSelect(selectElement, items, placeholder) {
        let html = `<option value="">${placeholder}</option>`;
        
        items.forEach(item => {
            html += `<option value="${item.codigo}">${item.nome}</option>`;
        });
        
        selectElement.innerHTML = html;
    }

    showResult(veiculo) {
        const resultado = document.getElementById('resultado');
        const resultadoContent = document.getElementById('resultadoContent');
        
        if (!resultado || !resultadoContent) return;

        resultadoContent.innerHTML = `
            <div class="veiculo-info">
                <h4>${veiculo.Marca} ${veiculo.Modelo}</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0;">
                    <p><strong>Ano Modelo:</strong> ${veiculo.AnoModelo}</p>
                    <p><strong>Combustível:</strong> ${veiculo.Combustivel}</p>
                    <p><strong>Código FIPE:</strong> ${veiculo.CodigoFipe}</p>
                    <p><strong>Mês Referência:</strong> ${veiculo.MesReferencia}</p>
                </div>
                <div style="text-align: center; margin: 2rem 0;">
                    <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color);">
                        ${veiculo.Valor}
                    </div>
                    <small style="color: var(--gray-600);">Preço médio FIPE</small>
                </div>
            </div>
        `;

        resultado.style.display = 'block';
        resultado.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideResult() {
        const resultado = document.getElementById('resultado');
        if (resultado) resultado.style.display = 'none';
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'block';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remover notificação existente
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Criar nova notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? 'var(--danger-color)' : type === 'success' ? 'var(--success-color)' : 'var(--primary-color)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; font-size: 1.2rem; margin-left: auto;">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove após 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Animação dos contadores na página inicial
    animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateValue(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateValue(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                element.textContent = Math.floor(current).toLocaleString('pt-BR');
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target.toLocaleString('pt-BR');
            }
        };

        updateCounter();
    }
}

// Adicionar estilos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Inicializar aplicação
const fipeApp = new FipeAPI();

// Event listener para quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('FIPE App carregado e pronto para uso!');
    
    // Log dos métodos HTTP disponíveis
    console.log('Métodos HTTP implementados:');
    console.log('• GET - Buscar marcas, modelos, anos e preços');
    console.log('• POST - Adicionar aos favoritos');
    console.log('• PUT - Atualizar favoritos');
    console.log('• DELETE - Remover favoritos');
});