#!/usr/bin/env node

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 Optimisation des images hero en cours...\n');

// Mapping des noms de fichiers
const imageMapping = {
  'lesvoyagesdejess.jpg': 'hero-home',
  'voyagesurmesure.jpg': 'hero-voyage-sur-mesure',
  'mesformules.jpg': 'hero-formules',
  'mesdestinations.jpg': 'hero-destinations',
  'FAQ.jpg': 'hero-faq',
  'blog.jpg': 'hero-blog',
  'contact.jpg': 'hero-contact'
};

// Dossiers
const sourceDir = 'temp-nouvelles-photos';
const targetDir = 'public/static/images';

// Créer le dossier de destination si nécessaire
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

// Résolutions pour responsive
const sizes = [
  { width: 400, suffix: '-400', quality: 75 },
  { width: 800, suffix: '-800', quality: 78 },
  { width: 1200, suffix: '-1200', quality: 80 }
];

// Fonction d'optimisation
async function optimizeImage(sourceName, targetName) {
  const sourcePath = join(sourceDir, sourceName);
  
  console.log(`📸 Traitement de ${sourceName}...`);
  
  for (const size of sizes) {
    const outputPath = join(targetDir, `${targetName}${size.suffix}.webp`);
    
    try {
      await sharp(sourcePath)
        .resize(size.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: size.quality })
        .toFile(outputPath);
      
      const stats = await sharp(outputPath).metadata();
      const fileSize = (await import('fs')).statSync(outputPath).size;
      const fileSizeKB = Math.round(fileSize / 1024);
      
      console.log(`   ✅ ${targetName}${size.suffix}.webp (${stats.width}×${stats.height}, ${fileSizeKB} KB)`);
    } catch (error) {
      console.error(`   ❌ Erreur pour ${targetName}${size.suffix}.webp:`, error.message);
    }
  }
  
  console.log('');
}

// Traiter toutes les images
async function processAll() {
  for (const [sourceName, targetName] of Object.entries(imageMapping)) {
    await optimizeImage(sourceName, targetName);
  }
  
  console.log('✅ Optimisation terminée !\n');
  console.log('📊 Résumé :');
  console.log('   - 7 images source (JPG 4K)');
  console.log('   - 21 images optimisées (WebP responsive)');
  console.log('   - 3 résolutions par image (400px, 800px, 1200px)');
  console.log('   - Gain estimé : -90% de poids total\n');
}

processAll().catch(console.error);
