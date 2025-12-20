// Admin credentials
const ADMIN_CREDENTIALS = {
    username: "multiPerfil2024",
    password: "Gig@Byte2012"
};

// Storage for all content
let blogPosts = JSON.parse(localStorage.getItem('socializaPetPosts')) || [];
let banners = JSON.parse(localStorage.getItem('socializaPetBanners')) || [];
let products = JSON.parse(localStorage.getItem('socializaPetProducts')) || [];
let gallery = JSON.parse(localStorage.getItem('socializaPetGallery')) || [];
let siteContent = JSON.parse(localStorage.getItem('socializaPetContent')) || {};
let siteSettings = JSON.parse(localStorage.getItem('socializaPetSettings')) || {};

let editingPostId = null;
let editingBannerId = null;
let editingProductId = null;
let editingGalleryId = null;

// Log de inicialização
console.log('🟢 ADMIN PANEL INICIALIZANDO...');
console.log('📊 Banners carregados:', banners.length);
console.log('📝 Posts carregados:', blogPosts.length);
console.log('🛒 Produtos carregados:', products.length);

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    checkAutoLogin();
    loadAllContent();
});

// Auto login check
function checkAutoLogin() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    if (isLoggedIn === 'true') {
        showAdminPanel();
    }
}

// Handle login (função nova e mais robusta)
function doLogin() {
    const loginBtn = document.querySelector('.btn-login');
    const originalText = loginBtn.innerHTML;

    try {
        // Mostrar indicador de carregamento
        loginBtn.innerHTML = '🔄 Entrando...';
        loginBtn.disabled = true;

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        console.log('🔐 Tentativa de login:', { username, password: '***' });
        console.log('🔑 Credenciais esperadas:', {
            username: ADMIN_CREDENTIALS.username,
            password: '***'
        });

        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            console.log('✅ Login aprovado!');
            loginBtn.innerHTML = '✅ Sucesso!';

            setTimeout(() => {
                sessionStorage.setItem('adminLoggedIn', 'true');
                showAdminPanel();
                showToast('✅ Login realizado com sucesso!', 'success');
            }, 500);

        } else {
            console.log('❌ Login rejeitado!');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            showError('❌ Usuário ou senha incorretos!');
        }
    } catch (error) {
        console.error('❌ Erro no processo de login:', error);
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
        showError('❌ Erro interno. Tente novamente.');
    }
}

// Handle login (função antiga mantida para compatibilidade)
function handleLogin(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    doLogin();
    return false;
}

// Show admin panel
function showAdminPanel() {
    try {
        console.log('🔄 Iniciando carregamento do painel...');

        const loginContainer = document.getElementById('loginContainer');
        const adminContainer = document.getElementById('adminContainer');

        console.log('📦 Containers encontrados:', {
            login: !!loginContainer,
            admin: !!adminContainer
        });

        if (!loginContainer || !adminContainer) {
            throw new Error('Containers não encontrados');
        }

        loginContainer.style.display = 'none';
        adminContainer.style.display = 'block';

        console.log('🔄 Carregando conteúdos...');

        // Aguardar um pouco para garantir que DOM está pronto
        setTimeout(() => {
            try {
                // Carregar todos os conteúdos
                loadAllContent();

                console.log('📊 Atualizando estatísticas...');

                // Atualizar estatísticas após carregar conteúdo
                setTimeout(() => {
                    updateAllStats();
                }, 100);

                console.log('📝 Exibindo posts...');

                // Exibir posts por padrão
                displayPosts();

                console.log('✅ Painel administrativo carregado com sucesso!');

            } catch (innerError) {
                console.error('❌ Erro interno:', innerError);
            }
        }, 200);

    } catch (error) {
        console.error('❌ Erro ao carregar painel administrativo:', error);
        alert('❌ Erro ao carregar painel: ' + error.message + '. Recarregue a página.');
    }
}

// Logout
function logout() {
    if (confirm('Tem certeza que deseja sair?')) {
        sessionStorage.removeItem('adminLoggedIn');
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminContainer').style.display = 'none';
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        showToast('👋 Logout realizado com sucesso!', 'info');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    if (type === 'success') toast.style.background = '#28a745';
    if (type === 'error') toast.style.background = '#dc3545';
    if (type === 'info') toast.style.background = '#17a2b8';

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// Load posts from localStorage
function loadPosts() {
    // Carregar apenas do armazenamento do admin
    blogPosts = JSON.parse(localStorage.getItem('socializaPetPosts')) || [];

    // Auto-fix Drive links
    const { items: fixed, updated } = autoFixDriveLinks(blogPosts);
    if (updated) {
        blogPosts = fixed;
        localStorage.setItem('socializaPetPosts', JSON.stringify(blogPosts));
        console.log('✅ Posts images updated from Google Drive links.');
    }

    // Se não há posts no admin, criar posts iniciais apenas uma vez
    if (blogPosts.length === 0 && !localStorage.getItem('adminInitialized')) {
        createInitialPosts();
        localStorage.setItem('adminInitialized', 'true');
    }

    updateStats();
}

// Criar posts iniciais apenas uma vez
function createInitialPosts() {
    const initialPosts = [
        {
            id: Date.now() + 1,
            title: "🍽️ 5 Dicas Essenciais para Alimentação do seu Pet",
            category: "Alimentação",
            image: "https://picsum.photos/400/250?random=1",
            excerpt: "Descubra como manter seu pet saudável com uma alimentação equilibrada e nutritiva. Dicas práticas que farão toda a diferença!",
            content: "Uma alimentação adequada é fundamental para a saúde do seu pet. Aqui estão 5 dicas essenciais: 1) Escolha ração de qualidade, 2) Mantenha horários regulares, 3) Controle as porções, 4) Ofereça água fresca sempre, 5) Evite alimentos tóxicos para pets.",
            date: new Date().toLocaleDateString('pt-BR'),
            author: "Admin SocializaPet"
        },
        {
            id: Date.now() + 2,
            title: "🐕 Golden Retriever: Tudo sobre esta Raça Incrível",
            category: "Guia de Raças",
            image: "https://picsum.photos/400/250?random=3",
            excerpt: "Conheça todas as características, cuidados e temperamento do Golden Retriever. Uma das raças mais carinhosas e leais do mundo!",
            content: "O Golden Retriever é conhecido por sua personalidade amigável e leal. Características principais: Porte médio a grande, pelagem dourada, muito inteligente, ótimo com crianças, necessita exercícios regulares, expectativa de vida de 10-12 anos. Cuidados especiais: escovação regular, exercícios diários, alimentação balanceada.",
            date: new Date().toLocaleDateString('pt-BR'),
            author: "Admin SocializaPet"
        },
        {
            id: Date.now() + 3,
            title: "🐕 Labrador: O Companheiro Perfeito para Famílias",
            category: "Guia de Raças",
            image: "https://picsum.photos/400/250?random=5",
            excerpt: "Tudo o que você precisa saber sobre o Labrador: temperamento dócil, cuidados essenciais e por que são ideais para famílias com crianças.",
            content: "O Labrador é uma das raças mais populares do mundo. Características: Temperamento dócil e amigável, excelente com crianças, muito leal, porte médio-grande, pelagem resistente à água, alta energia. Necessidades: exercícios diários intensos, alimentação controlada (tendem ao sobrepeso), socialização desde cedo, treinamento positivo.",
            date: new Date().toLocaleDateString('pt-BR'),
            author: "Admin SocializaPet"
        }
    ];

    blogPosts = initialPosts;
    localStorage.setItem('socializaPetPosts', JSON.stringify(blogPosts));
}

// Update statistics
function updateStats() {
    document.getElementById('totalPosts').textContent = blogPosts.length;

    const guiaRacasPosts = document.getElementById('guiaRacasPosts');
    if (guiaRacasPosts) {
        guiaRacasPosts.textContent = blogPosts.filter(post => post.category === 'Guia de Raças').length;
    }

    // Posts this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekPosts = blogPosts.filter(post => {
        const postDate = new Date(post.date.split('/').reverse().join('-'));
        return postDate >= oneWeekAgo;
    }).length;

    const thisWeekPostsEl = document.getElementById('thisWeekPosts');
    if (thisWeekPostsEl) {
        thisWeekPostsEl.textContent = thisWeekPosts;
    }

    // Unique categories
    const categories = [...new Set(blogPosts.map(post => post.category))];
    const totalCategoriesEl = document.getElementById('totalCategories');
    if (totalCategoriesEl) {
        totalCategoriesEl.textContent = categories.length;
    }
}

