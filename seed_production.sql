-- Insérer des formules de voyage
INSERT OR IGNORE INTO travel_packages (id, name, duration, description, price_eur, price_cad, sort_order) VALUES
(1, 'Escapade Express', '2-6 jours', 'Pour un court séjour bien organisé', 150, 220, 1),
(2, 'Aventure Complète', '7-14 jours', 'Un voyage équilibré et sur mesure', 300, 440, 2),
(3, 'Odyssée Sur Mesure', '15-21 jours', 'Une immersion totale dans votre destination', 450, 660, 3),
(4, 'Expédition Signature', '21+ jours', 'Le voyage de vos rêves en version XXL', 600, 880, 4);
