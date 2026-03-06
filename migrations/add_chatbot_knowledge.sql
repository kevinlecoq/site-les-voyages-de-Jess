-- Table pour la base de connaissances du chatbot
-- Cette table permet de gérer dynamiquement les informations
-- que le chatbot doit connaître sans modifier le code

CREATE TABLE IF NOT EXISTS chatbot_knowledge (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL, -- 'contact', 'pages', 'formules', 'general'
  key TEXT NOT NULL, -- Identifiant unique de l'info
  value TEXT NOT NULL, -- Valeur de l'information (peut être JSON)
  description TEXT, -- Description pour l'admin
  active INTEGER DEFAULT 1, -- 1 = actif, 0 = inactif
  priority INTEGER DEFAULT 0, -- Ordre de priorité (plus élevé = plus important)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- Index pour accélérer les recherches
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_category ON chatbot_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_knowledge_active ON chatbot_knowledge(active);

-- Insertion des données initiales
INSERT OR REPLACE INTO chatbot_knowledge (category, key, value, description, priority) VALUES

-- CONTACT
('contact', 'email', 'contact@lesvoyagesdejess.com', 'Email principal de Jessica', 100),
('contact', 'delai_reponse', '48 heures', 'Délai de réponse moyen', 90),
('contact', 'formulaire_page', '/contact', 'Page du formulaire de contact', 95),
('contact', 'instagram', '@lesvoyagesde_jess', 'Compte Instagram officiel', 70),
('contact', 'telephone', 'aucun', 'Jessica préfère le contact par email et formulaire', 80),

-- PAGES DU SITE
('pages', 'accueil', '/', 'Page d''accueil', 50),
('pages', 'qui_suis_je', '/qui-suis-je', 'Page à propos de Jessica', 60),
('pages', 'formules', '/mes-formules', 'Page des formules de voyage', 90),
('pages', 'destinations', '/destinations', 'Liste des 36 destinations couvertes', 95),
('pages', 'voyage_sur_mesure', '/voyage-sur-mesure', 'Page expliquant le processus', 85),
('pages', 'faq', '/faq', 'Questions fréquentes', 70),
('pages', 'blog', '/blog', 'Articles de blog', 60),
('pages', 'contact', '/contact', 'Formulaire de contact', 100),

-- FORMULES (résumé - les détails sont dans la table travel_packages)
('formules', 'nombre_formules', '3', 'Nombre de formules disponibles', 80),
('formules', 'durees', 'Court séjour (2-6j), Séjour classique (7-14j), Long voyage (15-21j+)', 'Durées des formules', 75),
('formules', 'inclus', 'Appel découverte, Itinéraire personnalisé, Recommandations hébergements, Suggestions activités, Carnet de voyage digital, 2 révisions incluses', 'Ce qui est inclus dans toutes les formules', 85),
('formules', 'services_extra', 'Voyages dog-friendly, Montages vidéo, Albums photos', 'Services supplémentaires sur devis', 70),

-- GÉNÉRAL
('general', 'nom_site', 'Les Voyages de Jess', 'Nom du site web', 100),
('general', 'nom_travel_planner', 'Jessica', 'Prénom de la travel planner', 100),
('general', 'role_chatbot', 'Assistant virtuel de Jessica pour inspirer et orienter les voyageurs', 'Rôle du chatbot', 90),
('general', 'contexte_integration', 'intégré au site web lesvoyagesdejess.com', 'Le chatbot est sur le site, pas externe', 100),
('general', 'approche', 'Voyages personnalisés sur mesure, pas de forfaits pré-établis', 'Approche de Jessica', 85),
('general', 'specialite', 'Planification détaillée d''itinéraires personnalisés pour 36 destinations', 'Spécialité', 90),

-- PROCESSUS
('processus', 'etape_1', 'Formulaire de demande sur le site', 'Première étape du processus', 90),
('processus', 'etape_2', 'Appel découverte gratuit sous 48h', 'Deuxième étape', 90),
('processus', 'etape_3', 'Création de l''itinéraire personnalisé + 2 révisions', 'Troisième étape', 90),
('processus', 'etape_4', 'Réception du carnet de voyage digital', 'Quatrième étape', 90),

-- TARIFICATION
('tarifs', 'court_sejour_eur', '150-250€', 'Tarif court séjour (2-6 jours)', 70),
('tarifs', 'court_sejour_cad', '225-375$ CAD', 'Tarif court séjour (2-6 jours)', 70),
('tarifs', 'sejour_classique_eur', '300-450€', 'Tarif séjour classique (7-14 jours)', 70),
('tarifs', 'sejour_classique_cad', '450-675$ CAD', 'Tarif séjour classique (7-14 jours)', 70),
('tarifs', 'long_voyage_eur', '500€+', 'Tarif long voyage (15-21+ jours)', 70),
('tarifs', 'long_voyage_cad', '750$+ CAD', 'Tarif long voyage (15-21+ jours)', 70);
