# 🚨 BRIEF POUR LE PROCHAIN AGENT - SITE LES VOYAGES DE JESS

**Date** : 20 mars 2026  
**Projet** : https://github.com/kevinlecoq/site-les-voyages-de-Jess  
**Site production** : https://lesvoyagesdejess.com  
**Dernier déploiement** : https://0d4add4a.les-voyages-de-jess.pages.dev

---

## ✅ PROBLÈME RÉSOLU (SESSION ACTUELLE)

### **✨ Carousel homepage - FONCTIONNEL**

**Solution finale (V4)** :
- ✅ Format universel : accepte tous les formats d'image
- ✅ Recadrage automatique en carré (aspect-ratio 1:1)
- ✅ Background-image avec position center 35% (évite le ciel)
- ✅ Auto-scroll toutes les 3 secondes avec pause au hover
- ✅ Images cliquables vers articles
- ✅ Pas de texte, seulement images
- ✅ Responsive (3 desktop, 2 tablette, 1 mobile)

**Commit final** : `10c702c` - feat(carousel): nouveau carousel V4 - format universel

**Classes utilisées** :
- `.homepage-carousel-wrapper` (container)
- `.homepage-carousel-track` (scroll horizontal)
- `.carousel-item-link` (lien cliquable)
- `.carousel-item-image` (background-image)
- `.carousel-nav-btn` (boutons prev/next)

**JavaScript** : `scrollCarouselHome()` dans `/public/static/js/app.js`

---

## 🎯 TÂCHES RESTANTES (Priorités du brief initial)

### **PRIORITÉ 2 : Simplifier la page /blog** ⭐