// Display posts
function displayPosts(postsToShow = blogPosts) {
    const postsGrid = document.getElementById('postsGrid');

    if (postsToShow.length === 0) {
        postsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>Nenhum post encontrado</h3>
                        <p>Crie sua primeira postagem clicando no botão "Nova Postagem"</p>
                    </div>
                `;
        return;
    }

    postsGrid.innerHTML = postsToShow.map(post => `
                <div class="post-card">
                    <div class="post-header">
                        <div class="post-title">${post.title}</div>
                        <div class="post-actions">
                            <button class="btn btn-primary btn-sm" onclick="editPost(${post.id})">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">
                                🗑️ Excluir
                            </button>
                        </div>
                    </div>
                    
                    <div class="post-meta">
                        <span class="post-category">${post.category}</span>
                        <span class="post-date">📅 ${post.date}</span>
                        <span class="post-date">👤 ${post.author}</span>
                    </div>
                    
                    <div class="post-excerpt">${post.excerpt}</div>
                </div>
            `).join('');
}

// Filter posts
function filterPosts(searchTerm) {
    const filtered = blogPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayPosts(filtered);
}

// Open new post modal
function openNewPostModal() {
    editingPostId = null;
    document.getElementById('modalTitle').textContent = '✍️ Nova Postagem';
    document.getElementById('postTitle').value = '';
    document.getElementById('postCategory').value = '';
    document.getElementById('postImage').value = '';
    document.getElementById('postExcerpt').value = '';
    document.getElementById('postContent').value = '';
    document.getElementById('postModal').style.display = 'flex';
}

// Edit post
function editPost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    editingPostId = id;
    document.getElementById('modalTitle').textContent = '✏️ Editar Postagem';
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postModal').style.display = 'flex';
}

// Close post modal
function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    editingPostId = null;
}

// Save post
function savePost(event) {
    event.preventDefault();

    const title = document.getElementById('postTitle').value;
    const category = document.getElementById('postCategory').value;
    const rawImage = document.getElementById('postImage').value;
    const image = convertGoogleDriveLink(rawImage) || `https://picsum.photos/400/250?random=${Date.now()}`;
    const excerpt = document.getElementById('postExcerpt').value;
    const content = document.getElementById('postContent').value;

    if (editingPostId) {
        // Update existing post
        const postIndex = blogPosts.findIndex(p => p.id === editingPostId);
        if (postIndex !== -1) {
            blogPosts[postIndex] = {
                ...blogPosts[postIndex],
                title,
                category,
                image,
                excerpt,
                content
            };
            showToast('✅ Post atualizado com sucesso!');
        }
    } else {
        // Create new post
        const newPost = {
            id: Date.now(),
            title,
            category,
            image,
            excerpt,
            content,
            date: new Date().toLocaleDateString('pt-BR'),
            author: 'Admin SocializaPet'
        };
        blogPosts.unshift(newPost);
        showToast('✅ Post criado com sucesso!');
    }

    // Save to localStorage
    localStorage.setItem('socializaPetPosts', JSON.stringify(blogPosts));

    // Update displays
    updateStats();
    displayPosts();
    closePostModal();
}

// Delete post
function deletePost(id) {
    const post = blogPosts.find(p => p.id === id);
    if (!post) return;

    if (confirm(`Tem certeza que deseja excluir o post "${post.title}"?`)) {
        blogPosts = blogPosts.filter(p => p.id !== id);

        // Salvar nos dois locais para garantir sincronização
        localStorage.setItem('socializaPetPosts', JSON.stringify(blogPosts));
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts));

        updateStats();
        displayPosts();
        showToast('🗑️ Post excluído com sucesso!');
    }
}

