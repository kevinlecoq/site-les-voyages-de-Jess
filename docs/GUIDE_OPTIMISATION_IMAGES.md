# 🎨 GUIDE D'OPTIMISATION DES IMAGES

**Projet** : Les Voyages de Jess  
**Date** : 05 février 2026  
**Auteur** : Claude Code Agent

---

## 📋 TABLE DES MATIÈRES

1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Workflow complet](#workflow-complet)
4. [Script d'optimisation](#script-doptimisation)
5. [Recadrage 4:3 → 16:9](#recadrage-43--169)
6. [Intégration dans le HTML/CSS](#intégration-dans-le-htmlcss)
7. [Cache-busting](#cache-busting)
8. [Dépannage](#dépannage)

---

## 🎯 Introduction

Ce guide explique comment optimiser les images du site pour obtenir :
- ✅ **Poids réduit de 90-95%** (JPG 3 MB → WebP 150 KB)
- ✅ **3 versions responsive** (mobile 400px, tablet 800px, desktop 1200px)
- ✅ **Ratio 16:9** pour les images hero
- ✅ **Qualité visuelle identique**

---

## 🛠️ Prérequis

### 1. Installer Sharp
```bash
cd ~/Desktop/"site internet perso"/les-voyages-de-jess
npm install --save-dev sharp
```

### 2. Vérifier l'installation
```bash
node -e "const sharp = require('sharp'); console.log('Sharp OK');"
```

Si ça affiche `Sharp OK`, c'est bon ✅

---

## 🚀 Workflow complet

### Étape 1 : Récupérer la nouvelle photo

#### Option A : Via Git (recommandé)
```bash
# Sur Mac
cd ~/Desktop/"site internet perso"/les-voyages-de-jess
mkdir -p temp-nouvelles-photos

# Copier la photo depuis le Bureau
cp ~/Desktop/nouvelle-photo.jpg temp-nouvelles-photos/

# Commit temporaire
git add temp-nouvelles-photos/
git commit -m "temp: Ajout nouvelle photo pour optimisation"
git push origin main
```

#### Option B : Via WeTransfer
1. Jessica upload la photo sur https://wetransfer.com/
2. Elle te donne le lien
3. Télécharger dans le sandbox

---

### Étape 2 : Vérifier le ratio de l'image

```bash
# Installer ImageMagick (si pas déjà fait)
sudo apt-get update && sudo apt-get install -y imagemagick

# Vérifier les dimensions
identify temp-nouvelles-photos/nouvelle-photo.jpg
```

**Exemple de sortie** :
```
nouvelle-photo.jpg JPEG 4608x3456 (ratio 4:3)
```

**Ratios courants** :
- 16:9 = 1.778 (ex: 1920×1080, 3840×2160)
- 4:3 = 1.333 (ex: 2048×1536, 4608×3456)
- 3:2 = 1.5 (ex: 3000×2000, 4608×3072)

**Si ratio ≠ 16:9** → passer à l'étape de recadrage

---

### Étape 3 : Recadrer en 16:9 (si nécessaire)

Créer le script `scripts/recrop-image.mjs` :

```javascript
import sharp from 'sharp';

const inputPath = 'temp-nouvelles-photos/nouvelle-photo.jpg';
const outputDir = 'public/static/images';

async function recropTo16x9() {
  const metadata = await sharp(inputPath).metadata();
  const { width, height } = metadata;
  
  console.log(`📐 Image originale: ${width}×${height}`);
  
  // Calculer les nouvelles dimensions 16:9
  const targetHeight = Math.round(width / 16 * 9);
  const cropTop = Math.round((height - targetHeight) / 2);
  
  console.log(`✂️  Recadrage: ${width}×${targetHeight} (crop ${cropTop}px haut/bas)`);
  
  // Recadrer et générer les 3 versions WebP
  const sizes = [400, 800, 1200];
  const quality = 75;
  
  for (const size of sizes) {
    const outputHeight = Math.round(size / 16 * 9);
    const outputPath = `${outputDir}/hero-nouvelle-${size}.webp`;
    
    await sharp(inputPath)
      .extract({ left: 0, top: cropTop, width: width, height: targetHeight })
      .resize(size, outputHeight, { fit: 'cover' })
      .webp({ quality })
      .toFile(outputPath);
    
    const stats = await sharp(outputPath).metadata();
    console.log(`✅ ${outputPath} (${stats.width}×${stats.height}, ${Math.round(stats.size / 1024)} KB)`);
  }
}

recropTo16x9();
```

**Exécuter** :
```bash
node scripts/recrop-image.mjs
```

---

### Étape 4 : Optimiser en WebP (si déjà 16:9)

Créer le script `scripts/optimize-image.mjs` :

```javascript
import sharp from 'sharp';

const inputPath = 'temp-nouvelles-photos/nouvelle-photo.jpg';
const outputDir = 'public/static/images';
const basename = 'hero-nouvelle'; // Renommer selon la page

async function optimizeImage() {
  const sizes = [400, 800, 1200];
  const quality = 75;
  
  for (const size of sizes) {
    const outputHeight = Math.round(size / 16 * 9); // 16:9
    const outputPath = `${outputDir}/${basename}-${size}.webp`;
    
    await sharp(inputPath)
      .resize(size, outputHeight, { fit: 'cover', position: 'center' })
      .webp({ quality })
      .toFile(outputPath);
    
    const stats = await sharp(outputPath).metadata();
    console.log(`✅ ${outputPath} (${stats.width}×${stats.height}, ${Math.round(stats.size / 1024)} KB)`);
  }
}

optimizeImage();
```

**Exécuter** :
```bash
node scripts/optimize-image.mjs
```

---

### Étape 5 : Renommer les fichiers

Si tu as créé `hero-nouvelle-400.webp`, renomme selon la page :

```bash
# Exemple pour la page "Voyage sur Mesure"
cd public/static/images
mv hero-nouvelle-400.webp hero-voyage-sur-mesure-400.webp
mv hero-nouvelle-800.webp hero-voyage-sur-mesure-800.webp
mv hero-nouvelle-1200.webp hero-voyage-sur-mesure-1200.webp
```

**Convention de nommage** :
- Homepage → `hero-home-*.webp`
- Voyage sur Mesure → `hero-voyage-sur-mesure-*.webp`
- Mes Formules → `hero-formules-*.webp`
- Destinations → `hero-destinations-*.webp`
- FAQ → `hero-faq-*.webp`
- Blog → `hero-blog-*.webp`
- Contact → `hero-contact-*.webp`

---

## 🎨 Intégration dans le HTML/CSS

### Option A : Modifier le CSS (recommandé)

Éditer `public/static/css/styles.css` :

```css
/* Mobile par défaut (400px) */
.hero-voyage-sur-mesure {
  background-image: url('/static/images/hero-voyage-sur-mesure-400.webp?v=4');
}

/* Tablet (800px) */
@media (min-width: 768px) {
  .hero-voyage-sur-mesure {
    background-image: url('/static/images/hero-voyage-sur-mesure-800.webp?v=4');
  }
}

/* Desktop (1200px) */
@media (min-width: 1200px) {
  .hero-voyage-sur-mesure {
    background-image: url('/static/images/hero-voyage-sur-mesure-1200.webp?v=4');
  }
}
```

**⚠️ Important** : Incrémenter `?v=X` pour forcer le rechargement (cache-busting).

### Option B : Modifier le HTML (si balise `<img>`)

Éditer `src/index.tsx` :

```tsx
<img 
  src="/static/images/hero-voyage-sur-mesure-400.webp?v=4"
  srcset="
    /static/images/hero-voyage-sur-mesure-400.webp?v=4 400w,
    /static/images/hero-voyage-sur-mesure-800.webp?v=4 800w,
    /static/images/hero-voyage-sur-mesure-1200.webp?v=4 1200w
  "
  sizes="(max-width: 767px) 400px, (max-width: 1199px) 800px, 1200px"
  alt="Voyage sur Mesure"
  loading="lazy"
/>
```

---

## 🔄 Cache-busting

### Pourquoi ?
Le navigateur et Cloudflare cachent les fichiers CSS/images. Si tu modifies une image sans changer son nom, l'ancienne version reste en cache.

### Solution : Query parameter `?v=X`

**Avant modification** :
```css
background-image: url('/static/images/hero-home-1200.webp?v=3');
```

**Après modification** :
```css
background-image: url('/static/images/hero-home-1200.webp?v=4');
```

### Incrémenter partout

**Dans le CSS** :
```bash
# Rechercher l'ancienne version
grep -r "?v=3" public/static/css/styles.css

# Remplacer par v=4
sed -i 's/?v=3/?v=4/g' public/static/css/styles.css
```

**Dans le HTML (pour le CSS)** :
```tsx
// src/index.tsx
<link href="/static/css/styles.css?v=4" rel="stylesheet" />
```

---

## 🧹 Nettoyage

### Supprimer le dossier temporaire

```bash
# Supprimer le dossier des photos temporaires
rm -rf temp-nouvelles-photos/

# Commit
git add -A
git commit -m "chore: Suppression photos temporaires"
git push origin main
```

---

## 🚀 Déploiement

### 1. Commit et push
```bash
git add public/static/images/*.webp
git add public/static/css/styles.css
git add src/index.tsx
git commit -m "perf: Optimisation image hero Voyage sur Mesure (v=4)"
git push origin main
```

### 2. Déployer (sur Mac)
```bash
cd ~/Desktop/"site internet perso"/les-voyages-de-jess
git pull origin main
npm run deploy
```

### 3. Purger le cache Cloudflare
1. https://dash.cloudflare.com/
2. Sélectionner `lesvoyagesdejess.com`
3. Caching → **Purge Everything**
4. Attendre 30-60s
5. Tester en navigation privée

---

## 🐛 Dépannage

### Problème 1 : Sharp n'est pas installé
```bash
npm install --save-dev sharp
```

### Problème 2 : L'image ne s'affiche pas
- Vérifier que le fichier existe : `ls -lh public/static/images/hero-*.webp`
- Vérifier le nom dans le CSS : `grep "hero-voyage" public/static/css/styles.css`
- Purger le cache Cloudflare

### Problème 3 : L'image est encore zoomée sur mobile
- Vérifier le ratio : doit être **16:9** (pas 4:3)
- Vérifier la media query mobile : `@media (max-width: 767px)`
- Ajuster `background-position` et `min-height`

### Problème 4 : Wrangler dit "0 files uploaded"
- Incrémenter le cache-busting : `?v=X` → `?v=X+1`
- Supprimer le cache Wrangler : `rm -rf .wrangler/`
- Redéployer : `npm run deploy`

---

## 📊 Résultats attendus

### Avant optimisation
- **Format** : JPG
- **Poids** : 2-5 MB
- **Versions** : 1 seule (4K)
- **Temps de chargement mobile** : 4-8s

### Après optimisation
- **Format** : WebP
- **Poids** : 150-250 KB (desktop), 10-20 KB (mobile)
- **Versions** : 3 (400px, 800px, 1200px)
- **Temps de chargement mobile** : 0.3-0.5s

### Gain
- **Poids** : -93% à -99%
- **Temps** : -90%
- **Qualité visuelle** : identique ✅

---

## ✅ Checklist complète

Avant d'optimiser une nouvelle image :
- [ ] Sharp est installé
- [ ] La photo est récupérée dans `temp-nouvelles-photos/`
- [ ] Le ratio est vérifié (16:9 idéal)

Pendant l'optimisation :
- [ ] Recadrage 4:3 → 16:9 si nécessaire
- [ ] Génération des 3 versions WebP (400/800/1200)
- [ ] Fichiers renommés selon la page (hero-{page}-{size}.webp)
- [ ] CSS modifié avec les nouvelles URLs
- [ ] Cache-busting incrémenté (?v=X+1)

Après l'optimisation :
- [ ] Commit avec message clair
- [ ] Push vers GitHub
- [ ] Pull sur Mac
- [ ] Déploiement avec `npm run deploy`
- [ ] Purge du cache Cloudflare
- [ ] Test en navigation privée

---

## 🎉 Félicitations !

Tu sais maintenant optimiser les images du site comme un pro ! 💪

Pour toute question, consulte :
- `docs/HANDOVER_05_FEV_2026_FINAL.md` : handover complet
- `docs/MESSAGE_PROCHAIN_AGENT_05_FEV_2026.md` : guide rapide

---

*Guide créé par Claude Code Agent - 05 février 2026*
