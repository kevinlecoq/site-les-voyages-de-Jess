import sharp from 'sharp';
import { existsSync, statSync } from 'fs';
import { join } from 'path';

const images = [
  'hero-home',
  'hero-qui-suis-je',
  'hero-voyage-sur-mesure',
  'hero-formules',
  'hero-destinations',
  'hero-faq',
  'hero-blog',
  'hero-contact'
];

const sizes = [
  { width: 400, quality: 90 },
  { width: 800, quality: 92 },
  { width: 1200, quality: 95 }
];

const targetDir = 'public/static/images';

console.log('🚀 Regénération de 24 images en HAUTE QUALITÉ...\n');

let totalOriginal = 0;
let totalOptimized = 0;

for (const img of images) {
  const sourceFile = img + '.jpg';
  if (!existsSync(sourceFile)) {
    console.log('⚠️  ' + sourceFile + ' introuvable, ignoré\n');
    continue;
  }
  
  const stats = statSync(sourceFile);
  totalOriginal += stats.size;
  console.log('📸 ' + img + ' (' + (stats.size / (1024*1024)).toFixed(2) + ' MB)');
  
  for (const size of sizes) {
    const output = join(targetDir, img + '-' + size.width + '.webp');
    await sharp(sourceFile)
      .resize(size.width, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: size.quality, effort: 6 })
      .toFile(output);
    
    const outStats = statSync(output);
    totalOptimized += outStats.size;
    console.log('  ✅ ' + size.width + 'px → ' + Math.round(outStats.size/1024) + ' KB (quality=' + size.quality + ')');
  }
  console.log('');
}

console.log('✅ Terminé ! 24 images WebP haute qualité créées');
console.log('📊 Total : ' + (totalOriginal/(1024*1024)).toFixed(2) + ' MB → ' + (totalOptimized/(1024*1024)).toFixed(2) + ' MB');
console.log('💾 Gain : -' + (100 - (totalOptimized/totalOriginal*100)).toFixed(0) + '%');