// Sync with main blog
function syncWithBlog() {
    // Copy posts to main blog storage, sobrescrevendo completamente
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    // Marcar como sincronizado
    localStorage.setItem('blogSynced', 'true');
    showToast('🔄 Sincronização com blog principal realizada!');
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(blogPosts, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `socializapet-posts-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📤 Dados exportados com sucesso!');
}

// Handle modal click outside
document.getElementById('postModal').addEventListener('click', function (e) {
    if (e.target === this) {
        closePostModal();
    }
});

// =============== TAB MANAGEMENT ===============
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Content').classList.add('active');

    // Add active class to clicked button if event is present
    if (typeof event !== 'undefined' && event.target) {
        event.target.classList.add('active');
    } else {
        // Fallback if event is not passed (e.g. initial load)
        const tabBtn = document.getElementById(tabName + 'Tab');
        if (tabBtn) tabBtn.classList.add('active');
    }

    // Load content for the selected tab
    switch (tabName) {
        case 'posts':
            displayPosts();
            break;
        case 'banners':
            displayBanners();
            break;
        case 'products':
            displayProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'gallery':
            displayGallery();
            break;
        case 'content':
            loadContentForm();
            break;
        case 'settings':
            loadSettingsForm();
            break;
    }
}

// =============== CONTENT LOADING ===============
function loadAllContent() {
    loadPosts();
    loadBanners();
    loadProducts();
    loadOrders();
    loadGallery();
    loadContent();
    loadSettings();
}

function loadBanners() {
    // Auto-fix: Atualizar links antigos do Google Drive e corrigir banner default quebrado
    let updated = false;

    // ID do arquivo quebrado conhecido (default antigo)
    const brokenDefaultId = '1DtzW0MkXOnZRxjWlHoRcllC9kRliCqM';
    const newDefaultImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80';

    banners = banners.map(b => {
        let currentImage = b.image || '';
        let modified = false;

        // 1. Correção específica para o banner default quebrado
        if (currentImage.includes(brokenDefaultId)) {
            b.image = newDefaultImage;
            b.imageType = 'url';
            b.iframe = ''; // Limpar iframe antigo se existir
            modified = true;
        }
        // 2. Correção genérica para outros links do Google Drive (uc?export=view -> thumbnail)
        else if (currentImage.includes('drive.google.com') && !currentImage.includes('thumbnail')) {
            let fileId = null;
            const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/];
            for (const p of patterns) {
                const m = currentImage.match(p);
                if (m) fileId = m[1];
            }

            if (fileId) {
                b.image = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
                modified = true;
            }
        }

        if (modified) {
            updated = true;
        }
        return b;
    });

    if (updated) {
        localStorage.setItem('socializaPetBanners', JSON.stringify(banners));
        console.log('✅ Banners corrigidos e salvos automaticamente.');
        if (typeof showToast === 'function') {
            showToast('✅ Banners antigos foram corrigidos automaticamente!', 'success');
        }
    }

    if (banners.length === 0 && !localStorage.getItem('bannersInitialized')) {
        // Se ainda vazio, cria o inicial seguro
        createInitialBanners();
        localStorage.setItem('bannersInitialized', 'true');
    }
}

function loadProducts() {
    if (products.length === 0 && !localStorage.getItem('productsInitialized')) {
        createInitialProducts();
        localStorage.setItem('productsInitialized', 'true');
    } else {
        // Auto-fix Drive links
        const { items: fixed, updated } = autoFixDriveLinks(products);
        if (updated) {
            products = fixed;
            localStorage.setItem('socializaPetProducts', JSON.stringify(products));
            console.log('✅ Products images updated from Google Drive links.');
        }
    }
}

function loadGallery() {
    if (gallery.length === 0 && !localStorage.getItem('galleryInitialized')) {
        createInitialGallery();
        localStorage.setItem('galleryInitialized', 'true');
    } else {
        // Auto-fix Drive links
        const { items: fixed, updated } = autoFixDriveLinks(gallery);
        if (updated) {
            gallery = fixed;
            localStorage.setItem('socializaPetGallery', JSON.stringify(gallery));
            console.log('✅ Gallery images updated from Google Drive links.');
        }
    }
}

function loadContent() {
    if (Object.keys(siteContent).length === 0) {
        siteContent = {
            title: 'SocializaPet',
            subtitle: 'Conectando pets e pessoas com amor 🐾',
            about: 'Somos uma organização dedicada ao bem-estar animal e à criação de vínculos especiais entre pets e famílias.',
            project: 'O Projeto Socializa é nossa iniciativa de impacto social para promover a adoção responsável.',
            whatsapp: '5511999999999',
            email: 'contato@socializapet.com'
        };
        localStorage.setItem('socializaPetContent', JSON.stringify(siteContent));
    }
}

function loadSettings() {
    if (Object.keys(siteSettings).length === 0) {
        siteSettings = {
            primaryColor: '#F28DB2',
            secondaryColor: '#0597F2',
            adoptedPets: 500,
            happyFamilies: 350,
            partners: 25,
            logoUrl: 'socializapet-logo.png',
            faviconUrl: 'socializapet-logo.png'
        };
        localStorage.setItem('socializaPetSettings', JSON.stringify(siteSettings));
    }
}

// =============== INITIAL DATA CREATION ===============
function createInitialBanners() {
    const initialBanners = [
        {
            id: Date.now() + 1,
            page: 'home',
            title: 'Amor Por Pets',
            text: 'Muito mais que gostar, amar!',
            image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1920&q=80',
            iframe: '',
            imageType: 'url',
            link: '#sobre'
        }
    ];

    banners = initialBanners;
    localStorage.setItem('socializaPetBanners', JSON.stringify(banners));
}

function createInitialProducts() {
    const initialProducts = [
        {
            id: Date.now() + 1,
            name: 'Ração Premium',
            price: 'R$ 89,90',
            category: 'Ração',
            image: 'https://picsum.photos/300/300?random=10',
            description: 'Ração premium para cães adultos, com ingredientes naturais e balanceada.'
        },
        {
            id: Date.now() + 2,
            name: 'Bola Interativa',
            price: 'R$ 24,90',
            category: 'Brinquedos',
            image: 'https://picsum.photos/300/300?random=11',
            description: 'Bola interativa que estimula a atividade física e mental do seu pet.'
        },
        {
            id: Date.now() + 3,
            name: 'Coleira Personalizada',
            price: 'R$ 39,90',
            category: 'Coleiras',
            image: 'https://picsum.photos/300/300?random=12',
            description: 'Coleira resistente e confortável, disponível em várias cores.'
        }
    ];

    products = initialProducts;
    localStorage.setItem('socializaPetProducts', JSON.stringify(products));
}

function createInitialGallery() {
    const initialGallery = [
        {
            id: Date.now() + 1,
            title: 'Max e sua nova família',
            description: 'História de adoção feliz',
            image: 'https://picsum.photos/400/300?random=20',
            category: 'Adoções'
        },
        {
            id: Date.now() + 2,
            title: 'Evento de Adoção 2024',
            description: 'Nosso maior evento do ano',
            image: 'https://picsum.photos/400/300?random=21',
            category: 'Eventos'
        },
        {
            id: Date.now() + 3,
            title: 'Cuidados Veterinários',
            description: 'Check-up completo',
            image: 'https://picsum.photos/400/300?random=22',
            category: 'Cuidados'
        }
    ];

    gallery = initialGallery;
    localStorage.setItem('socializaPetGallery', JSON.stringify(gallery));
}

// =============== HELPER FUNCTIONS ===============
// Helper function for page labels
function getPageLabel(page) {
    const labels = {
        'home': '🏠 Home',
        'loja': '🛍️ Loja',
        'blog': '📝 Blog',
        'todas': '🌟 Todas'
    };
    return labels[page] || '🏠 Home';
}

// Detect if input is iframe or URL
function detectInputType(input) {
    const trimmed = input.trim();
    if (trimmed.startsWith('<iframe') && trimmed.includes('</iframe>')) {
        return 'iframe';
    } else if (trimmed.startsWith('http')) {
        return 'url';
    }
    return 'unknown';
}

// Extract src from iframe
function extractSrcFromIframe(iframe) {
    const match = iframe.match(/src=["']([^"']+)["']/);
    return match ? match[1] : null;
}

// Convert Google Drive preview to direct URL
function convertGoogleDrivePreview(previewUrl) {
    if (previewUrl.includes('/file/d/') && previewUrl.includes('/preview')) {
        const fileId = previewUrl.split('/file/d/')[1].split('/')[0];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return previewUrl;
}

// Google Drive ID extractor
function getGoogleDriveId(url) {
    const patterns = [
        /\/file\/d\/([a-zA-Z0-9_-]+)/, // /file/d/ID
        /id=([a-zA-Z0-9_-]+)/          // id=ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Convert Google Drive URL to direct view URL
function convertGoogleDriveLink(url) {
    const fileId = getGoogleDriveId(url);
    if (fileId) {
        // Use thumbnail endpoint with large size (w1920) which is more reliable for hotlinking than uc?export=view
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
    }
    return url;
}

// Helper: Auto-fix Drive links in an array of items
function autoFixDriveLinks(items) {
    let updated = false;
    const fixedItems = items.map(item => {
        if (item.image && typeof item.image === 'string' && item.image.includes('drive.google.com') && !item.image.includes('thumbnail')) {
            const converted = convertGoogleDriveLink(item.image);
            if (converted !== item.image) {
                item.image = converted;
                updated = true;
            }
        }
        return item;
    });
    return { items: fixedItems, updated };
}

// Process banner image input (iframe or URL)
function processBannerImage(input) {
    const type = detectInputType(input);

    if (type === 'iframe') {
        const src = extractSrcFromIframe(input);
        if (src) {
            return {
                type: 'iframe',
                iframe: input,
                url: convertGoogleDriveLink(src), // Ensure iframe src is also converted if needed
                valid: true
            };
        }
    } else if (type === 'url') {
        // Check for Google Drive Folder (Common User Error)
        if (input.includes('drive.google.com') && input.includes('/folders/')) {
            return {
                type: 'error_folder',
                iframe: null,
                url: null,
                valid: false
            };
        }

        // Check if it's a Google Drive link and convert it
        const convertedUrl = convertGoogleDriveLink(input);

        return {
            type: 'url',
            iframe: null,
            url: convertedUrl,
            valid: true
        };
    }

    return {
        type: 'unknown',
        iframe: null,
        url: null,
        valid: false
    };
}

// Validate image URL (aceita Google Drive)
function isValidImageUrl(url) {
    try {
        const urlObj = new URL(url);
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const pathname = urlObj.pathname.toLowerCase();

        // Check if URL has valid image extension or is from known image services
        const hasImageExtension = allowedExtensions.some(ext => pathname.endsWith(ext));
        const isImageService = [
            'picsum.photos',
            'images.unsplash.com',
            'i.imgur.com',
            'github.com',
            'githubusercontent.com',
            'drive.google.com'  // Adicionar Google Drive
        ].some(service => urlObj.hostname.includes(service));

        return hasImageExtension || isImageService;
    } catch (e) {
        return false;
    }
}

// =============== STATISTICS UPDATE ===============
function updateAllStats() {
    try {
        const totalPostsEl = document.getElementById('totalPosts');
        if (totalPostsEl) totalPostsEl.textContent = blogPosts.length;

        const totalBannersEl = document.getElementById('totalBanners');
        if (totalBannersEl) totalBannersEl.textContent = banners.length;

        const totalProductsEl = document.getElementById('totalProducts');
        if (totalProductsEl) totalProductsEl.textContent = products.length;

        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) totalOrdersEl.textContent = orders ? orders.length : 0;

        const totalGalleryEl = document.getElementById('totalGallery');
        if (totalGalleryEl) totalGalleryEl.textContent = gallery.length;

    } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
    }
}

// =============== BANNER MANAGEMENT ===============
// Debug function for banners
function debugBanners() {
    console.log('=== DEBUG BANNERS ===');
    console.log('Total banners:', banners.length);
    console.log('Banners data:', banners);
    console.log('localStorage banners:', JSON.parse(localStorage.getItem('socializaPetBanners') || 'null'));
}

// FUNÇÃO DE TESTE FORÇADO - Cole seu iframe aqui para testar
function testarBannerForcado() {
    const testeIframe = prompt('Cole seu iframe do Google Drive aqui:');
    if (!testeIframe) return;

    console.log('🔥 TESTANDO IFRAME:', testeIframe);

    // Processar iframe
    const resultado = processBannerImage(testeIframe);
    console.log('🔥 RESULTADO:', resultado);

    if (resultado.valid) {
        // Criar banner de teste
        const bannerTeste = {
            id: Date.now(),
            page: 'home',
            title: 'TESTE FORÇADO',
            text: 'Testando iframe do usuário',
            image: resultado.url,
            iframe: resultado.iframe,
            imageType: resultado.type,
            link: '#'
        };

        // Adicionar ao array
        banners.unshift(bannerTeste);
        localStorage.setItem('socializaPetBanners', JSON.stringify(banners));

        // Atualizar display
        displayBanners();
        updateAllStats();

        alert('✅ Banner de teste criado! Verifique na home page.');
        console.log('🔥 BANNER CRIADO:', bannerTeste);
    } else {
        alert('❌ Formato inválido! Verifique o iframe.');
    }
}

function debugCompleto() {
    console.log('🐛 === DEBUG COMPLETO INICIADO ===');
    console.log('🐛 LocalStorage socializaPetBanners:', localStorage.getItem('socializaPetBanners'));

    const storedBanners = JSON.parse(localStorage.getItem('socializaPetBanners') || '[]');
    console.log('🐛 Banners parseados:', storedBanners);
    console.log('🐛 Total de banners:', storedBanners.length);

    storedBanners.forEach((banner, index) => {
        console.log(`🐛 Banner ${index + 1}:`, banner);
        console.log(`🐛 Banner ${index + 1} - ID:`, banner.id);
        console.log(`🐛 Banner ${index + 1} - Título:`, banner.title);
        console.log(`🐛 Banner ${index + 1} - Página:`, banner.page);
        console.log(`🐛 Banner ${index + 1} - Tem iframe:`, !!banner.iframe);
        console.log(`🐛 Banner ${index + 1} - Tipo:`, banner.imageType);
        console.log(`🐛 Banner ${index + 1} - URL:`, banner.image);
        console.log(`🐛 Banner ${index + 1} - Iframe:`, banner.iframe);
    });

    console.log('🐛 === TESTANDO CARREGAMENTO NA INDEX ===');

    // Simular o que a index.html faz
    const homeBanners = storedBanners.filter(banner =>
        banner.page === 'home' || banner.page === 'todas'
    );
    console.log('🐛 Banners filtrados para HOME:', homeBanners);

    alert('Debug completo executado! Verifique o console (F12) para detalhes completos.');
}

function displayBanners() {
    const bannersGrid = document.getElementById('bannersGrid');

    if (banners.length === 0) {
        bannersGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🖼️</div>
                        <h3>Nenhum banner encontrado</h3>
                        <p>Crie seu primeiro banner clicando no botão "Novo Banner"</p>
                    </div>
                `;
        return;
    }

    bannersGrid.innerHTML = banners.map((banner, index) => `
                <div class="banner-card">
                    <img src="${banner.image}" alt="${banner.title}" class="banner-image" 
                         onerror="this.style.display='none'; this.parentElement.querySelector('.error-msg').style.display='block';">
                    <div class="image-error-msg error-msg" style="display:none; color: red; font-size: 0.8em; margin: 5px 0; text-align: center; padding: 20px;">❌ Erro ao carregar imagem</div>
                    <div class="banner-content">
                        <div class="banner-title">${banner.title}</div>
                        <div class="banner-page-tag">${getPageLabel(banner.page)} ${banner.position ? ' • ' + (banner.position.includes('quem-somos') ? '📸 Card Quem Somos' : (banner.position === 'promo' ? '🎉 Promo' : '🎞️ Slider')) : ''}</div>
                        <div class="banner-type-tag" style="font-size: 0.7em; color: #888; margin-bottom: 5px;">${banner.imageType === 'iframe' ? '🇬🇹 Google Drive Iframe' : '🔗 URL Direta'}</div>
                        <div class="banner-text">${banner.text}</div>
                        <div class="banner-actions">
                            <button class="btn btn-primary btn-sm" onclick="editBanner(${banner.id})">✏️ Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBanner(${banner.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `).join('');
}

