import fs from 'fs';
let content = fs.readFileSync('src/index.tsx', 'utf8');

// Remplacer exactement la ligne 231
const lines = content.split('\n');
if (lines[230] && lines[230].trim() === '}))') {
  lines[230] = '})(c, next)\n})';
  content = lines.join('\n');
  fs.writeFileSync('src/index.tsx', content);
  console.log('✅ Syntaxe corrigée !');
} else {
  console.error('❌ Ligne 231 ne correspond pas à }))', 'Contenu:', lines[230]);
  process.exit(1);
}
