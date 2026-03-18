# 🚨 BRIEF POUR LE PROCHAIN AGENT - SITE LES VOYAGES DE JESS

**Date** : 18 mars 2026  
**Projet** : https://github.com/kevinlecoq/site-les-voyages-de-Jess  
**Site production** : https://lesvoyagesdejess.com  
**Dernière preview** : https://689e3e08.les-voyages-de-jess.pages.dev

---

## ⚠️ PROBLÈME NON RÉSOLU (SESSION PRÉCÉDENTE)

### **Carousel page d'accueil - Images zoomées sur le ciel**

**Symptôme** :  
Les images du carousel "Articles récents" sur la page d'accueil affichent uniquement le **haut de l'image (le ciel)** au lieu du **contenu principal (fjord Norvège, roches Turquie, carte avec carnet)**.

**Tentatives infructueuses** (7 commits, aucune solution) :
1. ❌ `dc1d204` - Ajout `flex-direction: column` → Pas d'effet
2. ❌ `b57e796` - Remplacement `<div background-image>` par `<img>` → Pas d'effet
3. ❌ `38f33b6` - Hauteur fixe 450px + ellipsis texte → Empiré le problème
4. ❌ `99811f4` - Revert du commit précédent → Retour état antérieur
5. ❌ `4ccaa5e` - Ajout `align-items: flex-start` → Pas d'effet
6. ❌ `24c6c6b` - Changement `object-fit: cover` → `contain` → Images petites avec bandes grises
7. ❌ `e7fb031` - Hauteur 350px + retour `object-fit: cover` → Toujours que le ciel
8. ❌ `d3a033b` - Ajout `object-position: center 65%` → **TOUJOURS PAS RÉSOLU**

**CSS actuel (non fonctionnel)** :
```css
.blog-card-image {
  width: 100%;
  height: 350px;
  object-fit: cover;
  object-position: center 65%;
  display: block;
  flex-shrink: 0;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
```

**Fichiers concernés** :
- `/home/user/webapp/public/static/css/styles.css` (lignes ~1043-1052)
- `/home/user/webapp/src/index.tsx` (lignes ~758-778 - carousel homepage)

---

## 🎯 OBJECTIFS PRIORITAIRES

### **PRIORITÉ 1 : Résoudre le carousel page d'accueil** ⭐⭐⭐

**Objectif** : Créer un **nouveau carousel** avec images **format carré** (1:1 ou proche) qui **défile automatiquement**.

**Spécifications** :
- ✅ Images **format carré** (ratio 1:1 ou 4:3 max)
- ✅ **Défilement automatique** (toutes les 5-7 secondes)
- ✅ Pause au hover
- ✅ Boutons navigation prev/next conservés
- ✅ **Supprimer** : titre, texte description, bouton "Lire l'article"
- ✅ **Clic sur l'image** → Redirection vers `/blog?article=slug`
- ✅ Images doivent **toujours afficher le contenu principal** (pas le ciel)

**Approche recommandée** :
- Option A : Utiliser un vrai plugin carousel (Swiper.js, Splide.js)
- Option B : Recadrer les images **avant upload** en carré via traitement serveur
- Option C : CSS avec `aspect-ratio: 1 / 1` + `object-fit: cover` + recadrage manuel admin

---

### **PRIORITÉ 2 : Simplifier le carousel homepage** ⭐⭐

**Objectif** : Retirer texte et boutons du carousel page d'accueil.

**Modifications** :
```tsx
// AVANT (src/index.tsx lignes ~758-778)
<div class="blog-card">
  <img src={post.featured_image} alt={post.title} class="blog-card-image" />
  <div class="blog-card-content">
    <h3>{post.title}</h3>
    <p>{post.excerpt}</p>
    <a href={`/blog?article=${post.slug}`}>Lire l'article</a>
  </div>
</div>

// APRÈS
<a href={`/blog?article=${post.slug}`} class="blog-card-link">
  <img src={post.featured_image} alt={post.title} class="blog-card-image-only" />
</a>
```