// Add input detector
function setupImageInputDetector() {
    const imageInput = document.getElementById('bannerImage');
    const detector = document.getElementById('imageTypeDetector');

    imageInput.addEventListener('input', function () {
        const input = this.value;
        const result = processBannerImage(input);

        if (input.trim() === '') {
            detector.textContent = '';
        } else if (result.valid) {
            if (result.type === 'iframe') {
                detector.textContent = '✅ Iframe do Google Drive detectado!';
                detector.style.color = 'green';
            } else if (result.type === 'url') {
                detector.textContent = '✅ URL de imagem detectada!';
                detector.style.color = 'green';
            }
        } else {
            if (result.type === 'error_folder') {
                detector.textContent = '❌ Erro: Você colou um link de PASTA. Precisa ser o link de um ARQUIVO de imagem.';
            } else {
                detector.textContent = '⚠️ Formato não reconhecido. Use URL ou iframe do Google Drive.';
            }
            detector.style.color = 'red';
        }
    });
}

// Banner Position Logic
function updateBannerPositions() {
    const page = document.getElementById('bannerPage').value;
    const positionGroup = document.getElementById('bannerPositionGroup');
    const positionSelect = document.getElementById('bannerPosition');

    // Clear existing options
    positionSelect.innerHTML = '';

    if (!page) {
        positionGroup.style.display = 'none';
        return;
    }

    positionGroup.style.display = 'block';

    let options = [];

    switch (page) {
        case 'home':
            options = [
                { value: 'slider', text: '🎞️ Slider Principal (1920x600px)' },
                { value: 'promo', text: '🎉 Banner Promocional (1920x400px)' },
                { value: 'quem-somos-1', text: '📸 Quem Somos - Card 1 (Rosa) (300x500px)' },
                { value: 'quem-somos-2', text: '📸 Quem Somos - Card 2 (Azul) (300x500px)' },
                { value: 'quem-somos-3', text: '📸 Quem Somos - Card 3 (Verde) (300x500px)' },
                { value: 'quem-somos-4', text: '📸 Quem Somos - Card 4 (Roxo) (300x500px)' }
            ];
            break;
        case 'loja':
            options = [
                { value: 'slider', text: '🎞️ Slider Topo da Loja (1920x400px)' }
            ];
            break;
        case 'blog':
            options = [
                { value: 'slider', text: '🎞️ Slider Topo do Blog (1920x400px)' }
            ];
            break;
        default:
            options = [{ value: 'slider', text: 'Banner Padrão (1920x600px)' }];
    }

    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        positionSelect.appendChild(option);
    });
}

