#!/bin/bash

# Restaurer le backup
cp src/index.tsx.backup src/index.tsx

# Utiliser sed correctement
perl -i -pe 's/fontFamily: "'"'"'"'"'"'"'"'"'"'"'"'"'"'"Alice'"'"'"'"'"'"'"'"'"'"'"'"'"'"'"'"'"'", serif"/fontFamily: "'\''Alice'\'', serif"/g' src/index.tsx

echo "✅ Correction appliquée"