**CSS à ajouter** :
```css
.blog-card-link {
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.blog-card-link:hover {
  transform: scale(1.05);
}

.blog-card-image-only {
  width: 100%;
  aspect-ratio: 1 / 1; /* Force le carré */
  object-fit: cover;
  border-radius: var(--radius-lg);
}
```

---

### **PRIORITÉ 3 : Simplifier la page /blog** ⭐

**Objectif** : Afficher uniquement **image + bouton "Lire l'article"** (pas de date, pas d'excerpt).

**Fichier** : `src/index.tsx` lignes ~1290-1360 (route `/blog`)

**Modifications HTML** :
```tsx
// RETIRER
<p class="blog-card-date">
  <i class="far fa-calendar"></i> {date}
</p>
<p>{post.excerpt}</p>

// GARDER
<img src={post.featured_image} />
<h3>{post.title}</h3>
<button class="blog-read-more" data-slug={post.slug}>
  Lire l'article
</button>
```

---

### **PRIORITÉ 4 : Éditeur riche pour les articles** ⭐⭐⭐

**Objectif** : Jessica doit pouvoir **formater son contenu** (titres, gras, italique, images, listes) dans l'admin.

**Solutions** :
1. **Option A (recommandée)** : Intégrer **TinyMCE** ou **Quill.js**
   - Éditeur WYSIWYG complet
   - Gestion images via upload
   - Export HTML propre
   
2. **Option B** : Markdown avec preview
   - Plus simple mais nécessite apprentissage syntaxe
   
3. **Option C** : Textarea enrichie avec boutons
   - Boutons pour `<h2>`, `<b>`, `<i>`, `<ul>`, `<img>`

**Fichiers concernés** :
- `/home/user/webapp/src/index.tsx` lignes ~2360-2480 (admin form)
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
- ✅ Navigation dynamique blog (articles s'affichent dans `/blog` sans reload)
- ✅ Upload d'images R2 via admin
- ✅ CRUD articles complet (create, read, update, delete)
- ✅ Page `/blog` avec liste articles
- ✅ Affichage article individuel avec date et contenu
- ✅ Bouton "Retour au blog" fonctionnel

### **Problèmes connus** ❌
- ❌ **Carousel homepage** : images zoomées sur le ciel (CRITIQUE)
- ⚠️ Éditeur admin basique (textarea simple, pas de formatage)
- ⚠️ Pas de défilement automatique carousel

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
│       ├── Lignes 594-802           → Page d'accueil (carousel L758-778)
│       ├── Lignes 1292-1436         → Route /blog (liste articles)
│       ├── Lignes 2738-2680         → Route /blog/:slug (article)
│       └── Lignes 2286-2562         → Admin blog (form, upload)
│
├── public/static/
│   ├── css/
│   │   └── styles.css               # CSS principal (1200 lignes)
│   │       └── Lignes 1010-1120     → Carousel blog (problème ici)
│   │
│   └── js/
│       └── blog-navigation.js       # Navigation dynamique blog
│
├── package.json                      # Dependencies
├── wrangler.toml                     # Config Cloudflare
└── vite.config.ts                    # Config build
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

## 📝 NOTES IMPORTANTES

### **CSS Carousel actuel (NON FONCTIONNEL)**
Le CSS ci-dessous **NE FONCTIONNE PAS** pour afficher le paysage :

```css
/* LIGNE ~1043 - public/static/css/styles.css */
.blog-card-image {
  width: 100%;
  height: 350px;                    /* Testé : 250px, 350px, 450px */
  object-fit: cover;                /* Testé : cover, contain */
  object-position: center 65%;      /* Testé : center, center 65%, center 70% */
  display: block;
  flex-shrink: 0;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}
```

**Aucune combinaison CSS n'a fonctionné.** Le problème est probablement :
1. Les images sources ont **trop de ciel en haut**
2. Le ratio 16:9 ne convient pas (besoin de carré ou 4:3)
3. Il faut recadrer les images **avant affichage** ou **uploader des versions carrées**

### **Images actuelles (exemples)**
- Norvège : `/r2/blog/1773863030188-7mxe8o.jpg` (3505×2628 px, ratio 4:3)
- Turquie : `/r2/blog/1773849083918-4onbyf.jpg` (3505×2628 px, ratio 4:3)

Ces images ont **beaucoup de ciel en haut**, donc `object-fit: cover` + hauteur fixe affiche toujours le ciel.

---

## ✅ CHECKLIST PROCHAIN AGENT

### **Avant de commencer**
- [ ] Lire ce brief en entier
- [ ] Vérifier `git status` (doit être clean)
- [ ] Tester le site actuel : https://lesvoyagesdejess.com
- [ ] Reproduire le problème carousel sur la preview

### **Plan d'action recommandé**

#### **Phase 1 : Résoudre le carousel homepage** (2-3h)
1. [ ] Analyser les images actuelles (dimensions, contenu)
2. [ ] Choisir approche :
   - Plugin carousel auto-scroll (Swiper.js) **OU**
   - Images carrées recadrées serveur **OU**
   - CSS `aspect-ratio: 1/1` + recadrage admin
3. [ ] Implémenter défilement automatique (5-7s)
4. [ ] Retirer texte/boutons, garder seulement images cliquables
5. [ ] Tester sur 3 articles minimum
6. [ ] Déployer et valider avec Kevin

#### **Phase 2 : Simplifier /blog** (30min)
1. [ ] Retirer date publication
2. [ ] Retirer excerpt
3. [ ] Garder image + titre + bouton "Lire l'article"
4. [ ] Tester navigation
5. [ ] Déployer

#### **Phase 3 : Éditeur riche admin** (1-2h)
1. [ ] Choisir éditeur (TinyMCE recommandé)
2. [ ] Intégrer dans admin form
3. [ ] Connecter upload images existant
4. [ ] Tester formatage (gras, italique, titres, listes, images)
5. [ ] Tester affichage frontend
6. [ ] Déployer

#### **Phase 4 : Tests & validation** (30min)
1. [ ] Tester carousel auto-scroll
2. [ ] Tester clic image → article
3. [ ] Tester création article avec formatage
4. [ ] Tester affichage article avec images inline
5. [ ] Validation finale avec Kevin

---

## 🚨 ALERTES & PIÈGES

### **⚠️ Cache Cloudflare**
Kevin vide systématiquement le cache navigateur après chaque déploiement. Ne **JAMAIS** dire "c'est le cache" si un problème persiste après déploiement.

### **⚠️ CSS ne s'applique pas**
Si un changement CSS ne fonctionne pas :
1. Vérifier que le fichier est bien dans `public/static/css/`
2. Vérifier le build (`npm run build`)
3. Vérifier le CSS déployé : `https://[url]/static/css/styles.css`
4. Ne **PAS** accuser le cache sans preuve

### **⚠️ Images R2**
Les images sont stockées sur R2 avec URLs :
- Format : `/r2/blog/[timestamp]-[random].jpg`
- Pas de resize automatique
- Uploader des images **optimisées** (max 2000px largeur)

### **⚠️ Git workflow**
Kevin fait `git pull origin main` **AVANT** chaque `npm run deploy`.  
Toujours commit + push **AVANT** de lui demander de déployer.

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
1. ✅ Carousel homepage attractif (images carrées, auto-scroll, cliquables)
2. ✅ Page blog épurée (image + titre + bouton)
3. ✅ Articles formatés richement (titres, gras, italique, images inline)
4. ✅ Expérience admin intuitive (éditeur WYSIWYG)
5. ✅ Pas de bugs visuels (images bien affichées partout)

---

**Dernière mise à jour** : 18 mars 2026, 21h15  
**Dernier commit** : `d3a033b` - fix(carousel): object-position 65% (NON RÉSOLU)  
**Statut** : 🔴 Carousel homepage cassé - Priorité critique

**BON COURAGE ! 💪**
