#!/bin/bash

# ============================================
# SCRIPT DE REPRISE PROJET - LES VOYAGES DE JESS
# ============================================
# Date: 20 mars 2026
# Agent: Pour le prochain agent qui reprend le projet
# ============================================

echo "🚀 Reprise du projet Les Voyages de Jess"
echo "=========================================="
echo ""

# Vérifier qu'on est dans le bon répertoire
if [ ! -f "wrangler.jsonc" ]; then
    echo "❌ ERREUR: Vous n'êtes pas dans le répertoire du projet!"
    echo "👉 Exécutez: cd /home/user/webapp"
    exit 1
fi

echo "✅ Répertoire de travail: $(pwd)"
echo ""

# Afficher l'état git
echo "📊 État Git actuel:"
git status --short
echo ""

# Afficher le dernier commit
echo "📌 Dernier commit:"
git log -1 --oneline
echo ""

# Vérifier les sauvegardes disponibles
echo "📦 Sauvegardes disponibles:"
ls -lh backup-carousel-v4-success-*.tar.gz 2>/dev/null || echo "Aucune sauvegarde trouvée"
echo ""

# Afficher le brief pour le prochain agent
echo "📝 Brief disponible:"
if [ -f "BRIEF_PROCHAIN_AGENT_V2.md" ]; then
    echo "✅ BRIEF_PROCHAIN_AGENT_V2.md (à lire en priorité)"
else
    echo "⚠️  Brief non trouvé"
fi
echo ""

# Résumé des priorités
echo "🎯 PRIORITÉS RESTANTES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ TERMINÉ:"
echo "  1. Carousel homepage V4 (format universel, auto-scroll)"
echo ""
echo "⏳ À FAIRE:"
echo "  2. Simplifier page /blog (retirer date et excerpt)"
echo "     📍 Fichier: src/index.tsx lignes ~1290-1360"
echo ""
echo "  3. Éditeur riche TinyMCE pour admin"
echo "     📍 Fichier: src/index.tsx lignes ~2360-2480"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Commandes de démarrage
echo "🔧 COMMANDES UTILES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  git pull origin main          # Récupérer dernières modifs"
echo "  npm run build                 # Build local"
echo "  npm run deploy                # Déployer sur Cloudflare"
echo "  cat BRIEF_PROCHAIN_AGENT_V2.md # Lire le brief complet"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Leçon importante
echo "⚠️  LEÇON IMPORTANTE (Cache Cloudflare):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Si les modifications ne s'appliquent pas après déploiement:"
echo ""
echo "  1. Supprimer temporairement la section problématique"
echo "  2. Déployer (pour vider le cache)"
echo "  3. Recréer from scratch avec nouveaux noms de classes"
echo ""
echo "Cette méthode a résolu le problème du carousel!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✨ Prêt à continuer ! Lis le BRIEF_PROCHAIN_AGENT_V2.md"
echo ""
