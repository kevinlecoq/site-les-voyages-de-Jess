# 🚀 DÉMARRER LE PANNEAU ADMIN - CHECKLIST RAPIDE

**Votre mission** : Créer un back-office pour que Jess puisse gérer son site elle-même.

---

## ✅ AVANT DE COMMENCER

### Prérequis
- [ ] Vous avez lu `PROJET_ADMIN_JESS.md` en entier
- [ ] Vous avez parcouru `EXEMPLES_CODE_ADMIN.md`
- [ ] Vous avez compris le concept global
- [ ] Vous êtes prêt à coder ! 💪

### Documents à avoir sous la main
- 📘 `PROJET_ADMIN_JESS.md` - Le plan complet
- 💻 `EXEMPLES_CODE_ADMIN.md` - Les exemples de code
- 🔧 `GUIDE_DEMARRAGE_RAPIDE.md` - Commandes utiles
- 📊 `ETAT_ACTUEL.md` - État du projet

---

## 🎯 ÉTAPE 1 : AUTHENTIFICATION (AUJOURD'HUI)

**Objectif** : Créer un système de connexion sécurisé pour Jess.

### Tâche 1.1 : Préparer l'environnement
```bash
cd /home/user/webapp

# Installer les dépendances nécessaires
npm install bcryptjs jsonwebtoken cookie

# Vérifier que tout est installé
npm list bcryptjs jsonwebtoken cookie
```

**✅ Fait ?** → Passez à 1.2

---

### Tâche 1.2 : Hasher le mot de passe de Jess

**Option A : Script Node.js (Recommandé)**

```bash
cd /home/user/webapp

# Créer un script temporaire
cat > hash_password.js << 'EOF'
const bcrypt = require('bcryptjs');

const password = 'MotDePasseTemporaire123!';  // Changez ici

bcrypt.genSalt(10, (err, salt) => {
  bcrypt.hash(password, salt, (err, hash) => {
    console.log('Password hash:', hash);
    console.log('\nCopiez ce hash dans migrations/seed.sql');
  });
});
EOF

# Exécuter le script
node hash_password.js

# Copier le hash affiché, puis supprimer le script
rm hash_password.js
```

**Option B : Console Node.js**
```bash
cd /home/user/webapp && node
# Puis dans Node :
> const bcrypt = require('bcryptjs')
> bcrypt.hashSync('MotDePasseTemporaire123!', 10)
# Copier le résultat
> .exit
```

**✅ Fait ?** → Vous avez un hash comme `$2a$10$...`

---

### Tâche 1.3 : Modifier la base de données

**Fichier à modifier** : `migrations/seed.sql`

```bash
# Ouvrir le fichier
nano migrations/seed.sql
# OU
code migrations/seed.sql
```

**À ajouter à la fin du fichier** :
```sql
-- Table des administrateurs
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insérer Jess comme administratrice
INSERT INTO admin_users (email, password_hash, name)
VALUES (
  'jess@lesvoyagesdejess.ca',
  'COLLEZ_LE_HASH_ICI',  -- Remplacez par le hash de la tâche 1.2
  'Jessica'
);
```

**✅ Fait ?** → Table créée avec le hash

---

### Tâche 1.4 : Ajouter JWT_SECRET

**Fichier à modifier** : `.dev.vars`

```bash
cd /home/user/webapp

# Si .dev.vars n'existe pas encore
cat > .dev.vars << 'EOF'
ANTHROPIC_API_KEY=sk-ant-api03-VOTRE_CLE_ICI
JWT_SECRET=un_secret_aleatoire_tres_long_et_securise_123456789
EOF

# Si .dev.vars existe déjà, ajoutez simplement la ligne JWT_SECRET
```

**💡 Conseil** : Générez un secret aléatoire :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**✅ Fait ?** → `.dev.vars` contient `JWT_SECRET`

---

### Tâche 1.5 : Recréer la base de données (avec la nouvelle table)

```bash
cd /home/user/webapp

# Si vous utilisez wrangler pour la DB locale
npx wrangler d1 execute DB --local --file=./migrations/seed.sql

# OU si c'est une DB de développement distincte, suivez la doc Cloudflare D1
```

**❓ Pas sûr comment faire ?** → Consultez la documentation existante du projet ou cherchez "cloudflare d1 local development"

**✅ Fait ?** → La table `admin_users` existe dans votre DB

---

### Tâche 1.6 : Créer la page de login (GET)

**Fichier à modifier** : `src/index.tsx`

**Où l'ajouter ?** → Après les autres routes (par exemple, après la route `/contact`)