function openBannerModal() {
    editingBannerId = null;
    document.getElementById('bannerModalTitle').textContent = '🖼️ Novo Banner';
    document.getElementById('bannerPage').value = '';
    document.getElementById('bannerPosition').innerHTML = ''; // Clear positions
    document.getElementById('bannerPositionGroup').style.display = 'none';
    document.getElementById('bannerTitle').value = '';
    document.getElementById('bannerText').value = '';
    document.getElementById('bannerImage').value = '';
    document.getElementById('bannerLink').value = '';
    document.getElementById('imageTypeDetector').textContent = '';

    // Setup detector
    setTimeout(setupImageInputDetector, 100);
    document.getElementById('bannerModal').style.display = 'flex';
}

function editBanner(id) {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    editingBannerId = id;
    document.getElementById('bannerModalTitle').textContent = '✏️ Editar Banner';
    document.getElementById('bannerPage').value = banner.page || 'home';

    // Update positions based on page load
    updateBannerPositions();
    document.getElementById('bannerPosition').value = banner.position || 'slider';

    document.getElementById('bannerTitle').value = banner.title;
    document.getElementById('bannerText').value = banner.text;
    document.getElementById('bannerImage').value = banner.iframe || banner.image || '';
    document.getElementById('bannerLink').value = banner.link || '';

    // Setup detector após carregar dados
    setTimeout(setupImageInputDetector, 100);
    document.getElementById('bannerModal').style.display = 'flex';
}

function closeBannerModal() {
    document.getElementById('bannerModal').style.display = 'none';
    editingBannerId = null;
}

