# Configuration du Chatbot IA - Les Voyages de Jess

## ✅ Ce qui a été intégré

Le chatbot IA est maintenant **entièrement intégré** dans le site Les Voyages de Jess !

### Fonctionnalités :
- ✅ Widget flottant accessible sur **toutes les pages**
- ✅ Design harmonisé avec les couleurs du site (vert sauge)
- ✅ Assistant personnalisé : "Je suis l'assistant de Jess"
- ✅ Mémoire de conversation
- ✅ Détection automatique de devise (CAD/EUR/USD)
- ✅ Réponses structurées via Claude Haiku

---

## 🔧 Configuration requise

### 1. Clé API Anthropic

Vous devez configurer votre clé API Anthropic dans le fichier `.dev.vars` :

```bash
# Ouvrez le fichier .dev.vars
nano .dev.vars

# Remplacez "your_anthropic_api_key_here" par votre vraie clé API
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Où trouver votre clé ?**
- Allez sur : https://console.anthropic.com/
- Créez une clé API si vous n'en avez pas
- Copiez-la et collez-la dans `.dev.vars`

---

## 🚀 Démarrage du site avec chatbot

```bash
# 1. Installer les dépendances (si pas déjà fait)
npm install

# 2. Démarrer en mode développement
npm run dev

# 3. Ou utiliser Wrangler pour tester avec Cloudflare Workers
npm run build
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

Le site sera accessible sur `http://localhost:5173` (ou le port indiqué).

Le chatbot apparaîtra en bas à droite sur **toutes les pages** ! 💬

---

## 🎨 Personnalisation

### Modifier le message d'accueil
Éditez `/public/static/js/chatbot.js` :

```javascript
// Ligne ~14 dans le HTML du widget
"👋 Bonjour ! Je suis l'assistant de Jess..."
```

### Modifier le prompt système
Éditez `/src/index.tsx`, section API chatbot (ligne ~120) :

```javascript
system: `Tu es un assistant de voyage expert pour 'Les Voyages de Jess'...`
```

### Changer les couleurs
Éditez `/public/static/css/styles.css`, section CHATBOT WIDGET (ligne ~510+)

---

## 📦 Déploiement sur Cloudflare

```bash
# 1. Build le projet
npm run build

# 2. Configurer la clé API dans Cloudflare
wrangler secret put ANTHROPIC_API_KEY
# Puis collez votre clé API quand demandé

# 3. Déployer
npm run deploy
```

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Le fichier `.dev.vars` contient votre clé API et **ne doit JAMAIS être commité sur Git**.

Il est déjà dans `.gitignore`, mais vérifiez toujours avant de push :

```bash
git status  # .dev.vars ne doit PAS apparaître
```

---

## 🆘 Dépannage

### Le chatbot ne s'affiche pas
- Vérifiez que `/static/js/chatbot.js` se charge bien
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Erreur "ANTHROPIC_API_KEY not found"
- Vérifiez que `.dev.vars` contient votre clé API
- Redémarrez le serveur après avoir modifié `.dev.vars`

### Le chatbot ne répond pas
- Vérifiez votre clé API Anthropic
- Vérifiez votre connexion internet
- Regardez les logs dans la console (F12 → Network)

---

## 📞 Support

Pour toute question sur le chatbot, référez-vous à la documentation de :
- Anthropic Claude : https://docs.anthropic.com/
- Cloudflare Workers : https://developers.cloudflare.com/workers/

---

✨ **Le chatbot est maintenant intégré et prêt à utiliser !**