```typescript
// ============================================
// ROUTES ADMIN - AUTHENTIFICATION
// ============================================

// Page de connexion admin
app.get('/admin/login', (c) => {
  return c.render(
    <>
      {/* TODO : Créer votre formulaire ici */}
      {/* Inspirez-vous de EXEMPLES_CODE_ADMIN.md, Exemple 1.4 */}
    </>,
    { title: 'Connexion Admin - Les Voyages de Jess' }
  )
})
```

**💡 Aide** : Regardez `EXEMPLES_CODE_ADMIN.md`, section "Exemple 1.4"

**✅ Fait ?** → Vous pouvez accéder à `/admin/login` dans le navigateur

---

### Tâche 1.7 : Traiter la connexion (POST)

**Fichier** : `src/index.tsx`

```typescript
// Traitement du formulaire de connexion
app.post('/admin/login', async (c) => {
  // TODO : Implémenter la logique
  // Inspirez-vous de EXEMPLES_CODE_ADMIN.md, Exemple 1.5
  
  return c.json({ error: 'À implémenter' }, 501)
})
```

**💡 Aide** : Regardez `EXEMPLES_CODE_ADMIN.md`, section "Exemple 1.5"

**📝 Points clés** :
1. Récupérer email et password
2. Chercher l'utilisateur dans la DB
3. Vérifier le mot de passe avec `bcrypt.compare()`
4. Créer un JWT avec `jwt.sign()`
5. Définir le cookie avec `setCookie()`
6. Rediriger vers `/admin`

**✅ Fait ?** → Vous pouvez vous connecter avec succès

---

### Tâche 1.8 : Créer le middleware de protection

**Fichier** : `src/index.tsx`

**Où l'ajouter ?** → AVANT les routes admin (avant `app.get('/admin/login', ...)`)

```typescript
import { setCookie, getCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// ... autres imports ...

// ============================================
// MIDDLEWARE ADMIN
// ============================================

app.use('/admin/*', async (c, next) => {
  // TODO : Implémenter la protection
  // Inspirez-vous de EXEMPLES_CODE_ADMIN.md, Exemple 1.6
  
  await next()
})
```

**💡 Aide** : Regardez `EXEMPLES_CODE_ADMIN.md`, section "Exemple 1.6"

**✅ Fait ?** → Vous êtes redirigé vers `/admin/login` si vous n'êtes pas connecté

---

### Tâche 1.9 : Créer la page d'accueil admin

**Fichier** : `src/index.tsx`

```typescript
// Page d'accueil admin (protégée)
app.get('/admin', (c) => {
  // Récupérer l'utilisateur connecté
  const user = c.get('user')
  
  return c.render(
    <>
      <div style="max-width: 1200px; margin: 2rem auto; padding: 2rem;">
        <h1>Bienvenue {user.email} !</h1>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin-top: 2rem;">
          {/* TODO : Créer des cartes pour chaque section */}
          
          <a href="/admin/blog" style="display: block; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-decoration: none; color: inherit;">
            <i class="fas fa-book-open" style="font-size: 3rem; color: var(--color-primary);"></i>
            <h3>Gérer le Blog</h3>
            <p>Créer et modifier des articles</p>
          </a>
          
          {/* TODO : Ajouter d'autres cartes (Photos, Formules, FAQ) */}
          
          <a href="/admin/logout" style="display: block; padding: 2rem; background: #f5f5f5; border-radius: 8px; text-decoration: none; color: inherit;">
            <i class="fas fa-sign-out-alt" style="font-size: 3rem; color: #dc3545;"></i>
            <h3>Se déconnecter</h3>
          </a>
        </div>
      </div>
    </>,
    { title: 'Admin - Les Voyages de Jess' }
  )
})
```

**✅ Fait ?** → Vous voyez la page d'accueil admin après connexion

---

### Tâche 1.10 : Créer la route de déconnexion

**Fichier** : `src/index.tsx`

```typescript
// Déconnexion
app.get('/admin/logout', (c) => {
  // TODO : Supprimer le cookie et rediriger
  // Inspirez-vous de EXEMPLES_CODE_ADMIN.md
  
  return c.redirect('/admin/login')
})
```

**💡 Aide** : Utilisez `setCookie(c, 'auth_token', '', { maxAge: 0 })` pour supprimer le cookie

**✅ Fait ?** → Vous pouvez vous déconnecter

---

### 🎉 TESTER L'AUTHENTIFICATION

