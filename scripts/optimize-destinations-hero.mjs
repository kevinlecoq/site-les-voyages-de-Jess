#!/usr/bin/env node

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { statSync } from 'fs';

console.log('🚀 Optimisation de l\'image hero "Mes Destinations" en cours...\n');

const sourceFile = 'mesdestinations1.JPG';
const targetDir = 'public/static/images';
const targetName = 'hero-destinations';

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
async function optimizeDestinationsHero() {
  console.log(`📸 Traitement de ${sourceFile}...`);
  
  // Vérifier que le fichier source existe
  if (!existsSync(sourceFile)) {
    console.error(`❌ Erreur : ${sourceFile} introuvable`);
    process.exit(1);
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
  
  console.log('\n✅ Optimisation terminée !\n');
  console.log('📊 Résumé :');
  console.log(`   - Image source : ${sourceSizeMB} MB (${sourceFile})`);
  console.log(`   - 3 images WebP créées (400px, 800px, 1200px)`);
  console.log(`   - Gain total : ${savedMB} MB (-${savedPercent}%)\n`);
  console.log('🎯 Prochaine étape : Modifier le code pour utiliser ces images !');
}

optimizeDestinationsHero().catch(console.error);
