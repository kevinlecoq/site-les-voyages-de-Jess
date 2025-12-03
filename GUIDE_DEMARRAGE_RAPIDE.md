# 🚀 GUIDE DE DÉMARRAGE RAPIDE - Les Voyages de Jess

**Pour reprendre rapidement le développement**

---

## ⚡ DÉMARRAGE EN 3 ÉTAPES

### Étape 1 : Configuration de la clé API (OBLIGATOIRE)

Le chatbot a besoin d'une clé API Anthropic pour fonctionner.

```bash
cd /home/user/webapp

# Créer le fichier .dev.vars
cat > .dev.vars << 'EOF'
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ANTHROPIC_ICI
EOF

# Vérifier que le fichier est créé (NE PAS afficher le contenu en production!)
ls -la .dev.vars
```

**🔑 Où trouver votre clé API ?**
- Allez sur : https://console.anthropic.com/
- Créez une clé API si vous n'en avez pas
- Copiez-la et remplacez `VOTRE_CLE_ANTHROPIC_ICI`

---

### Étape 2 : Installer les dépendances

```bash
cd /home/user/webapp
npm install
```

---

### Étape 3 : Lancer le serveur

```bash
cd /home/user/webapp
npm run dev
```

Le site sera accessible sur `http://localhost:5173` (ou le port indiqué dans le terminal).

**Dans un environnement sandbox E2B** :
```bash
# Utilisez --host pour rendre accessible de l'extérieur
cd /home/user/webapp && npx vite dev --host 0.0.0.0 --port 5173
```

---

## 🧪 TESTER LE CHATBOT

### 1. Ouvrir le site
Une fois le serveur lancé, ouvrez votre navigateur.

### 2. Cliquer sur le bouton du chatbot
En bas à droite, vous verrez un bouton flottant : **💬**

### 3. Poser des questions au chatbot

#### ✅ Questions qui fonctionnent bien
```
"Je veux visiter l'Italie, que me conseilles-tu ?"
"Quelles destinations en Asie proposes-tu ?"
"Je cherche une destination nature en Europe"
"Quelle est la différence entre tes formules ?"
"Je veux partir au Canada, c'est possible ?"
```

#### 🧪 Tester la limite des destinations (doit rediriger)
```
"Je veux aller au Japon"
→ Le chatbot devrait dire que Jess ne couvre pas le Japon
→ Et suggérer : Thaïlande, Indonésie (Bali), ou Cambodge

"Je veux visiter l'Afrique du Sud"
→ Le chatbot devrait dire que Jess ne couvre aucun pays d'Afrique
→ Et suggérer : Costa Rica, Norvège, ou Pérou (pour nature/aventure)

"Propose-moi une destination pour voir des aurores boréales"
→ Le chatbot devrait suggérer : Norvège, Finlande, ou Canada
→ PAS l'Islande (non couverte)
```

#### ❌ Ce que le chatbot NE DOIT PAS faire
- Suggérer des pays hors de la liste des 36 destinations
- Donner des itinéraires détaillés complets
- Donner des listes d'activités spécifiques avec noms de lieux
- Remplacer Jess (il doit toujours inviter à la contacter)

---

## 🔍 VÉRIFICATIONS IMPORTANTES

### Vérifier que le chatbot fonctionne
1. Ouvrez la console du navigateur (F12)
2. Cliquez sur "💬" pour ouvrir le chatbot
3. Envoyez un message de test
4. Regardez les logs dans la console

**Erreurs possibles** :
- `ANTHROPIC_API_KEY not found` → Vérifiez votre `.dev.vars`
- `fetch failed` → Vérifiez votre connexion internet
- `401 Unauthorized` → Votre clé API est invalide ou expirée

### Vérifier la mémoire de conversation
1. Posez une première question : "Je veux visiter l'Italie"
2. Posez une question de suivi : "Quelle est la meilleure période ?"
3. Le chatbot devrait se souvenir que vous parliez de l'Italie

---

## 🌐 PAGES À TESTER

### Navigation
- [ ] **Accueil** (`/`) - Hero, formules, CTA
- [ ] **Qui suis-je** (`/qui-suis-je`) - Bio de Jessica
- [ ] **Mes Formules** (`/mes-formules`) - Détails des 3 formules
- [ ] **Destinations** (`/destinations`) - Liste des 36 pays
- [ ] **Voyage sur Mesure** (`/voyage-sur-mesure`) - Processus
- [ ] **FAQ** (`/faq`) - Questions fréquentes
- [ ] **Blog** (`/blog`) - Articles (vide actuellement)
- [ ] **Contact** (`/contact`) - Formulaire