```bash
cd /home/user/webapp

# Lancer le serveur
npm run dev

# Ouvrir le navigateur
# 1. Aller sur http://localhost:5173/admin
#    → Doit rediriger vers /admin/login
#
# 2. Se connecter avec :
#    Email : jess@lesvoyagesdejess.ca
#    Password : MotDePasseTemporaire123! (celui que vous avez hashé)
#
# 3. Après connexion → doit rediriger vers /admin
#
# 4. Aller sur /admin/logout → doit déconnecter
#
# 5. Re-essayer /admin → doit redemander login
```

**✅ Tous les tests passent ?** → 🎉 BRAVO ! L'authentification fonctionne !

---

## 🎯 ÉTAPE 2 : GESTION DU BLOG (PROCHAINE FOIS)

**Ne faites pas tout d'un coup !** Prenez le temps de bien comprendre et tester l'étape 1 d'abord.

Quand vous êtes prêt pour l'étape 2, consultez `PROJET_ADMIN_JESS.md`, section "ÉTAPE 2".

---

## 🐛 DÉPANNAGE

### Erreur "bcryptjs not found"
```bash
cd /home/user/webapp
npm install bcryptjs
```

### Erreur "JWT_SECRET not defined"
Vérifiez que :
1. `.dev.vars` contient `JWT_SECRET=...`
2. Vous avez redémarré le serveur après avoir modifié `.dev.vars`

### Erreur "Table admin_users doesn't exist"
Vérifiez que :
1. Vous avez bien ajouté la table dans `migrations/seed.sql`
2. Vous avez exécuté le script SQL sur la DB

### Le formulaire de login ne fonctionne pas
Vérifiez que :
1. L'attribut `method="POST"` est bien présent
2. L'attribut `action="/admin/login"` est bien présent
3. Les noms des inputs sont `email` et `password`

### Le cookie n'est pas défini
Vérifiez que :
1. Vous importez bien `setCookie` depuis `'hono/cookie'`
2. Vous appelez `setCookie()` après la vérification du mot de passe
3. Le JWT_SECRET est bien défini

---

## 📝 PRENDRE DES NOTES

Créez un fichier pour vos notes pendant le développement :

```bash
cd /home/user/webapp
touch MES_NOTES_DEV.md
```

Notez-y :
- Ce que vous avez appris
- Les difficultés rencontrées
- Les solutions trouvées
- Les questions à poser

---

## 💬 DEMANDER DE L'AIDE

Si vous bloquez vraiment :
1. **D'abord** : Relisez les exemples
2. **Ensuite** : Cherchez sur Google/Stack Overflow
3. **Enfin** : Demandez de l'aide avec un message précis :
   - Qu'essayez-vous de faire ?
   - Quel est le code exact ?
   - Quelle est l'erreur exacte ?
   - Qu'avez-vous déjà essayé ?

---

## 📊 PROGRESSION

### Étape 1 : Authentification
- [ ] 1.1 Dépendances installées
- [ ] 1.2 Mot de passe hashé
- [ ] 1.3 Base de données modifiée
- [ ] 1.4 JWT_SECRET configuré
- [ ] 1.5 DB recréée avec nouvelle table
- [ ] 1.6 Page de login créée (GET)
- [ ] 1.7 Traitement du login (POST)
- [ ] 1.8 Middleware de protection
- [ ] 1.9 Page d'accueil admin
- [ ] 1.10 Route de déconnexion
- [ ] ✅ Tests passent

**Progression Étape 1 : 0/11 (0%)**

---

## 🎯 OBJECTIF DU JOUR

**Focus** : Terminer l'étape 1 (Authentification)

**Temps estimé** : 2-4 heures (selon votre rythme)

**Résultat attendu** : Jess peut se connecter à `/admin/login` et accéder à `/admin`

---

## 🚀 C'EST PARTI !

**Commencez par la tâche 1.1** et avancez à votre rythme.

N'oubliez pas : **l'objectif est d'APPRENDRE**, pas juste de finir vite ! 💪

**Bon courage Kevin !** 🎉

---

**Questions fréquentes** :

**Q : Combien de temps ça va prendre ?**  
R : L'étape 1 (auth) : 2-4h. Tout le projet : 6-9 jours.

**Q : C'est trop difficile, je peux avoir de l'aide ?**  
R : Oui ! Mais essayez d'abord par vous-même. C'est comme ça qu'on apprend.

**Q : Je peux sauter des étapes ?**  
R : Non ! Chaque étape est importante. L'authentification est la base de tout.

**Q : Et pour AutomAître ?**  
R : C'est un projet séparé. Finissez d'abord l'étape 1 ici.
