// SocializaPet - Unified Script
// Contains logic for all pages: Home, Store, Blog, Project

// --- GLOBAL VARIABLES ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];
// DATA SOURCES - Single Source of Truth from Admin Panel
let products = JSON.parse(localStorage.getItem('socializaPetProducts')) || [];
let blogPosts = JSON.parse(localStorage.getItem('socializaPetPosts')) || [];
let banners = JSON.parse(localStorage.getItem('socializaPetBanners')) || [];
let galleryItems = JSON.parse(localStorage.getItem('socializaPetGallery')) || [];
let siteContent = JSON.parse(localStorage.getItem('socializaPetContent')) || {};
let siteSettings = JSON.parse(localStorage.getItem('socializaPetSettings')) || {};

// Constants
const CONTACT_WHATSAPP = siteContent.whatsapp || "5511999999999";

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function () {
    initGlobal();
    initContact();

    // Core Dynamic Content (Texts, Colors, etc)
    loadDynamicContent();
    applySiteFavicon();

    // Page Detection & Specific Init
    if (document.getElementById('productsGrid')) {
        initStore();
    }

    if (document.getElementById('blogGrid')) {
        initBlog();
    }

    if (document.querySelector('.hero-banner-slider')) {
        initHome();
    }

    if (document.querySelector('.impact-grid')) {
        initProject();
    }


});

// --- GLOBAL FUNCTIONS ---

function initGlobal() {
    // Mobile Menu
    const mobileBtn = document.querySelector('.mobile-menu-btn'); // For blog/loja
    const hamburger = document.getElementById('hamburger'); // For index
    const mobileNav = document.getElementById('mobileNav'); // For blog/loja
    const navMenu = document.querySelector('.nav-menu'); // For index

    const mobileOverlay = document.getElementById('mobileOverlay');

    // Case 1: Blog/Loja/Project Mobile Menu
    if (mobileBtn && mobileNav && mobileOverlay) {
        const toggleMenu = () => {
            mobileNav.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
        };

        mobileBtn.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);

        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileNav.classList.contains('active')) toggleMenu();
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && mobileNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    }

    // Case 2: Index Hamburger (if different structure)
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Notifications (Toast)
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

function initContact() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            sendContactToWhatsApp();
        });
    }
}