function saveBanner(event) {
    event.preventDefault();

    const page = document.getElementById('bannerPage').value;
    const position = document.getElementById('bannerPosition').value;
    const title = document.getElementById('bannerTitle').value;
    const text = document.getElementById('bannerText').value;
    const imageInput = document.getElementById('bannerImage').value.trim();
    const link = document.getElementById('bannerLink').value;

    // Processar entrada (iframe ou URL)
    const imageResult = processBannerImage(imageInput);

    if (!imageResult.valid) {
        showToast('⚠️ Formato inválido! Use URL de imagem ou iframe do Google Drive.', 'error');
        return;
    }

    console.log('Processando banner:', imageResult);

    if (editingBannerId) {
        const bannerIndex = banners.findIndex(b => b.id === editingBannerId);
        if (bannerIndex !== -1) {
            banners[bannerIndex] = {
                ...banners[bannerIndex],
                page, position, title, text,
                image: imageResult.url,
                iframe: imageResult.iframe,
                imageType: imageResult.type,
                link
            };
            showToast('✅ Banner atualizado com sucesso!');
        }
    } else {
        const newBanner = {
            id: Date.now(),
            page, position, title, text,
            image: imageResult.url,
            iframe: imageResult.iframe,
            imageType: imageResult.type,
            link
        };
        banners.unshift(newBanner);
        showToast('✅ Banner criado com sucesso!');
    }

    localStorage.setItem('socializaPetBanners', JSON.stringify(banners));
    updateAllStats();
    displayBanners();
    closeBannerModal();
}

function deleteBanner(id) {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    if (confirm(`Tem certeza que deseja excluir o banner "${banner.title}"?`)) {
        banners = banners.filter(b => b.id !== id);
        localStorage.setItem('socializaPetBanners', JSON.stringify(banners));
        updateAllStats();
        displayBanners();
        showToast('🗑️ Banner excluído com sucesso!');
    }
}

// =============== PRODUCT MANAGEMENT ===============
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');

    if (products.length === 0) {
        productsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">🛒</div>
                        <h3>Nenhum produto encontrado</h3>
                        <p>Crie seu primeiro produto clicando no botão "Novo Produto"</p>
                    </div>
                `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://picsum.photos/300/300?random=1'">
                    <div class="product-content">
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">${product.price}</div>
                        <div class="product-description">${product.description}</div>
                        <div class="product-actions">
                            <button class="btn btn-primary btn-sm" onclick="editProduct(${product.id})">✏️ Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">🗑️ Excluir</button>
                        </div>
                    </div>
                </div>
            `).join('');
}

function openProductModal() {
    editingProductId = null;
    document.getElementById('productModalTitle').textContent = '🛒 Novo Produto';
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productLink').value = '';
    document.getElementById('productModal').style.display = 'flex';
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('productModalTitle').textContent = '✏️ Editar Produto';
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productImage').value = product.image;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productLink').value = product.link || '';
    document.getElementById('productModal').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    editingProductId = null;
}

function saveProduct(event) {
    event.preventDefault();

    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    const image = convertGoogleDriveLink(document.getElementById('productImage').value);
    const description = document.getElementById('productDescription').value;
    const link = document.getElementById('productLink').value;

    if (editingProductId) {
        const productIndex = products.findIndex(p => p.id === editingProductId);
        if (productIndex !== -1) {
            products[productIndex] = {
                ...products[productIndex],
                name, price, category, image, description, link
            };
            showToast('✅ Produto atualizado com sucesso!');
        }
    } else {
        const newProduct = {
            id: Date.now(),
            name, price, category, image, description, link
        };
        products.unshift(newProduct);
        showToast('✅ Produto criado com sucesso!');
    }

    localStorage.setItem('socializaPetProducts', JSON.stringify(products));
    updateAllStats();
    displayProducts();
    closeProductModal();
}

function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('socializaPetProducts', JSON.stringify(products));
        updateAllStats();
        displayProducts();
        showToast('🗑️ Produto excluído com sucesso!');
    }
}

// =============== GALLERY MANAGEMENT ===============


// =============== CONTENT MANAGEMENT ===============
function loadContentForm() {
    document.getElementById('siteTitle').value = siteContent.title || '';
    document.getElementById('siteSubtitle').value = siteContent.subtitle || '';
    document.getElementById('aboutContent').value = siteContent.about || '';
    document.getElementById('projectContent').value = siteContent.project || '';
    document.getElementById('whatsappNumber').value = siteContent.whatsapp || '';
    document.getElementById('contactEmail').value = siteContent.email || '';

    // Promo Fields
    document.getElementById('promoTitle').value = siteContent.promoTitle || '';
    document.getElementById('promoText').value = siteContent.promoText || '';
    document.getElementById('promoBtnText').value = siteContent.promoBtnText || '';
    document.getElementById('promoLink').value = siteContent.promoLink || '';
}

function saveContent(type) {
    switch (type) {
        case 'main':
            siteContent.title = document.getElementById('siteTitle').value;
            siteContent.subtitle = document.getElementById('siteSubtitle').value;
            siteContent.about = document.getElementById('aboutContent').value;
            break;
        case 'project':
            siteContent.project = document.getElementById('projectContent').value;
            break;
        case 'contact':
            siteContent.whatsapp = document.getElementById('whatsappNumber').value;
            siteContent.email = document.getElementById('contactEmail').value;
            break;
        case 'promo':
            siteContent.promoTitle = document.getElementById('promoTitle').value;
            siteContent.promoText = document.getElementById('promoText').value;
            siteContent.promoBtnText = document.getElementById('promoBtnText').value;
            siteContent.promoLink = document.getElementById('promoLink').value;
            break;
    }

    localStorage.setItem('socializaPetContent', JSON.stringify(siteContent));
    showToast('✅ Conteúdo salvo com sucesso!');
}

