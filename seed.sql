-- Données initiales pour le site

-- Paramètres du site
INSERT OR IGNORE INTO site_settings (key, value) VALUES 
  ('site_title', 'Les Voyages de Jess'),
  ('about_jessica', 'Je m''appelle Jessica, passionnée de voyages et grande amoureuse d''aventure. Originaire du sud de la France, je vis au Québec depuis plus de 6 ans avec mon mari et notre chien Lucky, un malinois de 5 ans qui m''accompagne dans toutes mes aventures. 🐾

Depuis mon tout premier voyage humanitaire en Tanzanie à 17 ans, j''ai multiplié les escapades et aventures; parmi lesquelles: l''Asie, l''Amérique du Sud et Centrale en sac à dos, l''Europe en van durant 6 mois; sans oublier de multiples autres escapades ! Ces expériences m''ont appris que chaque voyage est unique — à condition qu''il soit pensé selon vos envies, votre rythme et vos rêves.

Après avoir travaillé comme conseillère externe dans une agence de voyage, j''ai compris que je voulais aller plus loin : offrir une approche plus libre, humaine et personnalisée du voyage. C''est ainsi qu''est née mon envie de devenir Travel Planner : non pas pour vendre des voyages, mais pour aider les autres à créer le leur — celui qui leur ressemble vraiment.

Aujourd''hui, j''accompagne chaque voyageur dans la conception d''itinéraires sur mesure, pensés selon ses envies, son rythme et son budget, afin de transformer chaque idée d''évasion en une expérience unique et fluide.

Mon objectif : vous inspirer, vous simplifier la vie et vous aider à vivre des voyages aussi beaux à imaginer qu''à réaliser.'),
  ('about_photo', '/static/images/jessica-placeholder.jpg'),
  ('hero_subtitle', 'Créatrice de voyages sur mesure'),
  ('contact_email', 'contact@lesvoyagesdejess.ca'),
  ('instagram_url', 'https://www.instagram.com/lesvoyagesdejess'),
  ('facebook_url', '');

-- Formules de voyage
INSERT OR IGNORE INTO travel_packages (name, duration, price_eur, price_cad, description, sort_order) VALUES 
  ('Parenthèse', '2 à 6 jours', 300, 450, 'Pour une courte pause bien méritée', 1),
  ('Escapade', '7 à 14 jours', 450, 700, 'Pour un voyage complet et ressourçant', 2),
  ('Aventure', '15 à 21 jours', 575, 850, 'Pour vivre une expérience immersive', 3),
  ('Exploration', 'Plus de 21 jours', 700, 1050, 'Pour les rêveurs et grand explorateurs', 4);

-- FAQ initiales
INSERT OR IGNORE INTO faqs (question, answer, category, sort_order) VALUES 
  ('Comment fonctionne la planification de voyage ?', 'Nous commençons par un appel découverte gratuit pour comprendre vos envies, votre budget et vos contraintes. Ensuite, je crée un itinéraire personnalisé que nous affinons ensemble jusqu''à ce qu''il soit parfait pour vous.', 'Processus', 1),
  ('Combien de temps prend la création d''un itinéraire ?', 'En général, comptez entre 7 à 14 jours selon la complexité du voyage. Pour les destinations plus exotiques ou les longs séjours, cela peut prendre un peu plus de temps.', 'Processus', 2),
  ('Est-ce que vous réservez les hébergements et transports ?', 'Je vous fournis un itinéraire détaillé avec toutes mes recommandations. Vous êtes libre de réserver vous-même ou je peux vous aider moyennant des frais supplémentaires.', 'Services', 3),
  ('Quels sont les moyens de paiement acceptés ?', 'J''accepte les paiements par carte bancaire (Visa, Mastercard) via Stripe. Les paiements sont sécurisés et vous pouvez payer en EUR ou CAD.', 'Paiement', 4),
  ('Puis-je modifier mon itinéraire après l''avoir reçu ?', 'Oui ! Chaque forfait inclut des révisions. Si vous avez besoin de modifications supplémentaires, elles seront facturées à un tarif horaire.', 'Services', 5);

-- Utilisateur admin par défaut (mot de passe: ChangeMe123!)
INSERT OR IGNORE INTO admin_users (email, password_hash, name) VALUES 
('jess@lesvoyagesdejess.ca', '$2b$10$J0rmjnrFaDsg2YMpLOCibO9e035Eu.F8kQR2m2Ip573Ah10b3iWXu', 'Jessica');

