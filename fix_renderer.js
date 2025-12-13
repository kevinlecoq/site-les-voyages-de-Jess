const fs = require('fs');
const content = fs.readFileSync('src/index.tsx', 'utf8');

const oldCode = `// Renderer JSX avec layout commun
app.use('*', jsxRenderer(({ children, title }) => {`;

const newCode = `// Renderer JSX avec layout commun (exclure les API)
app.use('*', async (c, next) => {
  // Ignorer les routes API
  if (c.req.path.startsWith('/api/')) {
    return next()
  }
  
  return jsxRenderer(({ children, title }) => {`;

const updated = content.replace(oldCode, newCode);
fs.writeFileSync('src/index.tsx', updated);
console.log('✅ Fix appliqué !');
