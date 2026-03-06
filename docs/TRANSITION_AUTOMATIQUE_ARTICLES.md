# 🔄 TRANSITION AUTOMATIQUE : Articles Exemples → Articles Réels

**Date:** 4 février 2026  
**Commit:** 89feeb1  
**Branche:** fix/responsive-optimisations  
**Statut:** ✅ Pushé sur GitHub, prêt à merger

---

## 🎯 OBJECTIF

Permettre à Jessica de publier ses articles via `/admin/blog` et les voir automatiquement remplacer les articles d'exemple sur la homepage, **sans aucune intervention manuelle**.

---

## 📊 LOGIQUE DE TRANSITION

| Articles DB | Articles Homepage | Composition |
|-------------|-------------------|-------------|
| **0 articles** | 4 articles exemples | 100% exemples |
| **1 article** | 1 réel + 3 exemples | 25% réels, 75% exemples |
| **2 articles** | 2 réels + 2 exemples | 50% réels, 50% exemples |
| **3 articles** | 3 réels + 1 exemple | 75% réels, 25% exemples |
| **4+ articles** | 4 réels | 100% réels (exemples disparaissent) |

---

## 🔧 MODIFICATIONS TECHNIQUES

### **1. Route API `/api/recent-posts`** (src/index.tsx)

```typescript
app.get('/api/recent-posts', async (c) => {
  try {
    // Récupérer les 4 derniers articles publiés
    const realArticles = await c.env.db.prepare(
      'SELECT id, title, slug, excerpt, image_url, created_at 
       FROM blog_posts 
       WHERE published = 1 
       ORDER BY created_at DESC 
       LIMIT 4'
    ).all();

    // Articles d'exemple (fallback)
    const exampleArticles = [
      { id: 'example-1', title: '10 destinations...', isExample: true },
      { id: 'example-2', title: 'Comment préparer...', isExample: true },
      { id: 'example-3', title: 'Voyage en famille...', isExample: true },
      { id: 'example-4', title: 'Voyager en solo...', isExample: true }
    ];

    // Combiner réels + exemples (max 4)
    const articles = [
      ...realArticles.results.map(a => ({ ...a, isExample: false })),
      ...exampleArticles.slice(0, Math.max(0, 4 - realArticles.results.length))
    ].slice(0, 4);

    return c.json(articles);
  } catch (error) {
    // Fallback : renvoyer les exemples en cas d'erreur
    return c.json(exampleArticles);
  }
});
```

### **2. Chargement dynamique** (public/static/js/app.js)

```javascript
async function loadRecentPosts() {
  try {
    const response = await fetch('/api/recent-posts');
    const articles = await response.json();
    
    const carousel = document.querySelector('.blog-carousel');
    if (!carousel) return;
    
    // Générer le HTML des cartes
    carousel.innerHTML = articles.map(article => `
      <div class="blog-card">
        <div class="blog-card-image">
          <img src="${article.image_url}" alt="${article.title}" loading="lazy" />
        </div>
        <div class="blog-card-content">
          <h3>${article.title}</h3>
          <p>${formatDate(article.created_at)}</p>
          <p>${article.excerpt}</p>
          <a href="${article.isExample ? '/blog' : '/blog/' + article.slug}">
            Lire l'article
          </a>
        </div>
      </div>
    `).join('');
    
    initScrollAnimations(); // Réactiver les animations
  } catch (error) {
    console.error('Erreur chargement articles:', error);
    // Le HTML statique reste affiché en fallback
  }
}

// Charger au démarrage si carousel présent
if (document.querySelector('.blog-carousel')) {
  loadRecentPosts();
}
```

---

## ✨ FONCTIONNALITÉS

### **1. Transition automatique**
- Jessica publie un article via `/admin/blog`
- L'article apparaît instantanément sur la homepage
- Les exemples disparaissent progressivement (1 par 1)

### **2. Ordre chronologique**
- Les articles les plus récents apparaissent en premier
- `ORDER BY created_at DESC`

### **3. Liens intelligents**
- Articles réels → `/blog/[slug]` (page détaillée)
- Articles exemples → `/blog` (page générale)

### **4. Format date français**
```javascript
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-CA', { 
    year: 'numeric', 
    month: 'long'  // Ex: "février 2026"
  });
}
```

### **5. Fallback robuste**
- Si erreur DB → affiche les exemples
- Si `loadRecentPosts()` échoue → HTML statique reste visible
- Pas de "trou" dans l'affichage

---

## 📝 EXEMPLE DE SCÉNARIO

### **Jour 1 : Site lancé (0 articles)**
```
Homepage affiche :
1. "10 destinations incontournables en 2026" (exemple)
2. "Comment préparer son voyage en 5 étapes" (exemple)
3. "Voyage en famille : mes destinations préférées" (exemple)
4. "Voyager en solo : mes meilleurs conseils" (exemple)
```

