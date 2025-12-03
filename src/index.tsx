import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { jsxRenderer } from 'hono/jsx-renderer'
import Anthropic from '@anthropic-ai/sdk'
import { setCookie, getCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Types pour les bindings Cloudflare
type Bindings = {
  db: D1Database;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware CORS pour les API
app.use('/api/*', cors())

// Middleware de protection pour les routes admin
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  
  // Ne pas protéger la page de login
  if (path === '/admin/login') {
    await next()
    return
  }
  
  // Vérifier le token JWT dans le cookie
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.redirect('/admin/login')
  }
  
  try {
    const decoded = jwt.verify(token, c.env.JWT_SECRET)
    c.set('user', decoded)
    await next()
  } catch (error) {
    return c.redirect('/admin/login')
  }
})

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
        <link href="https://fonts.googleapis.com/css2?family=Alice&family=Brittany+Signature&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        
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
              <li><a href="/destinations"><i class="fas fa-globe"></i> Mes Destinations</a></li>
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
            <div style="text-align: center; padding: 0.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 1rem;">
              <a href="/admin/login" style="color: rgba(255,255,255,0.5); font-size: 0.8rem; text-decoration: none;">
                Accès admin
              </a>
            </div>
            <p>&copy; {new Date().getFullYear()} Les Voyages de Jess. Tous droits réservés.</p>
          </div>
        </footer>

        {/* Widget Chatbot */}
        <div id="chat-widget-button" 
             class="chat-widget-button">
          💬
        </div>

        <div id="chat-widget-window" class="chat-widget-window chat-widget-hidden">
          <div class="chat-header">
            <div>
              <h3 class="chat-title">Assistant de Jess</h3>
              <p class="chat-status">En ligne</p>
            </div>
            <button id="close-chat" class="chat-close">×</button>
          </div>

          <div id="chat-messages" class="chat-messages">
            <div class="chat-message chat-message-bot">
              <p>👋 Bonjour ! Je suis l'assistant de Jess. Comment puis-je vous aider à planifier votre voyage ?</p>
            </div>
          </div>

          <div class="chat-input-container">
            <div class="chat-input-wrapper">
              <input 
                type="text" 
                id="user-input" 
                placeholder="Votre message..."
                class="chat-input"
              />
              <button id="send-button" class="chat-send-btn">➤</button>
            </div>
          </div>
        </div>

        {/* Scripts */}
        <script src="/static/js/app.js"></script>
        <script src="/static/js/chatbot.js"></script>
      </body>
    </html>
  )
}))

// ============================================
// API CHATBOT
// ============================================

