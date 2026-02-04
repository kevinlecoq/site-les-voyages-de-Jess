// Les Voyages de Jess - Application principale
document.addEventListener('DOMContentLoaded', function() {
  initMenu();
  initPhotoSliders();
  initFAQ();
  initForms();
  initSmoothScroll();
});

// Gestion du menu latéral
function initMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const sidebarOverlay = document.querySelector('.sidebar-overlay');
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      sidebarOverlay.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  }

  // Fermer le menu lors du clic sur un lien
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      sidebar.classList.remove('open');
      sidebarOverlay.classList.remove('active');
      menuToggle.classList.remove('active');
    });
  });

  // Marquer le lien actif
  const currentPath = window.location.pathname;
  sidebarLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

// Gestion des sliders de photos
function initPhotoSliders() {
  const sliders = document.querySelectorAll('.photo-slider');
  
  sliders.forEach(slider => {
    const container = slider.querySelector('.slider-container');
    const images = slider.querySelectorAll('.slider-image');
    const prevBtn = slider.querySelector('.slider-nav-prev');
    const nextBtn = slider.querySelector('.slider-nav-next');
    const dotsContainer = slider.querySelector('.slider-dots');
    
    if (!container || images.length === 0) return;
    
    let currentIndex = 0;
    const totalImages = images.length;
    
    // Créer les dots
    if (dotsContainer) {
      images.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
      });
    }
    
    function updateSlider() {
      container.style.transform = `translateX(-${currentIndex * 100}%)`;
      
      const dots = slider.querySelectorAll('.slider-dot');
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });
    }
    
    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
    }
    
    function nextSlide() {
      currentIndex = (currentIndex + 1) % totalImages;
      updateSlider();
    }
    
    function prevSlide() {
      currentIndex = (currentIndex - 1 + totalImages) % totalImages;
      updateSlider();
    }
    
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    
    // Auto-play toutes les 5 secondes
    setInterval(nextSlide, 5000);
  });
}

// Gestion des FAQ (accordéon)
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', function() {
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });
        
        item.classList.toggle('active');
      });
    }
  });
}

// Gestion des formulaires
function initForms() {
  const quoteForm = document.getElementById('quote-form');
  
  if (quoteForm) {
    quoteForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(quoteForm);
      const data = Object.fromEntries(formData);
      
      try {
        const response = await fetch('/api/quote-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          showNotification('Votre demande a été envoyée avec succès ! Jessica vous contactera bientôt.', 'success');
          quoteForm.reset();
        } else {
          throw new Error('Erreur lors de l\'envoi');
        }
      } catch (error) {
        showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
      }
    });
  }
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideInRight 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Défilement fluide
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Charger les formules
async function loadPackages() {
  try {
    const response = await fetch('/api/packages');
    const packages = await response.json();
    
    const grid = document.getElementById('packages-grid');
    if (!grid) return;
    
    grid.innerHTML = packages.map(pkg => `
      <div class="package-card">
        <div class="package-image"></div>
        <div class="package-content">
          <h3 class="package-name">${pkg.name}</h3>
          <p class="package-duration">${pkg.duration}</p>
          <p class="package-description">${pkg.description}</p>
          <div class="package-price">
            <span class="price-amount">${pkg.price_eur}€ / ${pkg.price_cad}$</span>
            <a href="/voyage-sur-mesure" class="btn btn-primary btn-sm">Découvrir</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erreur lors du chargement des formules:', error);
  }
}

// Charger les formules si on est sur la page d'accueil
if (document.getElementById('packages-grid')) {
  loadPackages();
}

// Animation au scroll
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, {
    threshold: 0.1
  });
  
  document.querySelectorAll('.package-card, .blog-card, .process-step').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

initScrollAnimations();

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// CAROUSEL BLOG ARTICLES
// ============================================

function scrollBlogCarousel(direction) {
  const carousel = document.querySelector('.blog-carousel');
  if (!carousel) return;
  
  const cardWidth = carousel.querySelector('.blog-card').offsetWidth;
  const gap = 32; // 2rem = 32px
  const scrollAmount = (cardWidth + gap) * direction;
  
  carousel.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
}

// Rendre la fonction globale pour l'attribut onclick
window.scrollBlogCarousel = scrollBlogCarousel;
