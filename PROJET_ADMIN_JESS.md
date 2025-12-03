# 🔐 PROJET : PANNEAU D'ADMINISTRATION POUR JESS

**Objectif d'apprentissage** : Créer un back-office sécurisé pour que Jess puisse gérer son site.

---

## 🎯 FONCTIONNALITÉS À DÉVELOPPER

### Phase 1 : Authentification (PRIORITAIRE)
- [ ] Page de connexion `/admin/login`
- [ ] Système d'authentification sécurisé
- [ ] Protection des routes admin
- [ ] Déconnexion

### Phase 2 : Interface Admin de Base
- [ ] Page d'accueil admin `/admin`
- [ ] Menu de navigation admin
- [ ] Design simple et fonctionnel

### Phase 3 : Gestion du Blog
- [ ] Liste des articles existants
- [ ] Créer un nouvel article
- [ ] Modifier un article existant
- [ ] Supprimer un article
- [ ] Upload d'image pour l'article

### Phase 4 : Upload de Photos
- [ ] Gestionnaire de médias
- [ ] Upload de photos
- [ ] Galerie des photos uploadées
- [ ] Supprimer des photos

### Phase 5 : Gestion des Formules
- [ ] Modifier les formules existantes
- [ ] Créer une nouvelle formule
- [ ] Modifier les prix

### Phase 6 : Gestion de la FAQ
- [ ] Ajouter une question/réponse
- [ ] Modifier une FAQ existante
- [ ] Réordonner les FAQs

---

## 📚 ÉTAPE 1 : AUTHENTIFICATION (À FAIRE EN PREMIER)

### 🤔 Pourquoi commencer par l'authentification ?
**Sécurité d'abord !** Sans authentification, n'importe qui pourrait modifier le site.

### 🎓 Ce que vous allez apprendre
- Système de sessions/tokens
- Hachage de mots de passe
- Protection de routes
- Cookies sécurisés

### 🛠️ Options d'authentification

#### Option A : Simple avec Cloudflare Workers (RECOMMANDÉ pour apprendre)
- **Avantages** : Plus simple à comprendre, contrôle total
- **Inconvénients** : Vous devez tout coder

**Composants nécessaires** :
1. **Table utilisateurs** dans D1
   ```sql
   CREATE TABLE admin_users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     name TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```

2. **Sessions** (avec cookies ou JWT)
   - Cookie avec session ID
   - Ou JWT (JSON Web Token)

3. **Middleware de protection**
   - Vérifier si l'utilisateur est connecté
   - Rediriger vers `/admin/login` sinon

**Technologies à apprendre** :
- `bcrypt` ou `argon2` pour hasher les mots de passe
- `jsonwebtoken` (JWT) ou cookies de session
- Middleware Hono

