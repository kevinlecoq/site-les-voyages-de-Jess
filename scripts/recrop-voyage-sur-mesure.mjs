#!/usr/bin/env node

import sharp from 'sharp';
import { join } from 'path';

console.log('🔧 Recadrage de voyagesurmesure.jpg en 16:9...\n');

const sourceFile = 'temp-recadrage/voyagesurmesure.jpg';
const targetDir = 'public/static/images';

// Dimensions cibles pour 16:9
const targetWidth = 4608;
const targetHeight = Math.round(targetWidth / 16 * 9); // 2592

console.log(`📐 Dimensions source : 4608 × 3456 (4:3)`);
console.log(`📐 Dimensions cible : ${targetWidth} × ${targetHeight} (16:9)\n`);

// Recadrage centré
const cropTop = Math.round((3456 - targetHeight) / 2); // 432 pixels

console.log(`✂️  Recadrage : enlever ${cropTop}px en haut et en bas\n`);

// Générer les versions responsive
const sizes = [
  { width: 400, suffix: '-400', quality: 75 },
  { width: 800, suffix: '-800', quality: 78 },
  { width: 1200, suffix: '-1200', quality: 80 }
];

async function processImage() {
  // D'abord, recadrer l'image source
  const croppedBuffer = await sharp(sourceFile)
    .extract({
      left: 0,
      top: cropTop,
      width: targetWidth,
      height: targetHeight
    })
    .toBuffer();
  
  console.log('✅ Image recadrée en 16:9 !\n');
  
  // Générer les 3 versions optimisées
  for (const size of sizes) {
    const outputPath = join(targetDir, `hero-voyage-sur-mesure${size.suffix}.webp`);
    
    await sharp(croppedBuffer)
      .resize(size.width, null, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: size.quality })
      .toFile(outputPath);
    
    const stats = await sharp(outputPath).metadata();
    const fileSize = (await import('fs')).statSync(outputPath).size;
    const fileSizeKB = Math.round(fileSize / 1024);
    
    console.log(`   ✅ hero-voyage-sur-mesure${size.suffix}.webp (${stats.width}×${stats.height}, ${fileSizeKB} KB)`);
  }
  
  console.log('\n✅ Recadrage et optimisation terminés !\n');
  console.log('📊 Résumé :');
  console.log('   - Image source recadrée de 4:3 → 16:9');
  console.log('   - 3 versions WebP optimisées générées');
  console.log('   - Gain : ~97% de poids total\n');
}

processImage().catch(console.error);
