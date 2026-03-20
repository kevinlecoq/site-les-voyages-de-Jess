#!/bin/bash

# Script pour appliquer la migration du chatbot RAG
# Usage: ./scripts/apply-chatbot-migration.sh

echo "🚀 Application de la migration chatbot RAG..."
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Étape 1: Vérification de la base de données${NC}"
echo "Database ID: 9f1635bb-10ec-4a9e-acd9-754dadda2890"
echo "Database Name: voyages-jess-db"
echo ""

echo -e "${YELLOW}📋 Étape 2: Application de la migration${NC}"
npx wrangler d1 execute voyages-jess-db --remote --file=migrations/add_chatbot_knowledge.sql

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Migration appliquée avec succès !${NC}"
    echo ""
    echo "🔍 Vérification des données insérées..."
    npx wrangler d1 execute voyages-jess-db --remote --command="SELECT category, COUNT(*) as count FROM chatbot_knowledge GROUP BY category"
    echo ""
    echo -e "${GREEN}✨ Le chatbot RAG est maintenant opérationnel !${NC}"
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