// =============== SETTINGS MANAGEMENT ===============
function loadSettingsForm() {
    document.getElementById('primaryColor').value = siteSettings.primaryColor || '#F28DB2';
    document.getElementById('secondaryColor').value = siteSettings.secondaryColor || '#0597F2';
    document.getElementById('adoptedPets').value = siteSettings.adoptedPets || 500;
    document.getElementById('happyFamilies').value = siteSettings.happyFamilies || 350;
    document.getElementById('partners').value = siteSettings.partners || 25;
    document.getElementById('logoUrl').value = siteSettings.logoUrl || '';
    document.getElementById('faviconUrl').value = siteSettings.faviconUrl || '';

    // Update favicon preview
    updateFaviconPreview(siteSettings.faviconUrl || '');

    // Update Admin Logos on load
    if (siteSettings.faviconUrl) {
        const loginLogo = document.getElementById('adminLoginLogo');
        const dashboardLogo = document.getElementById('adminDashboardLogo');

        if (loginLogo) loginLogo.innerHTML = `<img src="${siteSettings.faviconUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
        if (dashboardLogo) dashboardLogo.innerHTML = `<img src="${siteSettings.faviconUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
}

function saveSettings(type) {
    try {
        switch (type) {
            case 'colors':
                siteSettings.primaryColor = document.getElementById('primaryColor').value;
                siteSettings.secondaryColor = document.getElementById('secondaryColor').value;
                break;
            case 'stats':
                siteSettings.adoptedPets = document.getElementById('adoptedPets').value;
                siteSettings.happyFamilies = document.getElementById('happyFamilies').value;
                siteSettings.partners = document.getElementById('partners').value;
                break;
            case 'general':
                const logoInput = document.getElementById('logoUrl');
                const faviconInput = document.getElementById('faviconUrl');

                if (logoInput) siteSettings.logoUrl = convertGoogleDriveLink(logoInput.value);
                if (faviconInput) siteSettings.faviconUrl = convertGoogleDriveLink(faviconInput.value);

                // Apply favicon immediately if present
                if (siteSettings.faviconUrl) {
                    if (typeof applySiteFavicon === 'function') {
                        applySiteFavicon(siteSettings.faviconUrl);
                    }

                    // Update Admin Logos
                    const loginLogo = document.getElementById('adminLoginLogo');
                    const dashboardLogo = document.getElementById('adminDashboardLogo');

                    if (loginLogo) loginLogo.innerHTML = `<img src="${siteSettings.faviconUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
                    if (dashboardLogo) dashboardLogo.innerHTML = `<img src="${siteSettings.faviconUrl}" style="width: 100%; height: 100%; object-fit: contain;">`;
                }
                break;
        }

        localStorage.setItem('socializaPetSettings', JSON.stringify(siteSettings));
        showToast('✅ Configurações salvas com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Erro ao salvar: ' + error.message);
    }
}

// =============== ORDERS MANAGEMENT ===============
let orders = JSON.parse(localStorage.getItem('socializaPetOrders') || '[]');

function loadOrders() {
    displayOrders();
    updateOrdersStats();
}

function displayOrders(ordersToShow = orders) {
    const container = document.getElementById('ordersGrid');

    if (ordersToShow.length === 0) {
        container.innerHTML = `
                    <div class="empty-orders">
                        <h3>📦 Nenhum pedido encontrado</h3>
                        <p>Os pedidos do e-commerce aparecerão aqui automaticamente.</p>
                    </div>
                `;
        return;
    }

    container.innerHTML = ordersToShow.map(order => `
                <div class="order-card">
                    <div class="order-header">
                        <div class="order-id">#${order.id}</div>
                        <div class="order-date">${formatDate(order.date)}</div>
                        <div class="order-status status-${order.status}">${getStatusLabel(order.status)}</div>
                    </div>
                    
                    <div class="order-customer">
                        <div class="customer-info">
                            <strong>👤 Cliente:</strong> ${order.customer.name}<br>
                            <strong>📧 E-mail:</strong> ${order.customer.email}<br>
                            <strong>📱 Telefone:</strong> ${order.customer.phone}
                        </div>
                        <div class="customer-info">
                            <strong>📍 Endereço:</strong><br>
                            ${order.address.address}, ${order.address.number}<br>
                            ${order.address.neighborhood} - ${order.address.city}/${order.address.state}<br>
                            CEP: ${order.address.cep}
                        </div>
                    </div>
                    
                    <div class="order-items">
                        <h4>📦 Itens do Pedido:</h4>
                        <div class="items-list">
                            ${order.items.map(item => `
                                <div class="item-row">
                                    <span>${item.title} (${item.quantity}x)</span>
                                    <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="order-totals">
                        <div class="payment-info">
                            <span class="payment-method">${getPaymentLabel(order.payment)}</span>
                            ${order.shipping ? `<br><small>🚚 Frete: R$ ${order.shipping.price.toFixed(2).replace('.', ',')}</small>` : ''}
                        </div>
                        <div class="order-total">Total: R$ ${order.total.toFixed(2).replace('.', ',')}</div>
                    </div>
                    
                    <div class="order-actions">
                        <button class="btn-order btn-view" onclick="viewOrder('${order.id}')">👁️ Ver</button>
                        <button class="btn-order btn-update" onclick="updateOrderStatus('${order.id}')">✏️ Status</button>
                        <button class="btn-order btn-invoice" onclick="generateInvoice('${order.id}')">📄 Fatura</button>
                        <button class="btn-order btn-delete" onclick="deleteOrder('${order.id}')">🗑️ Excluir</button>
                    </div>
                </div>
            `).join('');
}

function updateOrdersStats() {
    const pendingCount = orders.filter(order => order.status === 'pending').length;
    const completedCount = orders.filter(order => order.status === 'delivered').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = pendingCount;
    document.getElementById('completedOrders').textContent = completedCount;
    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const paymentFilter = document.getElementById('paymentFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;

    let filteredOrders = orders;

    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.payment === paymentFilter);
    }

    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            return orderDate === dateFilter;
        });
    }

    displayOrders(filteredOrders);
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pendente',
        'paid': 'Pago',
        'shipped': 'Enviado',
        'delivered': 'Entregue',
        'cancelled': 'Cancelado'
    };
    return labels[status] || status;
}

function getPaymentLabel(payment) {
    const labels = {
        'mercadopago': 'Mercado Pago',
        'pix': 'PIX',
        'whatsapp': 'WhatsApp'
    };
    return labels[payment] || payment;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('pt-BR');
}

function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    alert(`📦 DETALHES DO PEDIDO #${order.id}\n\n` +
        `Cliente: ${order.customer.name}\n` +
        `E-mail: ${order.customer.email}\n` +
        `Telefone: ${order.customer.phone}\n` +
        `CPF: ${order.customer.cpf}\n\n` +
        `Endereço: ${order.address.address}, ${order.address.number}\n` +
        `${order.address.neighborhood} - ${order.address.city}/${order.address.state}\n` +
        `CEP: ${order.address.cep}\n\n` +
        `Itens:\n${order.items.map(item => `- ${item.title} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n` +
        `Pagamento: ${getPaymentLabel(order.payment)}\n` +
        `Total: R$ ${order.total.toFixed(2)}\n` +
        `Status: ${getStatusLabel(order.status)}`
    );
}

function updateOrderStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const newStatus = prompt(`Status atual: ${getStatusLabel(order.status)}\n\nNovo status:\n1 - Pendente\n2 - Pago\n3 - Enviado\n4 - Entregue\n5 - Cancelado\n\nDigite o número:`);

    const statusMap = {
        '1': 'pending',
        '2': 'paid',
        '3': 'shipped',
        '4': 'delivered',
        '5': 'cancelled'
    };

    if (statusMap[newStatus]) {
        order.status = statusMap[newStatus];
        localStorage.setItem('socializaPetOrders', JSON.stringify(orders));
        loadOrders();
        showToast(`✅ Status do pedido #${orderId} atualizado!`);
    }
}

