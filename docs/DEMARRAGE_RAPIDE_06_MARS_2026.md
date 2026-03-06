# ⚡ DÉMARRAGE RAPIDE - 30 SECONDES

**Date :** 6 mars 2026  
**Projet :** Les Voyages de Jess  
**État :** ✅ Opérationnel, 2 grosses modifs aujourd'hui

---

## 🚀 CE QUI A ÉTÉ FAIT AUJOURD'HUI

### 1️⃣ **Photo "Mes Destinations" remplacée** (✅ TERMINÉ)
- Image optimisée WebP (-93%)
- 3 versions responsive (400/800/1200px)

### 2️⃣ **Chatbot RAG implémenté** (✅ TERMINÉ) ⭐
- Base de connaissances créée (`chatbot_knowledge` table)
- 30+ infos officielles dans la DB
- Plus d'infos erronées (fini le faux numéro !)
- Chatbot conscient d'être sur le site web

---

## ⚡ COMMANDES ESSENTIELLES

```bash
# Récupérer le code
cd ~/Desktop/"site internet perso"/les-voyages-de-jess
git pull origin main

# Développer en local
npm run dev

# Déployer en production
npm run deploy

# Requête SQL sur la DB
npx wrangler d1 execute voyages-jess-db --remote --command="SELECT ..."
```

---

## 📊 BASE DE DONNÉES

**Database ID:** `9f1635bb-10ec-4a9e-acd9-754dadda2890`  
**Database Name:** `voyages-jess-db`

**Tables importantes:**
- `chatbot_knowledge` ← 30+ infos pour le chatbot (NOUVEAU)
- `blog_posts` ← Articles
- `faqs` ← Questions fréquentes
- `travel_packages` ← Formules de voyage

---

## 🎯 SI TU VEUX MODIFIER LE CHATBOT

**IMPORTANT:** Les infos du chatbot sont dans la **BASE DE DONNÉES**, pas le code !

```bash
# Voir les infos actuelles
npx wrangler d1 execute voyages-jess-db --remote \
  --command="SELECT * FROM chatbot_knowledge WHERE active=1"

# Modifier une info (ex: email)
npx wrangler d1 execute voyages-jess-db --remote \
  --command="UPDATE chatbot_knowledge 
             SET value='nouveau@email.com' 
             WHERE key='email'"
```

---

## 📚 DOCUMENTATION COMPLÈTE

Lis ces fichiers dans l'ordre :

1. **`docs/HANDOVER_06_MARS_2026.md`** ← Handover complet (ce fichier parent)
2. **`docs/CHATBOT_RAG_DOCUMENTATION.md`** ← Doc système chatbot
3. **`docs/HANDOVER_05_FEV_2026_FINAL.md`** ← Session précédente

---

## 🔗 LIENS

- 🌐 **Site prod:** https://lesvoyagesdejess.com
- 🌐 **Cloudflare:** https://6645f8aa.les-voyages-de-jess.pages.dev
- 📦 **GitHub:** https://github.com/kevinlecoq/site-les-voyages-de-Jess

---

## ⚠️ RÈGLES IMPORTANTES

1. ✅ **TOUJOURS** commit + push après modification
2. ✅ Tester le chatbot après chaque changement
3. ✅ Utiliser `--remote` pour les commandes D1
4. ✅ Images = WebP responsive (3 versions)
5. ✅ Infos chatbot = dans la DB, pas le code !

---

## 🎯 PROCHAINES ÉTAPES SUGGÉRÉES

1. Tester le chatbot (20-30 questions)
2. Optimiser autres images hero (accueil, formules...)
3. Enrichir `chatbot_knowledge` avec plus d'infos
4. Créer interface admin pour gérer les infos chatbot

---

**✨ Tout est prêt ! Bon développement ! 🚀**