function sendContactToWhatsApp() {
    const name = document.getElementById('contactName').value;
    const phone = document.getElementById('contactPhone').value;
    const email = document.getElementById('contactEmail').value;
    const message = document.getElementById('contactMessage').value;

    if (!name || !phone || !message) {
        showToast('Preencha os campos obrigatórios!', 'error');
        return;
    }

    // Format message
    const text = `*Contato Site SocializaPet*%0A%0A*Nome:* ${encodeURIComponent(name)}%0A*Telefone:* ${encodeURIComponent(phone)}%0A*Email:* ${encodeURIComponent(email)}%0A*Mensagem:*%0A${encodeURIComponent(message)}`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${text}`, '_blank');

    showToast('Enviado para o WhatsApp!');
    document.getElementById('contactForm').reset();
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--gradient-1);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    `;
    if (type === 'error') {
        toast.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
    }
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function applySiteFavicon() {
    const settings = JSON.parse(localStorage.getItem('socializaPetSettings') || '{}');
    if (settings.faviconUrl) {
        const url = convertGoogleDriveLink(settings.faviconUrl);
        document.querySelectorAll('link[data-admin-favicon="true"]').forEach(l => l.remove());

        const head = document.head;
        ['16x16', '32x32', '48x48', '64x64'].forEach(size => {
            const link = document.createElement('link');
            link.rel = 'icon'; link.sizes = size; link.href = url;
            link.setAttribute('data-admin-favicon', 'true');
            head.appendChild(link);
        });
    }
}

function convertGoogleDriveLink(url) {
    if (!url) return url;
    if (url.includes('drive.google.com')) {
        let fileId = '';
        if (url.includes('/file/d/')) fileId = url.split('/file/d/')[1].split('/')[0];
        else if (url.includes('id=')) fileId = url.split('id=')[1].split('&')[0];
        if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1920`;
    }
    return url;
}

function loadDynamicContent() {
    // 1. Settings (Colors)
    if (siteSettings.primaryColor) document.documentElement.style.setProperty('--primary-pink', siteSettings.primaryColor);
    if (siteSettings.secondaryColor) document.documentElement.style.setProperty('--primary-blue', siteSettings.secondaryColor);

    // 2. Logo / Favicon
    const logo = document.getElementById('siteLogo');
    if (logo && siteSettings.faviconUrl) {
        let img = logo.querySelector('img');
        if (!img) {
            if (logo.textContent.trim().startsWith('Socializa')) {
                img = document.createElement('img');
                img.style.height = '1.2em'; img.style.marginRight = '8px';
                logo.insertBefore(img, logo.firstChild);
            }
        }
        if (img) img.src = convertGoogleDriveLink(siteSettings.faviconUrl);
    }

    // 3. Texts Content (Home About, Project, etc)
    if (siteContent.about) {
        const aboutContainer = document.getElementById('aboutTextContainer'); // Container in Home
        if (aboutContainer) aboutContainer.innerHTML = siteContent.about.replace(/\n/g, '<br>');
    }

    // Project Page specific content
    // Check if we are on project page or have the element
    /* If the project page uses a specific ID for content, update it here */

    // 4. Promo Banner
    const promoSection = document.querySelector('.promo-banner');
    if (promoSection) {
        if (siteContent.promoTitle) promoSection.querySelector('h2').innerText = siteContent.promoTitle;
        if (siteContent.promoText) promoSection.querySelector('p').innerText = siteContent.promoText;

        const btn = promoSection.querySelector('.btn-white');
        if (btn) {
            if (siteContent.promoBtnText) btn.innerText = siteContent.promoBtnText;
            if (siteContent.promoLink) btn.href = siteContent.promoLink;
        }
    }

    // 5. Contact Info In Footer & Contact Section
    // Update Phone/Email
    const phones = document.querySelectorAll('a[href^="https://wa.me"], a[href^="tel:"]');
    // Simple way: update text of footer items if they match pattern or add specific classes?
    // Let's rely on CSS selectors if possible, or just iterate.
    // Actually, simply updating specific IDs is safer.

    // Footer Email
    const footerEmail = Array.from(document.querySelectorAll('a')).find(el => el.textContent.includes('E-mail:'));
    if (footerEmail && siteContent.email) footerEmail.textContent = `E-mail: ${siteContent.email}`;

    // Footer Phone
    const footerPhone = Array.from(document.querySelectorAll('a')).find(el => el.textContent.includes('WhatsApp'));
    if (footerPhone && siteContent.whatsapp) footerPhone.textContent = `WhatsApp ${siteContent.whatsapp}`;

    // Site Title
    if (siteContent.title) {
        // Optional: Update title tag? 
        // document.title = siteContent.title + ' - SocializaPet';
    }
}


// --- HOME PAGE LOGIC ---

function initHome() {
    console.log('Initializing Home...');
    loadHomeBanners();

    // Load Featured Products
    const homeProductsGrid = document.getElementById('homeProductsGrid');
    if (homeProductsGrid) {
        let items = products;
        if (items.length === 0) {
            items = [
                { id: 1, title: "Ração Premium", category: "Alimentação", price: 129.90, image: "https://images.unsplash.com/photo-1589924691195-41432c84c161?w=300", description: "Melhor nutrição." },
                { id: 2, title: "Brinquedo Corda", category: "Brinquedos", price: 29.90, image: "https://picsum.photos/300/200?2", description: "Diversão garantida." }
            ];
        }

        homeProductsGrid.innerHTML = items.slice(0, 4).map(p => `
            <div class="product-card">
                <img src="${p.image}" class="product-image" onerror="this.src='https://via.placeholder.com/300'">
                <div class="product-info">
                    <span class="product-category">${p.category}</span>
                    <h3 class="product-title">${p.name || p.title}</h3>
                    <div class="product-price">${parseFloat(p.price) ? 'R$ ' + parseFloat(p.price).toFixed(2) : p.price}</div>
                    <a href="loja.html" class="buy-direct-btn" style="text-align:center; display:block; text-decoration:none">Ver Detalhes</a>
                </div>
            </div>
        `).join('');
    }

    // Load Blog Content
    const homeBlogGrid = document.getElementById('homeBlogGrid');
    if (homeBlogGrid) {
        if (blogPosts.length === 0) {
            blogPosts = [
                { id: 101, title: "Cuidados no Verão", category: "Saúde", excerpt: "Saiba como proteger seu pet do calor excessivo. Mantenha seu pet hidratado e evite passeios nos horários mais quentes.", image: "https://images.unsplash.com/photo-1541781777631-fa95319087eb?w=400", content: "Durante o verão, é essencial ter cuidados redobrados com seu pet. O calor excessivo pode causar desidratação e queimaduras nas patas. Certifique-se de oferecer água fresca constantemente e evitar passear entre 10h e 16h." },
                { id: 102, title: "Socialização Canina", category: "Comportamento", excerpt: "A importância de sociabilizar desde cedo para ter um cão equilibrado.", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", content: "A socialização é fundamental para o desenvolvimento saudável do seu cão. Expor o filhote a diferentes ambientes, pessoas e outros animais ajuda a prevenir medos e agressividade no futuro." },
                { id: 103, title: "Alimentação Natural", category: "Alimentação", excerpt: "Descubra os benefícios da alimentação natural e balanceada.", image: "https://images.unsplash.com/photo-1589924691195-41432c84c161?w=400", content: "A alimentação natural pode trazer diversos benefícios para a saúde do seu pet, como pelagem mais brilhante, mais energia e melhor digestão. Consulte sempre um veterinário nutricionista." },
                { id: 104, title: "Dicas de Passeio", category: "Dicas", excerpt: "Como tornar o passeio mais agradável e seguro para todos.", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400", content: "O passeio é o momento mais esperado pelo seu cão. Use guias confortáveis, deixe-o cheirar e explorar, e aproveite para fortalecer o vínculo entre vocês. Lembre-se de recolher as necessidades!" }
            ];
        }
        homeBlogGrid.innerHTML = blogPosts.slice(0, 4).map(post => createBlogCard(post)).join('');
    }

    // Load Gallery Content (Home)
    const homeGalleryGrid = document.getElementById('homeGalleryGrid');
    if (homeGalleryGrid) { // Check if element exists in index.html (it might not be there if user removed it, but I see it in index.html line 165 commented out "Gallery Section Removed"?? Wait.)
        // In Step 8 index.html, line 165 says "Gallery Section Removed".
        // But user wants "power to edit functions of WHOLE site".
        // If the section is removed from HTML, I can't populate it.
        // However, user might have wanted it back or I might have misread.
        // Step 8 line 165: "Gallery Section Removed".
        // Okay, so initHome SHOULD NOT try to populate it if it's not there.
        // But the previous js/script.js HAD `homeGalleryGrid` logic?
        // Let's check Step 19 `view_file` output. Line 266: `const homeGalleryGrid = document.getElementById('homeGalleryGrid');`.
        // If it returns null, inputs are skipped.
        // I will keep the logic just in case user adds it back, using galleryItems.

        const galleryDisplay = galleryItems.length > 0 ? galleryItems.slice(0, 4) : [];
        if (galleryDisplay.length > 0) {
            homeGalleryGrid.innerHTML = galleryDisplay.map(img => `
                <div class="gallery-card">
                     <img src="${img.image}" alt="${img.title}">
                     <div class="gallery-overlay">
                        <span>❤️ ${img.title}</span>
                     </div>
                </div>
            `).join('');
        }
    }
}

function loadHomeBanners() {
    const bannerContainer = document.getElementById('heroBannerSlider');
    const indicators = document.getElementById('heroBannerIndicators');

    // 1. Load Fixed Positon Banners (Quem Somos & Promo)
    const fixedBanners = banners.filter(b => b.page === 'home' && b.position && b.position !== 'slider');

    fixedBanners.forEach(b => {
        if (b.position.startsWith('quem-somos-')) {
            const num = b.position.split('-')[2];
            const imgEl = document.getElementById(`qs-img-${num}`);
            if (imgEl && b.image) {
                imgEl.src = b.image;
            }
        } else if (b.position === 'promo') {
            const promoSection = document.getElementById('promo-banner-section');
            if (promoSection && b.image) {
                // If text/title exists, we might want to update it too, but user specificially asked for images.
                // For promo banner, typically it's a background image
                promoSection.style.backgroundImage = `url('${b.image}')`;
                promoSection.style.backgroundSize = 'cover';
                promoSection.style.backgroundPosition = 'center';
                promoSection.style.backgroundRepeat = 'no-repeat';
                // Ensure text is visible on top of image (maybe add overlay if needed, but keeping simple for now)
            }
        }
    });

    if (!bannerContainer) return;

    // 2. Load Slider Banners
    let homeBanners = banners.filter(b => (b.page === 'home' || b.page === 'todas') && (!b.position || b.position === 'slider'));

    if (homeBanners.length === 0) {
        // Fallback for demo
        homeBanners = [
            { image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800', title: 'Bem-vindo', text: 'Conecte-se com quem ama pets' },
            { image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', title: 'Amor pelos Animais', text: 'Cuidado e Carinho' }
        ];
    }

    bannerContainer.innerHTML = homeBanners.map((b, i) => `
        <div class="hero-banner-slide ${i === 0 ? 'active' : ''}">
            <img src="${b.image}" onerror="this.src='https://via.placeholder.com/800'">
            <div class="banner-overlay"><h2>${b.title}</h2><p>${b.text || ''}</p></div>
        </div>
    `).join('');

    if (indicators) {
        indicators.innerHTML = homeBanners.map((_, i) => `
            <div class="hero-banner-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
        `).join('');
    }

    startBannerRotation(homeBanners.length);
}

let bannerInterval;
function startBannerRotation(count) {
    if (count <= 1) return;
    let current = 0;

    window.goToSlide = (index) => {
        current = index;
        updateBanner();
        resetInterval();
    };

    const updateBanner = () => {
        document.querySelectorAll('.hero-banner-slide').forEach((el, i) => el.classList.toggle('active', i === current));
        document.querySelectorAll('.hero-banner-dot').forEach((el, i) => el.classList.toggle('active', i === current));
    };

    const nextSlide = () => {
        current = (current + 1) % count;
        updateBanner();
    };

    const resetInterval = () => {
        clearInterval(bannerInterval);
        bannerInterval = setInterval(nextSlide, 5000);
    };

    resetInterval();
}


// --- STORE / LOJA LOGIC ---

function initStore() {
    console.log('Initializing Store...');
    initStoreBanner();

    // Check for cart in LS
    cart = JSON.parse(localStorage.getItem('cart') || '[]');
    updateCartUI();
    updateCartCount();

    if (products.length === 0) {
        products = [
            { id: 1, title: "Ração Premium", category: "Alimentação", price: 129.90, image: "https://picsum.photos/300/200?1", description: "Melhor nutrição." },
            { id: 2, title: "Brinquedo Corda", category: "Brinquedos", price: 29.90, image: "https://picsum.photos/300/200?2", description: "Diversão garantida." }
        ];
    }
    displayProducts(products);

    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.innerText.replace(/^[^\w\s]+/, '').trim();

            if (e.target.innerText.includes('Todos')) displayProducts(products);
            else {
                const filtered = products.filter(p => p.category.includes(cat) || (cat === 'Produtos Especiais' && p.special));
                displayProducts(filtered);
            }
        });
    });

    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) cartIcon.addEventListener('click', toggleCart);
    const closeCartBtn = document.querySelector('.close-cart');
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);

    const checkoutClose = document.querySelector('.checkout-close');
    if (checkoutClose) checkoutClose.addEventListener('click', () => {
        document.getElementById('checkoutModal').classList.remove('active');
    });

    const floatBtn = document.getElementById('floatingCheckoutBtn');
    if (floatBtn) floatBtn.addEventListener('click', toggleCart);
}

function displayProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = list.map(p => `
        <div class="product-card ${p.special ? 'special' : ''}" onclick="openProductModal(${p.id})">
            <img src="${p.image}" class="product-image" onerror="this.src='https://via.placeholder.com/300'">
            <div class="product-info">
                <span class="product-category">${p.category || 'Geral'}</span>
                <h3 class="product-title">${p.title}</h3>
                <p class="product-description">${(p.description || '').substring(0, 80)}...</p>
                <div class="product-price">R$ ${parseFloat(p.price).toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})">🛒 Adicionar</button>
            </div>
        </div>
    `).join('');
}

function openProductModal(id) {
    const p = products.find(x => x.id == id);
    if (!p) return;

    const modal = document.getElementById('productModal');
    const body = document.getElementById('modalBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <img src="${p.image}" style="width:100%; height:300px; object-fit:cover; border-radius:10px;">
        <h2>${p.title}</h2>
        <div class="product-price">R$ ${parseFloat(p.price).toFixed(2)}</div>
        <p>${p.description}</p>
        <div class="quantity-selector">
            <button class="quantity-btn" onclick="adjustModalQty(-1)">-</button>
            <input id="modalQty" class="quantity-input" type="number" value="1" readonly>
            <button class="quantity-btn" onclick="adjustModalQty(1)">+</button>
        </div>
        <button class="btn btn-primary" onclick="addToCart(${p.id}, parseInt(document.getElementById('modalQty').value)); closeModal();">Adicionar ao Carrinho</button>
    `;
    modal.classList.add('active');
}

window.adjustModalQty = (delta) => {
    const input = document.getElementById('modalQty');
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    input.value = val;
};

window.closeModal = () => {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
};

window.addToCart = (id, qty = 1) => {
    const p = products.find(x => x.id == id);
    if (!p) return;

    const exist = cart.find(x => x.id == id);
    if (exist) exist.quantity += qty;
    else cart.push({ ...p, quantity: qty });

    saveCart();
    showToast(`${qty}x ${p.title} adicionado!`);
    updateCartDisplay();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const count = cart.reduce((a, b) => a + b.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.innerText = count;

    const floatBadge = document.getElementById('floatingCartCount');
    if (floatBadge) floatBadge.innerText = count;

    const floatBtn = document.getElementById('floatingCheckoutBtn');
    if (floatBtn) floatBtn.style.display = count > 0 ? 'flex' : 'none';
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (sidebar.classList.contains('active')) updateCartDisplay();
    }
}

function updateCartDisplay() {
    const itemsDiv = document.getElementById('cartItems');
    if (!itemsDiv) return;

    if (cart.length === 0) {
        itemsDiv.innerHTML = '<div class="empty-cart"><p>Carrinho vazio</p></div>';
        const footer = document.getElementById('cartFooter');
        if (footer) footer.style.display = 'none';
        return;
    }

    itemsDiv.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" class="cart-item-image">
            <div style="flex:1">
                <h4>${item.title}</h4>
                <p>R$ ${item.price}</p>
                <div>
                   <button onclick="changeCartQty(${item.id}, -1)">-</button>
                   ${item.quantity}
                   <button onclick="changeCartQty(${item.id}, 1)">+</button>
                   <button onclick="removeFromCart(${item.id})" style="color:red; border:none; background:none;">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    const footer = document.getElementById('cartFooter');
    if (footer) {
        footer.style.display = 'block';
        document.getElementById('cartTotalPrice').innerText = 'R$ ' + total.toFixed(2);
    }
}

window.changeCartQty = (id, delta) => {
    const item = cart.find(x => x.id == id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) cart = cart.filter(x => x.id !== id);
        saveCart();
        updateCartDisplay();
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(x => x.id !== id);
    saveCart();
    updateCartDisplay();
};

window.checkoutWhatsApp = () => {
    if (cart.length === 0) return;
    let msg = "Ola! Gostaria de finalizar meu pedido SocializaPet:\n\n";
    cart.forEach(item => {
        msg += `- ${item.quantity}x ${item.title} (R$ ${item.price})\n`;
    });
    const total = cart.reduce((a, b) => a + (b.price * b.quantity), 0);
    msg += `\nTotal: R$ ${total.toFixed(2)}`;

    window.open(`https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
};


// --- BLOG LOGIC ---

function initBlog() {
    console.log('Initializing Blog...');
    initBlogBanner();

    if (blogPosts.length === 0) {
        blogPosts = [
            { id: 1, title: "Dicas de Alimentação", category: "Saúde", excerpt: "Como alimentar seu pet.", image: "https://picsum.photos/400/250?1", content: "Conteúdo completo..." },
            { id: 2, title: "Brincadeiras", category: "Diversão", excerpt: "Ideias para brincar.", image: "https://picsum.photos/400/250?2", content: "Conteúdo..." }
        ];
    }

    displayBlogPosts(blogPosts);

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const handleSearch = () => {
            const term = searchInput.value.toLowerCase();
            const filtered = blogPosts.filter(p => p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term));
            displayBlogPosts(filtered);
            const info = document.getElementById('searchResultsInfo');
            if (info) {
                info.style.display = term ? 'block' : 'none';
                info.innerText = `Encontrados ${filtered.length} posts.`;
            }
        };
        searchInput.addEventListener('keyup', handleSearch);
        document.querySelector('.search-btn').addEventListener('click', handleSearch);
    }

    document.querySelectorAll('.categories-filter .category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.categories-filter .category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const cat = e.target.innerText.replace(/^[^\w\s]+/, '').trim();
            if (cat === 'Todos') displayBlogPosts(blogPosts);
            else displayBlogPosts(blogPosts.filter(p => p.category === cat));
        });
    });
}

function displayBlogPosts(list) {
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    grid.innerHTML = list.map(p => createBlogCard(p)).join('');
}

function createBlogCard(post) {
    return `
        <article class="blog-card" onclick="openPostModal(${post.id})" style="cursor: pointer;">
            <img src="${post.image}" onerror="this.src='https://via.placeholder.com/400'">
            <div class="blog-card-content">
                <span class="blog-category">${post.category || 'Geral'}</span>
                <h3>${post.title}</h3>
                <p>${post.excerpt || ''}</p>
                <a href="#" onclick="event.stopPropagation(); openPostModal(${post.id}); return false;" class="read-more">Leia Mais</a>
            </div>
        </article>
    `;
}

window.openPostModal = (id) => {
    const post = blogPosts.find(x => x.id == id);
    if (!post) return;

    const modal = document.getElementById('postModal');
    if (!modal) return;

    document.getElementById('modalTitle').innerText = post.title;
    document.getElementById('modalImage').src = post.image;
    document.getElementById('modalContent').innerHTML = post.content || post.excerpt;
    document.getElementById('modalCategory').innerText = post.category;

    modal.classList.add('active');
};

window.closePostModal = () => {
    document.getElementById('postModal').classList.remove('active');
};

function initBlogBanner() {
    const bannerContainer = document.getElementById('blogBannerSlider');
    const indicators = document.getElementById('blogBannerIndicators');
    if (!bannerContainer) return;

    let blogBanners = banners.filter(b => (b.page === 'blog' || b.page === 'todas') && (!b.position || b.position === 'slider'));

    // Default banners if none
    if (blogBanners.length === 0) {
        blogBanners = [
            { image: 'imagens/blog-banner.png' },
            { image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200' },
            { image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200' }
        ];
    }

    bannerContainer.innerHTML = blogBanners.map((b, i) => `
        <div class="blog-banner-slide ${i === 0 ? 'active' : ''}">
            <img src="${b.image}" onerror="this.src='https://via.placeholder.com/1200x400'">
        </div>
    `).join('');

    if (indicators) {
        indicators.innerHTML = blogBanners.map((_, i) => `
            <div class="blog-banner-dot ${i === 0 ? 'active' : ''}" onclick="goToBlogSlide(${i})"></div>
        `).join('');
    }

    startBlogBannerRotation(blogBanners.length);
}

let blogBannerInterval;
function startBlogBannerRotation(count) {
    if (count <= 1) return;
    let current = 0;

    window.goToBlogSlide = (index) => {
        current = index;
        updateBlogBanner();
        resetBlogInterval();
    };

    const updateBlogBanner = () => {
        document.querySelectorAll('.blog-banner-slide').forEach((el, i) => el.classList.toggle('active', i === current));
        document.querySelectorAll('.blog-banner-dot').forEach((el, i) => el.classList.toggle('active', i === current));
    };

    const nextSlide = () => {
        current = (current + 1) % count;
        updateBlogBanner();
    };

    const resetBlogInterval = () => {
        clearInterval(blogBannerInterval);
        blogBannerInterval = setInterval(nextSlide, 8000); // 8 seconds as requested
    };

    resetBlogInterval();
}

function initStoreBanner() {
    const bannerContainer = document.getElementById('shopBannerSlider');
    const indicators = document.getElementById('shopBannerIndicators');
    if (!bannerContainer) return;

    let shopBanners = banners.filter(b => (b.page === 'loja' || b.page === 'todas') && (!b.position || b.position === 'slider'));

    // Default banners for store (could be fetched later)
    if (shopBanners.length === 0) {
        shopBanners = [
            { image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1200' },
            { image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200' },
            { image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200' }
        ];
    }

    bannerContainer.innerHTML = shopBanners.map((b, i) => `
        <div class="shop-banner-slide ${i === 0 ? 'active' : ''}">
            <img src="${b.image}" onerror="this.src='https://via.placeholder.com/1200x400'">
        </div>
    `).join('');

    if (indicators) {
        indicators.innerHTML = shopBanners.map((_, i) => `
            <div class="shop-banner-dot ${i === 0 ? 'active' : ''}" onclick="goToShopSlide(${i})"></div>
        `).join('');
    }

    startShopBannerRotation(shopBanners.length);
}

let shopBannerInterval;
function startShopBannerRotation(count) {
    if (count <= 1) return;
    let current = 0;

    window.goToShopSlide = (index) => {
        current = index;
        updateShopBanner();
        resetShopInterval();
    };

    const updateShopBanner = () => {
        document.querySelectorAll('.shop-banner-slide').forEach((el, i) => el.classList.toggle('active', i === current));
        document.querySelectorAll('.shop-banner-dot').forEach((el, i) => el.classList.toggle('active', i === current));
    };

    const nextSlide = () => {
        current = (current + 1) % count;
        updateShopBanner();
    };

    const resetShopInterval = () => {
        clearInterval(shopBannerInterval);
        shopBannerInterval = setInterval(nextSlide, 8000); // 8 seconds
    };

    resetShopInterval();
}

// --- GALLERY PAGE LOGIC ---


// --- PROJECT LOGIC ---
function initProject() {
    console.log('Initializing Project...');
}

// --- UTILS ---
window.toggleMobileMenu = function () {
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    if (mobileNav) mobileNav.classList.toggle('active');
    if (mobileOverlay) mobileOverlay.classList.toggle('active');
}
