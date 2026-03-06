#!/bin/bash

# ================================================================
# 💾 SCRIPT DE SAUVEGARDE COMPLÈTE
# ================================================================
# Crée une sauvegarde complète du projet Les Voyages de Jess
# Date: 6 mars 2026
# Usage: ./scripts/backup-complet.sh
# ================================================================

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Variables
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_${DATE}"
PROJECT_NAME="les-voyages-de-jess"

echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  💾 SAUVEGARDE COMPLÈTE DU PROJET   ║${NC}"
echo -e "${BLUE}╔══════════════════════════════════════╗${NC}"
echo ""

# ================================================================
# 1. CRÉATION DU DOSSIER DE SAUVEGARDE
# ================================================================
echo -e "${YELLOW}📁 Étape 1/5: Création du dossier de sauvegarde${NC}"
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✓ Dossier créé: ${BACKUP_DIR}${NC}"
echo ""

# ================================================================
# 2. SAUVEGARDE DES FICHIERS DU PROJET
# ================================================================
echo -e "${YELLOW}📦 Étape 2/5: Sauvegarde des fichiers du projet${NC}"

# Liste des fichiers/dossiers à sauvegarder
ITEMS=(
    "src/"
    "public/"
    "docs/"
    "scripts/"
    "migrations/"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "vite.config.ts"
    "wrangler.jsonc"
    "README.md"
    ".gitignore"
)

for item in "${ITEMS[@]}"; do
    if [ -e "$item" ]; then
        cp -r "$item" "$BACKUP_DIR/"
        echo -e "${GREEN}✓ Copié: ${item}${NC}"
    else
        echo -e "${RED}⚠ Non trouvé: ${item}${NC}"
    fi
done
echo ""

# ================================================================
# 3. SAUVEGARDE DE LA BASE DE DONNÉES D1
# ================================================================
echo -e "${YELLOW}🗄️  Étape 3/5: Export de la base de données D1${NC}"

DB_FILE="${BACKUP_DIR}/database_backup_${DATE}.sql"

echo "Exportation de la base de données (remote)..."
npx wrangler d1 export voyages-jess-db --remote --output="$DB_FILE" 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Base de données exportée: ${DB_FILE}${NC}"
else
    echo -e "${RED}✗ Erreur lors de l'export de la base${NC}"
fi
echo ""

# ================================================================
# 4. SAUVEGARDE DES INFOS GIT
# ================================================================
echo -e "${YELLOW}📊 Étape 4/5: Sauvegarde des informations Git${NC}"

GIT_INFO="${BACKUP_DIR}/git_info.txt"

{
    echo "======================================="
    echo "INFORMATIONS GIT - ${DATE}"
    echo "======================================="
    echo ""
    echo "--- Remote URL ---"
    git remote -v
    echo ""
    echo "--- Branche actuelle ---"
    git branch --show-current
    echo ""
    echo "--- Dernier commit ---"
    git log -1 --pretty=format:"%H%n%an <%ae>%n%cd%n%s%n%b" --date=format:"%Y-%m-%d %H:%M:%S"
    echo ""
    echo ""
    echo "--- Status ---"
    git status
    echo ""
    echo "--- Derniers 10 commits ---"
    git log -10 --oneline --graph
    echo ""
} > "$GIT_INFO"

echo -e "${GREEN}✓ Informations Git sauvegardées: ${GIT_INFO}${NC}"
echo ""

# ================================================================
# 5. CRÉATION D'UN FICHIER RÉCAPITULATIF
# ================================================================
echo -e "${YELLOW}📝 Étape 5/5: Création du fichier récapitulatif${NC}"

RECAP="${BACKUP_DIR}/RECAP_SAUVEGARDE.txt"

{
    echo "================================================================"
    echo "RÉCAPITULATIF DE LA SAUVEGARDE"
    echo "================================================================"
    echo ""
    echo "Date de sauvegarde: ${DATE}"
    echo "Projet: ${PROJECT_NAME}"
    echo "Dossier de sauvegarde: ${BACKUP_DIR}"
    echo ""
    echo "--- Fichiers sauvegardés ---"
    find "$BACKUP_DIR" -type f | wc -l | xargs echo "Nombre de fichiers:"
    du -sh "$BACKUP_DIR" | awk '{print "Taille totale: " $1}'
    echo ""
    echo "--- Contenu ---"
    tree -L 2 "$BACKUP_DIR" 2>/dev/null || find "$BACKUP_DIR" -maxdepth 2 -print
    echo ""
    echo "--- Base de données ---"
    if [ -f "$DB_FILE" ]; then
        wc -l "$DB_FILE" | awk '{print "Lignes SQL: " $1}'
        du -h "$DB_FILE" | awk '{print "Taille DB: " $1}'
    else
        echo "Base de données non exportée"
    fi
    echo ""
    echo "--- État du projet ---"
    echo "Dernier commit: $(git log -1 --pretty=format:'%h - %s (%cr)' 2>/dev/null || echo 'N/A')"
    echo "Branche: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo ""
    echo "================================================================"
    echo "RESTAURATION"
    echo "================================================================"
    echo ""
    echo "Pour restaurer cette sauvegarde:"
    echo "1. Copier le contenu de ${BACKUP_DIR}/ vers un nouveau projet"
    echo "2. Installer les dépendances: npm install"
    echo "3. Restaurer la DB: npx wrangler d1 execute voyages-jess-db --remote --file=${DB_FILE}"
    echo "4. Déployer: npm run deploy"
    echo ""
} > "$RECAP"

echo -e "${GREEN}✓ Récapitulatif créé: ${RECAP}${NC}"
echo ""

# ================================================================
# 6. COMPRESSION (OPTIONNELLE)
# ================================================================
echo -e "${YELLOW}🗜️  Compression de la sauvegarde (optionnel)${NC}"
read -p "Voulez-vous compresser la sauvegarde en .tar.gz ? (o/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[OoYy]$ ]]; then
    ARCHIVE="${PROJECT_NAME}_backup_${DATE}.tar.gz"
    tar -czf "$ARCHIVE" "$BACKUP_DIR"
    echo -e "${GREEN}✓ Archive créée: ${ARCHIVE}${NC}"
    echo -e "${BLUE}💡 Vous pouvez supprimer le dossier ${BACKUP_DIR} si vous le souhaitez${NC}"
else
    echo -e "${BLUE}ℹ️  Sauvegarde non compressée${NC}"
fi
echo ""

# ================================================================
# RÉSUMÉ FINAL
# ================================================================
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ SAUVEGARDE TERMINÉE !         ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Dossier de sauvegarde:${NC} ${BACKUP_DIR}"
echo -e "${BLUE}📝 Récapitulatif:${NC} ${RECAP}"
echo -e "${BLUE}🗄️  Base de données:${NC} ${DB_FILE}"
if [ -f "$ARCHIVE" ]; then
    echo -e "${BLUE}🗜️  Archive compressée:${NC} ${ARCHIVE}"
fi
echo ""
echo -e "${YELLOW}💡 Conseils:${NC}"
echo "  - Conservez cette sauvegarde en lieu sûr"
echo "  - Testez la restauration de temps en temps"
echo "  - Faites des sauvegardes régulières (hebdomadaires)"
echo ""
echo -e "${GREEN}✨ Bonne continuation ! 🚀${NC}"
