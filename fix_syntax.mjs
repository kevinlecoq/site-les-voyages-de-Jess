import fs from 'fs';
const content = fs.readFileSync('src/index.tsx', 'utf8');

// Chercher la ligne problématique
const oldLine = `  }))`;

// La remplacer par la bonne syntaxe
const newLine = `  })(c, next)
})`;

const updated = content.replace(oldLine, newLine);

if (updated === content) {
  console.error('❌ Pattern non trouvé');
  process.exit(1);
}

fs.writeFileSync('src/index.tsx', updated);
console.log('✅ Syntaxe corrigée !');
