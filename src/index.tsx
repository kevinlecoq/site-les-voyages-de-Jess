import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { jsxRenderer } from 'hono/jsx-renderer'

// Types pour les bindings Cloudflare
type Bindings = {
  db: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware CORS pour les API
app.use('/api/*', cors())

// Servir les fichiers statiques
app.use('/static/*', serveStatic({ root: './public' }))

// Renderer JSX avec layout commun
app.use('*', jsxRenderer(({ children, title }) => {
  return (
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'Les Voyages de Jess - Travel Planner au Québec'}</title>
        <meta name="description" content="Créatrice de voyages sur mesure. Planification personnalisée de vos aventures selon vos envies, votre rythme et votre budget." />
        
        {/* Fonts Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Font Awesome */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Styles personnalisés */}
        <link href="/static/css/styles.css" rel="stylesheet" />
      </head>
      <body>
        {/* Menu hamburger */}
        <button class="menu-toggle">
          <span></span>
        </button>

        {/* Sidebar */}
        <nav class="sidebar">
          <div class="sidebar-content">
            <div class="sidebar-logo">
              <i class="fas fa-globe-americas"></i>
              <br />
              Les Voyages de Jess
            </div>
            <ul class="sidebar-nav">
              <li><a href="/"><i class="fas fa-home"></i> Accueil</a></li>
              <li><a href="/qui-suis-je"><i class="fas fa-user"></i> Qui suis-je?</a></li>
              <li><a href="/mes-formules"><i class="fas fa-suitcase"></i> Mes Formules</a></li>
              <li><a href="/voyage-sur-mesure"><i class="fas fa-map-marked-alt"></i> Voyage sur Mesure</a></li>
              <li><a href="/faq"><i class="fas fa-question-circle"></i> FAQ</a></li>
              <li><a href="/blog"><i class="fas fa-book-open"></i> Blog</a></li>
              <li><a href="/contact"><i class="fas fa-envelope"></i> Contact</a></li>
            </ul>
          </div>
        </nav>

        {/* Overlay pour fermer le menu */}
        <div class="sidebar-overlay"></div>

        {/* Contenu principal */}
        <main class="main-container">
          {children}
        </main>

        {/* Footer */}
        <footer class="footer">
          <div class="footer-content">
            <div class="footer-section">
              <h3>Les Voyages de Jess</h3>
              <p>Créatrice de voyages sur mesure</p>
              <p>Québec, Canada</p>
            </div>
            <div class="footer-section">
              <h3>Navigation</h3>
              <ul class="footer-links">
                <li><a href="/">Accueil</a></li>
                <li><a href="/qui-suis-je">Qui suis-je?</a></li>
                <li><a href="/mes-formules">Mes Formules</a></li>
                <li><a href="/blog">Blog</a></li>
              </ul>
            </div>
            <div class="footer-section">
              <h3>Contact</h3>
              <p><i class="fas fa-envelope"></i> contact@lesvoyagesdejess.ca</p>
              <div class="social-links">
                <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
                <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Les Voyages de Jess. Tous droits réservés.</p>
          </div>
        </footer>

        {/* Scripts */}
        <script src="/static/js/app.js"></script>
      </body>
    </html>
  )
}))