function generateInvoice(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    let invoice = `📄 FATURA - SOCIALIZAPET\n`;
    invoice += `=====================================\n\n`;
    invoice += `Pedido: #${order.id}\n`;
    invoice += `Data: ${formatDate(order.date)}\n\n`;
    invoice += `CLIENTE:\n`;
    invoice += `Nome: ${order.customer.name}\n`;
    invoice += `E-mail: ${order.customer.email}\n`;
    invoice += `Telefone: ${order.customer.phone}\n`;
    invoice += `CPF: ${order.customer.cpf}\n\n`;
    invoice += `ENDEREÇO DE ENTREGA:\n`;
    invoice += `${order.address.address}, ${order.address.number}\n`;
    invoice += `${order.address.neighborhood}\n`;
    invoice += `${order.address.city} - ${order.address.state}\n`;
    invoice += `CEP: ${order.address.cep}\n\n`;
    invoice += `ITENS:\n`;
    invoice += `-------------------------------------\n`;

    let subtotal = 0;
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        invoice += `${item.title}\n`;
        invoice += `Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)} = R$ ${itemTotal.toFixed(2)}\n\n`;
    });

    invoice += `-------------------------------------\n`;
    invoice += `Subtotal: R$ ${subtotal.toFixed(2)}\n`;
    if (order.shipping) {
        invoice += `Frete: R$ ${order.shipping.price.toFixed(2)}\n`;
    }
    invoice += `TOTAL: R$ ${order.total.toFixed(2)}\n\n`;
    invoice += `Forma de Pagamento: ${getPaymentLabel(order.payment)}\n`;
    invoice += `Status: ${getStatusLabel(order.status)}\n\n`;
    invoice += `=====================================\n`;
    invoice += `SocializaPet - Amor em cada produto!`;

    // Copiar para área de transferência
    navigator.clipboard.writeText(invoice).then(() => {
        showToast('📄 Fatura copiada para a área de transferência!');
    });
}

function deleteOrder(orderId) {
    if (confirm(`Tem certeza que deseja excluir o pedido #${orderId}?`)) {
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('socializaPetOrders', JSON.stringify(orders));
        loadOrders();
        showToast(`🗑️ Pedido #${orderId} excluído!`);
    }
}

function exportOrders() {
    if (orders.length === 0) {
        alert('📦 Nenhum pedido para exportar!');
        return;
    }

    let csvContent = 'Pedido,Data,Cliente,E-mail,Telefone,Total,Status,Pagamento\n';

    orders.forEach(order => {
        csvContent += `#${order.id},${formatDate(order.date)},${order.customer.name},${order.customer.email},${order.customer.phone},R$ ${order.total.toFixed(2)},${getStatusLabel(order.status)},${getPaymentLabel(order.payment)}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `pedidos_socializapet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast('📊 Relatório de pedidos exportado!');
}

// =============== FAVICON MANAGEMENT ===============
function updateFaviconPreview(faviconUrl) {
    faviconUrl = convertGoogleDriveLink(faviconUrl);
    const previewImg = document.getElementById('faviconPreviewImg');
    const previewText = document.getElementById('faviconPreviewText');

    if (faviconUrl && faviconUrl.trim() !== '') {
        previewImg.src = faviconUrl;
        previewImg.style.display = 'inline-block';
        previewText.textContent = 'Preview do favicon';
        previewText.style.color = '#28a745';

        // Handle image load error
        previewImg.onerror = function () {
            this.style.display = 'none';
            previewText.textContent = 'Erro ao carregar favicon';
            previewText.style.color = '#dc3545';
        };
    } else {
        previewImg.style.display = 'none';
        previewText.textContent = 'Nenhum favicon definido';
        previewText.style.color = '#666';
    }
}

function applySiteFavicon(faviconUrl) {
    if (!faviconUrl || faviconUrl.trim() === '') return;

    // Remove existing admin favicons
    const existingFavicons = document.querySelectorAll('link[data-admin-favicon="true"]');
    existingFavicons.forEach(link => link.remove());

    // Add new favicon links
    const head = document.head;

    // Create multiple favicon sizes for better compatibility
    const sizes = ['16x16', '32x32', '48x48', '64x64'];
    sizes.forEach(size => {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        favicon.sizes = size;
        favicon.href = faviconUrl;
        favicon.setAttribute('data-admin-favicon', 'true');
        head.appendChild(favicon);
    });

    // Apple touch icon
    const appleTouchIcon = document.createElement('link');
    appleTouchIcon.rel = 'apple-touch-icon';
    appleTouchIcon.href = faviconUrl;
    appleTouchIcon.setAttribute('data-admin-favicon', 'true');
    head.appendChild(appleTouchIcon);

    // Shortcut icon (fallback)
    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.type = 'image/x-icon';
    shortcutIcon.href = faviconUrl;
    shortcutIcon.setAttribute('data-admin-favicon', 'true');
    head.appendChild(shortcutIcon);

    console.log('✅ Favicon aplicado:', faviconUrl);
}

// Global function to apply favicon on all pages
window.applySiteFavicon = function () {
    const settings = JSON.parse(localStorage.getItem('socializaPetSettings') || '{}');
    if (settings.faviconUrl) {
        applySiteFavicon(settings.faviconUrl);
    }
};

// =============== ENHANCED SYNC FUNCTION ===============
function syncWithBlog() {
    // Sync all content with main site
    localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    localStorage.setItem('siteBanners', JSON.stringify(banners));
    localStorage.setItem('siteProducts', JSON.stringify(products));
    localStorage.setItem('siteGallery', JSON.stringify(gallery));
    localStorage.setItem('siteContent', JSON.stringify(siteContent));
    localStorage.setItem('siteSettings', JSON.stringify(siteSettings));
    localStorage.setItem('blogSynced', 'true');

    showToast('🔄 Sincronização completa realizada! Todo o conteúdo foi atualizado.');
}

// =============== ENHANCED EXPORT FUNCTION ===============
function exportData() {
    const allData = {
        posts: blogPosts,
        banners: banners,
        products: products,
        gallery: gallery,
        content: siteContent,
        settings: siteSettings,
        exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `socializapet-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('📤 Backup completo exportado com sucesso!');
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closePostModal();
        closeBannerModal();
        closeProductModal();
        closeGalleryModal();
    }
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        const activeTab = document.querySelector('.nav-tab.active').textContent;
        if (activeTab.includes('Posts')) openNewPostModal();
        if (activeTab.includes('Banners')) openBannerModal();
        if (activeTab.includes('Produtos')) openProductModal();

    }
});