### Menu hamburger
- [ ] Cliquer sur le menu hamburger (en haut à gauche)
- [ ] Vérifier que la sidebar s'ouvre
- [ ] Tester tous les liens du menu
- [ ] Cliquer sur l'overlay pour fermer

### Widget chatbot
- [ ] Le bouton 💬 est visible sur toutes les pages
- [ ] Le widget s'ouvre et se ferme correctement
- [ ] Les messages s'affichent bien
- [ ] L'historique est conservé lors de la navigation

---

## 🚀 DÉPLOIEMENT SUR CLOUDFLARE

### 1. Build du projet
```bash
cd /home/user/webapp
npm run build
```

### 2. Configurer la clé API sur Cloudflare
```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Puis coller votre clé API quand demandé
```

### 3. Déployer
```bash
npm run deploy
```

Le site sera accessible sur une URL Cloudflare Pages (ex: `https://xxxxx.pages.dev`).

---

## 🐛 DÉPANNAGE

### Le chatbot ne s'affiche pas
1. Vérifiez que `/static/js/chatbot.js` se charge bien
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Vérifiez le CSS du widget dans `/static/css/styles.css`

### Le chatbot ne répond pas
1. Vérifiez votre clé API dans `.dev.vars`
2. Vérifiez que le serveur est bien lancé
3. Regardez les logs de l'API dans le terminal
4. Regardez la console du navigateur (F12 → Network)

### Erreur "ANTHROPIC_API_KEY not found"
1. Vérifiez que le fichier `.dev.vars` existe
2. Vérifiez qu'il contient bien `ANTHROPIC_API_KEY=sk-ant-api03-...`
3. Redémarrez le serveur après avoir modifié `.dev.vars`

### Le site ne démarre pas
1. Vérifiez que Node.js est installé : `node --version`
2. Vérifiez que les dépendances sont installées : `npm install`
3. Regardez les erreurs dans le terminal

---

## 📝 MODIFIER LE CHATBOT

### Changer le modèle Claude
Éditez `/src/index.tsx`, ligne 177 :
```typescript
model: 'claude-sonnet-4-20250514',  // Modèle actuel
```

### Modifier le prompt système
Éditez `/src/index.tsx`, lignes 180-278 (section `system:`).

**⚠️ ATTENTION** : Le prompt actuel est ultra-strict sur les 36 destinations. Si vous le modifiez, assurez-vous de conserver cette contrainte !

### Modifier l'apparence du widget
Éditez `/public/static/css/styles.css`, section "CHATBOT WIDGET" (ligne ~510+).

### Modifier le message d'accueil
Éditez `/src/index.tsx`, ligne 126 :
```tsx
<p>👋 Bonjour ! Je suis l'assistant de Jess. Comment puis-je vous aider à planifier votre voyage ?</p>
```

---

## 🎯 COMMANDES GIT

### Voir l'état actuel
```bash
cd /home/user/webapp
git status
git log --oneline -10
```

### Créer une nouvelle branche
```bash
git checkout -b nouvelle-fonctionnalite
```

### Commit et push
```bash
git add .
git commit -m "feat: Description de la modification"
git push origin main
```

---

## 📞 LIENS UTILES

- **Chatbot standalone en prod** : https://63960e63.jessica-travel-bot.pages.dev
- **Repository GitHub** : https://github.com/kevinlecoq/site-les-voyages-de-Jess
- **Anthropic Console** : https://console.anthropic.com/
- **Documentation Claude** : https://docs.anthropic.com/
- **Cloudflare Dashboard** : https://dash.cloudflare.com/

---

## 💡 ASTUCES

1. **Tests rapides du chatbot** : Posez des questions sur des pays non couverts (Japon, Islande, Afrique du Sud) pour vérifier que le chatbot redirige correctement.

2. **Développement** : Gardez la console du navigateur ouverte (F12) pour voir les logs en temps réel.

3. **Hot reload** : Vite recharge automatiquement le navigateur quand vous modifiez le code.

4. **Historique** : Le chatbot garde l'historique de conversation en mémoire jusqu'au rechargement de la page.

5. **Multi-devises** : Le chatbot détecte automatiquement la devise de l'utilisateur (CAD par défaut).

---

**Prêt à développer !** 🎉

Si vous avez des questions, consultez `ETAT_ACTUEL.md` ou `README_CHATBOT.md`.