// ============================================
// PAGE D'ACCUEIL
// ============================================
app.get('/', async (c) => {
  // Récupérer les paramètres du site
  const settings = await c.env.db.prepare('SELECT key, value FROM site_settings').all();
  const settingsMap = settings.results.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  
  // Récupérer les formules
  const packages = await c.env.db.prepare('SELECT * FROM travel_packages ORDER BY sort_order ASC').all();

  return c.render(
    <>
      {/* Section Hero */}
      <section class="hero">
        <h1 class="hero-title">Les Voyages de Jess</h1>
        <p class="hero-subtitle">{settingsMap.hero_subtitle || 'Créatrice de voyages sur mesure'}</p>
        <div style="margin-top: 2rem;">
          <a href="/voyage-sur-mesure" class="btn btn-primary" style="margin-right: 1rem;">
            <i class="fas fa-compass"></i> Créer mon voyage
          </a>
          <a href="/qui-suis-je" class="btn btn-outline">
            <i class="fas fa-user"></i> Découvrir Jessica
          </a>
        </div>
      </section>

      {/* Section Formules */}
      <section class="section">
        <h2 class="section-title">Mes Formules de Voyage</h2>
        <p style="text-align: center; color: var(--color-text-secondary); max-width: 700px; margin: 0 auto 2rem;">
          Choisissez la formule qui correspond à vos envies. Chaque voyage est unique et adapté à votre rythme.
        </p>
        <div class="packages-grid">
          {packages.results.map((pkg: any) => (
            <div class="package-card">
              <div class="package-image">
                {/* Placeholder - les images seront ajoutées plus tard */}
              </div>
              <div class="package-content">
                <h3 class="package-name">{pkg.name}</h3>
                <p class="package-duration"><i class="fas fa-clock"></i> {pkg.duration}</p>
                <p class="package-description">{pkg.description}</p>
                <div class="package-price">
                  <div>
                    <span class="price-amount">{pkg.price_eur}€</span>
                    <span style="color: var(--color-text-secondary);"> / </span>
                    <span class="price-amount">{pkg.price_cad}$</span>
                  </div>
                  <a href="/voyage-sur-mesure" class="btn btn-primary">Découvrir</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section À propos (courte) */}
      <section class="section section-warm">
        <div style="max-width: 900px; margin: 0 auto; text-align: center;">
          <h2 class="section-title">Qui suis-je?</h2>
          <p style="font-size: 1.1rem; line-height: 1.8; color: var(--color-text-secondary); margin-bottom: 2rem;">
            {settingsMap.about_jessica ? settingsMap.about_jessica.substring(0, 300) + '...' : 
            'Je m\'appelle Jessica, passionnée de voyages et grande amoureuse d\'aventure. Originaire du sud de la France, je vis au Québec depuis plus de 6 ans...'}
          </p>
          <a href="/qui-suis-je" class="btn btn-secondary">
            <i class="fas fa-arrow-right"></i> En savoir plus
          </a>
        </div>
      </section>

      {/* Section CTA */}
      <section class="section" style="text-align: center; padding: 4rem 1rem;">
        <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Prêt à créer votre voyage de rêve?</h2>
        <p style="font-size: 1.2rem; color: var(--color-text-secondary); margin-bottom: 2rem;">
          Contactez-moi pour une consultation gratuite
        </p>
        <a href="/contact" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
          <i class="fas fa-paper-plane"></i> Me contacter
        </a>
      </section>
    </>,
    { title: 'Accueil - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE QUI SUIS-JE
// ============================================
app.get('/qui-suis-je', async (c) => {
  const settings = await c.env.db.prepare('SELECT key, value FROM site_settings').all();
  const settingsMap = settings.results.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Qui suis-je?</h1>
        <p class="hero-subtitle">Jessica, votre Travel Planner</p>
      </section>

      <section class="section">
        <div class="about-section">
          <div>
            <img src={settingsMap.about_photo || '/static/images/jessica-placeholder.jpg'} 
                 alt="Jessica" 
                 class="about-image" />
          </div>
          <div class="about-content">
            <h2 style="margin-bottom: 1.5rem;">Bienvenue dans mon univers</h2>
            {settingsMap.about_jessica && settingsMap.about_jessica.split('\n\n').map((paragraph: string) => (
              <p style="margin-bottom: 1rem; line-height: 1.8;">{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section class="section section-warm">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h2 class="section-title">Pourquoi choisir un Travel Planner?</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-top: 2rem;">
            <div>
              <i class="fas fa-heart" style="font-size: 3rem; color: var(--color-secondary); margin-bottom: 1rem;"></i>
              <h3>Personnalisé</h3>
              <p>Un voyage qui vous ressemble vraiment</p>
            </div>
            <div>
              <i class="fas fa-clock" style="font-size: 3rem; color: var(--color-secondary); margin-bottom: 1rem;"></i>
              <h3>Gain de temps</h3>
              <p>Je m'occupe de tout pour vous</p>
            </div>
            <div>
              <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--color-secondary); margin-bottom: 1rem;"></i>
              <h3>Expertise</h3>
              <p>Des conseils basés sur mes expériences</p>
            </div>
          </div>
        </div>
      </section>
    </>,
    { title: 'Qui suis-je? - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE MES FORMULES
// ============================================
app.get('/mes-formules', async (c) => {
  const packages = await c.env.db.prepare('SELECT * FROM travel_packages ORDER BY sort_order ASC').all();

  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Mes Formules</h1>
        <p class="hero-subtitle">Choisissez celle qui correspond à vos envies</p>
      </section>

      <section class="section">
        <div class="packages-grid">
          {packages.results.map((pkg: any) => (
            <div class="package-card">
              <div class="package-image"></div>
              <div class="package-content">
                <h3 class="package-name">{pkg.name}</h3>
                <p class="package-duration"><i class="fas fa-clock"></i> {pkg.duration}</p>
                <p class="package-description">{pkg.description}</p>
                <div style="margin: 1.5rem 0;">
                  <h4 style="color: var(--color-primary); margin-bottom: 0.5rem;">Ce qui est inclus :</h4>
                  <ul style="list-style: none; padding: 0;">
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> Appel découverte</li>
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> Itinéraire détaillé personnalisé</li>
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> Recommandations d'hébergements</li>
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> Suggestions d'activités</li>
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> Carnet de voyage digital</li>
                    <li><i class="fas fa-check" style="color: var(--color-accent-green);"></i> 2 révisions incluses</li>
                  </ul>
                </div>
                <div class="package-price">
                  <div>
                    <span class="price-amount">{pkg.price_eur}€</span>
                    <span style="color: var(--color-text-secondary);"> / </span>
                    <span class="price-amount">{pkg.price_cad}$</span>
                  </div>
                  <a href="/voyage-sur-mesure" class="btn btn-primary">Commencer</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section class="section section-warm">
        <div style="max-width: 800px; margin: 0 auto; text-align: center;">
          <h2 class="section-title">Besoin de quelque chose de différent?</h2>
          <p style="font-size: 1.1rem; margin-bottom: 2rem;">
            Chaque voyage est unique. Si aucune formule ne correspond exactement à vos besoins,
            contactez-moi pour un devis personnalisé.
          </p>
          <a href="/contact" class="btn btn-secondary">
            <i class="fas fa-envelope"></i> Demander un devis personnalisé
          </a>
        </div>
      </section>
    </>,
    { title: 'Mes Formules - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE VOYAGE SUR MESURE (Processus)
// ============================================
app.get('/voyage-sur-mesure', (c) => {
  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Votre Voyage sur Mesure</h1>
        <p class="hero-subtitle">Comment ça marche?</p>
      </section>

      <section class="section">
        <div class="process-steps">
          <div class="process-step">
            <div class="step-number">1</div>
            <h3 class="step-title">Premier Contact</h3>
            <p class="step-description">
              Remplissez le formulaire de demande ou contactez-moi directement. 
              Je vous recontacte sous 48h pour planifier notre appel découverte gratuit.
            </p>
          </div>

          <div class="process-step">
            <div class="step-number">2</div>
            <h3 class="step-title">Appel Découverte</h3>
            <p class="step-description">
              Nous discutons de vos envies, votre budget, vos contraintes et vos rêves. 
              C'est le moment de tout me dire pour que je comprenne votre vision parfaitement.
            </p>
          </div>

          <div class="process-step">
            <div class="step-number">3</div>
            <h3 class="step-title">Création de l'Itinéraire</h3>
            <p class="step-description">
              Je travaille sur votre itinéraire personnalisé avec tous les détails : 
              hébergements, activités, restaurants, transports et mes meilleurs conseils.
            </p>
          </div>

          <div class="process-step">
            <div class="step-number">4</div>
            <h3 class="step-title">Présentation & Révisions</h3>
            <p class="step-description">
              Je vous présente votre itinéraire complet. Vous avez droit à 2 révisions 
              pour l'affiner jusqu'à ce qu'il soit parfait pour vous.
            </p>
          </div>

          <div class="process-step">
            <div class="step-number">5</div>
            <h3 class="step-title">Carnet de Voyage</h3>
            <p class="step-description">
              Vous recevez votre carnet de voyage digital avec toutes les informations, 
              réservations suggérées, cartes et mes recommandations personnelles.
            </p>
          </div>

          <div class="process-step">
            <div class="step-number">6</div>
            <h3 class="step-title">Bon Voyage!</h3>
            <p class="step-description">
              Vous partez l'esprit léger. Je reste disponible pendant votre voyage 
              si vous avez besoin de conseils ou ajustements.
            </p>
          </div>
        </div>
      </section>

      <section class="section section-warm" style="text-align: center;">
        <h2 class="section-title">Prêt à commencer?</h2>
        <p style="font-size: 1.1rem; max-width: 600px; margin: 0 auto 2rem;">
          Remplissez le formulaire de demande et je vous recontacte rapidement pour 
          commencer à planifier votre voyage de rêve.
        </p>
        <a href="/contact" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
          <i class="fas fa-paper-plane"></i> Faire une demande
        </a>
      </section>
    </>,
    { title: 'Voyage sur Mesure - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE FAQ
// ============================================
app.get('/faq', async (c) => {
  const faqs = await c.env.db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();

  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Questions Fréquentes</h1>
        <p class="hero-subtitle">Tout ce que vous devez savoir</p>
      </section>

      <section class="section">
        <div class="faq-list">
          {faqs.results.map((faq: any) => (
            <div class="faq-item">
              <div class="faq-question">
                <span>{faq.question}</span>
                <i class="fas fa-chevron-down faq-icon"></i>
              </div>
              <div class="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div style="text-align: center; margin-top: 3rem; padding: 2rem; background: var(--color-bg-warm); border-radius: var(--radius-lg);">
          <h3 style="margin-bottom: 1rem;">Vous ne trouvez pas votre réponse?</h3>
          <p style="margin-bottom: 1.5rem; color: var(--color-text-secondary);">
            N'hésitez pas à me contacter directement, je serai ravie de répondre à toutes vos questions!
          </p>
          <a href="/contact" class="btn btn-primary">
            <i class="fas fa-envelope"></i> Me contacter
          </a>
        </div>
      </section>
    </>,
    { title: 'FAQ - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE BLOG
// ============================================
app.get('/blog', async (c) => {
  const posts = await c.env.db.prepare('SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC').all();

  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Blog</h1>
        <p class="hero-subtitle">Récits, conseils et inspirations voyage</p>
      </section>

      <section class="section">
        {posts.results.length === 0 ? (
          <div style="text-align: center; padding: 3rem;">
            <i class="fas fa-book-open" style="font-size: 4rem; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
            <h2>Bientôt disponible</h2>
            <p style="color: var(--color-text-secondary);">
              Les premiers articles arrivent bientôt! Revenez régulièrement pour découvrir 
              mes récits de voyage et mes meilleurs conseils.
            </p>
          </div>
        ) : (
          <div class="blog-grid">
            {posts.results.map((post: any) => (
              <article class="blog-card">
                {post.featured_image && (
                  <img src={post.featured_image} alt={post.title} class="blog-image" />
                )}
                <div class="blog-content">
                  <div class="blog-date">
                    <i class="fas fa-calendar"></i> {new Date(post.published_at).toLocaleDateString('fr-FR')}
                  </div>
                  <h3 class="blog-title">{post.title}</h3>
                  <p class="blog-excerpt">{post.excerpt}</p>
                  <a href={`/blog/${post.slug}`} class="btn btn-outline">
                    Lire la suite <i class="fas fa-arrow-right"></i>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>,
    { title: 'Blog - Les Voyages de Jess' }
  )
})

// ============================================
// PAGE CONTACT
// ============================================
app.get('/contact', (c) => {
  return c.render(
    <>
      <section class="hero" style="min-height: 40vh;">
        <h1 class="hero-title">Contact</h1>
        <p class="hero-subtitle">Commençons à planifier votre voyage</p>
      </section>

      <section class="section">
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="background: var(--color-bg-warm); padding: 2rem; border-radius: var(--radius-lg); margin-bottom: 2rem; text-align: center;">
            <h2 style="margin-bottom: 1rem;">Demande de devis gratuite</h2>
            <p style="color: var(--color-text-secondary);">
              Remplissez ce formulaire et je vous recontacte sous 48h pour discuter de votre projet de voyage.
            </p>
          </div>

          <form id="quote-form" style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-md);">
            <div class="form-group">
              <label class="form-label" for="name">Nom complet *</label>
              <input type="text" id="name" name="name" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="email">Email *</label>
              <input type="email" id="email" name="email" class="form-input" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="phone">Téléphone</label>
              <input type="tel" id="phone" name="phone" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label" for="destination">Destination souhaitée *</label>
              <input type="text" id="destination" name="destination" class="form-input" placeholder="Ex: Japon, Italie, Amérique du Sud..." required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="form-label" for="duration">Durée du voyage *</label>
                <select id="duration" name="duration" class="form-select" required>
                  <option value="">Choisir...</option>
                  <option value="2-6">2 à 6 jours</option>
                  <option value="7-14">7 à 14 jours</option>
                  <option value="15-21">15 à 21 jours</option>
                  <option value="21+">Plus de 21 jours</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="travelers">Nombre de voyageurs *</label>
                <input type="number" id="travelers" name="travelers" class="form-input" min="1" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="budget">Budget estimé</label>
              <select id="budget" name="budget" class="form-select">
                <option value="">Choisir...</option>
                <option value="low">Moins de 1000€/pers</option>
                <option value="medium">1000€ - 3000€/pers</option>
                <option value="high">3000€ - 5000€/pers</option>
                <option value="luxury">Plus de 5000€/pers</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="message">Parlez-moi de votre projet *</label>
              <textarea id="message" name="message" class="form-textarea" 
                        placeholder="Qu'est-ce qui vous fait rêver? Quels types d'expériences recherchez-vous?" 
                        required></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1rem; font-size: 1.1rem;">
              <i class="fas fa-paper-plane"></i> Envoyer ma demande
            </button>
          </form>

          <div style="margin-top: 2rem; text-align: center; padding: 2rem;">
            <h3 style="margin-bottom: 1rem;">Ou contactez-moi directement :</h3>
            <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">
              <i class="fas fa-envelope" style="color: var(--color-primary);"></i> 
              <a href="mailto:contact@lesvoyagesdejess.ca" style="color: var(--color-primary); text-decoration: none;">
                contact@lesvoyagesdejess.ca
              </a>
            </p>
            <p style="font-size: 1.1rem;">
              <i class="fab fa-instagram" style="color: var(--color-secondary);"></i> 
              <a href="https://instagram.com/lesvoyagesdejess" target="_blank" style="color: var(--color-secondary); text-decoration: none;">
                @lesvoyagesdejess
              </a>
            </p>
          </div>
        </div>
      </section>
    </>,
    { title: 'Contact - Les Voyages de Jess' }
  )
})

// ============================================
// API ROUTES
// ============================================

// API: Récupérer toutes les formules
app.get('/api/packages', async (c) => {
  const packages = await c.env.db.prepare('SELECT * FROM travel_packages ORDER BY sort_order ASC').all();
  return c.json(packages.results)
})

// API: Soumettre une demande de devis
app.post('/api/quote-request', async (c) => {
  const data = await c.req.json();
  
  try {
    await c.env.db.prepare(`
      INSERT INTO quote_requests (name, email, phone, destination, duration, budget, travelers, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.email,
      data.phone || null,
      data.destination,
      data.duration,
      data.budget || null,
      data.travelers,
      data.message
    ).run();
    
    return c.json({ success: true, message: 'Demande envoyée avec succès' })
  } catch (error) {
    return c.json({ success: false, error: 'Erreur lors de l\'envoi' }, 500)
  }
})

// API: Récupérer les paramètres du site
app.get('/api/settings', async (c) => {
  const settings = await c.env.db.prepare('SELECT key, value FROM site_settings').all();
  const settingsMap = settings.results.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  return c.json(settingsMap)
})

export default app
