# 🤖 Système RAG du Chatbot - Documentation

## 📚 Vue d'ensemble

Le chatbot utilise désormais un système **RAG (Retrieval-Augmented Generation)** pour récupérer dynamiquement les informations officielles du site avant de générer ses réponses.

### Avantages
- ✅ **Informations toujours à jour** sans modifier le code
- ✅ **Cohérence parfaite** avec le site web
- ✅ **Pas de données erronées** (plus de numéro de téléphone inventé)
- ✅ **Évolutif** : facile d'ajouter de nouvelles infos
- ✅ **Maintenable** : Jessica peut modifier via le panneau admin (futur)

---

## 🏗️ Architecture

### 1. Base de données
Table `chatbot_knowledge` contenant les informations structurées :

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Identifiant unique |
| `category` | TEXT | Catégorie ('contact', 'pages', 'formules', etc.) |
| `key` | TEXT | Clé unique de l'info |
| `value` | TEXT | Valeur de l'information |
| `description` | TEXT | Description pour l'admin |
| `active` | INTEGER | 1 = actif, 0 = inactif |
| `priority` | INTEGER | Ordre de priorité (plus élevé = plus important) |

### 2. Catégories disponibles
- **contact** : Email, délai de réponse, formulaire, Instagram
- **pages** : Chemins vers les pages du site
- **formules** : Infos sur les formules de voyage
- **tarifs** : Grille tarifaire
- **general** : Contexte général (nom du site, rôle du chatbot)
- **processus** : Étapes de réservation

### 3. Fonction RAG
```typescript
async function getChatbotKnowledge(db: D1Database): Promise<string>
```

Cette fonction :
1. Récupère les connaissances actives depuis la base
2. Les organise par catégorie
3. Les formate en texte structuré pour Claude
4. Retourne un contexte enrichi injecté dans le prompt système

---

## 🚀 Utilisation

### Ajouter une nouvelle information

**En SQL (pour développeurs) :**
```sql
INSERT INTO chatbot_knowledge (category, key, value, description, priority) 
VALUES ('contact', 'whatsapp', '+1234567890', 'Numéro WhatsApp', 75);
```

**Via interface admin (futur) :**
1. Aller dans "Admin > Chatbot Knowledge"
2. Cliquer sur "Ajouter une info"
3. Remplir le formulaire
4. Sauvegarder

### Modifier une information existante

**En SQL :**
```sql
UPDATE chatbot_knowledge 
SET value = 'nouvelle_valeur', updated_at = CURRENT_TIMESTAMP 
WHERE category = 'contact' AND key = 'email';
```

### Désactiver temporairement une info

```sql
UPDATE chatbot_knowledge 
SET active = 0 
WHERE category = 'contact' AND key = 'telephone';
```

---

## 📊 Exemples de comportements

### Avant RAG (problèmes)
**Question :** "Je veux appeler Jessica"
**Réponse :** "Voici son numéro : +1 (514) 677-4050" ❌ (FAUX)

### Après RAG (correct)
**Question :** "Je veux appeler Jessica"
**Réponse :** "Jessica privilégie le contact par email (contact@lesvoyagesdejess.com) et le formulaire de contact pour mieux comprendre votre projet. Elle vous répondra sous 48h ! 😊" ✅

---

## 🔧 Maintenance

### Vérifier les connaissances actives
```sql
SELECT category, key, value, priority 
FROM chatbot_knowledge 
WHERE active = 1 
ORDER BY priority DESC;
```

### Logs et debugging
Les erreurs de récupération sont loggées mais n'empêchent pas le chatbot de fonctionner (fallback sur prompt de base).

---

## 🎯 Prochaines améliorations possibles

1. **Interface admin graphique** pour gérer les connaissances
2. **Versioning** des connaissances (historique des changements)
3. **A/B testing** de différentes formulations
4. **Analytics** : quelles infos sont les plus demandées
5. **Multilingue** : valeurs en français + anglais

---

## 📝 Notes importantes

- Les connaissances sont chargées **à chaque requête** (pas de cache)
- Si la base est vide ou en erreur, le chatbot fonctionne quand même avec le prompt de base
- La priorité détermine l'ordre d'affichage dans le contexte injecté
- Les modifications sont prises en compte **immédiatement** (pas besoin de redéployer)

---

## 🐛 Troubleshooting

**Le chatbot ne récupère pas les nouvelles infos :**
- Vérifier que `active = 1`
- Vérifier la connexion à la base D1
- Checker les logs Cloudflare Workers

**Erreur "table doesn't exist" :**
- Exécuter la migration : `wrangler d1 execute voyages-jess-db --file=migrations/add_chatbot_knowledge.sql`

---

✨ **Système opérationnel depuis le 6 mars 2026**
