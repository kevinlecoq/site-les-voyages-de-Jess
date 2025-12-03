# 💻 EXEMPLES DE CODE POUR LE PANNEAU ADMIN

**Ces exemples sont là pour vous guider, pas pour copier-coller bêtement !**

Lisez, comprenez, adaptez à votre situation.

---

## 🔐 ÉTAPE 1 : AUTHENTIFICATION

### Exemple 1.1 : Hasher un mot de passe (bcrypt)

```typescript
import bcrypt from 'bcryptjs'

// Hasher un mot de passe (à faire UNE SEULE FOIS pour créer Jess)
const password = 'MotDePasseDeJess123!'
const salt = await bcrypt.genSalt(10)
const hashedPassword = await bcrypt.hash(password, salt)

console.log('Mot de passe hashé:', hashedPassword)
// Copiez ce hash dans votre seed.sql

// Vérifier un mot de passe (lors du login)
const isPasswordCorrect = await bcrypt.compare(
  'MotDePasseSaisiParJess',  // Ce que Jess tape
  hashedPassword               // Ce qui est dans la DB
)

if (isPasswordCorrect) {
  console.log('✅ Mot de passe correct !')
} else {
  console.log('❌ Mot de passe incorrect !')
}
```

**💡 Conseil** : Créez un petit script séparé pour hasher le mot de passe de Jess, puis copiez le hash dans `seed.sql`.

---

### Exemple 1.2 : Créer un JWT

```typescript
import jwt from 'jsonwebtoken'

// Secret pour signer les tokens (À METTRE DANS .dev.vars !)
const JWT_SECRET = 'votre_secret_super_securise_ici'

// Créer un token (lors du login)
const token = jwt.sign(
  { userId: 1, email: 'jess@lesvoyagesdejess.ca' },  // Payload
  JWT_SECRET,                                          // Secret
  { expiresIn: '7d' }                                 // Expire dans 7 jours
)

console.log('Token JWT:', token)

// Vérifier un token (dans le middleware)
try {
  const decoded = jwt.verify(token, JWT_SECRET)
  console.log('✅ Token valide:', decoded)
  // decoded = { userId: 1, email: '...', iat: ..., exp: ... }
} catch (error) {
  console.log('❌ Token invalide ou expiré')
}
```

**💡 Conseil** : Ajoutez `JWT_SECRET` dans votre `.dev.vars` :
```
ANTHROPIC_API_KEY=sk-ant-api03-...
JWT_SECRET=un_secret_aleatoire_tres_long_et_securise
```

---

### Exemple 1.3 : Définir et lire un cookie (Hono)

```typescript
import { setCookie, getCookie } from 'hono/cookie'

// Définir un cookie (après le login)
app.post('/admin/login', async (c) => {
  // ... vérification du mot de passe ...
  
  const token = jwt.sign({ userId: 1 }, JWT_SECRET, { expiresIn: '7d' })
  
  // Définir le cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,    // Pas accessible en JS côté client (sécurité)
    secure: true,      // Uniquement HTTPS (en production)
    sameSite: 'Lax',   // Protection CSRF
    maxAge: 604800     // 7 jours en secondes
  })
  
  return c.redirect('/admin')
})

// Lire un cookie (dans le middleware)
app.use('/admin/*', async (c, next) => {
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    return c.redirect('/admin/login')
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    // Stocker l'utilisateur dans le contexte pour l'utiliser plus tard
    c.set('user', decoded)
    await next()
  } catch (error) {
    return c.redirect('/admin/login')
  }
})
```

---

### Exemple 1.4 : Formulaire de login (JSX)

```tsx
app.get('/admin/login', (c) => {
  return c.render(
    <>
      <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="text-align: center; margin-bottom: 2rem;">Connexion Admin</h1>
        
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
            style="width: 100%; padding: 0.75rem; background: var(--color-primary); color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;"
          >
            Se connecter
          </button>
        </form>
      </div>
    </>,
    { title: 'Connexion Admin - Les Voyages de Jess' }
  )
})
```

---

### Exemple 1.5 : Traiter le login (POST)

```typescript
app.post('/admin/login', async (c) => {
  // 1. Récupérer les données du formulaire
  const body = await c.req.parseBody()
  const email = body.email as string
  const password = body.password as string
  
  // 2. Chercher l'utilisateur dans la DB
  const user = await c.env.db
    .prepare('SELECT * FROM admin_users WHERE email = ?')
    .bind(email)
    .first()
  
  if (!user) {
    // Utilisateur non trouvé
    return c.render(
      <>
        <div style="color: red; text-align: center;">❌ Email ou mot de passe incorrect</div>
        {/* Réafficher le formulaire */}
      </>,
      { title: 'Connexion Admin' }
    )
  }
  
  // 3. Vérifier le mot de passe
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)
  
  if (!isPasswordValid) {
    // Mot de passe incorrect
    return c.render(
      <>
        <div style="color: red; text-align: center;">❌ Email ou mot de passe incorrect</div>
        {/* Réafficher le formulaire */}
      </>,
      { title: 'Connexion Admin' }
    )
  }
  
  // 4. Créer un JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    c.env.JWT_SECRET,  // À ajouter dans wrangler.jsonc
    { expiresIn: '7d' }
  )
  
  // 5. Définir le cookie
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 604800  // 7 jours
  })
  
  // 6. Rediriger vers /admin
  return c.redirect('/admin')
})
```

