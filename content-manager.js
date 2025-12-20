/**
 * SocializaPet Content Management System
 * Centralized dynamic content loader for all site pages
 * Connects admin panel changes to website display
 */

class SocializaPetCMS {
    constructor() {
        this.storageKeys = {
            posts: ['adminPosts', 'socializaPetPosts'],
            banners: ['siteBanners', 'socializaPetBanners'],
            products: ['siteProducts', 'socializaPetProducts'],
            gallery: ['siteGallery', 'socializaPetGallery'],
            content: ['siteContent', 'socializaPetContent'],
            settings: ['siteSettings', 'socializaPetSettings']
        };
    }

    // Get data from localStorage with fallback keys
    getData(type) {
        const keys = this.storageKeys[type];
        if (!keys) return null;

        for (const key of keys) {
            const data = localStorage.getItem(key);
            if (data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    console.warn(`Error parsing ${key}:`, e);
                }
            }
        }
        return null;
    }

    // Initialize content management for current page
    init() {
        const page = this.getCurrentPage();
        
        // Load common content for all pages
        this.loadSiteSettings();
        this.loadSiteContent();
        
        // Load page-specific content
        switch (page) {
            case 'index':
                this.loadBanners();
                this.loadGallery();
                break;
            case 'loja':
                this.loadProducts();
                break;
            case 'blog':
                this.loadPosts();
                break;
            case 'projeto-socializa':
                // No specific content for this page yet
                break;
        }
        
        console.log(`SocializaPet CMS initialized for page: ${page}`);
    }

    // Detect current page
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        if (filename === '' || filename === 'index') return 'index';
        return filename;
    }

    // Load site settings (colors, statistics)
    loadSiteSettings() {
        const settings = this.getData('settings') || {};
        
        // Update CSS custom properties for colors
        if (settings.primaryColor || settings.secondaryColor) {
            const root = document.documentElement;
            if (settings.primaryColor) {
                root.style.setProperty('--primary-pink', settings.primaryColor);
            }
            if (settings.secondaryColor) {
                root.style.setProperty('--primary-blue', settings.secondaryColor);
            }
        }
        
        // Update statistics in hero section (index page only)
        const statsElements = document.querySelectorAll('.hero-stat-number');
        if (statsElements.length >= 3) {
            if (settings.adoptedPets) statsElements[2].textContent = settings.adoptedPets + '+';
            if (settings.partners) statsElements[1].textContent = settings.partners + '+';
            if (settings.happyFamilies) statsElements[0].textContent = settings.happyFamilies + 'K+';
        }
    }

    // Load site content (titles, descriptions, contact info)
    loadSiteContent() {
        const content = this.getData('content') || {};
        
        // Update page title
        if (content.title) {
            const currentPage = this.getCurrentPage();
            const pageNames = {
                'index': content.title,
                'loja': `Loja - ${content.title}`,
                'blog': `Blog - ${content.title}`,
                'projeto-socializa': `Projeto Socializa - ${content.title}`
            };
            
            document.title = pageNames[currentPage] + ' - Seu Mundo Pet Conectado e Cheio de Amor!';
            
            // Update logo text if exists
            const logoText = document.querySelector('.logo');
            if (logoText && content.title) {
                logoText.innerHTML = `${content.title.replace('Pet', '<span style="color: var(--primary-pink);">Pet</span>')}`;
            }
        }
        
        // Update about section (index page only)
        if (content.about) {
            const aboutText = document.querySelector('#sobre .about-text p');
            if (aboutText) {
                aboutText.textContent = content.about;
            }
        }
        
        // Update contact info for WhatsApp
        if (content.whatsapp) {
            window.siteWhatsApp = content.whatsapp;
        }
    }

    // Load banners (index page)
    loadBanners() {
        const banners = this.getData('banners') || [];
        
        if (banners.length > 0) {
            const sliderContainer = document.querySelector('.hero-banner-slider');
            const indicatorsContainer = document.querySelector('.hero-banner-indicators');
            
            if (sliderContainer && indicatorsContainer) {
                // Clear existing content
                sliderContainer.innerHTML = '';
                indicatorsContainer.innerHTML = '';
                
                // Add dynamic banners
                banners.forEach((banner, index) => {
                    // Create slide
                    const slide = document.createElement('div');
                    slide.className = `hero-banner-slide ${index === 0 ? 'active' : ''}`;
                    slide.innerHTML = `
                        <img src="${banner.image}" alt="${banner.title}" onerror="this.src='https://picsum.photos/800/400?random=${index + 1}'">
                        <div class="hero-banner-overlay">
                            <div class="hero-banner-text">${banner.title}</div>
                            <div class="hero-banner-subtitle">${banner.text}</div>
                        </div>
                    `;
                    
                    // Add click handler if banner has link
                    if (banner.link) {
                        slide.style.cursor = 'pointer';
                        slide.addEventListener('click', () => {
                            if (banner.link.startsWith('http')) {
                                window.open(banner.link, '_blank');
                            } else {
                                window.location.href = banner.link;
                            }
                        });
                    }
                    
                    sliderContainer.appendChild(slide);
                    
                    // Create indicator
                    const indicator = document.createElement('div');
                    indicator.className = `hero-banner-dot ${index === 0 ? 'active' : ''}`;
                    indicator.setAttribute('data-slide', index);
                    indicator.addEventListener('click', () => this.goToSlide(index));
                    indicatorsContainer.appendChild(indicator);
                });
                
                // Initialize carousel
                this.initCarousel();
            }
        }
    }

    // Initialize carousel functionality
    initCarousel() {
        const slides = document.querySelectorAll('.hero-banner-slide');
        const dots = document.querySelectorAll('.hero-banner-dot');
        
        if (slides.length > 1) {
            let currentSlide = 0;
            
            const showSlide = (index) => {
                slides.forEach(slide => slide.classList.remove('active'));
                dots.forEach(dot => dot.classList.remove('active'));
                
                if (slides[index] && dots[index]) {
                    slides[index].classList.add('active');
                    dots[index].classList.add('active');
                }
            };
            
            const nextSlide = () => {
                currentSlide = (currentSlide + 1) % slides.length;
                showSlide(currentSlide);
            };
            
            // Make goToSlide globally accessible
            window.goToSlide = (index) => {
                currentSlide = index;
                showSlide(currentSlide);
            };
            
            // Auto-play carousel
            setInterval(nextSlide, 5000);
        }
    }

    // Load gallery (index page)
    loadGallery() {
        const gallery = this.getData('gallery') || [];
        
        if (gallery.length > 0) {
            const galleryGrid = document.querySelector('.gallery-grid');
            if (galleryGrid) {
                // Take first 6 images for homepage
                const limitedGallery = gallery.slice(0, 6);
                galleryGrid.innerHTML = limitedGallery.map(item => `
                    <div class="gallery-item">
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://picsum.photos/300/280?random=${Math.floor(Math.random() * 100)}'">
                    </div>
                `).join('');
            }
        }
    }

    // Load products (loja page)
    loadProducts() {
        const products = this.getData('products') || [];
        
        if (products.length > 0) {
            const productGrid = document.querySelector('.shop-grid');
            if (productGrid) {
                productGrid.innerHTML = products.map(product => `
                    <div class="product-card">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://picsum.photos/300/280?random=${Math.floor(Math.random() * 100)}'">
                            <div class="product-overlay">
                                <button class="btn-view" onclick="viewProduct(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-cart" onclick="addToCart(${product.id || Math.random()}, '${product.name}', ${product.price})">
                                    <i class="fas fa-shopping-cart"></i>
                                </button>
                            </div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-footer">
                                <span class="product-price">R$ ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(product.price).toFixed(2)}</span>
                                <div class="product-actions">
                                    <button class="btn-favorite">
                                        <i class="far fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
                
                // Update product count
                const productCount = document.querySelector('.shop-header p');
                if (productCount) {
                    productCount.textContent = `Encontramos ${products.length} produto${products.length > 1 ? 's' : ''} para você!`;
                }
            }
        }
    }

    // Load posts (blog page)
    loadPosts() {
        const adminPosts = this.getData('posts') || [];
        
        if (adminPosts.length > 0 && typeof window.blogPosts !== 'undefined') {
            // Replace existing posts with admin posts
            window.blogPosts = adminPosts.map(post => ({
                id: post.id,
                title: post.title,
                excerpt: post.content.substring(0, 150) + '...',
                content: post.content,
                author: post.author || 'Admin',
                date: post.date || new Date().toLocaleDateString('pt-BR'),
                image: post.image || 'https://picsum.photos/800/400?random=' + post.id,
                category: post.category || 'Geral',
                tags: post.tags || []
            }));
            
            // Re-display posts with new content if function exists
            if (typeof displayPosts === 'function') {
                displayPosts();
            }
        }
    }
}

// Initialize CMS when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const cms = new SocializaPetCMS();
    cms.init();
});

// Make CMS globally accessible
window.SocializaPetCMS = SocializaPetCMS;