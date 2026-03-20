// Redéploiement forcé pour variables env

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { jsxRenderer } from 'hono/jsx-renderer'
import Anthropic from '@anthropic-ai/sdk'
import { setCookie, getCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Force redeploy - 8 dec 11h10


// Types pour les bindings Cloudflare
type Bindings = {
  db: D1Database;
  ANTHROPIC_API_KEY: string;
  JWT_SECRET: string;
  PHOTOS_BUCKET: R2Bucket
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

// Renderer JSX avec layout commun (exclure les API)
app.use('*', async (c, next) => {
  // Skip JSX rendering pour les routes API
  if (c.req.path.startsWith('/api/')) {
    return next()
  }
  
  return jsxRenderer(({ children, title, bodyClass }) => {
  return (
    <html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  {/* SEO */}
  <title>Les Voyages de Jess | Planificatrice de Voyages Personnalisés au Québec</title>
  <meta name="description" content="Planification de voyages sur mesure par Jessica, experte en destinations Europe, Asie et Amériques. Créez votre voyage de rêve avec une professionnelle passionnée." />
  <meta name="keywords" content="travel planner québec, planificateur voyage, voyage sur mesure, agence voyage, jessica voyage" />
  
  {/* Open Graph (Facebook, LinkedIn) */}
  <meta property="og:title" content="Les Voyages de Jess | Planificatrice de Voyages Personnalisés" />
  <meta property="og:description" content="Planification de voyages sur mesure par Jessica. Europe, Asie, Amériques. Créez votre voyage de rêve avec une professionnelle passionnée." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lesvoyagesdejess.ca" />
  <meta property="og:image" content="https://lesvoyagesdejess.ca/static/images/hero-background.webp" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="fr_CA" />
  <meta property="og:site_name" content="Les Voyages de Jess" />
  
  {/* Twitter Card */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Les Voyages de Jess | Planificatrice de Voyages Personnalisés" />
  <meta name="twitter:description" content="Planification de voyages sur mesure par Jessica. Créez votre voyage de rêve avec une professionnelle passionnée." />
  <meta name="twitter:image" content="https://lesvoyagesdejess.ca/static/images/hero-background.webp" />
  
  <script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Les Voyages de Jess",
    "description": "Planification de voyages sur mesure",
    "founder": {
      "@type": "Person",
      "name": "Jessica Finiel",
      "email": "jessica.finiel@hotmail.com"
    },
    "url": "https://lesvoyagesdejess.ca",
    "sameAs": [
      "https://www.facebook.com/jessica.finiel",
      "https://www.instagram.com/lesvoyagesde_jess"
    ]
  })}
  </script>
        
        {/* Fonts Google */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Alice&family=Brittany+Signature&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        
        {/* Font Awesome */}
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        
        {/* Styles personnalisés */}
        <link href="/static/css/styles.css?v=4" rel="stylesheet" />
      </head>
      <body class={bodyClass || ''}>
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
              <p><i class="fas fa-envelope"></i> contact@lesvoyagesdejess.com</p>
              <div class="social-links">
                <a href="https://www.instagram.com/lesvoyagesde_jess" class="social-link" target="_blank"><i class="fab fa-instagram"></i></a>
                <a href="https://www.facebook.com/jessica.finiel" class="social-link" target="_blank"><i class="fab fa-facebook"></i></a>
              </div>
            </div>
          </div>
          <div class="footer-bottom">
            <div style={{textAlign: 'center', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem'}}>
              <a href="/admin/login" style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none'}}>
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
})(c, next)
})

// ============================================
// API CONTACT FORM
// ============================================

app.post('/api/contact', async (c) => {
  try {
    const formData = await c.req.json()
    
    // Vérifier que l'email de destination existe
    if (!c.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquante')
      return c.json({ success: false, error: 'Configuration serveur manquante' }, 500)
    }

    // Sauvegarder dans la base de données
    await c.env.db.prepare(`
      INSERT INTO quote_requests (name, email, phone, destination, travel_dates, duration, travelers, budget, message, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      formData.name,
      formData.email,
      formData.phone || null,
      formData.destination,
      formData.travel_dates || null,
      formData.duration,
      formData.travelers,
      formData.budget || null,
      formData.message,
      formData.special_requests || null
    ).run()

    // Envoyer l'email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Les Voyages de Jess <contact@lesvoyagesdejess.com>',
        to: 'contact@lesvoyagesdejess.com',
        subject: `Nouvelle demande de devis - ${formData.name}`,
        html: `
          <h2>Nouvelle demande de devis</h2>
          <p><strong>Nom:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Téléphone:</strong> ${formData.phone || 'Non renseigné'}</p>
          <hr>
          <p><strong>Destination:</strong> ${formData.destination}</p>
          <p><strong>Dates:</strong> ${formData.travel_dates || 'Flexibles'}</p>
          <p><strong>Durée:</strong> ${formData.duration}</p>
          <p><strong>Nombre de voyageurs:</strong> ${formData.travelers}</p>
          <p><strong>Budget:</strong> ${formData.budget || 'Non précisé'}</p>
          <hr>
          <p><strong>Message:</strong></p>
          <p>${formData.message}</p>
          ${formData.special_requests ? `
            <p><strong>Demandes spéciales:</strong></p>
            <p>${formData.special_requests}</p>
          ` : ''}
        `
      })
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Erreur Resend:', errorData)
      return c.json({ 
        success: false, 
        error: 'Erreur lors de l\'envoi de l\'email' 
      }, 500)
    }

    return c.json({ 
      success: true, 
      message: 'Votre demande a été envoyée avec succès!' 
    })

  } catch (error) {
    console.error('Erreur formulaire contact:', error)
    return c.json({ 
      success: false, 
      error: 'Une erreur est survenue' 
    }, 500)
  }
})


// ============================================
// API CHATBOT - Fonction helper pour RAG
// ============================================

/**
 * Récupère les connaissances du chatbot depuis la base de données
 * et les formate pour injection dans le prompt
 */
async function getChatbotKnowledge(db: D1Database): Promise<string> {
  try {
    const knowledge = await db.prepare(
      'SELECT category, key, value FROM chatbot_knowledge WHERE active = 1 ORDER BY priority DESC, category ASC'
    ).all()

    if (!knowledge.results || knowledge.results.length === 0) {
      return '' // Pas de connaissances = fallback sur prompt de base
    }

    // Organiser par catégorie
    const byCategory: Record<string, Array<{key: string, value: string}>> = {}
    
    knowledge.results.forEach((row: any) => {
      if (!byCategory[row.category]) {
        byCategory[row.category] = []
      }
      byCategory[row.category].push({ key: row.key, value: row.value })
    })

    // Formater pour le prompt
    let knowledgeText = '\n\n📚 INFORMATIONS OFFICIELLES DU SITE (à utiliser en priorité):\n\n'

    // CONTACT
    if (byCategory.contact) {
      knowledgeText += '📧 CONTACT:\n'
      byCategory.contact.forEach(item => {
        if (item.key === 'email') knowledgeText += `- Email: ${item.value}\n`
        if (item.key === 'delai_reponse') knowledgeText += `- Délai de réponse: ${item.value}\n`
        if (item.key === 'formulaire_page') knowledgeText += `- Formulaire de contact: Sur la page ${item.value}\n`
        if (item.key === 'telephone') knowledgeText += `- Téléphone: ${item.value}\n`
        if (item.key === 'instagram') knowledgeText += `- Instagram: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    // PAGES DU SITE
    if (byCategory.pages) {
      knowledgeText += '🌐 PAGES DU SITE (pour rediriger les utilisateurs):\n'
      byCategory.pages.forEach(item => {
        knowledgeText += `- ${item.key.replace(/_/g, ' ')}: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    // FORMULES
    if (byCategory.formules) {
      knowledgeText += '💼 FORMULES:\n'
      byCategory.formules.forEach(item => {
        knowledgeText += `- ${item.key.replace(/_/g, ' ')}: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    // TARIFS
    if (byCategory.tarifs) {
      knowledgeText += '💰 TARIFS:\n'
      byCategory.tarifs.forEach(item => {
        knowledgeText += `- ${item.key.replace(/_/g, ' ')}: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    // GÉNÉRAL
    if (byCategory.general) {
      knowledgeText += '🎯 CONTEXTE GÉNÉRAL:\n'
      byCategory.general.forEach(item => {
        knowledgeText += `- ${item.key.replace(/_/g, ' ')}: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    // PROCESSUS
    if (byCategory.processus) {
      knowledgeText += '📋 PROCESSUS DE RÉSERVATION:\n'
      byCategory.processus.forEach(item => {
        knowledgeText += `- ${item.key}: ${item.value}\n`
      })
      knowledgeText += '\n'
    }

    return knowledgeText

  } catch (error) {
    console.error('Erreur récupération connaissances chatbot:', error)
    return '' // En cas d'erreur, continuer sans RAG
  }
}

// ============================================
// API CHATBOT
// ============================================

// Route API pour le chatbot
app.post('/api/chat', async (c) => {
  try {
    // Récupère l'historique envoyé par le frontend
    const { message, history = [] } = await c.req.json()
    
    // Récupérer les connaissances depuis la base de données (RAG)
    const knowledgeContext = await getChatbotKnowledge(c.env.db)
    
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

🌐 CONTEXTE IMPORTANT:
Tu es **intégré directement sur le site web** lesvoyagesdejess.com.
Les utilisateurs sont DÉJÀ sur le site quand ils te parlent.
Ne leur dis JAMAIS d'aller sur le site - ils y sont déjà !

${knowledgeContext}

⚠️ RÈGLES CRITIQUES POUR LES INFORMATIONS DE CONTACT:
1. UTILISE UNIQUEMENT les informations de la section "INFORMATIONS OFFICIELLES" ci-dessus
2. N'INVENTE JAMAIS de numéro de téléphone, adresse ou autre contact
3. Si on te demande un numéro de téléphone et qu'il n'y en a pas → dis que Jessica préfère le contact par email/formulaire
4. Pour rediriger vers une page → utilise les chemins de la section "PAGES DU SITE" (ex: "Vous pouvez remplir le formulaire sur cette page" si on est sur /contact)
5. Sois conscient que l'utilisateur est DÉJÀ sur le site web

TON RÔLE :
Tu es l'assistant virtuel de Jessica sur SON site web.
Ton objectif: inspirer, conseiller et orienter vers Jessica.
JAMAIS remplacer Jessica - tu es son aide, pas son remplaçant.

🎯 COMMENT REDIRIGER INTELLIGEMMENT:
- Si l'utilisateur veut "parler à Jessica" → suggère le formulaire de contact (il est sur le site !)
- Si l'utilisateur demande "comment contacter" → donne l'email ET mentionne le formulaire
- Si l'utilisateur veut des infos sur les formules → suggère d'aller sur /mes-formules
- Utilise des phrases comme: "Vous pouvez...", "Je vous invite à...", "Remplissez le formulaire ci-dessous..."
- ÉVITE: "Allez sur le site", "Visitez lesvoyagesdejess.com" (ils y sont déjà!)

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
5. TOUJOURS conclure en invitant à contacter Jessica (utilise les infos de la section CONTACT ci-dessus)
6. Adapte ta réponse au CONTEXTE: l'utilisateur est sur le site, pas ailleurs !

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

7. EXEMPLES DE RÉPONSES CONTEXTUELLES:

   ❓ "Je veux parler à Jessica"
   ✅ "Parfait ! Vous pouvez contacter Jessica directement via le formulaire de contact sur cette page, ou par email à contact@lesvoyagesdejess.com. Elle vous répondra sous 48h ! 😊"

   ❓ "Comment je fais pour réserver ?"
   ✅ "Pour créer votre voyage sur mesure avec Jessica, remplissez le formulaire de demande (accessible via le menu). Jessica vous contactera sous 48h pour un appel découverte gratuit ! 😊"

   ❓ "Quel est le numéro de téléphone ?"
   ✅ "Jessica privilégie le contact par email (contact@lesvoyagesdejess.com) et le formulaire de contact pour mieux comprendre votre projet. Elle vous répondra sous 48h ! 😊"

   ❓ Zimbabwe / Namibie / Afrique
   ✅ "Malheureusement, Jessica ne propose pas de services en Afrique pour le moment. Si vous recherchez nature et aventure, voici des destinations qu'elle couvre:
   - Costa Rica: Nature luxuriante et biodiversité
   - Norvège: Paysages grandioses et fjords
   - Pérou: Diversité naturelle et culture andine
   Consultez la page /destinations pour voir toutes les options, ou contactez Jessica via le formulaire ! 😊"

   ❓ Japon / Chine / Vietnam
   ✅ "Jessica ne couvre pas ce pays actuellement. Pour une immersion asiatique, elle peut vous aider avec:
   - Thaïlande: Culture vibrante et hospitalité
   - Indonésie (Bali): Spiritualité et traditions
   - Cambodge: Patrimoine historique exceptionnel
   Consultez /destinations pour la liste complète ! 😊"

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
  
  // Récupérer les derniers articles de blog (max 4)
  const blogPosts = await c.env.db.prepare('SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC LIMIT 4').all();

 return c.render(
  <>

    {/* Section Hero - Image uniquement */}
<section class="hero hero-home hero-homepage">
  <div style={{background: 'rgba(0,0,0,0.2)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1}}></div>
  <div style={{position: 'relative', zIndex: 2}}>
    <h1 class="hero-title" style={{color: 'white', fontSize: '4rem'}}>Les Voyages de Jess</h1>
    <p class="hero-subtitle" style={{fontSize: '1.2rem', color: 'white', fontFamily: "'Alice', serif"}}>Créatrice de voyages sur mesure</p>
  </div>
</section>

{/* Section Citation élégante */}
<section style={{padding: '4rem 1.5rem', background: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
  <div style={{maxWidth: '800px', width: '100%', background: '#F2E6D9', borderRadius: '16px', padding: '3rem 2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', textAlign: 'center', border: '1px solid rgba(146, 181, 168, 0.1)'}}>
    <blockquote style={{margin: '0 0 2rem 0', padding: 0, borderLeft: 'none'}}>
      <p style={{fontSize: '1.8rem', lineHeight: 1.6, color: '#2c3e50', fontFamily: "'Alice', serif", fontStyle: 'italic', fontWeight: 400, margin: 0}}>
        "Parce que chaque voyageur est unique, chaque voyage doit l'être aussi."
      </p>
    </blockquote>
    <div style={{width: '60px', height: '3px', background: 'linear-gradient(to right, transparent, #92B5A8, transparent)', margin: '2rem auto'}}></div>
    <div style={{marginTop: '2rem'}}>
      <a href="/contact" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(107, 144, 128, 0.3)', transition: 'all 0.3s ease'}}>
        <i class="fas fa-compass"></i> Je crée mon voyage
      </a>
    </div>
  </div>
</section>

{/* Section Formules */}
<section class="section">
  
  {/* Texte explicatif éditable */}
  {/* Mise en page 2 colonnes : Texte + Photo */}
  <div style={{display: 'flex', gap: '3rem', alignItems: 'center', maxWidth: '1200px', margin: '0 auto 3rem', flexWrap: 'wrap'}}>
    
    {/* Colonne gauche : Texte */}
    <div style={{flex: '1 1 45%', minWidth: '300px'}}>
      <div style={{padding: '2rem', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
        <h2 style={{color: 'var(--color-primary)', marginBottom: '1.5rem', fontFamily: '\'Brittany Signature\', cursive'}}>Mon rôle</h2>
        <p style={{lineHeight: 1.8, color: 'var(--color-text-primary)'}}>
          Mon rôle, c'est de transformer vos idées d'évasion en un voyage concret, fluide et surtout à votre image.
        </p>
        <p style={{lineHeight: 1.8, color: 'var(--color-text-primary)', marginTop: '1rem'}}>
          Ensemble, nous créons l'itinéraire parfait pour vous, selon vos envies, vos priorités et votre budget. Je conçois des voyages sur mesure, pensés dans les moindres détails : des lieux à découvrir, des hébergements à essayer, des activités à vivre, et des moments à savourer.
        </p>
        <p style={{lineHeight: 1.8, color: 'var(--color-text-primary)', marginTop: '1rem'}}>
          Je vous offre une vision claire, personnalisée et inspirante pour que votre voyage se déroule sans stress tout en vous laissant la liberté de réserver et de le vivre à votre rythme.
        </p>
      </div>
    </div>
    
    {/* Colonne droite : Photo */}
    <div style={{flex: '1 1 45%', minWidth: '300px'}}>
      <img 
        src="/static/images/mon-role.webp" 
        alt="Jessica - Travel Planner" 
        loading="lazy"
        style={{width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', objectFit: 'cover'}}
      />
    </div>

</div>
  
{/* Section 4 étapes */}
<div style={{background: 'var(--color-bg-warm)', padding: '4rem 2rem'}}>
  <div style={{maxWidth: '1200px', margin: '0 auto'}}>
    <h2 style={{color: 'var(--color-primary)', marginBottom: '3rem', fontFamily: '\'Brittany Signature\', cursive', fontSize: '2.5rem', textAlign: 'center'}}>
      Les étapes de mon accompagnement
    </h2>
    
    <div class="etapes-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem'}}>
      
      {/* Étape 1 */}
      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease'}} class="etape-card">
        <div style={{fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '1rem'}}>1</div>
        <h3 style={{color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.2rem'}}>Formulaire à remplir</h3>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem'}}>
          Partagez vos souhaits, envies, budget...
        </p>
      </div>
      
      {/* Étape 2 */}
      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease'}} class="etape-card">
        <div style={{fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '1rem'}}>2</div>
        <h3 style={{color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.2rem'}}>Appel découverte gratuit</h3>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem'}}>
          Par téléphone ou visioconférence pour cibler votre demande, vos critères et envies pour votre séjour.
        </p>
      </div>
      
      {/* Étape 3 */}
      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease'}} class="etape-card">
        <div style={{fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '1rem'}}>3</div>
        <h3 style={{color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.2rem'}}>Création et validation du devis</h3>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem'}}>
          Je vous présente un devis personnalisé que nous validons ensemble.
        </p>
      </div>
      
      {/* Étape 4 */}
      <div style={{background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease'}} class="etape-card">
        <div style={{fontSize: '2.5rem', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '1rem'}}>4</div>
        <h3 style={{color: 'var(--color-text-primary)', marginBottom: '1rem', fontSize: '1.2rem'}}>Votre carnet de voyage personnalisé</h3>
        <p style={{color: 'var(--color-text-secondary)', lineHeight: 1.6, fontSize: '0.95rem'}}>
          Création de votre carnet de voyage détaillé en format PDF.
        </p>
      </div>
      
    </div>
  </div>
</div>
      
  {/* Lien vers les formules */}
  <div style={{textAlign: 'center', margin: '3rem 0'}}>
    <a href="/mes-formules" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
      <i class="fas fa-suitcase"></i> Voir mes formules
    </a>
  </div>

      </section>

      {/* Section À propos (courte) */}
      <section class="section section-warm">
        <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
          <h2 class="section-title">Qui suis-je?</h2>
          <p style={{fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text-secondary)', marginBottom: '2rem'}}>
            {settingsMap.about_jessica ? settingsMap.about_jessica.substring(0, 300) + '...' : 
            'Je m\'appelle Jessica, passionnée de voyages et grande amoureuse d\'aventure. Originaire du sud de la France, je vis au Québec depuis plus de 6 ans...'}
          </p>
          <a href="/qui-suis-je" class="btn btn-secondary">
            <i class="fas fa-arrow-right"></i> En savoir plus
          </a>
        </div>
      </section>

      {/* Section Articles récents */}
      <section class="section">
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
          <h2 class="section-title" style={{textAlign: 'center', marginBottom: '3rem'}}>Articles récents</h2>
          
          {blogPosts.results.length > 0 ? (
            <>
              {/* Carousel container */}
              <div class="blog-carousel-container">
                <button class="carousel-btn carousel-btn-prev" onclick="scrollBlogCarousel(-1)">
                  <i class="fas fa-chevron-left"></i>
                </button>
                
                <div class="blog-carousel">
                  {/* Carousel v2 - Images carrées */}
                  {blogPosts.results.map((post: any) => (
                    <a href={`/blog?article=${post.slug}`} class="blog-card-link">
                      <img 
                        src={post.featured_image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600"}
                        alt={post.title}
                        class="blog-card-image-square"
                      />
                    </a>
                  ))}
                </div>

                <button class="carousel-btn carousel-btn-next" onclick="scrollBlogCarousel(1)">
                  <i class="fas fa-chevron-right"></i>
                </button>
              </div>

              {/* Bouton vers le blog */}
              <div style={{textAlign: 'center', marginTop: '3rem'}}>
                <a href="/blog" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
                  <i class="fas fa-newspaper"></i> Découvrir le blog
                </a>
              </div>
            </>
          ) : (
            <div style={{textAlign: 'center', padding: '3rem'}}>
              <i class="fas fa-book-open" style={{fontSize: '4rem', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}></i>
              <h3>Bientôt disponible</h3>
              <p style={{color: 'var(--color-text-secondary)'}}>
                Les premiers articles arrivent bientôt!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Section CTA */}
      <section class="section" style={{textAlign: 'center', padding: '4rem 1rem'}}>
        <h2 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Prêt à créer votre voyage de rêve?</h2>
        <p style={{fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '2rem'}}>
          Contactez-moi pour une consultation gratuite
        </p>
        <a href="/contact" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
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
            <img src={settingsMap.about_photo || '/static/images/jessica-placeholder.webp'} 
                 alt="Jessica" 
                 class="about-image" />
          </div>
          <div class="about-content">
            <h2 style={{marginBottom: '1.5rem'}}>Bienvenue dans mon univers</h2>
            {settingsMap.about_jessica && settingsMap.about_jessica.split('\n\n').map((paragraph: string) => (
              <p style={{marginBottom: '1rem', lineHeight: 1.8}}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section class="section section-warm">
        <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
          <h2 class="section-title">Pourquoi choisir un Travel Planner?</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem'}}>
            <div>
              <i class="fas fa-heart" style={{fontSize: '3rem', color: 'var(--color-secondary)', marginBottom: '1rem'}}></i>
              <h3>Personnalisé</h3>
              <p>Un voyage qui vous ressemble vraiment</p>
            </div>
            <div>
              <i class="fas fa-clock" style={{fontSize: '3rem', color: 'var(--color-secondary)', marginBottom: '1rem'}}></i>
              <h3>Gain de temps</h3>
              <p>Je m'occupe de tout pour vous</p>
            </div>
            <div>
              <i class="fas fa-map-marked-alt" style={{fontSize: '3rem', color: 'var(--color-secondary)', marginBottom: '1rem'}}></i>
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
      <section class="hero hero-formules">
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
                <div style={{margin: '1.5rem 0'}}>
                  <h4 style={{color: 'var(--color-primary)', marginBottom: '0.5rem'}}>Ce qui est inclus :</h4>
                  <ul style={{listStyle: 'none', padding: 0}}>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> Appel découverte</li>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> Itinéraire détaillé personnalisé</li>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> Recommandations d'hébergements</li>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> Suggestions d'activités</li>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> Carnet de voyage digital</li>
                    <li><i class="fas fa-check" style={{color: 'var(--color-accent-green)'}}></i> 2 révisions incluses</li>
                  </ul>
                </div>
                <div class="package-price">
                  <div>
                    <span style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.25rem'}}>À partir de</span>
                    <span class="price-amount">{pkg.price_eur}€</span>
                    <span style={{color: 'var(--color-text-secondary)'}}> / </span>
                    <span class="price-amount">{pkg.price_cad}$</span>
                  </div>
                  <a href="/voyage-sur-mesure" class="btn btn-primary">Commencer</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

	<section class="section">
        <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
          <h2 class="section-title">Les petits plus sur devis</h2>
          <p style={{fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem'}}>
            Envie d'aller plus loin ? Découvrez mes services supplémentaires pour rendre votre voyage encore plus mémorable.
          </p>
          <div class="petits-plus-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem'}}>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🐕</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Voyages dog-friendly</h3>
              <p style={{lineHeight: 1.6}}>Voyagez avec votre compagnon à quatre pattes ! Je conçois des itinéraires adaptés pour que votre chien profite autant que vous de l'aventure.</p>
            </div>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎬</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Montages vidéo</h3>
              <p style={{lineHeight: 1.6}}>Immortalisez votre voyage avec un montage vidéo professionnel de vos meilleurs moments.</p>
            </div>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📸</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Albums photos</h3>
              <p style={{lineHeight: 1.6}}>Création d'albums souvenirs personnalisés pour revivre vos plus belles aventures.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-warm">
        <div style={{maxWidth: '800px', margin: '0 auto', textAlign: 'center'}}>
          <h2 class="section-title" style={{color: 'var(--color-text-primary)'}}>Besoin de quelque chose de différent?</h2>
          <p style={{fontSize: '1.1rem', marginBottom: '2rem'}}>
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
      <section class="hero hero-voyage-sur-mesure">
  <h1 class="hero-title">Votre Voyage sur Mesure</h1>
  <p class="hero-subtitle">Comment ça marche?</p>
</section>

<section class="section">
  <div style={{maxWidth: '900px', margin: '0 auto'}}>
    <h2 class="section-title" style={{textAlign: 'center', marginBottom: '3rem'}}>Comment ça fonctionne?</h2>
    
    <div style={{display: 'grid', gap: '2.5rem'}}>
      <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>
        <div style={{fontSize: '3rem', flexShrink: 0, color: 'var(--color-primary)'}}><i class="far fa-comment-dots"></i></div>
        <div>
          <h3 style={{color: 'var(--color-primary)', marginBottom: '0.5rem'}}>Échange personnalisé</h3>
          <p style={{lineHeight: 1.6}}>
            Tout commence par une conversation pour comprendre vos envies, votre budget, vos contraintes et vos rêves. 
            Remplissez le formulaire de demande ou contactez-moi directement. <strong>Je vous recontacte sous 48h</strong> pour 
            planifier notre appel découverte gratuit.
          </p>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>
        <div style={{fontSize: '3rem', flexShrink: 0, color: 'var(--color-primary)'}}><i class="fas fa-suitcase-rolling"></i></div>
        <div>
          <h3 style={{color: 'var(--color-primary)', marginBottom: '0.5rem'}}>Création sur mesure</h3>
          <p style={{lineHeight: 1.6}}>
            Je travaille sur votre itinéraire personnalisé avec tous les détails : hébergements, transports, activités, 
            restaurants et mes meilleurs conseils. Je vous présente ensuite votre itinéraire complet avec <strong>2 révisions incluses</strong> pour 
            l'affiner jusqu'à ce qu'il soit parfait pour vous.
          </p>
        </div>
      </div>

      <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>
        <div style={{fontSize: '3rem', flexShrink: 0, color: 'var(--color-primary)'}}><i class="far fa-check-circle"></i></div>
        <div>
          <h3 style={{color: 'var(--color-primary)', marginBottom: '0.5rem'}}>Votre carnet de voyage et accompagnement</h3>
          <p style={{lineHeight: 1.6}}>
            Vous recevez votre <strong>carnet de voyage digital</strong> avec toutes les informations, réservations suggérées, cartes 
            et mes recommandations personnelles. Vous partez l'esprit léger et je reste disponible pendant votre voyage 
            si vous avez besoin de conseils ou ajustements.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      <section class="section">
        <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center'}}>
          <h2 class="section-title">Les petits plus sur devis</h2>
          <p style={{fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '3rem'}}>
            Envie d'aller plus loin ? Découvrez mes services supplémentaires.
          </p>
          <div class="petits-plus-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem'}}>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🐕</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Voyages dog-friendly</h3>
              <p style={{lineHeight: 1.6}}>Voyagez avec votre compagnon à quatre pattes ! Je conçois des itinéraires adaptés pour que votre chien profite autant que vous de l'aventure.</p>
            </div>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎬</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Montages vidéo</h3>
              <p style={{lineHeight: 1.6}}>Immortalisez votre voyage avec un montage vidéo professionnel de vos meilleurs moments.</p>
            </div>
            <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center'}}>
              <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📸</div>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>Albums photos</h3>
              <p style={{lineHeight: 1.6}}>Création d'albums souvenirs personnalisés pour revivre vos plus belles aventures.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-warm" style={{textAlign: 'center'}}>
        <h2 class="section-title" style={{color: 'var(--color-text-primary)'}}>Prêt à commencer?</h2>
        <p style={{fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem'}}>
          Remplissez le formulaire de demande et je vous recontacte rapidement pour 
          commencer à planifier votre voyage de rêve.
        </p>
        <a href="/contact" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
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
      <section class="hero hero-destinations">
        <h1 class="hero-title">Mes Destinations</h1>
      </section>

      <section class="section">
        <div style={{maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '2rem', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-lg)', marginBottom: '3rem'}}>
          <p style={{fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text-primary)'}}>
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

        <div style={{textAlign: 'center', marginTop: '3rem', padding: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>Votre destination ne figure pas dans cette liste ?</h3>
          <p style={{fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '2rem'}}>
            Contactez-moi ! Je peux vous orienter vers des destinations similaires ou discuter de votre projet.
          </p>
          <a href="/contact" class="btn btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
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

  // Fonction pour formater la réponse avec retours à la ligne et listes
  const formatAnswer = (text: string) => {
    if (!text) return '';
    
    // Séparer par lignes
    const lines = text.split('\n');
    let html = '';
    let inList = false;
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Détecter une ligne de liste (commence par • ou - ou *)
      if (trimmedLine.match(/^[•\-\*]\s+/)) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        const listContent = trimmedLine.replace(/^[•\-\*]\s+/, '');
        html += `<li>${listContent}</li>`;
      } else {
        // Fermer la liste si on était dedans
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        
        // Ajouter la ligne normale
        if (trimmedLine) {
          html += `<p>${trimmedLine}</p>`;
        }
      }
    });
    
    // Fermer la liste si elle était ouverte
    if (inList) {
      html += '</ul>';
    }
    
    return html;
  };

  return c.render(
    <>
      <section class="hero hero-faq">
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
              <div class="faq-answer" dangerouslySetInnerHTML={{ __html: formatAnswer(faq.answer) }}>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-lg)'}}>
          <h3 style={{marginBottom: '1rem'}}>Vous ne trouvez pas votre réponse?</h3>
          <p style={{marginBottom: '1.5rem', color: 'var(--color-text-secondary)'}}>
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
      <section class="hero hero-blog">
        <h1 class="hero-title">Blog</h1>
        <p class="hero-subtitle">Récits, conseils et inspirations voyage</p>
      </section>

      <section class="section">
        {/* Container liste articles */}
        <div id="blog-list">
          {posts.results.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem'}}>
              <i class="fas fa-book-open" style={{fontSize: '4rem', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}></i>
              <h2>Bientôt disponible</h2>
              <p style={{color: 'var(--color-text-secondary)'}}>
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
                    <button class="btn btn-outline blog-read-more" data-slug={post.slug} style={{cursor: 'pointer'}}>
                      Lire la suite <i class="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Container article individuel (masqué par défaut) */}
        <div id="blog-article" style={{display: 'none'}}>
          {/* Contenu chargé dynamiquement */}
        </div>
      </section>

      {/* Script de navigation dynamique */}
      <script src="/static/js/blog-navigation.js"></script>
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
      <section class="hero hero-contact">
        <h1 class="hero-title">Contact</h1>
        <p class="hero-subtitle">Commençons à planifier votre voyage</p>
      </section>

      <section class="section">
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div style={{background: 'var(--color-bg-warm)', padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', textAlign: 'center'}}>
            <h2 style={{marginBottom: '1rem'}}>Demande de devis gratuite</h2>
            <p style={{color: 'var(--color-text-secondary)'}}>
              Remplissez ce formulaire et je vous recontacte sous 48h pour discuter de votre projet de voyage.
            </p>
          </div>

          {/* Barre de progression */}
          <div id="progress-bar" style={{marginBottom: '2rem'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', marginBottom: '1rem'}}>
              {/* Ligne de fond */}
              <div style={{position: 'absolute', top: '50%', left: '0', right: '0', height: '4px', background: '#E5E7EB', zIndex: 0, borderRadius: '2px'}}></div>
              {/* Ligne de progression */}
              <div id="progress-line" style={{position: 'absolute', top: '50%', left: '0', height: '4px', background: 'var(--color-primary)', zIndex: 1, width: '0%', transition: 'width 0.3s ease', borderRadius: '2px'}}></div>
              
              {/* Étapes */}
              <div class="progress-step active" data-step="1" style={{position: 'relative', zIndex: 2}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.3s ease'}}>1</div>
                <div style={{position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: '500'}}>Qui êtes-vous ?</div>
              </div>
              
              <div class="progress-step" data-step="2" style={{position: 'relative', zIndex: 2}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#E5E7EB', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.3s ease'}}>2</div>
                <div style={{position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6B7280'}}>Votre destination</div>
              </div>
              
              <div class="progress-step" data-step="3" style={{position: 'relative', zIndex: 2}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#E5E7EB', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.3s ease'}}>3</div>
                <div style={{position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6B7280'}}>Détails</div>
              </div>
              
              <div class="progress-step" data-step="4" style={{position: 'relative', zIndex: 2}}>
                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: '#E5E7EB', color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', transition: 'all 0.3s ease'}}>4</div>
                <div style={{position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '0.875rem', color: '#6B7280'}}>Votre projet</div>
              </div>
            </div>
          </div>

          {/* Formulaire multi-étapes */}
          <form id="quote-form" style={{background: 'white', padding: '2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', minHeight: '450px'}}>
            
            {/* ÉTAPE 1 : Coordonnées */}
            <div class="form-step active" data-step="1">
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem'}}>
                <i class="far fa-user"></i> Qui êtes-vous ?
              </h3>
              
              <div class="form-group">
                <label class="form-label" for="name">Nom complet :</label>
                <input type="text" id="name" name="name" class="form-input" placeholder="Jessica Dupont" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="email">Email :</label>
                <input type="email" id="email" name="email" class="form-input" placeholder="jessica@exemple.com" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="phone">Téléphone (optionnel) :</label>
                <input type="tel" id="phone" name="phone" class="form-input" placeholder="+33 6 12 34 56 78" />
              </div>
            </div>

            {/* ÉTAPE 2 : Destination */}
            <div class="form-step" data-step="2" style={{display: 'none'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem'}}>
                <i class="fas fa-globe-americas"></i> Où rêvez-vous d'aller ?
              </h3>
              
              <div class="form-group">
                <label class="form-label" for="destination">Destination souhaitée :</label>
                <input type="text" id="destination" name="destination" class="form-input" 
                       placeholder="Ex: Japon, Patagonie, Islande, Bali..." required />
                <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>
                  💡 Vous hésitez entre plusieurs destinations ? Listez-les !
                </p>
              </div>

              <div class="form-group">
                <label class="form-label" for="travel-dates">Période souhaitée (optionnel)</label>
                <input type="text" id="travel-dates" name="travel_dates" class="form-input" 
                       placeholder="Ex: Été 2025, Septembre, Dates flexibles..." />
              </div>
            </div>

            {/* ÉTAPE 3 : Détails pratiques */}
            <div class="form-step" data-step="3" style={{display: 'none'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem'}}>
                <i class="far fa-calendar-alt"></i> Détails pratiques
              </h3>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                <div class="form-group">
                  <label class="form-label" for="duration">Durée du voyage :</label>
                  <select id="duration" name="duration" class="form-select" required>
                    <option value="">Choisir...</option>
                    <option value="2-6">2 à 6 jours</option>
                    <option value="7-14">7 à 14 jours</option>
                    <option value="15-21">15 à 21 jours</option>
                    <option value="21+">Plus de 21 jours</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="travelers">Nombre de voyageurs :</label>
                  <input type="number" id="travelers" name="travelers" class="form-input" min="1" placeholder="2" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="budget">Budget estimé par personne :</label>
                <select id="budget" name="budget" class="form-select">
                  <option value="">Choisir...</option>
                  <option value="low">Moins de 1000€ / 1500$ CAD</option>
                  <option value="medium">1000€ - 3000€ / 1500$ - 4500$ CAD</option>
                  <option value="high">3000€ - 5000€ / 4500$ - 7500$ CAD</option>
                  <option value="luxury">Plus de 5000€ / 7500$ CAD</option>
                </select>
              </div>
            </div>

                        {/* ÉTAPE 4 : Projet & champ libre */}
            <div class="form-step" data-step="4" style={{display: 'none'}}>
              <h3 style={{color: 'var(--color-primary)', marginBottom: '1.5rem', fontSize: '1.5rem'}}>
                <i class="far fa-heart"></i> Parlez-moi de votre projet
              </h3>
              
              <div class="form-group">
                <label class="form-label" for="message">Qu'est-ce qui vous fait rêver ?</label>
                <textarea id="message" name="message" class="form-textarea" rows="6"
                          placeholder="Ex: Nous aimons la randonnée et les paysages sauvages. Nous recherchons un mélange d'aventure et de détente..." 
                          style={{width: '100%', resize: 'none', display: 'block', marginTop: '0.5rem'}}
                          required></textarea>
              </div>

              <div class="form-group">
                <label class="form-label" for="special-requests">
                  Qu'est-ce qui rendrait ce voyage parfait pour vous ? (optionnel)
                </label>
                <textarea id="special-requests" name="special_requests" class="form-textarea" rows="6"
                          placeholder="Ex: Voyager avec notre chien, célébrer un anniversaire, éviter les longs vols, besoin d'accessibilité, allergies alimentaires..."
                          style={{width: '100%', resize: 'none', display: 'block', marginTop: '0.5rem'}}></textarea>
                <p style={{fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.5rem'}}>
                  💬 Partagez tout ce qui vous semble important : occasions spéciales, contraintes, préférences...
                </p>
              </div>
            </div>


            {/* Boutons de navigation */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB'}}>
              <button type="button" id="prev-btn" class="btn" style={{visibility: 'hidden', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem'}}>
                <i class="fas fa-arrow-left"></i> Précédent
              </button>
              
              <button type="button" id="next-btn" class="btn btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem'}}>
                Suivant <i class="fas fa-arrow-right"></i>
              </button>
              
              <button type="submit" id="submit-btn" class="btn btn-primary" style={{display: 'none', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem'}}>
                <i class="fas fa-paper-plane"></i> Envoyer ma demande
              </button>
            </div>
          </form>

          <div style={{marginTop: '2rem', textAlign: 'center', padding: '2rem'}}>
            <h3 style={{marginBottom: '1rem'}}>Ou contactez-moi directement :</h3>
            <p style={{fontSize: '1.1rem', marginBottom: '0.5rem'}}>
              <i class="fas fa-envelope" style={{color: 'var(--color-primary)'}}></i> 
              <a href="mailto:contact@lesvoyagesdejess.com" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
                contact@lesvoyagesdejess.com
              </a>
            </p>
            <p style={{fontSize: '1.1rem'}}>
              <i class="fab fa-instagram" style={{color: 'var(--color-secondary)'}}></i> 
              <a href="https://instagram.com/lesvoyagesde_jess" target="_blank" style={{color: 'var(--color-secondary)', textDecoration: 'none'}}>
                @lesvoyagesdejess
              </a>
            </p>
          </div>
        </div>
      </section>

{/* CSS pour améliorer les textarea */}
      <style dangerouslySetInnerHTML={{__html: `
        .form-textarea {
          font-family: inherit;
          font-size: 1rem;
          padding: 0.75rem;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .form-textarea:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 73, 0.1);
        }
        
        .form-textarea::placeholder {
          color: #9CA3AF;
        }
      `}} />

      {/* JavaScript pour le formulaire multi-étapes */}
      <script dangerouslySetInnerHTML={{__html: `
        (function() {
          let currentStep = 1;
          const totalSteps = 4;
          
          const nextBtn = document.getElementById('next-btn');
          const prevBtn = document.getElementById('prev-btn');
          const submitBtn = document.getElementById('submit-btn');
          const progressLine = document.getElementById('progress-line');
          
          function updateStep() {
            // Masquer toutes les étapes
            document.querySelectorAll('.form-step').forEach(step => {
              step.style.display = 'none';
            });
            
            // Afficher l'étape courante avec animation
            const currentStepEl = document.querySelector('.form-step[data-step="' + currentStep + '"]');
            if (currentStepEl) {
              currentStepEl.style.display = 'block';
              currentStepEl.style.animation = 'fadeIn 0.4s ease-in-out';
            }
            
            // Mettre à jour la barre de progression
            const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressLine.style.width = progressPercentage + '%';
            
            // Mettre à jour les indicateurs d'étape
            document.querySelectorAll('.progress-step').forEach((step, index) => {
              const stepNum = index + 1;
              const circle = step.querySelector('div:first-child');
              const label = step.querySelector('div:last-child');
              
              if (stepNum < currentStep) {
                // Étape complétée
                circle.style.background = 'var(--color-secondary)';
                circle.style.color = 'white';
                circle.innerHTML = '<i class="fas fa-check"></i>';
                label.style.color = 'var(--color-secondary)';
              } else if (stepNum === currentStep) {
                // Étape active
                circle.style.background = 'var(--color-primary)';
                circle.style.color = 'white';
                circle.textContent = stepNum;
                label.style.color = 'var(--color-primary)';
                label.style.fontWeight = '600';
              } else {
                // Étape à venir
                circle.style.background = '#E5E7EB';
                circle.style.color = '#6B7280';
                circle.textContent = stepNum;
                label.style.color = '#6B7280';
                label.style.fontWeight = '400';
              }
            });
            
            // Gérer la visibilité des boutons
            prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
            
            if (currentStep === totalSteps) {
              nextBtn.style.display = 'none';
              submitBtn.style.display = 'flex';
            } else {
              nextBtn.style.display = 'flex';
              submitBtn.style.display = 'none';
            }
          }
          
          function validateStep(step) {
            const stepEl = document.querySelector('.form-step[data-step="' + step + '"]');
            const requiredInputs = stepEl.querySelectorAll('[required]');
            
            for (let input of requiredInputs) {
              if (!input.value.trim()) {
                input.focus();
                input.style.borderColor = '#EF4444';
                setTimeout(() => { input.style.borderColor = ''; }, 2000);
                return false;
              }
            }
            return true;
          }
          
          nextBtn.addEventListener('click', function() {
            if (validateStep(currentStep)) {
              if (currentStep < totalSteps) {
                currentStep++;
                updateStep();
              }
            }
          });
          
          prevBtn.addEventListener('click', function() {
            if (currentStep > 1) {
              currentStep--;
              updateStep();
            }
          });
          
          // Initialiser
          updateStep();
          
          // Ajouter l'animation CSS
          const style = document.createElement('style');
          style.textContent = \`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          \`;
          document.head.appendChild(style);
        })();
      `}} />
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

// API: Soumettre une demande de devis avec envoi d'email
app.post('/api/quote-request', async (c) => {
  const data = await c.req.json();

  try {
    // 1. Vérifier que la clé Resend existe
    if (!c.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquante');
      return c.json({ success: false, error: 'Configuration serveur manquante' }, 500);
    }

    // 2. Sauvegarder dans la base de données
    await c.env.db.prepare(`
      INSERT INTO quote_requests (name, email, phone, destination, duration, budget, travelers, message, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.email,
      data.phone || null,
      data.destination,
      data.duration,
      data.budget || null,
      data.travelers,
      data.message,
      data.special_requests || null
    ).run();

    // 3. Envoyer l'email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Les Voyages de Jess <contact@lesvoyagesdejess.com>',
        to: 'contact@lesvoyagesdejess.com',
        subject: `Nouvelle demande de devis - ${data.name}`,
        html: `
          <h2>Nouvelle demande de devis</h2>
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Téléphone:</strong> ${data.phone || 'Non renseigné'}</p>
          <p><strong>Destination:</strong> ${data.destination}</p>
          <p><strong>Dates souhaitées:</strong> ${data.travel_dates || 'Flexibles'}</p>
          <p><strong>Durée:</strong> ${data.duration}</p>
          <p><strong>Nombre de voyageurs:</strong> ${data.travelers}</p>
          <p><strong>Budget:</strong> ${data.budget || 'Non précisé'}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
          ${data.special_requests ? `<p><strong>Demandes spéciales:</strong></p><p>${data.special_requests}</p>` : ''}
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Erreur Resend:', errorText);
      return c.json({ success: false, error: 'Erreur lors de l\'envoi de l\'email' }, 500);
    }

    return c.json({ success: true, message: 'Votre demande a été envoyée avec succès!' });

  } catch (error) {
    console.error('Erreur formulaire contact:', error);
    return c.json({ success: false, error: 'Une erreur est survenue' }, 500);
  }
});

// API: Récupérer les paramètres du site
app.get('/api/settings', async (c) => {
  const settings = await c.env.db.prepare('SELECT key, value FROM site_settings').all();
  const settingsMap = settings.results.reduce((acc: any, row: any) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  return c.json(settingsMap)
})

// API: Récupérer les articles récents pour la homepage (max 4)
app.get('/api/recent-posts', async (c) => {
  try {
    // Récupérer les 4 derniers articles publiés depuis la DB
    const realArticles = await c.env.db.prepare(
      'SELECT id, title, slug, excerpt, featured_image, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC LIMIT 4'
    ).all();

    // Articles d'exemple (fallback si pas assez d'articles réels)
    const exampleArticles = [
      {
        id: 'example-1',
        title: '10 destinations incontournables en 2026',
        slug: 'example-1',
        excerpt: 'Découvrez les destinations qui feront rêver les voyageurs cette année. De l\'Europe à l\'Asie, voici mes coups de cœur.',
        image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
        created_at: '2026-02-01',
        isExample: true
      },
      {
        id: 'example-2',
        title: 'Comment préparer son voyage en 5 étapes',
        slug: 'example-2',
        excerpt: 'Les conseils essentiels pour organiser votre voyage sereinement, de la réservation aux derniers préparatifs.',
        image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop',
        created_at: '2026-02-02',
        isExample: true
      },
      {
        id: 'example-3',
        title: 'Voyage en famille : mes destinations préférées',
        slug: 'example-3',
        excerpt: 'Partir en famille demande une organisation particulière. Voici mes meilleures recommandations pour voyager avec des enfants.',
        image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop',
        created_at: '2026-02-03',
        isExample: true
      },
      {
        id: 'example-4',
        title: 'Voyager en solo : mes meilleurs conseils',
        slug: 'example-4',
        excerpt: 'Le voyage en solo est une expérience unique. Découvrez mes astuces pour voyager seul(e) en toute sérénité.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
        created_at: '2026-02-04',
        isExample: true
      }
    ];

    // Combiner articles réels + exemples pour toujours avoir 4 articles
    const articles = [
      ...realArticles.results.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        image_url: article.featured_image, // Renommer featured_image → image_url pour le frontend
        created_at: article.created_at,
        isExample: false
      })),
      ...exampleArticles.slice(0, Math.max(0, 4 - realArticles.results.length))
    ].slice(0, 4);

    return c.json(articles);
  } catch (error) {
    console.error('Erreur récupération articles récents:', error);
    // En cas d'erreur, renvoyer uniquement les articles d'exemple
    return c.json([
      {
        id: 'example-1',
        title: '10 destinations incontournables en 2026',
        slug: 'example-1',
        excerpt: 'Découvrez les destinations qui feront rêver les voyageurs cette année.',
        image_url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
        created_at: '2026-02-01',
        isExample: true
      },
      {
        id: 'example-2',
        title: 'Comment préparer son voyage en 5 étapes',
        slug: 'example-2',
        excerpt: 'Les conseils essentiels pour organiser votre voyage sereinement.',
        image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop',
        created_at: '2026-02-02',
        isExample: true
      },
      {
        id: 'example-3',
        title: 'Voyage en famille : mes destinations préférées',
        slug: 'example-3',
        excerpt: 'Partir en famille demande une organisation particulière.',
        image_url: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&auto=format&fit=crop',
        created_at: '2026-02-03',
        isExample: true
      },
      {
        id: 'example-4',
        title: 'Voyager en solo : mes meilleurs conseils',
        slug: 'example-4',
        excerpt: 'Le voyage en solo est une expérience unique.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop',
        created_at: '2026-02-04',
        isExample: true
      }
    ]);
  }
})


// ============================================
// ROUTES ADMIN - AUTHENTIFICATION
// ============================================

// Page de connexion admin
app.get('/admin/login', (c) => {
  return c.render(
    <>
      <div style={{maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
        <h1 style={{textAlign: 'center', marginBottom: '2rem', color: 'var(--color-primary)'}}>Connexion Admin</h1>
        
        <form method="POST" action="/admin/login">
          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          
          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              required 
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
            />
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary"
            style={{width: '100%', padding: '0.75rem', fontSize: '1rem'}}
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
        <div style={{maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <div style={{color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: '#ffe6e6', borderRadius: '4px'}}>
            ❌ Email ou mot de passe incorrect
          </div>
          <a href="/admin/login" class="btn btn-secondary" style={{display: 'block', textAlign: 'center'}}>Retour</a>
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
        <div style={{maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)'}}>
          <div style={{color: 'red', textAlign: 'center', marginBottom: '1rem', padding: '1rem', background: '#ffe6e6', borderRadius: '4px'}}>
            ❌ Email ou mot de passe incorrect
          </div>
          <a href="/admin/login" class="btn btn-secondary" style={{display: 'block', textAlign: 'center'}}>Retour</a>
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
      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '2px solid var(--color-primary)'}}>
       <h1>Panneau d'administration</h1>
          <div>
            <a href="/admin/profil" class="btn btn-secondary" style={{marginRight: '1rem'}}>
              <i class="fas fa-user"></i> Mon profil
            </a>
            <a href="/admin/logout" class="btn btn-secondary">
              <i class="fas fa-sign-out-alt"></i> Déconnexion
            </a>
          </div>
        </div>
        
        <p style={{fontSize: '1.2rem', marginBottom: '2rem'}}>
          Bienvenue <strong>{user.email}</strong> ! 👋
        </p>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem'}}>
          <a href="/admin/blog" style={{display: 'block', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s'}} onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-book-open" style={{fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem'}}></i>
            <h3 style={{marginBottom: '0.5rem'}}>Gérer le Blog</h3>
            <p style={{color: 'var(--color-text-secondary)'}}>Créer et modifier des articles</p>
          </a>
          
          <a href="/admin/media" style={{display: 'block', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s'}} onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-images" style={{fontSize: '3rem', color: 'var(--color-secondary)', marginBottom: '1rem'}}></i>
            <h3 style={{marginBottom: '0.5rem'}}>Gérer les Photos</h3>
            <p style={{color: 'var(--color-text-secondary)'}}>Uploader et gérer les images</p>
          </a>
          
          <a href="/admin/formules" style={{display: 'block', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s'}} onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-suitcase" style={{fontSize: '3rem', color: 'var(--color-accent-green)', marginBottom: '1rem'}}></i>
            <h3 style={{marginBottom: '0.5rem'}}>Gérer les Formules</h3>
            <p style={{color: 'var(--color-text-secondary)'}}>Modifier les formules de voyage</p>
          </a>
          
          <a href="/admin/faq" style={{display: 'block', padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s'}} onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
            <i class="fas fa-question-circle" style={{fontSize: '3rem', color: '#f39c12', marginBottom: '1rem'}}></i>
            <h3 style={{marginBottom: '0.5rem'}}>Gérer la FAQ</h3>
            <p style={{color: 'var(--color-text-secondary)'}}>Ajouter et modifier les FAQs</p>
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
      <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Mon profil</h1>
        
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Modifier mon email</h2>
          <form method="POST" action="/admin/profil/email">
            <div class="form-group">
              <label class="form-label">Email actuel</label>
              <input 
                type="email" 
                value={user.email} 
                disabled 
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', background: '#f5f5f5'}}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Nouvel email *</label>
              <input 
                type="email" 
                name="new_email" 
                required 
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">Mot de passe actuel (pour confirmer) *</label>
              <input 
                type="password" 
                name="password" 
                required 
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            
            <button type="submit" class="btn btn-primary">
              Modifier l'email
            </button>
          </form>
        </div>
        
        <div style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <h2 style={{marginBottom: '1.5rem'}}>Modifier mon mot de passe</h2>
          <form method="POST" action="/admin/profil/password">
            <div class="form-group">
              <label class="form-label">Mot de passe actuel *</label>
              <input 
                type="password" 
                name="current_password" 
                required 
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
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
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
              />
              <small style={{color: 'var(--color-text-secondary)'}}>Minimum 8 caractères</small>
            </div>
            
            <div class="form-group">
              <label class="form-label">Confirmer le nouveau mot de passe *</label>
              <input 
                type="password" 
                name="confirm_password" 
                required 
                minlength="8"
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
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
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
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
      <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
        <div style={{color: 'green', padding: '1rem', background: '#d4edda', borderRadius: '4px', marginBottom: '1rem'}}>
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
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
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
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
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
      <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
        <div style={{color: 'green', padding: '1rem', background: '#d4edda', borderRadius: '4px', marginBottom: '1rem'}}>
          ✅ Mot de passe modifié avec succès !
        </div>
        <a href="/admin/profil" class="btn btn-primary">Retour au profil</a>
      </div>
    </>,
    { title: 'Succès - Admin' }
  )
})
// ============================================
// ROUTES ADMIN - GESTION DU BLOG
// ============================================

// Liste des articles du blog
app.get('/admin/blog', async (c) => {
  const posts = await c.env.db
    .prepare('SELECT * FROM blog_posts ORDER BY created_at DESC')
    .all()
  
  return c.render(
    <>
      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h1>Gestion du Blog</h1>
          <a href="/admin/blog/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nouvel article
          </a>
        </div>
        
        {posts.results.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px'}}>
            <i class="fas fa-book-open" style={{fontSize: '4rem', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}></i>
            <p style={{fontSize: '1.2rem', color: 'var(--color-text-secondary)'}}>Aucun article pour le moment</p>
            <a href="/admin/blog/new" class="btn btn-primary" style={{marginTop: '1rem'}}>
              Créer le premier article
            </a>
          </div>
        ) : (
          <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{background: '#f5f5f5', borderBottom: '2px solid #ddd'}}>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Titre</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Date</th>
                  <th style={{padding: '1rem', textAlign: 'left'}}>Statut</th>
                  <th style={{padding: '1rem', textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.results.map((post: any) => (
                  <tr style={{borderBottom: '1px solid #eee'}}>
                    <td style={{padding: '1rem'}}>{post.title}</td>
                    <td style={{padding: '1rem'}}>
                      {new Date(post.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{padding: '1rem'}}>
                      {post.published ? (
                        <span style={{color: 'green', fontWeight: 600}}>✅ Publié</span>
                      ) : (
                        <span style={{color: 'orange', fontWeight: 600}}>📝 Brouillon</span>
                      )}
                    </td>
                    <td style={{padding: '1rem', textAlign: 'right'}}>
                      <a href={`/admin/blog/edit/${post.id}`} class="btn btn-secondary" style={{marginRight: '0.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem'}}>
                        <i class="fas fa-edit"></i> Modifier
                      </a>
                      <form method="POST" action={`/admin/blog/${post.id}/delete`} style={{display: 'inline'}}>
                        <button 
                          type="submit" 
                          onclick="return confirm('Supprimer cet article ?')"
                          style={{background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem'}}
                        >
                          <i class="fas fa-trash"></i> Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>,
    { title: 'Gestion du Blog - Admin' }
  )
})
// Formulaire de création d'article
// Formulaire de création d'article
app.get('/admin/blog/new', (c) => {
  return c.render(
    <>
      <div style={{maxWidth: '900px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin/blog" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour à la liste
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Nouvel article</h1>
        
        <form method="POST" action="/admin/blog" enctype="multipart/form-data" style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Titre *</label>
            <input 
              type="text" 
              name="title" 
              id="blog-title"
              required 
              class="form-input"
              placeholder="Ex: Mon voyage en Italie"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <input type="hidden" name="slug" id="blog-slug" />
          <div style={{marginBottom: '1.5rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '4px', border: '1px solid #bfdbfe'}}>
            <small style={{color: '#1e40af'}}>
              <i class="fas fa-link"></i> URL de l'article : <span style={{fontWeight: 600}}>/blog/<span id="slug-preview">mon-article</span></span>
            </small>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>
              <i class="fas fa-image"></i> Image à la une
            </label>
            <div style={{border: '2px dashed #ddd', borderRadius: '8px', padding: '2rem', textAlign: 'center', background: '#fafafa'}}>
              <input 
                type="file" 
                name="featured_image" 
                id="featured-image-input"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                style={{display: 'none'}}
              />
              <div id="featured-image-preview" style={{display: 'none', marginBottom: '1rem'}}>
                <img id="featured-image-img" src="" alt="Aperçu" style={{maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              </div>
              <button 
                type="button" 
                id="upload-featured-btn"
                onclick="document.getElementById('featured-image-input').click()"
                style={{padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem'}}
              >
                <i class="fas fa-upload"></i> Choisir une image
              </button>
              <input type="hidden" name="featured_image_url" id="featured-image-url" />
              <p style={{marginTop: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem'}}>
                JPG, PNG ou WebP - Max 5 MB
              </p>
            </div>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Extrait</label>
            <textarea 
              name="excerpt" 
              rows="3"
              class="form-textarea"
              placeholder="Court résumé de l'article (visible sur la liste des articles)..."
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            ></textarea>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Contenu *</label>
            <textarea 
              name="content" 
              rows="15"
              required
              class="form-textarea"
              placeholder="Rédigez votre article ici..."
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            ></textarea>
            <small style={{color: 'var(--color-text-secondary)'}}>
              💡 Astuce : Utilisez des retours à la ligne pour structurer votre texte
            </small>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
              <input type="checkbox" name="published" value="1" checked />
              <span style={{fontWeight: 600}}>Publier immédiatement</span>
            </label>
            <small style={{color: 'var(--color-text-secondary)', display: 'block', marginTop: '0.25rem'}}>
              Si non coché, l'article sera sauvegardé en brouillon
            </small>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Enregistrer l'article
            </button>
            <a href="/admin/blog" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
      
      <script dangerouslySetInnerHTML={{__html: `
        const titleInput = document.getElementById('blog-title');
        const slugInput = document.getElementById('blog-slug');
        const slugPreview = document.getElementById('slug-preview');
        
        function generateSlug(text) {
          return text
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\\u0300-\\u036f]/g, '')
            .replace(/[^a-z0-9\\s-]/g, '')
            .replace(/\\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
        }
        
        titleInput.addEventListener('input', function() {
          const slug = generateSlug(this.value) || 'mon-article';
          slugInput.value = slug;
          slugPreview.textContent = slug;
        });
        
        const featuredImageInput = document.getElementById('featured-image-input');
        const featuredImagePreview = document.getElementById('featured-image-preview');
        const featuredImageImg = document.getElementById('featured-image-img');
        const featuredImageUrl = document.getElementById('featured-image-url');
        const uploadBtn = document.getElementById('upload-featured-btn');
        
        featuredImageInput.addEventListener('change', async function() {
          const file = this.files[0];
          if (!file) return;
          
          uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Upload en cours...';
          uploadBtn.disabled = true;
          
          const formData = new FormData();
          formData.append('image', file);
          
          try {
            const response = await fetch('/admin/blog/upload-image', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
              featuredImageImg.src = result.url;
              featuredImagePreview.style.display = 'block';
              featuredImageUrl.value = result.url;
              uploadBtn.innerHTML = '<i class="fas fa-check"></i> Image téléchargée';
              uploadBtn.style.background = '#10b981';
            } else {
              alert('Erreur : ' + result.error);
              uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choisir une image';
              uploadBtn.disabled = false;
            }
          } catch (error) {
            alert('Erreur lors de l\\'upload : ' + error.message);
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Choisir une image';
            uploadBtn.disabled = false;
          }
        });
      `}} />
    </>,
    { title: 'Nouvel article - Admin' }
  )
})
// Traiter la création d'article
// Fonction utilitaire pour générer un slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Route pour uploader une image (blog)
app.post('/admin/blog/upload-image', async (c) => {
  try {
    const body = await c.req.parseBody()
    const file = body.image as File
    
    if (!file) {
      return c.json({ success: false, error: 'Aucun fichier fourni' }, 400)
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Format non supporté. Utilisez JPG, PNG ou WebP.' }, 400)
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ success: false, error: 'Fichier trop volumineux (max 5MB)' }, 400)
    }
    
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `blog/${timestamp}-${randomStr}.${extension}`
    
    const arrayBuffer = await file.arrayBuffer()
    await c.env.PHOTOS_BUCKET.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    const imageUrl = `/r2/${fileName}`
    
    return c.json({ 
      success: true, 
      url: imageUrl,
      fileName: file.name
    })
  } catch (error) {
    console.error('Erreur upload:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Route pour servir les images R2
app.get('/r2/*', async (c) => {
  try {
    const path = c.req.path.replace('/r2/', '')
    const object = await c.env.PHOTOS_BUCKET.get(path)
    
    if (!object) {
      return c.notFound()
    }
    
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('cache-control', 'public, max-age=31536000')
    
    return new Response(object.body, { headers })
  } catch (error) {
    return c.notFound()
  }
})

// Route API pour récupérer un article en JSON (pour navigation dynamique)
app.get('/api/blog/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  const post = await c.env.db
    .prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug)
    .first()
  
  if (!post) {
    return c.json({ success: false, error: 'Article non trouvé' }, 404)
  }
  
  return c.json({ 
    success: true, 
    post: post
  })
})

// Route article individuel
// Route article individuel - Redirige vers /blog avec paramètre
app.get('/blog/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  // Vérifier que l'article existe
  const post = await c.env.db
    .prepare('SELECT * FROM blog_posts WHERE slug = ? AND published = 1')
    .bind(slug)
    .first()
  
  if (!post) {
    return c.notFound()
  }
  
  // Rediriger vers /blog avec le paramètre article
  return c.redirect(`/blog?article=${slug}`)
})

app.post('/admin/blog', async (c) => {
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const slug = body.slug as string
  const excerpt = (body.excerpt as string) || ''
  const content = body.content as string
  const published = body.published === '1' ? 1 : 0
  const featured_image = (body.featured_image_url as string) || null

  try {
    await c.env.db
      .prepare(`
        INSERT INTO blog_posts (title, slug, excerpt, content, published, published_at, created_at, featured_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        title,
        slug,
        excerpt,
        content,
        published,
        published ? new Date().toISOString() : null,
        new Date().toISOString()
        ,
        featured_image
      )
      .run()
    
    return c.redirect('/admin/blog')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
            <br />
            <small>Le slug existe peut-être déjà ?</small>
          </div>
          <a href="/admin/blog/new" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
// Formulaire de modification d'article
app.get('/admin/blog/edit/:id', async (c) => {
  const id = c.req.param('id')
  
  const post = await c.env.db
    .prepare('SELECT * FROM blog_posts WHERE id = ?')
    .bind(id)
    .first()
  
  if (!post) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Article non trouvé
          </div>
          <a href="/admin/blog" class="btn btn-secondary">Retour à la liste</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  return c.render(
    <>
      <div style={{maxWidth: '900px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin/blog" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour à la liste
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Modifier l'article</h1>
        
        <form method="POST" action={`/admin/blog/${id}`} style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Titre *</label>
            <input 
              type="text" 
              name="title" 
              value={post.title}
              required 
              class="form-input"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Slug (URL) *</label>
            <input 
              type="text" 
              name="slug" 
              value={post.slug}
              required 
              class="form-input"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Extrait</label>
            <textarea 
              name="excerpt" 
              rows="3"
              class="form-textarea"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            >{post.excerpt}</textarea>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Contenu *</label>
            <textarea 
              name="content" 
              rows="15"
              required
              class="form-textarea"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            >{post.content}</textarea>
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
              <input type="checkbox" name="published" value="1" checked={post.published === 1} />
              <span style={{fontWeight: 600}}>Publié</span>
            </label>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Enregistrer les modifications
            </button>
            <a href="/admin/blog" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
    </>,
    { title: 'Modifier l\'article - Admin' }
  )
})
// Traiter la modification d'article
app.post('/admin/blog/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const slug = body.slug as string
  const excerpt = (body.excerpt as string) || ''
  const content = body.content as string
  const published = body.published === '1' ? 1 : 0
  
  try {
    await c.env.db
      .prepare(`
        UPDATE blog_posts 
        SET title = ?, slug = ?, excerpt = ?, content = ?, published = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(title, slug, excerpt, content, published, new Date().toISOString(), id)
      .run()
    
    return c.redirect('/admin/blog')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href={`/admin/blog/edit/${id}`} class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})

// Supprimer un article
app.post('/admin/blog/:id/delete', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.db
      .prepare('DELETE FROM blog_posts WHERE id = ?')
      .bind(id)
      .run()
    
    return c.redirect('/admin/blog')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur lors de la suppression : {error.message}
          </div>
          <a href="/admin/blog" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})

// ============================================
// ROUTES ADMIN - GESTION DE LA FAQ
// ============================================

// Liste des FAQs
app.get('/admin/faq', async (c) => {
  const faqs = await c.env.db
    .prepare('SELECT * FROM faqs ORDER BY sort_order ASC')
    .all()
  
  return c.render(
    <>
      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
          <h1>Gestion de la FAQ</h1>
          <a href="/admin/faq/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nouvelle question
          </a>
        </div>
        
        {faqs.results.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px'}}>
            <i class="fas fa-question-circle" style={{fontSize: '4rem', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}></i>
            <p style={{fontSize: '1.2rem', color: 'var(--color-text-secondary)'}}>Aucune question pour le moment</p>
            <a href="/admin/faq/new" class="btn btn-primary" style={{marginTop: '1rem'}}>
              Créer la première question
            </a>
          </div>
        ) : (
          <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
            {faqs.results.map((faq: any) => (
              <div style={{padding: '1.5rem', borderBottom: '1px solid #eee'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem'}}>
                  <div style={{flex: 1}}>
                    <h3 style={{marginBottom: '0.5rem', color: 'var(--color-primary)'}}>{faq.question}</h3>
                    <p style={{color: 'var(--color-text-secondary)', margin: 0}}>{faq.answer}</p>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem', flexShrink: 0}}>
                    <a href={`/admin/faq/edit/${faq.id}`} class="btn btn-secondary" style={{fontSize: '0.9rem', padding: '0.5rem 1rem'}}>
                      <i class="fas fa-edit"></i> Modifier
                    </a>
                    <form method="POST" action={`/admin/faq/${faq.id}/delete`} style={{display: 'inline'}}>
                      <button 
                        type="submit" 
                        onclick="return confirm('Supprimer cette question ?')"
                        style={{background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem'}}
                      >
                        <i class="fas fa-trash"></i> Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>,
    { title: 'Gestion de la FAQ - Admin' }
  )
})

// Formulaire de création de FAQ
app.get('/admin/faq/new', (c) => {
  return c.render(
    <>
      <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin/faq" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour à la liste
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Nouvelle question</h1>
        
        <form method="POST" action="/admin/faq" style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Question *</label>
            <input 
              type="text" 
              name="question" 
              required 
              class="form-input"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Réponse *</label>
            <textarea 
              name="answer" 
              rows="6"
              required
              class="form-textarea"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            ></textarea>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Enregistrer
            </button>
            <a href="/admin/faq" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
    </>,
    { title: 'Nouvelle question - Admin' }
  )
})

// Traiter la création de FAQ
app.post('/admin/faq', async (c) => {
  const body = await c.req.parseBody()
  const question = body.question as string
  const answer = body.answer as string
  
  // Trouver le prochain sort_order
  const maxOrder = await c.env.db
    .prepare('SELECT MAX(sort_order) as max FROM faqs')
    .first()
  
  const nextOrder = (maxOrder?.max || 0) + 1
  
  try {
    await c.env.db
      .prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)')
      .bind(question, answer, nextOrder)
      .run()
    
    return c.redirect('/admin/faq')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href="/admin/faq/new" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})

// Formulaire de modification de FAQ
app.get('/admin/faq/edit/:id', async (c) => {
  const id = c.req.param('id')
  
  const faq = await c.env.db
    .prepare('SELECT * FROM faqs WHERE id = ?')
    .bind(id)
    .first()
  
  if (!faq) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Question non trouvée
          </div>
          <a href="/admin/faq" class="btn btn-secondary">Retour à la liste</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  return c.render(
    <>
      <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin/faq" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour à la liste
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Modifier la question</h1>
        
        <form method="POST" action={`/admin/faq/${id}`} style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Question *</label>
            <input 
              type="text" 
              name="question" 
              value={faq.question}
              required 
              class="form-input"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Réponse *</label>
            <textarea 
              name="answer" 
              rows="6"
              required
              class="form-textarea"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            >{faq.answer}</textarea>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Enregistrer les modifications
            </button>
            <a href="/admin/faq" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
    </>,
    { title: 'Modifier la question - Admin' }
  )
})

// Traiter la modification de FAQ
app.post('/admin/faq/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  const question = body.question as string
  const answer = body.answer as string
  
  try {
    await c.env.db
      .prepare('UPDATE faqs SET question = ?, answer = ? WHERE id = ?')
      .bind(question, answer, id)
      .run()
    
    return c.redirect('/admin/faq')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href={`/admin/faq/edit/${id}`} class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})

// Supprimer une FAQ
app.post('/admin/faq/:id/delete', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.db
      .prepare('DELETE FROM faqs WHERE id = ?')
      .bind(id)
      .run()
    
    return c.redirect('/admin/faq')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href="/admin/faq" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
// ============================================
// ROUTES ADMIN - GESTION DES FORMULES
// ============================================

// Liste des formules
app.get('/admin/formules', async (c) => {
  const packages = await c.env.db
    .prepare('SELECT * FROM travel_packages ORDER BY sort_order ASC')
    .all()
  
  return c.render(
    <>
      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Gestion des Formules</h1>
        
        <div style={{display: 'grid', gap: '2rem'}}>
          {packages.results.map((pkg: any) => (
            <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '2rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '2rem'}}>
                <div style={{flex: 1}}>
                  <h2 style={{color: 'var(--color-primary)', marginBottom: '1rem'}}>{pkg.name}</h2>
                  <p style={{marginBottom: '0.5rem'}}><strong>Durée :</strong> {pkg.duration}</p>
                  <p style={{marginBottom: '1rem'}}><strong>Description :</strong> {pkg.description}</p>
                  <div style={{display: 'flex', gap: '2rem', marginTop: '1rem'}}>
                    <div>
                      <strong>Prix EUR :</strong> <span style={{fontSize: '1.2rem', color: 'var(--color-primary)'}}>{pkg.price_eur}€</span>
                    </div>
                    <div>
                      <strong>Prix CAD :</strong> <span style={{fontSize: '1.2rem', color: 'var(--color-primary)'}}>{pkg.price_cad}$</span>
                    </div>
                  </div>
                </div>
                <a href={`/admin/formules/edit/${pkg.id}`} class="btn btn-primary">
                  <i class="fas fa-edit"></i> Modifier
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>,
    { title: 'Gestion des Formules - Admin' }
  )
})

// Formulaire de modification de formule
app.get('/admin/formules/edit/:id', async (c) => {
  const id = c.req.param('id')
  
  const pkg = await c.env.db
    .prepare('SELECT * FROM travel_packages WHERE id = ?')
    .bind(id)
    .first()
  
  if (!pkg) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Formule non trouvée
          </div>
          <a href="/admin/formules" class="btn btn-secondary">Retour à la liste</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  return c.render(
    <>
      <div style={{maxWidth: '800px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin/formules" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour à la liste
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Modifier la formule : {pkg.name}</h1>
        
        <form method="POST" action={`/admin/formules/${id}`} style={{background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Nom de la formule *</label>
            <input 
              type="text" 
              name="name" 
              value={pkg.name}
              required 
              class="form-input"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Durée *</label>
            <input 
              type="text" 
              name="duration" 
              value={pkg.duration}
              required 
              class="form-input"
              placeholder="Ex: 7-14 jours"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
            />
          </div>
          
          <div class="form-group" style={{marginBottom: '1.5rem'}}>
            <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Description *</label>
            <textarea 
              name="description" 
              rows="4"
              required
              class="form-textarea"
              style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', fontFamily: 'inherit'}}
            >{pkg.description}</textarea>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
            <div class="form-group">
              <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Prix EUR (€) *</label>
              <input 
                type="number" 
                name="price_eur" 
                value={pkg.price_eur}
                required 
                min="0"
                step="1"
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
              />
            </div>
            
            <div class="form-group">
              <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Prix CAD ($) *</label>
              <input 
                type="number" 
                name="price_cad" 
                value={pkg.price_cad}
                required 
                min="0"
                step="1"
                class="form-input"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem'}}
              />
            </div>
          </div>
          
          <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-save"></i> Enregistrer les modifications
            </button>
            <a href="/admin/formules" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
    </>,
    { title: 'Modifier la formule - Admin' }
  )
})

// Traiter la modification de formule
app.post('/admin/formules/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const name = body.name as string
  const duration = body.duration as string
  const description = body.description as string
  const price_eur = parseInt(body.price_eur as string)
  const price_cad = parseInt(body.price_cad as string)
  
  try {
    await c.env.db
      .prepare('UPDATE travel_packages SET name = ?, duration = ?, description = ?, price_eur = ?, price_cad = ? WHERE id = ?')
      .bind(name, duration, description, price_eur, price_cad, id)
      .run()
    
    return c.redirect('/admin/formules')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href={`/admin/formules/edit/${id}`} class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
// ============================================
// ROUTES ADMIN - GESTION DES PHOTOS
// ============================================

// Liste et upload des photos
app.get('/admin/media', async (c) => {
  const photos = await c.env.db
    .prepare('SELECT * FROM photos ORDER BY created_at DESC')
    .all()
  
  return c.render(
    <>
      <div style={{maxWidth: '1200px', margin: '2rem auto', padding: '2rem'}}>
        <div style={{marginBottom: '2rem'}}>
          <a href="/admin" style={{color: 'var(--color-primary)', textDecoration: 'none'}}>
            <i class="fas fa-arrow-left"></i> Retour au panneau
          </a>
        </div>
        
        <h1 style={{marginBottom: '2rem'}}>Gestion des Photos</h1>
        
        <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '2rem'}}>
          <h2 style={{marginBottom: '1rem'}}>Uploader une nouvelle photo</h2>
          <p style={{color: 'var(--color-text-secondary)', marginBottom: '1rem'}}>
            Note : Pour le moment, l'upload de fichiers nécessite Cloudflare R2 en production. 
            En développement local, vous pouvez ajouter manuellement les images dans <code>/public/static/images/uploads/</code>
          </p>
          <form method="POST" action="/admin/media/upload" enctype="multipart/form-data">
            <div class="form-group" style={{marginBottom: '1rem'}}>
              <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Titre de la photo</label>
              <input 
                type="text" 
                name="title" 
                class="form-input"
                placeholder="Ex: Voyage en Italie"
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            
            <div class="form-group" style={{marginBottom: '1rem'}}>
              <label class="form-label" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600}}>Fichier image *</label>
              <input 
                type="file" 
                name="file" 
                accept="image/*"
                required
                style={{width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px'}}
              />
            </div>
            
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-upload"></i> Uploader
            </button>
          </form>
        </div>
        
        <h2 style={{marginBottom: '1.5rem'}}>Photos uploadées ({photos.results.length})</h2>
        
        {photos.results.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '8px'}}>
            <i class="fas fa-images" style={{fontSize: '4rem', color: 'var(--color-text-secondary)', marginBottom: '1rem'}}></i>
            <p style={{fontSize: '1.2rem', color: 'var(--color-text-secondary)'}}>Aucune photo pour le moment</p>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem'}}>
            {photos.results.map((photo: any) => (
              <div style={{background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden'}}>
                <div style={{aspectRatio: '4/3', background: '#f5f5f5', position: 'relative', overflow: 'hidden'}}>
                  <img 
                    src={photo.url} 
                    alt={photo.title || 'Photo'} 
                    style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  />
                </div>
                <div style={{padding: '1rem'}}>
                  {photo.title && (
                    <h3 style={{marginBottom: '0.5rem', fontSize: '1rem'}}>{photo.title}</h3>
                  )}
                  <p style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem'}}>
                    {new Date(photo.created_at).toLocaleDateString('fr-FR')}                    
                  </p>
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem'}}>
                    <input 
                      type="text" 
                      value={photo.url}
                      readonly
                      onclick="this.select()"
                      style={{flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85rem', fontFamily: 'monospace'}}
                    />
                    <button 
                      onclick="navigator.clipboard.writeText('{photo.url}'); alert('URL copiée !')"
                      style={{padding: '0.5rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                      title="Copier l'URL"
                    >
                      <i class="fas fa-copy"></i>
                    </button>
                  </div>
                  <form method="POST" action={`/admin/media/${photo.id}/delete`} onsubmit="return confirm('Supprimer cette photo ?')">
                    <button 
                      type="submit"
                      style={{width: '100%', padding: '0.5rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem'}}
                    >
                      <i class="fas fa-trash"></i> Supprimer
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>,
    { title: 'Gestion des Photos - Admin' }
  )
})

// Traiter l'upload de photo
app.post('/admin/media/upload', async (c) => {
  console.log('=== DÉBUT UPLOAD ===')
  
  const body = await c.req.parseBody()
  console.log('Body:', body)
  
  const file = body.file as File
  console.log('File:', file)
  
  if (!file) {
    console.log('❌ Aucun fichier détecté')
    return c.redirect('/admin/media?error=no-file')
  }

  // Générer un nom de fichier unique
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  console.log('Filename généré:', filename)
  
  try {
    console.log('Upload vers R2...')
    
    // Upload vers R2
    const arrayBuffer = await file.arrayBuffer()
    console.log('ArrayBuffer créé, taille:', arrayBuffer.byteLength)
    
    await c.env.PHOTOS_BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    console.log('✅ Upload R2 réussi!')
    
    // URL publique
    const publicUrl = `https://pub-d405710240234e2fa868c5dc2e1f8cdb.r2.dev/${filename}`
    console.log('URL publique:', publicUrl)
    
    // Enregistrer dans la DB
    await c.env.db
      .prepare('INSERT INTO photos (url, caption, created_at) VALUES (?, ?, ?)')
      .bind(publicUrl, file.name, new Date().toISOString())
      .run()
    
    console.log('✅ Enregistré dans la DB')
    
    return c.redirect('/admin/media')
  } catch (error) {
    console.error('❌ Upload error:', error)
    return c.redirect('/admin/media?error=upload-failed')
  }
})
// Supprimer une photo
app.post('/admin/media/:id/delete', async (c) => {
  const id = c.req.param('id')
  
  try {
    await c.env.db
      .prepare('DELETE FROM photos WHERE id = ?')
      .bind(id)
      .run()
    
    return c.redirect('/admin/media')
  } catch (error) {
    return c.render(
      <>
        <div style={{maxWidth: '600px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '8px'}}>
          <div style={{color: 'red', padding: '1rem', background: '#ffe6e6', borderRadius: '4px', marginBottom: '1rem'}}>
            ❌ Erreur : {error.message}
          </div>
          <a href="/admin/media" class="btn btn-secondary">Retour</a>
        </div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
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



export default app