// Route API pour le chatbot
app.post('/api/chat', async (c) => {
  try {
    // Récupère l'historique envoyé par le frontend
    const { message, history = [] } = await c.req.json()
    
    // Initialise le client Anthropic avec la clé API
    const anthropic = new Anthropic({
      apiKey: c.env.ANTHROPIC_API_KEY
    })

    // Construit la liste des messages avec l'historique
    const messages = [
      ...history, // Anciennes conversations
      {
        role: 'user',
        content: message // Nouveau message
      }
    ]

    // Envoie le message à Claude avec tout l'historique
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: messages,
      system: `Tu es un assistant de voyage expert pour 'Les Voyages de Jess'.

TON RÔLE :
Inspirer et conseiller, MAIS pas remplacer Jess.

⚠️⚠️⚠️ RÈGLE ABSOLUE CRITIQUE ⚠️⚠️⚠️
TU NE PEUX SUGGÉRER **QUE** LES PAYS DE CETTE LISTE.
SI UN PAYS N'EST PAS DANS CETTE LISTE → TU NE PEUX PAS LE SUGGÉRER.
AUCUNE EXCEPTION. JAMAIS.

DESTINATIONS COUVERTES PAR JESS - LISTE EXHAUSTIVE ET COMPLÈTE:

 EUROPE (22 pays):
France, Espagne, Italie, Angleterre, Irlande, Écosse, Allemagne, Autriche, République Tchèque, Hongrie, Roumanie, Norvège, Suède, Finlande, Danemark, Suisse, Grèce, Croatie, Malte, Portugal, Monténégro, Capitales européennes

 ASIE (5 destinations):
Thaïlande, Laos, Cambodge, Turquie, Indonésie (Bali uniquement)

 AMÉRIQUE DU NORD (3 pays):
Canada, USA, Mexique

 AMÉRIQUE CENTRALE (2 pays):
Guatemala, Costa Rica

 AMÉRIQUE DU SUD (4 pays):
Pérou, Bolivie, Argentine, Brésil

TOTAL: 36 DESTINATIONS SEULEMENT.

⛔ PAYS QUE TU NE DOIS **JAMAIS** SUGGÉRER (exemples):
Afrique du Sud, Tanzanie, Kenya, Namibie, Botswana, Zimbabwe, Islande, Japon, Chine, Corée, Vietnam, Nouvelle-Zélande, Australie, Égypte, Maroc, Tunisie, Inde, Népal, Russie, Ukraine, Chili, Colombie, Équateur, Venezuela, Cuba, République Dominicaine, Bahamas

RÈGLES IMPORTANTES:

1. Donne des idées GÉNÉRALES et inspire (ambiance, type d'expérience)
2. Partage ton enthousiasme pour les destinations
3. Ne donne JAMAIS d'itinéraires détaillés complets
4. Ne donne JAMAIS de listes d'activités spécifiques ni de noms de lieux précis
5. TOUJOURS conclure en invitant à contacter Jess

6. ⚠️ SI LA DESTINATION DEMANDÉE N'EST PAS DANS LA LISTE:

   ÉTAPE 1: Dis clairement que Jess ne couvre pas ce pays
   
   ÉTAPE 2: Identifie le TYPE de voyage:
   - Nature/Aventure → UNIQUEMENT: Costa Rica, Norvège, Pérou, Canada, Argentine, Finlande
   - Culture/Histoire → UNIQUEMENT: Grèce, Turquie, Italie, Pérou, Espagne, Portugal
   - Plages/Îles → UNIQUEMENT: Grèce, Croatie, Indonésie (Bali), Mexique, Portugal, Malte
   - Asie → UNIQUEMENT: Thaïlande, Indonésie (Bali), Cambodge, Laos, Turquie
   - Afrique → AUCUNE DESTINATION AFRICAINE N'EST COUVERTE
   
   ÉTAPE 3: Suggère 2-3 pays de la LISTE UNIQUEMENT
   
   ÉTAPE 4: Vérifie 3 FOIS que chaque pays suggéré est dans la liste
   
   ÉTAPE 5: Si tu n'es PAS CERTAIN à 100% → Ne suggère QUE 2 pays au lieu de 3

7. EXEMPLES OBLIGATOIRES À SUIVRE:

   ❓ Zimbabwe / Namibie / Tanzanie / Afrique du Sud / Kenya / Botswana
   ✅ "Malheureusement, Jess ne propose pas de services en Afrique pour le moment. Si vous recherchez nature et aventure, voici des destinations couvertes:
   - Costa Rica: Nature luxuriante et biodiversité
   - Norvège: Paysages grandioses et fjords
   - Pérou: Diversité naturelle et culture andine
   Je vous invite à contacter Jess ! 😊"

   ❓ Japon / Chine / Vietnam / Corée
   ✅ "Malheureusement, Jess ne propose pas de services pour ce pays. Pour une immersion asiatique:
   - Thaïlande: Culture vibrante et hospitalité
   - Indonésie (Bali): Spiritualité et traditions
   - Cambodge: Patrimoine historique exceptionnel
   Je vous invite à contacter Jess ! 😊"

   ❓ Australie / Nouvelle-Zélande
   ✅ "Malheureusement, Jess ne propose pas de services en Océanie. Pour nature et aventure:
   - Costa Rica: Biodiversité unique
   - Canada: Immensité naturelle
   - Norvège: Beautés sauvages
   Je vous invite à contacter Jess ! 😊"

   ❓ Islande
   ✅ "Malheureusement, Jess ne propose pas de services pour l'Islande. Pour des paysages nordiques:
   - Norvège: Fjords et aurores boréales
   - Finlande: Nature préservée scandinave
   - Canada: Grands espaces nordiques
   Je vous invite à contacter Jess ! 😊"

🎯 VÉRIFICATION AVANT CHAQUE RÉPONSE:
Avant de suggérer un pays, pose-toi ces 3 questions:
1. Ce pays est-il EXPLICITEMENT dans la liste des 36 destinations ?
2. Ai-je vérifié 2 fois qu'il est bien dans la liste ?
3. Suis-je CERTAIN à 100% ?

Si NON à une seule question → NE SUGGÈRE PAS CE PAYS.

Utilise toujours la devise: ${c.req.header('User-Currency') || 'CAD'}
Pays de l'utilisateur: ${c.req.header('User-Country') || 'Canada'}

Structure tes réponses clairement.`
    })
    
    // Extrait la réponse de Claude
    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Désolé, je ne peux pas répondre pour le moment.'

    return c.json({ 
      reply: aiMessage,
      usage: response.usage
    })

  } catch (error) {
    console.error('Erreur API:', error)
    return c.json({ error: 'Erreur lors de la communication avec l\'IA' }, 500)
  }
})

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
<section class="hero" style="background-image: url('/static/images/hero-background.jpg'); background-size: cover; background-position: center; position: relative;">
  <div style="background: rgba(0,0,0,0.3); position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1;"></div>
  <div style="position: relative; z-index: 2;">
    <h1 class="hero-title" style="color: white; font-size: 4rem;">Les Voyages de Jess</h1>
    <p class="hero-subtitle" style="font-size: 1.2rem; color: white; font-family: 'Alice', serif;">Créatrice de voyages sur mesure</p>
    <p style="font-size: 1.3rem; color: white; margin-top: 1rem; font-style: italic; font-family: 'Alice', serif;">
      "Trouvez votre chemin de traverse, là où commence la magie du voyage"
    </p>
    <div style="margin-top: 2rem;">
      <a href="/contact" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
        <i class="fas fa-compass"></i> Je crée mon voyage
      </a>
    </div>
  </div>
