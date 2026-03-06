# 🚀 GUIDE RAPIDE - Récupération des modifications

**Date :** 4 février 2026  
**Branche :** `fix/responsive-optimisations`  
**Temps estimé :** 5 minutes

---

## 📋 CE QUI A ÉTÉ FAIT

✅ **3 problèmes corrigés :**
1. 🔴 Responsive section 4 étapes (mobile/tablette)
2. 🟡 Lazy loading image mon-role.webp (2.1 MB)
3. 🟡 Meta tags Open Graph complets

**Fichiers modifiés :**
- `src/index.tsx` (3 zones)
- `public/static/css/styles.css` (+28 lignes media queries)

---

## ⚡ COMMANDES RAPIDES

### 1️⃣ Récupérer la branche

```bash
cd ~/Desktop/"site internet perso"/les-voyages-de-jess

git fetch origin

git checkout fix/responsive-optimisations
```

---

### 2️⃣ Voir les modifications

```bash
# Voir la différence avec main
git diff main

# Voir le commit détaillé
git show 4a56cf9

# Voir uniquement les fichiers modifiés
git diff --name-only main
```

---

### 3️⃣ Tester en local

```bash
npm run dev
```

Puis ouvrir **http://localhost:5173**

**Test responsive :**
- Appuyer sur **F12** (DevTools)
- Cliquer sur l'icône **mobile/tablette**
- Tester les tailles : 375px, 768px, 1024px, 1920px

**À vérifier :**
- [ ] Desktop : 4 cartes côte à côte
- [ ] Tablette : 2x2
- [ ] Mobile : 1 colonne
- [ ] Effet hover fonctionne

---

### 4️⃣ Merger dans main

**Si tout est OK :**

```bash
git checkout main

git merge fix/responsive-optimisations

git push origin main
```

---

### 5️⃣ Déployer en production

```bash
npm run deploy
```

**Après déploiement :**
- Aller sur Cloudflare Dashboard
- **Caching** → **Purge Everything** (vider le cache)
- Tester le site sur mobile réel

---

## 🛡️ SAUVEGARDES DISPONIBLES

Si besoin de revenir en arrière :

### Tag Git
```bash
git checkout backup-avant-responsive
```

### Fichiers backup
```bash
cp src/index.tsx.backup-20260204-193406 src/index.tsx
cp public/static/css/styles.css.backup-20260204-193406 public/static/css/styles.css
```

---

## 🎯 RÉSULTAT ATTENDU

**Responsive :**
- ✅ Desktop (> 1024px) → 4 colonnes
- ✅ Tablette (768-1024px) → 2x2
- ✅ Mobile (< 768px) → 1 colonne

**Performance :**
- ✅ Image mon-role.webp en lazy loading
- ✅ Gain : -2s chargement initial
- ✅ Score PageSpeed : +5 à +10 points

**SEO :**
- ✅ Open Graph complet (dimensions, locale, site_name)
- ✅ Meilleur partage Facebook/LinkedIn/Twitter

---

## ❓ AIDE RAPIDE

### Voir les branches disponibles
```bash
git branch -a
```

### Revenir à main sans merger
```bash
git checkout main
```

### Supprimer la branche locale (si besoin)
```bash
git branch -d fix/responsive-optimisations
```

### Voir l'historique
```bash
git log --oneline --graph --all -10
```

---

## 📞 COMMANDES DE DÉPANNAGE

### Si git fetch ne fonctionne pas
```bash
git remote -v
# Vérifier que origin = https://github.com/kevinlecoq/site-les-voyages-de-Jess.git
```

### Si la branche n'apparaît pas
```bash
git fetch --all
git branch -r | grep fix/responsive
```

### Si merge a des conflits
```bash
git merge --abort
# Puis me contacter pour aide
```

---

## ✅ CHECKLIST COMPLÈTE

- [ ] `git fetch origin` exécuté
- [ ] `git checkout fix/responsive-optimisations` exécuté
- [ ] `git diff main` vérifié
- [ ] `npm run dev` testé en local
- [ ] Test responsive mobile/tablette effectué
- [ ] Effet hover vérifié
- [ ] `git checkout main` exécuté
- [ ] `git merge fix/responsive-optimisations` exécuté
- [ ] `git push origin main` exécuté
- [ ] `npm run deploy` exécuté
- [ ] Cache Cloudflare purgé
- [ ] Site testé en production

---

**Temps estimé total :** 5-10 minutes  
**Difficulté :** ⭐⭐☆☆☆ (Facile)

**Besoin d'aide ?** Lire le document complet : `MODIFICATIONS_04_FEV_2026.md`
