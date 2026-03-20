#!/bin/bash

# Ligne de début : app.get('/admin/blog/new'
START_LINE=2366

# Le formulaire actuel fait environ 82 lignes
END_LINE=$((START_LINE + 82))

echo "Remplacement du formulaire (lignes $START_LINE à $END_LINE)..."

# Backup
cp src/index.tsx src/index.tsx.backup-blog

# Supprimer les lignes et insérer le nouveau formulaire
head -n $((START_LINE - 1)) src/index.tsx > src/index.tsx.tmp
cat FORMULAIRE_BLOG_COMPLET.txt >> src/index.tsx.tmp
tail -n +$((END_LINE + 1)) src/index.tsx >> src/index.tsx.tmp
mv src/index.tsx.tmp src/index.tsx

echo "✅ Formulaire remplacé !"
echo "📋 Backup sauvegardé : src/index.tsx.backup-blog"