#### Option B : Avec un service externe (Plus rapide mais moins éducatif)
- **Clerk** (https://clerk.com) - Gratuit jusqu'à 10k users
- **Auth0** (https://auth0.com) - Plus complexe
- **Supabase Auth** (https://supabase.com) - Bon compromis

**À éviter pour apprendre** : Cela cache la complexité, vous n'apprendrez pas vraiment.

### 📝 TÂCHES À FAIRE (Option A - Recommandée)

#### 1.1 Créer la table admin_users
```bash
# Fichier à modifier : migrations/seed.sql
# Ajouter à la fin :

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insérer Jess comme premier admin
-- ATTENTION : Ce mot de passe doit être hashé !
-- Pour l'instant, utilisez un placeholder
INSERT INTO admin_users (email, password_hash, name)
VALUES ('jess@lesvoyagesdejess.ca', 'TEMP_PASSWORD_TO_HASH', 'Jessica');
```

**❓ Questions à vous poser** :
- Comment hasher un mot de passe en JavaScript ?
- Où trouver une librairie pour ça ?
- Comment tester le hashage ?

**💡 Indice** : Cherchez "bcryptjs npm" sur Google

---

#### 1.2 Installer les dépendances d'authentification
```bash
cd /home/user/webapp

# Librairies suggérées (à vous de choisir) :
# - bcryptjs : Pour hasher les mots de passe
# - jsonwebtoken : Pour créer des tokens JWT
# - cookie : Pour gérer les cookies

# Commande à exécuter (exemple) :
npm install bcryptjs jsonwebtoken cookie

# OU en une seule ligne :
npm install bcryptjs jsonwebtoken @types/jsonwebtoken cookie
```

**❓ Questions à vous poser** :
- Qu'est-ce que bcrypt et pourquoi l'utiliser ?
- Qu'est-ce qu'un JWT ?
- Quelle est la différence entre JWT et sessions ?

**📖 Ressources** :
- https://www.npmjs.com/package/bcryptjs
- https://jwt.io/introduction

---

#### 1.3 Créer la route de login (GET)
```typescript
// Fichier : src/index.tsx
// À ajouter après les autres routes

// Page de connexion admin
app.get('/admin/login', (c) => {
  return c.render(
    <>
      {/* TODO : Créer votre formulaire de login ici */}
      {/* Champs nécessaires : email, password */}
      {/* Bouton : Se connecter */}
      {/* Action du form : POST /admin/login */}
    </>,
    { title: 'Connexion Admin - Les Voyages de Jess' }
  )
})
```

**❓ Questions à vous poser** :
- Comment créer un formulaire HTML en JSX ?
- Quel attribut `method` utiliser ? (GET ou POST ?)
- Quel attribut `action` mettre ?

**💡 Indice** : Regardez le formulaire de contact existant (ligne ~845 dans `src/index.tsx`)

---

#### 1.4 Créer la route de login (POST)
```typescript
// Fichier : src/index.tsx
// À ajouter après la route GET /admin/login

// Traitement de la connexion
app.post('/admin/login', async (c) => {
  // TODO :
  // 1. Récupérer email et password du formulaire
  // 2. Chercher l'utilisateur dans la DB
  // 3. Vérifier le mot de passe avec bcrypt
  // 4. Si OK : créer un JWT ou une session
  // 5. Rediriger vers /admin
  // 6. Sinon : afficher une erreur

  return c.json({ error: 'À implémenter' }, 501)
})
```

**❓ Questions à vous poser** :
- Comment récupérer les données du formulaire avec Hono ?
- Comment faire une requête SQL SELECT avec D1 ?
- Comment comparer un mot de passe avec bcrypt.compare() ?
- Comment créer un JWT ?
- Comment définir un cookie ?

**📖 Ressources** :
- Hono docs : https://hono.dev/docs/guides/validation
- Cloudflare D1 : https://developers.cloudflare.com/d1/
- Exemple existant : Ligne ~940 (route `/api/quote-request`)

---

#### 1.5 Créer un middleware de protection
```typescript
// Fichier : src/index.tsx
// À ajouter AVANT les routes admin

// Middleware pour protéger les routes admin
const requireAuth = async (c: any, next: any) => {
  // TODO :
  // 1. Récupérer le JWT du cookie (ou vérifier la session)
  // 2. Vérifier que le token est valide
  // 3. Si OK : continuer avec next()
  // 4. Sinon : rediriger vers /admin/login

  await next()
}

// Appliquer le middleware à toutes les routes /admin/* SAUF /admin/login
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  if (path === '/admin/login') {
    await next()
  } else {
    await requireAuth(c, next)
  }
})
```

**❓ Questions à vous poser** :
- Comment récupérer un cookie avec Hono ?
- Comment vérifier un JWT avec jsonwebtoken.verify() ?
- Que faire si le token est expiré ?

**📖 Ressources** :
- Hono middleware : https://hono.dev/docs/guides/middleware
- JWT verify : https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback

---

#### 1.6 Créer la page d'accueil admin
```typescript
// Fichier : src/index.tsx

// Page d'accueil admin (protégée par le middleware)
app.get('/admin', (c) => {
  return c.render(
    <>
      <h1>Panneau d'administration</h1>
      <p>Bienvenue Jess !</p>
      
      {/* TODO : Ajouter un menu avec : */}
      {/* - Gérer le blog */}
      {/* - Gérer les photos */}
      {/* - Gérer les formules */}
      {/* - Gérer la FAQ */}
      {/* - Se déconnecter */}
    </>,
    { title: 'Admin - Les Voyages de Jess' }
  )
})
```

**❓ Questions à vous poser** :
- Comment créer un menu de navigation simple ?
- Comment styliser cette page admin ?
- Où mettre le CSS spécifique à l'admin ?

---

#### 1.7 Créer la route de déconnexion
```typescript
// Fichier : src/index.tsx

app.get('/admin/logout', (c) => {
  // TODO :
  // 1. Supprimer le cookie JWT (ou détruire la session)
  // 2. Rediriger vers /admin/login

  return c.redirect('/admin/login')
})
```

**❓ Questions à vous poser** :
- Comment supprimer un cookie avec Hono ?
- Quelle est la syntaxe pour rediriger ?

**💡 Indice** : Cherchez "hono set cookie" et "hono redirect"

---

### ✅ CHECKLIST ÉTAPE 1 : AUTHENTIFICATION

- [ ] Table `admin_users` créée dans `seed.sql`
- [ ] Dépendances installées (`bcryptjs`, `jsonwebtoken`, `cookie`)
- [ ] Route `GET /admin/login` créée avec formulaire
- [ ] Route `POST /admin/login` implémentée
- [ ] Middleware de protection créé et appliqué
- [ ] Page d'accueil admin `GET /admin` créée
- [ ] Route de déconnexion `GET /admin/logout` créée
- [ ] Testé la connexion avec succès ✅
- [ ] Testé la redirection si non connecté ✅
- [ ] Testé la déconnexion ✅

---

## 📚 ÉTAPE 2 : GESTION DU BLOG (APRÈS L'AUTHENTIFICATION)

### 🎓 Ce que vous allez apprendre
- CRUD (Create, Read, Update, Delete)
- Formulaires complexes
- Upload de fichiers
- Gestion de base de données

### 📝 TÂCHES À FAIRE

#### 2.1 Créer la page liste des articles
```typescript
// Route : GET /admin/blog

// TODO :
// 1. Récupérer tous les articles du blog depuis la DB
// 2. Afficher une table avec : titre, date, statut (publié/brouillon)
// 3. Bouton "Modifier" pour chaque article
// 4. Bouton "Supprimer" pour chaque article
// 5. Bouton "Créer un nouvel article"
```

**❓ Questions à vous poser** :
- Comment faire un SELECT sur `blog_posts` ?
- Comment boucler sur les résultats en JSX ?
- Comment créer des liens vers `/admin/blog/edit/:id` ?

---

#### 2.2 Créer la page de création d'article
```typescript
// Route : GET /admin/blog/new

// TODO :
// 1. Formulaire avec champs :
//    - Titre
//    - Slug (URL)
//    - Extrait
//    - Contenu (textarea grande)
//    - Image featured (upload)
//    - Publier ? (checkbox)
// 2. Bouton "Enregistrer"
```

---

#### 2.3 Traiter la création d'article
```typescript
// Route : POST /admin/blog

// TODO :
// 1. Récupérer les données du formulaire
// 2. Valider les données (titre non vide, slug unique, etc.)
// 3. Insérer dans la DB (table blog_posts)
// 4. Rediriger vers /admin/blog avec un message de succès
```

**❓ Questions à vous poser** :
- Comment faire un INSERT avec D1 ?
- Comment valider les données ?
- Comment gérer les erreurs ?

---

#### 2.4 Créer la page de modification d'article
```typescript
// Route : GET /admin/blog/edit/:id

// TODO :
// 1. Récupérer l'article par son ID
// 2. Pré-remplir le formulaire avec les données existantes
// 3. Même formulaire que la création
```

---

#### 2.5 Traiter la modification d'article
```typescript
// Route : POST /admin/blog/:id

// TODO :
// 1. Récupérer les données du formulaire
// 2. UPDATE de l'article dans la DB
// 3. Rediriger vers /admin/blog
```

---

#### 2.6 Supprimer un article
```typescript
// Route : POST /admin/blog/:id/delete

// TODO :
// 1. DELETE de l'article dans la DB
// 2. Rediriger vers /admin/blog
```

---

### ✅ CHECKLIST ÉTAPE 2 : GESTION DU BLOG

- [ ] Page liste des articles créée
- [ ] Formulaire de création d'article créé
- [ ] Route POST pour créer un article implémentée
- [ ] Formulaire de modification créé
- [ ] Route POST pour modifier un article implémentée
- [ ] Route de suppression créée
- [ ] Testé la création d'un article ✅
- [ ] Testé la modification d'un article ✅
- [ ] Testé la suppression d'un article ✅

---

## 📚 ÉTAPE 3 : UPLOAD DE PHOTOS (AVANCÉ)

### 🎓 Ce que vous allez apprendre
- Upload de fichiers
- Stockage de fichiers (Cloudflare R2 ou autre)
- Gestion de médias
- Optimisation d'images

### 🛠️ Options de stockage

#### Option A : Cloudflare R2 (RECOMMANDÉ)
- **Avantages** : Gratuit jusqu'à 10 GB, rapide, intégré avec Workers
- **Inconvénients** : Configuration requise

**Ressources** :
- https://developers.cloudflare.com/r2/

#### Option B : Upload vers `/public/static/images/`
- **Avantages** : Simple, pas de config
- **Inconvénients** : Nécessite un redéploiement à chaque upload

#### Option C : Service externe (Cloudinary, Uploadcare)
- **Avantages** : Simple, optimisation automatique
- **Inconvénients** : Coût, dépendance externe

### 📝 TÂCHES À FAIRE (Option A - R2)

#### 3.1 Configurer Cloudflare R2
```bash
# Dans wrangler.jsonc, ajouter :
{
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "voyages-jess-media"
    }
  ]
}
```

**❓ Questions à vous poser** :
- Comment créer un bucket R2 ?
- Comment lier le bucket à votre Worker ?

---

#### 3.2 Créer la page d'upload
```typescript
// Route : GET /admin/media

// TODO :
// 1. Formulaire d'upload avec input type="file"
// 2. Accepter uniquement les images (jpg, png, webp)
// 3. Bouton "Upload"
// 4. Galerie des images déjà uploadées
```

---

#### 3.3 Traiter l'upload
```typescript
// Route : POST /admin/media/upload

// TODO :
// 1. Récupérer le fichier uploadé
// 2. Vérifier que c'est une image
// 3. Générer un nom unique (timestamp + nom original)
// 4. Uploader vers R2
// 5. Enregistrer l'URL dans la DB (table media)
// 6. Retourner l'URL de l'image
```

**❓ Questions à vous poser** :
- Comment récupérer un fichier avec Hono ?
- Comment uploader vers R2 ?
- Comment générer un nom unique ?

**📖 Ressources** :
- Hono file upload : https://hono.dev/docs/helpers/file
- R2 put : https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#put

---

#### 3.4 Créer une table media
```sql
-- Dans migrations/seed.sql

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### ✅ CHECKLIST ÉTAPE 3 : UPLOAD DE PHOTOS

- [ ] R2 configuré et lié au Worker
- [ ] Table `media` créée
- [ ] Page d'upload créée
- [ ] Route POST d'upload implémentée
- [ ] Galerie des images créée
- [ ] Suppression d'image implémentée
- [ ] Testé l'upload d'une image ✅
- [ ] Testé l'affichage dans la galerie ✅

---

## 📚 ÉTAPE 4 : GESTION DES FORMULES

### 📝 TÂCHES À FAIRE

#### 4.1 Créer la page liste des formules
```typescript
// Route : GET /admin/formules

// TODO :
// 1. Afficher toutes les formules
// 2. Bouton "Modifier" pour chaque formule
// 3. Bouton "Créer une nouvelle formule"
```

---

#### 4.2 Modifier une formule
```typescript
// Route : GET /admin/formules/edit/:id
// Route : POST /admin/formules/:id

// TODO :
// 1. Formulaire pré-rempli avec les données actuelles
// 2. Champs : nom, description, durée, prix EUR, prix CAD
// 3. UPDATE dans la DB
```

---

### ✅ CHECKLIST ÉTAPE 4 : GESTION DES FORMULES

- [ ] Page liste des formules créée
- [ ] Formulaire de modification créé
- [ ] Route POST de modification implémentée
- [ ] Testé la modification d'une formule ✅

---

## 📚 ÉTAPE 5 : GESTION DE LA FAQ

### 📝 TÂCHES À FAIRE

#### 5.1 Créer la page liste des FAQs
```typescript
// Route : GET /admin/faq

// TODO :
// 1. Afficher toutes les questions/réponses
// 2. Bouton "Modifier" et "Supprimer" pour chaque FAQ
// 3. Bouton "Ajouter une FAQ"
```

---

#### 5.2 Ajouter/Modifier/Supprimer une FAQ
```typescript
// Routes :
// - GET /admin/faq/new
// - POST /admin/faq
// - GET /admin/faq/edit/:id
// - POST /admin/faq/:id
// - POST /admin/faq/:id/delete

// TODO : Implémenter le CRUD complet
```

---

### ✅ CHECKLIST ÉTAPE 5 : GESTION DE LA FAQ

- [ ] Page liste des FAQs créée
- [ ] Formulaire d'ajout créé
- [ ] Formulaire de modification créé
- [ ] Suppression implémentée
- [ ] Testé l'ajout d'une FAQ ✅
- [ ] Testé la modification d'une FAQ ✅
- [ ] Testé la suppression d'une FAQ ✅

---

## 🎨 BONUS : AMÉLIORATIONS FUTURES

### Design
- [ ] Créer un CSS dédié à l'admin (`/public/static/css/admin.css`)
- [ ] Utiliser un framework CSS (Tailwind, Bootstrap) ?
- [ ] Design responsive pour mobile

### Fonctionnalités
- [ ] Éditeur de texte riche (TinyMCE, Quill)
- [ ] Prévisualisation des articles avant publication
- [ ] Statistiques (nombre de visites, articles populaires)
- [ ] Gestion des messages de contact
- [ ] Notifications par email

### Sécurité
- [ ] Rate limiting sur le login
- [ ] 2FA (authentification à deux facteurs)
- [ ] Logs des actions admin
- [ ] Expiration de session

---

## 📖 RESSOURCES GÉNÉRALES

### Documentation officielle
- **Hono** : https://hono.dev/
- **Cloudflare Workers** : https://developers.cloudflare.com/workers/
- **Cloudflare D1** : https://developers.cloudflare.com/d1/
- **Cloudflare R2** : https://developers.cloudflare.com/r2/

### Tutoriels recommandés
- **JWT Auth** : https://jwt.io/introduction
- **Bcrypt** : https://www.npmjs.com/package/bcryptjs
- **File Upload** : https://hono.dev/docs/helpers/file

### Communautés
- **Hono Discord** : https://discord.gg/hono
- **Cloudflare Discord** : https://discord.gg/cloudflaredev

---

## 💡 CONSEILS POUR APPRENDRE

### 1. Avancez étape par étape
Ne sautez pas d'étapes ! Commencez par l'authentification avant de passer au reste.

### 2. Testez après chaque modification
À chaque fois que vous codez quelque chose, testez-le immédiatement.

### 3. Consultez les exemples existants
Vous avez déjà du code dans `src/index.tsx` :
- Formulaire de contact (ligne ~845)
- Requêtes DB (ligne ~302, ~462, ~736)
- Routes API (ligne ~933)

### 4. Lisez les messages d'erreur
Les erreurs sont vos amies ! Elles vous disent exactement ce qui ne va pas.

### 5. Cherchez sur Google/Stack Overflow
Si vous bloquez, cherchez ! La plupart des problèmes ont déjà été résolus.

### 6. Faites des commits réguliers
```bash
git add .
git commit -m "feat: Ajout de l'authentification admin"
git push origin main
```

### 7. Demandez de l'aide quand nécessaire
Si vous êtes vraiment bloqué, demandez ! Mais essayez d'abord par vous-même.

---

## 🎯 ORDRE RECOMMANDÉ

1. **ÉTAPE 1 : Authentification** (1-2 jours) ← COMMENCEZ ICI
2. **ÉTAPE 2 : Gestion du Blog** (1-2 jours)
3. **ÉTAPE 4 : Gestion des Formules** (1 jour)
4. **ÉTAPE 5 : Gestion de la FAQ** (1 jour)
5. **ÉTAPE 3 : Upload de Photos** (2-3 jours) ← Plus complexe

**Total estimé** : 6-9 jours de développement

---

## 📊 PROGRESSION GLOBALE

- [ ] **ÉTAPE 1** : Authentification (0%)
- [ ] **ÉTAPE 2** : Gestion du Blog (0%)
- [ ] **ÉTAPE 3** : Upload de Photos (0%)
- [ ] **ÉTAPE 4** : Gestion des Formules (0%)
- [ ] **ÉTAPE 5** : Gestion de la FAQ (0%)

**Progression totale : 0%**

---

**BON COURAGE KEVIN ! Vous allez apprendre énormément avec ce projet ! 🚀**

---

**PROCHAINE ACTION** : Commencez par l'Étape 1.1 (Créer la table admin_users)