**⚠️ IMPORTANT** : N'oubliez pas d'ajouter `JWT_SECRET` dans `wrangler.jsonc` :
```jsonc
{
  "vars": {
    "JWT_SECRET": "votre_secret_local"
  }
}
```

Et pour la production :
```bash
npx wrangler secret put JWT_SECRET
# Puis tapez votre secret
```

---

### Exemple 1.6 : Middleware de protection complet

```typescript
// Middleware à placer AVANT les routes /admin/*
app.use('/admin/*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  
  // Ne pas protéger la page de login elle-même
  if (path === '/admin/login') {
    await next()
    return
  }
  
  // Récupérer le token du cookie
  const token = getCookie(c, 'auth_token')
  
  if (!token) {
    // Pas de token = pas connecté
    return c.redirect('/admin/login')
  }
  
  try {
    // Vérifier le token
    const decoded = jwt.verify(token, c.env.JWT_SECRET)
    
    // Stocker l'utilisateur dans le contexte
    c.set('user', decoded)
    
    // Continuer vers la route demandée
    await next()
  } catch (error) {
    // Token invalide ou expiré
    return c.redirect('/admin/login')
  }
})
```

---

## 📝 ÉTAPE 2 : GESTION DU BLOG

### Exemple 2.1 : Liste des articles

```typescript
app.get('/admin/blog', async (c) => {
  // Récupérer tous les articles
  const posts = await c.env.db
    .prepare('SELECT * FROM blog_posts ORDER BY created_at DESC')
    .all()
  
  return c.render(
    <>
      <div style="max-width: 1200px; margin: 2rem auto; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <h1>Gestion du Blog</h1>
          <a href="/admin/blog/new" class="btn btn-primary">
            <i class="fas fa-plus"></i> Nouvel article
          </a>
        </div>
        
        {posts.results.length === 0 ? (
          <p>Aucun article pour le moment.</p>
        ) : (
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
                <th style="padding: 1rem; text-align: left;">Titre</th>
                <th style="padding: 1rem; text-align: left;">Date</th>
                <th style="padding: 1rem; text-align: left;">Statut</th>
                <th style="padding: 1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.results.map((post: any) => (
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 1rem;">{post.title}</td>
                  <td style="padding: 1rem;">
                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td style="padding: 1rem;">
                    {post.published ? (
                      <span style="color: green;">✅ Publié</span>
                    ) : (
                      <span style="color: orange;">📝 Brouillon</span>
                    )}
                  </td>
                  <td style="padding: 1rem; text-align: right;">
                    <a href={`/admin/blog/edit/${post.id}`} class="btn btn-secondary" style="margin-right: 0.5rem;">
                      Modifier
                    </a>
                    <form method="POST" action={`/admin/blog/${post.id}/delete`} style="display: inline;">
                      <button type="submit" class="btn btn-danger" onclick="return confirm('Supprimer cet article ?')">
                        Supprimer
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>,
    { title: 'Gestion du Blog - Admin' }
  )
})
```

---

### Exemple 2.2 : Formulaire de création d'article

```typescript
app.get('/admin/blog/new', (c) => {
  return c.render(
    <>
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem;">
        <h1>Nouvel article</h1>
        
        <form method="POST" action="/admin/blog" enctype="multipart/form-data">
          <div class="form-group">
            <label class="form-label">Titre *</label>
            <input type="text" name="title" class="form-input" required />
          </div>
          
          <div class="form-group">
            <label class="form-label">Slug (URL) *</label>
            <input 
              type="text" 
              name="slug" 
              class="form-input" 
              placeholder="mon-super-article"
              required 
            />
            <small>URL de l'article : /blog/mon-super-article</small>
          </div>
          
          <div class="form-group">
            <label class="form-label">Extrait</label>
            <textarea 
              name="excerpt" 
              class="form-textarea" 
              rows="3"
              placeholder="Court résumé de l'article..."
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Contenu *</label>
            <textarea 
              name="content" 
              class="form-textarea" 
              rows="15"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Image à la une</label>
            <input type="file" name="featured_image" accept="image/*" />
          </div>
          
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" name="published" value="1" />
              <span>Publier immédiatement</span>
            </label>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-primary">
              Enregistrer
            </button>
            <a href="/admin/blog" class="btn btn-secondary">
              Annuler
            </a>
          </div>
        </form>
      </div>
    </>,
    { title: 'Nouvel article - Admin' }
  )
})
```

---

### Exemple 2.3 : Traiter la création d'article

