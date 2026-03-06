#!/usr/bin/env node

import sharp from 'sharp';
import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🚀 Optimisation des images "Formules" et "Destinations" en cours...\n');

const targetDir = 'public/static/images';

// Créer le dossier de destination si nécessaire
if (!existsSync(targetDir)) {
  mkdirSync(targetDir, { recursive: true });
}

// Configuration des images à optimiser
const images = [
  {
    sourceFile: 'mesformules1.jpg',
    targetName: 'hero-formules',
    description: 'Mes Formules'
  },
  {
    sourceFile: 'destinations.JPG',
    targetName: 'hero-destinations',
    description: 'Mes Destinations'
  }
];

// Résolutions pour responsive
const sizes = [
  { width: 400, suffix: '-400', quality: 75 },
  { width: 800, suffix: '-800', quality: 78 },
  { width: 1200, suffix: '-1200', quality: 80 }
];

// Fonction d'optimisation
async function optimizeImage(sourceFile, targetName, description) {
  console.log(`📸 Traitement de ${description} (${sourceFile})...`);
  
  // Vérifier que le fichier source existe
  if (!existsSync(sourceFile)) {
    console.error(`   ❌ Erreur : ${sourceFile} introuvable`);
    return;
  }
  
  // Afficher les infos du fichier source
  const sourceStats = statSync(sourceFile);
  const sourceSizeMB = (sourceStats.size / (1024 * 1024)).toFixed(2);
  console.log(`   📁 Fichier source : ${sourceSizeMB} MB\n`);
  
  let totalSaved = sourceStats.size;
  
  for (const size of sizes) {
    const outputPath = join(targetDir, `${targetName}${size.suffix}.webp`);
    
    try {
      await sharp(sourceFile)
        .resize(size.width, null, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: size.quality })
        .toFile(outputPath);
      
      const stats = await sharp(outputPath).metadata();
      const fileSize = statSync(outputPath).size;
      const fileSizeKB = Math.round(fileSize / 1024);
      totalSaved -= fileSize;
      
      console.log(`   ✅ ${targetName}${size.suffix}.webp (${stats.width}×${stats.height}, ${fileSizeKB} KB)`);
    } catch (error) {
      console.error(`   ❌ Erreur pour ${targetName}${size.suffix}.webp:`, error.message);
    }
  }
  
  const savedMB = (totalSaved / (1024 * 1024)).toFixed(2);
  const savedPercent = Math.round((totalSaved / sourceStats.size) * 100);
  
  console.log(`   💾 Gain : ${savedMB} MB (-${savedPercent}%)\n`);
}

// Traiter toutes les images
async function processAll() {
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  
  for (const img of images) {
    await optimizeImage(img.sourceFile, img.targetName, img.description);
    
    // Calculer les tailles pour le récap
    if (existsSync(img.sourceFile)) {
      totalOriginalSize += statSync(img.sourceFile).size;
    }
    
    for (const size of sizes) {
      const outputPath = join(targetDir, `${img.targetName}${size.suffix}.webp`);
      if (existsSync(outputPath)) {
        totalOptimizedSize += statSync(outputPath).size;
      }
    }
  }
  
  console.log('✅ Optimisation terminée !\n');
  console.log('📊 Résumé global :');
  console.log(`   - 2 images sources (JPG)`);
  console.log(`   - 6 images WebP créées (3 résolutions × 2 images)`);
  console.log(`   - Taille originale : ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   - Taille optimisée : ${(totalOptimizedSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`   - Gain total : ${((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(0)}%\n`);
  console.log('🎯 Prochaine étape : Les images sont prêtes à être utilisées !');
}

processAll().catch(console.error);