</section>

{/* Section Formules */}
<section class="section">
  <h2 class="section-title">Mes Formules de Voyage</h2>
  
  {/* Texte explicatif éditable */}
  <div style="max-width: 800px; margin: 0 auto 3rem; text-align: center; padding: 2rem; background: var(--color-bg-warm); border-radius: var(--radius-lg);">
    <p style="font-size: 1.1rem; line-height: 1.8; color: var(--color-text-primary);">
      {settingsMap.formules_intro || "En tant que Travel Planner, mon rôle est de concevoir votre voyage sur mesure de A à Z. Je m'occupe de créer un itinéraire personnalisé, adapté à vos envies, votre budget et votre rythme. Vous gagnez du temps et profitez de conseils d'experte pour un voyage qui vous ressemble vraiment."}
    </p>
  </div>
  
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
      <section class="hero">
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
      <section class="hero">
        <h1 class="hero-title">Mes Formules</h1>
        <p class="hero-subtitle">Choisissez celle qui correspond à vos envies</p>
      </section>

      <section class="section">
        <div style="max-width: 900px; margin: 0 auto; text-align: center; padding: 2rem; background: var(--color-bg-warm); border-radius: var(--radius-lg); margin-bottom: 3rem;">
          <h2 style="color: var(--color-primary); margin-bottom: 1.5rem; font-family: 'Brittany Signature', cursive; font-size: 2.5rem;">Mon rôle</h2>
          <div style="text-align: left; line-height: 1.8; color: var(--color-text-primary);">
            <p style="margin-bottom: 1rem;">
              Mon rôle, c'est de transformer vos idées d'évasion en un voyage concret, fluide et surtout à votre image.
            </p>
            <p style="margin-bottom: 1rem;">
              Ensemble, nous créons l'itinéraire parfait pour vous, selon vos envies, vos priorités et votre budget. Je conçois des voyages sur mesure, pensés dans les moindres détails : des lieux à découvrir, des hébergements à essayer, des activités à vivre, et des moments à savourer.
            </p>
            <p>
              Je vous offre une vision claire, personnalisée et inspirante pour que votre voyage se déroule sans stress tout en vous laissant la liberté de réserver et de le vivre à votre rythme.
            </p>
          </div>
        </div>
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
      <section class="hero">
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
// ============================================
// PAGE DESTINATIONS
// ============================================
app.get('/destinations', (c) => {
  return c.render(
    <>
      <section class="hero">
        <h1 class="hero-title">Mes Destinations</h1>
        <p class="hero-subtitle">Les pays que je connais et pour lesquels je propose mes services</p>
      </section>

      <section class="section">
        <div style="max-width: 900px; margin: 0 auto; text-align: center; padding: 2rem; background: var(--color-bg-warm); border-radius: var(--radius-lg); margin-bottom: 3rem;">
          <p style="font-size: 1.1rem; line-height: 1.8; color: var(--color-text-primary);">
            Je propose mes services uniquement pour les destinations que je connais, afin de vous garantir des conseils authentiques et des recommandations de confiance.
            Cela me permet de vous accompagner de manière plus juste et personnalisée.
          </p>
        </div>

        <div class="destinations-grid">
          <div class="destination-continent">
            <h2 class="continent-title">Europe</h2>
            <div class="countries-list">
              <span class="country-tag">France</span>
              <span class="country-tag">Espagne</span>
              <span class="country-tag">Italie</span>
              <span class="country-tag">Angleterre</span>
              <span class="country-tag">Irlande</span>
              <span class="country-tag">Écosse</span>
              <span class="country-tag">Allemagne</span>
              <span class="country-tag">Autriche</span>
              <span class="country-tag">République Tchèque</span>
              <span class="country-tag">Hongrie</span>
              <span class="country-tag">Roumanie</span>
              <span class="country-tag">Norvège</span>
              <span class="country-tag">Suède</span>
              <span class="country-tag">Finlande</span>
              <span class="country-tag">Danemark</span>
              <span class="country-tag">Suisse</span>
              <span class="country-tag">Grèce</span>
              <span class="country-tag">Croatie</span>
              <span class="country-tag">Malte</span>
              <span class="country-tag">Portugal</span>
              <span class="country-tag">Monténégro</span>
              <span class="country-tag">Capitales européennes</span>
            </div>
          </div>

          <div class="destination-continent">
            <h2 class="continent-title">Asie</h2>
            <div class="countries-list">
              <span class="country-tag">Thaïlande</span>
              <span class="country-tag">Laos</span>
              <span class="country-tag">Cambodge</span>
              <span class="country-tag">Turquie</span>
              <span class="country-tag">Indonésie (Bali)</span>
            </div>
          </div>

          <div class="destination-continent">
            <h2 class="continent-title">Amérique du Nord</h2>
            <div class="countries-list">
              <span class="country-tag">Canada</span>
              <span class="country-tag">USA</span>
              <span class="country-tag">Mexique</span>
            </div>
          </div>

          <div class="destination-continent">
            <h2 class="continent-title">Amérique Centrale</h2>
            <div class="countries-list">
              <span class="country-tag">Guatemala</span>
              <span class="country-tag">Costa Rica</span>
            </div>
          </div>

          <div class="destination-continent">
            <h2 class="continent-title">Amérique du Sud</h2>
            <div class="countries-list">
              <span class="country-tag">Pérou</span>
              <span class="country-tag">Bolivie</span>
              <span class="country-tag">Argentine</span>
              <span class="country-tag">Brésil</span>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: 3rem; padding: 2rem;">
          <h3 style="margin-bottom: 1rem;">Votre destination ne figure pas dans cette liste ?</h3>
          <p style="font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: 2rem;">
            Contactez-moi ! Je peux vous orienter vers des destinations similaires ou discuter de votre projet.
          </p>
          <a href="/contact" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem;">
            <i class="fas fa-paper-plane"></i> Me contacter
          </a>
        </div>
      </section>
    </>,
    { title: 'Mes Destinations - Les Voyages de Jess' }
  )
})