```typescript
app.post('/admin/blog', async (c) => {
  // Récupérer les données du formulaire
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const slug = body.slug as string
  const excerpt = body.excerpt as string || ''
  const content = body.content as string
  const published = body.published === '1' ? 1 : 0
  
  // TODO : Gérer l'upload de l'image (voir Étape 3)
  const featured_image = null
  
  // Insérer dans la DB
  try {
    await c.env.db
      .prepare(`
        INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        title,
        slug,
        excerpt,
        content,
        featured_image,
        published,
        published ? new Date().toISOString() : null
      )
      .run()
    
    // Rediriger vers la liste des articles
    return c.redirect('/admin/blog')
  } catch (error) {
    // Erreur (slug déjà existant ?)
    return c.render(
      <>
        <div style="color: red; padding: 1rem; background: #ffe6e6; border-radius: 4px; margin-bottom: 1rem;">
          ❌ Erreur : {error.message}
        </div>
        {/* Réafficher le formulaire */}
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
```

---

### Exemple 2.4 : Modifier un article

```typescript
app.get('/admin/blog/edit/:id', async (c) => {
  const id = c.req.param('id')
  
  // Récupérer l'article
  const post = await c.env.db
    .prepare('SELECT * FROM blog_posts WHERE id = ?')
    .bind(id)
    .first()
  
  if (!post) {
    return c.render(
      <>
        <div>❌ Article non trouvé</div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
  
  return c.render(
    <>
      <div style="max-width: 800px; margin: 2rem auto; padding: 2rem;">
        <h1>Modifier l'article</h1>
        
        <form method="POST" action={`/admin/blog/${id}`}>
          <div class="form-group">
            <label class="form-label">Titre *</label>
            <input 
              type="text" 
              name="title" 
              class="form-input" 
              value={post.title} 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Slug *</label>
            <input 
              type="text" 
              name="slug" 
              class="form-input" 
              value={post.slug} 
              required 
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Extrait</label>
            <textarea 
              name="excerpt" 
              class="form-textarea" 
              rows="3"
            >{post.excerpt}</textarea>
          </div>
          
          <div class="form-group">
            <label class="form-label">Contenu *</label>
            <textarea 
              name="content" 
              class="form-textarea" 
              rows="15"
              required
            >{post.content}</textarea>
          </div>
          
          <div class="form-group">
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input 
                type="checkbox" 
                name="published" 
                value="1" 
                checked={post.published === 1}
              />
              <span>Publié</span>
            </label>
          </div>
          
          <div style="display: flex; gap: 1rem;">
            <button type="submit" class="btn btn-primary">
              Enregistrer
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

// Route POST pour traiter la modification
app.post('/admin/blog/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.parseBody()
  
  const title = body.title as string
  const slug = body.slug as string
  const excerpt = body.excerpt as string || ''
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
        <div style="color: red;">❌ Erreur : {error.message}</div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
```

---

### Exemple 2.5 : Supprimer un article

```typescript
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
        <div style="color: red;">❌ Erreur : {error.message}</div>
      </>,
      { title: 'Erreur - Admin' }
    )
  }
})
```

---

## 📸 ÉTAPE 3 : UPLOAD DE PHOTOS (R2)

### Exemple 3.1 : Upload vers R2

```typescript
app.post('/admin/media/upload', async (c) => {
  // Récupérer le fichier uploadé
  const body = await c.req.parseBody()
  const file = body.file as File
  
  if (!file) {
    return c.json({ error: 'Aucun fichier fourni' }, 400)
  }
  
  // Vérifier que c'est une image
  if (!file.type.startsWith('image/')) {
    return c.json({ error: 'Le fichier doit être une image' }, 400)
  }
  
  // Générer un nom unique
  const timestamp = Date.now()
  const filename = `${timestamp}-${file.name}`
  
  // Uploader vers R2
  try {
    await c.env.MEDIA_BUCKET.put(filename, file.stream(), {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    // URL publique de l'image
    const url = `https://votre-domaine-r2.com/${filename}`
    
    // Enregistrer dans la DB
    await c.env.db
      .prepare(`
        INSERT INTO media (filename, url, mime_type, size)
        VALUES (?, ?, ?, ?)
      `)
      .bind(filename, url, file.type, file.size)
      .run()
    
    return c.json({ success: true, url })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})
```

**💡 Note** : Pour R2, vous devez configurer un domaine public ou utiliser un Worker pour servir les fichiers.

---

## 🎨 BONUS : CSS pour l'admin

```css
/* À ajouter dans /public/static/css/admin.css */

/* Layout admin */
.admin-container {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ddd;
}

/* Tables */
.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.admin-table thead {
  background: #f5f5f5;
}

.admin-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #ddd;
}

.admin-table td {
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.admin-table tr:hover {
  background: #f9f9f9;
}

/* Boutons admin */
.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}

/* Messages flash */
.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
```

---

## 📖 RESSOURCES COMPLÉMENTAIRES

### Tutoriels vidéo
- **JWT Auth** : Cherchez "JWT authentication tutorial" sur YouTube
- **Cloudflare R2** : https://www.youtube.com/results?search_query=cloudflare+r2+tutorial

### Articles
- **CRUD avec D1** : https://developers.cloudflare.com/d1/tutorials/
- **File upload Hono** : https://hono.dev/docs/helpers/file

---

**BON CODE KEVIN ! 🚀**

**Rappel** : Ces exemples sont là pour vous GUIDER, pas pour copier-coller aveuglément. Lisez, comprenez, adaptez !
