import fs from 'fs';
const content = fs.readFileSync('src/index.tsx', 'utf8');

const oldCode = `// Renderer JSX avec layout commun
app.use('*', jsxRenderer(({ children, title }) => {`;

const newCode = `// Renderer JSX avec layout commun (exclure les API)
app.use('*', async (c, next) => {
  // Skip JSX rendering pour les routes API
  if (c.req.path.startsWith('/api/')) {
    return next()
  }
  
  return jsxRenderer(({ children, title }) => {`;

const updated = content.replace(oldCode, newCode);

// Vérifier que le remplacement a fonctionné
if (updated === content) {
  console.error('❌ ERREUR: Le code à remplacer n\'a pas été trouvé');
  process.exit(1);
}

fs.writeFileSync('src/index.tsx', updated);
console.log('✅ Fix appliqué avec succès !');
console.log('📝 Changement: jsxRenderer skip maintenant les routes /api/*');