app.get('/faq', async (c) => {
  const faqs = await c.env.db.prepare('SELECT * FROM faqs ORDER BY sort_order ASC').all();

  return c.render(
    <>
      <section class="hero">
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
      <section class="hero">
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
      <section class="hero">
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

// ============================================
// ROUTES ADMIN - AUTHENTIFICATION
// ============================================

// Page de connexion admin
app.get('/admin/login', (c) => {
  return c.render(
    <>
      <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="text-align: center; margin-bottom: 2rem; color: var(--color-primary);">Connexion Admin</h1>
        
        <form method="POST" action="/admin/login">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              required 
              style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
            />
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            style="width: 100%; padding: 0.75rem; font-size: 1rem;"
          >
            Se connecter
          </button>
        </form>
      </div>
    </>,
    { title: 'Connexion Admin - Les Voyages de Jess' }
  )
})

// Traitement de la connexion
app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  const email = body.email as string
  const password = body.password as string  
  console.log('=== DEBUG LOGIN ===')
  console.log('Email saisi:', email)
  console.log('Password saisi:', password)
  
  // Chercher l'utilisateur dans la DB
  const user = await c.env.db
    .prepare('SELECT * FROM admin_users WHERE email = ?')
    .bind(email)
    .first()

  console.log('User trouvé:', user)  
  
  if (!user) {
    return c.render(
      <>
        <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="color: red; text-align: center; margin-bottom: 1rem; padding: 1rem; background: #ffe6e6; border-radius: 4px;">
            ❌ Email ou mot de passe incorrect
          </div>
          <a href="/admin/login" class="btn btn-secondary" style="display: block; text-align: center;">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  // Vérifier le mot de passe
  const isPasswordValid = bcrypt.compareSync(password, user.password_hash)
  console.log('Password valid:', isPasswordValid)
  if (!isPasswordValid) {
    return c.render(
      <>
        <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="color: red; text-align: center; margin-bottom: 1rem; padding: 1rem; background: #ffe6e6; border-radius: 4px;">
            ❌ Email ou mot de passe incorrect
          </div>
          <a href="/admin/login" class="btn btn-secondary" style="display: block; text-align: center;">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  // Créer le token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    c.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  // Définir le cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 604800
  })
  
  return c.redirect('/admin')
})


// Page d'accueil admin (protégée)
app.get('/admin', (c) => {
  const user = c.get('user')
  
  return c.render(
    <>
      <div style="max-width: 1200px; margin: 2rem auto; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 2px solid var(--color-primary);">
       <h1>Panneau d'administration</h1>
          <div>
            <a href="/admin/profil" class="btn btn-secondary" style="margin-right: 1rem;">
              <i class="fas fa-user"></i> Mon profil
            </a>
            <a href="/admin/logout" class="btn btn-secondary">
              <i class="fas fa-sign-out-alt"></i> Déconnexion
            </a>
          </div>
        </div>
        
        <p style="font-size: 1.2rem; margin-bottom: 2rem;">
          Bienvenue <strong>{user.email}</strong> ! 👋
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          <a href="/admin/blog" style="display: block; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-book-open" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Gérer le Blog</h3>
            <p style="color: var(--color-text-secondary);">Créer et modifier des articles</p>
          </a>
          
          <a href="/admin/media" style="display: block; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-images" style="font-size: 3rem; color: var(--color-secondary); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Gérer les Photos</h3>
            <p style="color: var(--color-text-secondary);">Uploader et gérer les images</p>
          </a>
          
          <a href="/admin/formules" style="display: block; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-suitcase" style="font-size: 3rem; color: var(--color-accent-green); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Gérer les Formules</h3>
            <p style="color: var(--color-text-secondary);">Modifier les formules de voyage</p>
          </a>
          
          <a href="/admin/faq" style="display: block; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-decoration: none; color: inherit; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-question-circle" style="font-size: 3rem; color: #f39c12; margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem;">Gérer la FAQ</h3>
            <p style="color: var(--color-text-secondary);">Ajouter et modifier les FAQs</p>
          </a>
        </div>
      </div>
    </>,
    { title: 'Admin - Les Voyages de Jess' }
  )
})

// Page Mon profil
app.get('/admin/profil', (c) => {
  const user = c.get('user')
  
  return c.render(
    <>
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem;">
        <div style="margin-bottom: 2rem;">
          <a href="/admin" style="color: var(--color-primary); text-decoration: none;">
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <h1 style="margin-bottom: 2rem;">Mon profil</h1>
        
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 2rem;">
          <h2 style="margin-bottom: 1.5rem;">Modifier mon email</h2>
          <form method="POST" action="/admin/profil/email">
            <div class="form-group">
              <label class="form-label">Email actuel</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; background: #f5f5f5;"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Nouvel email *</label>
              <input 
                type="email" 
                name="new_email" 
                required 
                class="form-input"
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Mot de passe actuel (pour confirmer) *</label>
              <input 
                type="password" 
                name="password" 
                required 
                class="form-input"
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            
            <button type="submit" class="btn btn-primary">
              Modifier l'email
            </button>
          </form>
        </div>
        
        <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="margin-bottom: 1.5rem;">Modifier mon mot de passe</h2>
          <form method="POST" action="/admin/profil/password">
            <div class="form-group">
              <label class="form-label">Mot de passe actuel *</label>
              <input 
                type="password" 
                name="current_password" 
                required 
                class="form-input"
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Nouveau mot de passe *</label>
              <input 
                type="password" 
                name="new_password" 
                required 
                minlength="8"
                class="form-input"
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
              <small style="color: var(--color-text-secondary);">Minimum 8 caractères</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">Confirmer le nouveau mot de passe *</label>
              <input 
                type="password" 
                name="confirm_password" 
                required 
                minlength="8"
                class="form-input"
                style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;"
              />
            </div>
            
            <button type="submit" class="btn btn-primary">
              Modifier le mot de passe
            </button>
          </form>
        </div>
      </div>
    </>,
    { title: 'Mon profil - Admin' }
  )
})
// Modifier l'email
app.post('/admin/profil/email', async (c) => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const new_email = body.new_email as string
  const password = body.password as string
  
  // Vérifier le mot de passe actuel
  const currentUser = await c.env.db
    .prepare('SELECT * FROM admin_users WHERE id = ?')
    .bind(user.userId)
    .first()
  
  const isPasswordValid = bcrypt.compareSync(password, currentUser.password_hash)
  
  if (!isPasswordValid) {
    return c.render(
      <>
        <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px;">
          <div style="color: red; padding: 1rem; background: #ffe6e6; border-radius: 4px; margin-bottom: 1rem;">
            ❌ Mot de passe incorrect
          </div>
          <a href="/admin/profil" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  // Mettre à jour l'email
  await c.env.db
    .prepare('UPDATE admin_users SET email = ? WHERE id = ?')
    .bind(new_email, user.userId)
    .run()
  
  // Créer un nouveau token avec le nouvel email
  const token = jwt.sign(
    { userId: user.userId, email: new_email },
    c.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
  
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 604800
  })
  
  return c.render(
    <>
      <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px;">
        <div style="color: green; padding: 1rem; background: #d4edda; border-radius: 4px; margin-bottom: 1rem;">
          ✅ Email modifié avec succès !
        </div>
        <a href="/admin/profil" class="btn btn-primary">Retour au profil</a>
      </div>
    </>,
    { title: 'Succès - Admin' }
  )
})

// Modifier le mot de passe
app.post('/admin/profil/password', async (c) => {
  const user = c.get('user')
  const body = await c.req.parseBody()
  const current_password = body.current_password as string
  const new_password = body.new_password as string
  const confirm_password = body.confirm_password as string
  
  // Vérifier que les mots de passe correspondent
  if (new_password !== confirm_password) {
    return c.render(
      <>
        <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px;">
          <div style="color: red; padding: 1rem; background: #ffe6e6; border-radius: 4px; margin-bottom: 1rem;">
            ❌ Les mots de passe ne correspondent pas
          </div>
          <a href="/admin/profil" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  // Vérifier le mot de passe actuel
  const currentUser = await c.env.db
    .prepare('SELECT * FROM admin_users WHERE id = ?')
    .bind(user.userId)
    .first()
  
  const isPasswordValid = bcrypt.compareSync(current_password, currentUser.password_hash)
  
  if (!isPasswordValid) {
    return c.render(
      <>
        <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px;">
          <div style="color: red; padding: 1rem; background: #ffe6e6; border-radius: 4px; margin-bottom: 1rem;">
            ❌ Mot de passe actuel incorrect
          </div>
          <a href="/admin/profil" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  // Hasher le nouveau mot de passe
  const salt = bcrypt.genSaltSync(10)
  const new_password_hash = bcrypt.hashSync(new_password, salt)
  
  // Mettre à jour le mot de passe
  await c.env.db
    .prepare('UPDATE admin_users SET password_hash = ? WHERE id = ?')
    .bind(new_password_hash, user.userId)
    .run()
  
  return c.render(
    <>
      <div style="max-width: 600px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px;">
        <div style="color: green; padding: 1rem; background: #d4edda; border-radius: 4px; margin-bottom: 1rem;">
          ✅ Mot de passe modifié avec succès !
        </div>
        <a href="/admin/profil" class="btn btn-primary">Retour au profil</a>
      </div>
    </>,
    { title: 'Succès - Admin' }
  )
})


// Déconnexion
app.get('/admin/logout', (c) => {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0
  })
  
  return c.redirect('/admin/login')
})


