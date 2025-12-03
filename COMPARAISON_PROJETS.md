# 🔄 COMPARAISON DES DEUX PROJETS

**Comprendre la différence entre le site principal et le chatbot standalone**

---

## 📊 VUE D'ENSEMBLE

Vous avez **2 projets distincts** liés aux Voyages de Jess :

| Aspect | Site Principal | Chatbot Standalone |
|--------|---------------|-------------------|
| **Nom** | site-les-voyages-de-Jess | jessica-travel-bot |
| **Repository** | [site-les-voyages-de-Jess](https://github.com/kevinlecoq/site-les-voyages-de-Jess) | [jessica-travel-bot](https://github.com/kevinlecoq/jessica-travel-bot) |
| **Commit actuel** | `0836721` | `ba92a7f` |
| **Déploiement** | À faire | ✅ [En production](https://63960e63.jessica-travel-bot.pages.dev) |
| **Dans sandbox** | ✅ Oui (`/home/user/webapp`) | ❌ Non |

---

## 🌐 PROJET 1 : SITE PRINCIPAL

### 📁 Repository
```
https://github.com/kevinlecoq/site-les-voyages-de-Jess
```

### 🎯 Objectif
Site web complet pour Les Voyages de Jess avec **chatbot intégré**.

### 🏗️ Architecture
- **Framework** : Hono (backend) + JSX (frontend)
- **Hébergement** : Cloudflare Pages
- **Base de données** : Cloudflare D1 (SQLite)
- **IA** : Claude Sonnet 4 (API Anthropic)

### 📄 Pages disponibles
1. **Accueil** (`/`)
2. **Qui suis-je** (`/qui-suis-je`)
3. **Mes Formules** (`/mes-formules`)
4. **Destinations** (`/destinations`)
5. **Voyage sur Mesure** (`/voyage-sur-mesure`)
6. **FAQ** (`/faq`)
7. **Blog** (`/blog`)
8. **Contact** (`/contact`)

### 💬 Chatbot
- **Intégration** : Widget flottant sur toutes les pages
- **Design** : Harmonisé avec le site (vert sauge)
- **Fonctionnalités** :
  - Mémoire de conversation
  - Détection automatique de devise (CAD/EUR/USD)
  - Suggestions strictes sur 36 destinations
  - Connexion à la base de données du site

### 🔑 Configuration
```bash
# .dev.vars (local)
ANTHROPIC_API_KEY=sk-ant-api03-...

# Cloudflare (production)
wrangler secret put ANTHROPIC_API_KEY
```

### 📦 Dépendances clés
```json
{
  "@anthropic-ai/sdk": "^0.70.1",
  "hono": "^4.10.4",
  "vite": "^6.3.5",
  "wrangler": "^4.4.0"
}
```

### 🚀 Déploiement
```bash
npm run build
npm run deploy
```

### ✅ Avantages
- Site complet avec toutes les fonctionnalités
- Chatbot parfaitement intégré au design
- Une seule base de données pour tout
- SEO optimal (toutes les pages indexables)

### ❌ Inconvénients
- Plus complexe à maintenir
- Nécessite de déployer tout le site pour modifier le chatbot
- Plus lourd (plusieurs pages)

---

## 💬 PROJET 2 : CHATBOT STANDALONE

### 📁 Repository
```
https://github.com/kevinlecoq/jessica-travel-bot
```

### 🌐 URL de production
```
https://63960e63.jessica-travel-bot.pages.dev
```

### 🎯 Objectif
Version **autonome** du chatbot, intégrable partout via un simple script.

### 🏗️ Architecture
- **Framework** : HTML/CSS/JS pur (pas de framework)
- **Hébergement** : Cloudflare Pages
- **IA** : Claude Sonnet 4 (API Anthropic)
- **API** : Workers API Cloudflare

### 📄 Pages disponibles
1. **Chat Interface** (`/`) - Interface du chatbot uniquement
2. **API Endpoint** (`/api/chat`) - Pour intégrer dans d'autres sites

### 💬 Chatbot
- **Intégration** : Peut être embarqué dans n'importe quel site via `<iframe>` ou script
- **Design** : Similaire au site principal
- **Fonctionnalités** :
  - Identiques au chatbot du site principal
  - Peut être utilisé indépendamment
  - Même modèle IA (Sonnet 4)
  - Même prompt strict (36 destinations)

### 🔌 Intégration dans d'autres sites
```html
<!-- Méthode 1 : iFrame -->
<iframe 
  src="https://63960e63.jessica-travel-bot.pages.dev" 
  width="400" 
  height="600"
  frameborder="0">
</iframe>

<!-- Méthode 2 : Widget JavaScript (à développer) -->
<script src="https://63960e63.jessica-travel-bot.pages.dev/widget.js"></script>
<div id="jess-chatbot"></div>
```

### 🔑 Configuration
```bash
# Cloudflare (production uniquement)
wrangler secret put ANTHROPIC_API_KEY
```

### 📦 Dépendances clés
```json
{
  "@anthropic-ai/sdk": "^0.70.1",
  "wrangler": "^4.4.0"
}
```

### 🚀 Déploiement
```bash
wrangler pages deploy
```

### ✅ Avantages
- Léger et rapide
- Peut être intégré partout (iframe, widget)
- Déploiement indépendant du site principal
- Facile à tester et itérer

### ❌ Inconvénients
- Pas de contexte du site (pas d'accès à la BDD du site)
- Moins intégré visuellement
- Fonctionnalité unique (juste le chat)

---

## 🤔 QUAND UTILISER QUEL PROJET ?

### Utilisez le **SITE PRINCIPAL** si vous voulez :
- ✅ Développer le site complet
- ✅ Ajouter des pages (blog, nouvelles formules, etc.)
- ✅ Modifier le design global
- ✅ Avoir le chatbot parfaitement intégré
- ✅ Travailler sur la base de données (formules, FAQ, etc.)

### Utilisez le **CHATBOT STANDALONE** si vous voulez :
- ✅ Tester rapidement des modifications du chatbot
- ✅ Intégrer le chatbot dans un autre site (ex: Wix, WordPress, etc.)
- ✅ Avoir une version indépendante pour démo/tests
- ✅ Développer une API chatbot réutilisable

---

## 🔄 SYNCHRONISATION ENTRE LES DEUX PROJETS

### Prompt système
**IMPORTANT** : Les deux projets doivent avoir **le même prompt** pour cohérence.

Si vous modifiez le prompt dans un projet, copiez-le dans l'autre :

**Site principal** : `/src/index.tsx` (lignes 180-278)  
**Chatbot standalone** : `/functions/api/chat.js` (ou fichier équivalent)

### Modèle IA
Les deux projets utilisent actuellement :
```
claude-sonnet-4-20250514
```

Si vous changez de modèle, mettez à jour les deux projets.

### Clé API
Les deux projets utilisent la **même clé API Anthropic**, mais configurée différemment :

| Projet | Configuration |
|--------|--------------|
| Site principal | `.dev.vars` (local) + Cloudflare Secret (prod) |
| Chatbot standalone | Cloudflare Secret uniquement (pas de dev local pour l'instant) |

---

## 📊 TABLEAU RÉCAPITULATIF

| Fonctionnalité | Site Principal | Chatbot Standalone |
|---------------|---------------|-------------------|
| **Pages web** | 8 pages complètes | 1 page (chat uniquement) |
| **Base de données** | ✅ D1 (formules, FAQ, blog) | ❌ Aucune |
| **Chatbot IA** | ✅ Intégré | ✅ Autonome |
| **Modèle IA** | Claude Sonnet 4 | Claude Sonnet 4 |
| **Prompt** | Ultra-strict (36 destinations) | Identique |
| **Design** | Complet (hero, footer, etc.) | Minimal (widget uniquement) |
| **Déploiement** | À faire | ✅ En production |
| **Intégrable ailleurs** | ❌ Non | ✅ Oui (iframe/widget) |
| **Maintenance** | Complexe | Simple |
| **SEO** | ✅ Toutes les pages | ❌ Une seule page |

---

## 🎯 RECOMMANDATIONS

### Pour le développement actuel
1. **Site principal** → Utilisez celui-ci comme projet principal
2. **Chatbot standalone** → Gardez comme backup et pour tests rapides

### Pour le futur
1. **Déployez le site principal** pour remplacer/compléter le chatbot standalone
2. **Maintenez la synchronisation** du prompt entre les deux projets
3. **Utilisez le chatbot standalone** pour des intégrations externes (si besoin)

### Pour AutomAître
C'est un **projet complètement séparé**, ne pas confondre avec Les Voyages de Jess.

---

## 🚀 QUELLE SANDBOX POUR QUEL PROJET ?

### Sandbox actuelle (`/home/user/webapp`)
- **Projet chargé** : Site principal (site-les-voyages-de-Jess)
- **Pour travailler dessus** : Rien à faire, c'est déjà prêt !

### Pour charger le chatbot standalone
Si vous voulez travailler sur le chatbot standalone, il faudrait :

```bash
# Cloner le repo dans un autre dossier
cd /home/user
git clone https://github.com/kevinlecoq/jessica-travel-bot.git

cd jessica-travel-bot
npm install
```

**MAIS** : Vous ne pouvez avoir qu'un seul projet "actif" en même temps dans `/home/user/webapp` selon vos contraintes.

---

## 💡 CONSEIL

**Pour l'instant, concentrez-vous sur le SITE PRINCIPAL** (`/home/user/webapp`), car :
1. C'est le projet le plus complet
2. Il inclut déjà le chatbot
3. Le chatbot standalone est déjà déployé et fonctionnel
4. Vous pourrez toujours synchroniser les modifications plus tard

---

**Kevin, vous avez maintenant une vision claire des deux projets !** 🎉

Besoin d'aide pour démarrer l'un ou l'autre ? Consultez `GUIDE_DEMARRAGE_RAPIDE.md` !