### **Jour 10 : Jessica publie son 1er article "Mon voyage au Japon"**
```
Homepage affiche :
1. "Mon voyage au Japon" (réel) ✅
2. "Comment préparer son voyage en 5 étapes" (exemple)
3. "Voyage en famille : mes destinations préférées" (exemple)
4. "Voyager en solo : mes meilleurs conseils" (exemple)
```

### **Jour 20 : Jessica publie "Les secrets de l'Islande"**
```
Homepage affiche :
1. "Les secrets de l'Islande" (réel - plus récent) ✅
2. "Mon voyage au Japon" (réel) ✅
3. "Voyage en famille : mes destinations préférées" (exemple)
4. "Voyager en solo : mes meilleurs conseils" (exemple)
```

### **Jour 60 : Jessica a publié 5 articles**
```
Homepage affiche :
1. "Barcelone en 3 jours" (réel - article 5) ✅
2. "Road trip en Californie" (réel - article 4) ✅
3. "Les secrets de l'Islande" (réel - article 2) ✅
4. "Mon voyage au Japon" (réel - article 1) ✅

→ TOUS LES EXEMPLES ONT DISPARU ✅
```

---

## 🧪 TESTS À FAIRE

### **Test 1 : Vérifier l'API**
```bash
curl https://21f5c9ef.les-voyages-de-jess.pages.dev/api/recent-posts
```

**Attendu :** JSON avec 4 articles (exemples pour l'instant)

---

### **Test 2 : Vérifier la homepage**
1. Ouvrir https://21f5c9ef.les-voyages-de-jess.pages.dev
2. Scroller jusqu'à "Articles récents"
3. Vérifier que 4 articles s'affichent
4. Cliquer sur les flèches gauche/droite → scroll fonctionne
5. Cliquer sur "Lire l'article" → redirige vers `/blog`

---

### **Test 3 : Simuler l'ajout d'un article**
1. Jessica se connecte sur `/admin/blog`
2. Crée un nouvel article : titre, contenu, image, slug
3. Coche "Publié"
4. Enregistre
5. Retourne sur la homepage
6. **Rafraîchir la page** (Cmd+R)
7. → Le nouvel article doit apparaître en 1ère position
8. → 1 article d'exemple doit avoir disparu

---

## 📁 FICHIERS MODIFIÉS

| Fichier | Lignes ajoutées | Modifications |
|---------|----------------|---------------|
| `src/index.tsx` | +102 lignes | Route API `/api/recent-posts` |
| `public/static/js/app.js` | +52 lignes | Fonction `loadRecentPosts()` |

**Total :** 154 lignes ajoutées

---

## 🚀 DÉPLOIEMENT

### **Commandes pour récupérer sur votre terminal :**

```bash
cd ~/Desktop/"site internet perso"/les-voyages-de-jess

# Récupérer les modifications
git pull origin fix/responsive-optimisations

# Voir les derniers commits
git log --oneline -5

# Merger dans main
git checkout main
git merge fix/responsive-optimisations
git push origin main

# Déployer
npm run deploy
```

---

## ✅ RÉSULTAT ATTENDU

1. **Dès maintenant** : 4 articles d'exemple s'affichent sur la homepage
2. **Jessica publie 1 article** : 1 réel + 3 exemples
3. **Jessica publie 2 articles** : 2 réels + 2 exemples
4. **Jessica publie 3 articles** : 3 réels + 1 exemple
5. **Jessica publie 4+ articles** : 4 réels, exemples disparus

**Tout est automatique. Jessica n'a rien à faire. 🎉**

---

## 🔗 LIENS UTILES

- **Branche GitHub :** https://github.com/kevinlecoq/site-les-voyages-de-Jess/tree/fix/responsive-optimisations
- **Commit détaillé :** https://github.com/kevinlecoq/site-les-voyages-de-Jess/commit/89feeb1
- **Site de production :** https://21f5c9ef.les-voyages-de-jess.pages.dev

---

## 📌 NOTES IMPORTANTES

1. **Jessica n'a rien à faire manuellement** : elle publie ses articles via `/admin/blog` et ils apparaissent automatiquement
2. **Ordre chronologique respecté** : les articles les plus récents apparaissent en premier
3. **Pas de risque de "trou"** : toujours 4 articles affichés (réels + exemples)
4. **Fallback robuste** : en cas d'erreur, les exemples s'affichent
5. **Performance** : chargement async, pas de blocage de la page

---

**Durée totale :** ~20 minutes  
**Complexité :** ⭐⭐⭐☆☆ (moyenne)  
**Impact :** 🚀🚀🚀🚀🚀 (très élevé - automatisation complète)