**Objectif** : Afficher uniquement **image + titre + bouton "Lire l'article"** (pas de date, pas d'excerpt).

**Fichier** : `src/index.tsx` lignes ~1290-1360 (route `/blog`)

**Modifications à faire** :
```tsx
// RETIRER ces éléments :
<p class="blog-card-date">
  <i class="far fa-calendar"></i> {date}
</p>
<p>{post.excerpt}</p>

// GARDER uniquement :
<img src={post.featured_image} />
<h3>{post.title}</h3>
<button class="blog-read-more" data-slug={post.slug}>
  Lire l'article
</button>
```

---

### **PRIORITÉ 3 : Éditeur riche pour les articles** ⭐⭐⭐

**Objectif** : Jessica doit pouvoir **formater son contenu** (titres, gras, italique, images, listes) dans l'admin.

**Solution recommandée** : Intégrer **TinyMCE** (éditeur WYSIWYG)

**Fichiers concernés** :
- `/src/index.tsx` lignes ~2360-2480 (admin form)
- Remplacer `<textarea id="content">` par un éditeur riche
- Stocker HTML brut en DB (champ `content`)

**Exemple TinyMCE** :
```html
<script src="https://cdn.tiny.cloud/1/YOUR_API_KEY/tinymce/6/tinymce.min.js"></script>
<script>
  tinymce.init({
    selector: '#content',
    plugins: 'image link lists',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | image link',
    images_upload_handler: function(blobInfo, success, failure) {
      // Upload vers /admin/blog/upload-image
      const formData = new FormData();
      formData.append('image', blobInfo.blob());
      
      fetch('/admin/blog/upload-image', {
        method: 'POST',
        body: formData
      })
      .then(r => r.json())
      .then(data => success(data.url))
      .catch(err => failure('Upload failed'));
    }
  });
</script>
```

---

## 📂 ÉTAT ACTUEL DU PROJET

### **Fonctionnalités opérationnelles** ✅
- ✅ **Carousel homepage V4** : format universel, auto-scroll, images carrées
- ✅ Navigation dynamique blog (articles s'affichent dans `/blog` sans reload)
- ✅ Upload d'images R2 via admin
- ✅ CRUD articles complet (create, read, update, delete)
- ✅ Page `/blog` avec liste articles
- ✅ Affichage article individuel avec date et contenu
- ✅ Bouton "Retour au blog" fonctionnel

### **À améliorer** ⚠️
- ⚠️ Page `/blog` : simplifier (retirer date et excerpt)
- ⚠️ Éditeur admin basique (textarea simple, pas de formatage)

### **Stack technique**
- **Framework** : Hono (Cloudflare Workers)
- **Frontend** : JSX inline (pas de React)
- **Base de données** : D1 (SQLite Cloudflare)
- **Stockage images** : R2 (Cloudflare)
- **Build** : Vite
- **Déploiement** : Cloudflare Pages via `npm run deploy`

---

## 🗂️ STRUCTURE FICHIERS CLÉS

```
/home/user/webapp/
├── src/
│   └── index.tsx                     # Routes + HTML (3667 lignes)
│       ├── Lignes 594-802           → Page d'accueil (carousel L744-792)
│       ├── Lignes 1292-1436         → Route /blog (liste articles)
│       ├── Lignes 2738-2680         → Route /blog/:slug (article)
│       └── Lignes 2286-2562         → Admin blog (form, upload)
│
├── public/static/
│   ├── css/
│   │   └── styles.css               # CSS principal (1300 lignes)
│   │       └── Lignes 1028-1145     → Carousel homepage V4
│   │
│   └── js/
│       ├── app.js                   # JavaScript carousel + auto-scroll
│       └── blog-navigation.js       # Navigation dynamique blog
│
├── backup-carousel-v4-success-*.tar.gz  # Sauvegardes du code fonctionnel
├── package.json                          # Dependencies
├── wrangler.jsonc                        # Config Cloudflare
└── vite.config.ts                        # Config build
```

---

## 🔧 COMMANDES UTILES

```bash
# Build local
npm run build

# Déploiement Cloudflare
npm run deploy

# Dev local (attention : pas de DB locale)
npm run dev

# Git workflow
git add .
git commit -m "message"
git push origin main
```

---

## 📝 LEÇONS APPRISES (Session actuelle)

### **🚨 PROBLÈME DE CACHE CLOUDFLARE PAGES**

**Symptôme** : Les modifications du code ne s'appliquaient pas malgré les déploiements réussis.

**Cause** : Cloudflare Pages garde en cache le worker bundlé (`_worker.js`) même avec de nouveaux déploiements.

**Solution qui a fonctionné** :
1. ✅ **Suppression complète** de la section problématique
2. ✅ **Déploiement** pour vider le cache
3. ✅ **Recréation from scratch** avec nouveaux noms de classes

**⚠️ Si le problème se reproduit** :
- Supprimer temporairement la section
- Déployer
- Recréer avec des noms de classes complètement différents

### **✅ BONNES PRATIQUES DÉCOUVERTES**

1. **Background-image > <img>** pour le carousel
   - Meilleur contrôle du recadrage
   - `background-position: center 35%` évite le ciel
   - `aspect-ratio: 1/1` force le carré

2. **Noms de classes uniques**
   - Utiliser des noms jamais utilisés avant
   - Ex : `homepage-carousel-*` au lieu de `blog-card-*`

3. **Test de validation**
   - Supprimer temporairement pour tester si les modifications passent
   - Si suppression fonctionne → recréer from scratch

---

## 🚨 ALERTES & PIÈGES

### **⚠️ Cache Cloudflare**
Kevin vide systématiquement le cache navigateur après chaque déploiement. Ne **JAMAIS** dire "c'est le cache" sans preuve concrète.

### **⚠️ CSS ne s'applique pas**
Si un changement CSS ne fonctionne pas :
1. Vérifier que le fichier est bien dans `public/static/css/`
2. Vérifier le build (`npm run build`)
3. Vérifier le CSS déployé via DevTools
4. **Si ça persiste** : Supprimer temporairement, déployer, recréer

### **⚠️ Images R2**
Les images sont stockées sur R2 avec URLs :
- Format : `/r2/blog/[timestamp]-[random].jpg`
- Pas de resize automatique
- Uploader des images **optimisées** (max 2000px largeur)

### **⚠️ Git workflow**
Kevin fait `git pull origin main` **AVANT** chaque `npm run deploy`.  
Toujours commit + push **AVANT** de lui demander de déployer.

---

## 📦 SAUVEGARDES DISPONIBLES

**Archive** : `backup-carousel-v4-success-20260320-145714.tar.gz` (17 Mo)

**Contenu** :
- Code source complet (`src/`)
- Assets statiques (`public/`)
- Fichiers de configuration

**Restaurer** :
```bash
cd /home/user/webapp
tar -xzf backup-carousel-v4-success-20260320-145714.tar.gz
npm install
npm run build
```

---

## 📞 CONTACT & VALIDATION

**Client** : Kevin (développeur technique, exigeant sur la qualité)

**Attentes** :
- ✅ Solutions qui **fonctionnent du premier coup**
- ✅ Explication claire des changements
- ✅ Pas d'essais/erreurs multiples
- ✅ Commit messages descriptifs
- ❌ Ne **JAMAIS** dire "c'est le cache" sans preuve
- ❌ Ne **JAMAIS** proposer 5-6 solutions consécutives qui échouent

**Validation requise** :
Après chaque phase, demander à Kevin de :
1. `git pull origin main`
2. `npm run deploy`
3. Tester la fonctionnalité
4. Valider ✅ ou signaler problème ❌

---

## 📚 RESSOURCES UTILES

- **Documentation Hono** : https://hono.dev
- **Cloudflare D1** : https://developers.cloudflare.com/d1/
- **Cloudflare R2** : https://developers.cloudflare.com/r2/
- **TinyMCE** : https://www.tiny.cloud/docs/
- **Swiper.js** : https://swiperjs.com/

---

## 🎯 OBJECTIF FINAL

**Site fonctionnel avec** :
1. ✅ Carousel homepage attractif (images carrées, auto-scroll, format universel) **FAIT**
2. ⏳ Page blog épurée (image + titre + bouton) **À FAIRE**
3. ⏳ Articles formatés richement (titres, gras, italique, images inline) **À FAIRE**
4. ⏳ Expérience admin intuitive (éditeur WYSIWYG) **À FAIRE**
5. ✅ Pas de bugs visuels (images bien affichées partout) **FAIT**

---

**Dernière mise à jour** : 20 mars 2026, 15h00  
**Dernier commit fonctionnel** : `10c702c` - feat(carousel): nouveau carousel V4  
**Statut** : 🟢 Carousel homepage résolu - Priorités 2 et 3 en attente

**BON COURAGE ! 💪**
