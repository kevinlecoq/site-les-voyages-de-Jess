CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES 
  ('formules_intro', 'En tant que Travel Planner, mon rôle est de concevoir votre voyage sur mesure de A à Z.'),
  ('about_jessica', 'Je m''appelle Jessica, passionnée de voyages et grande amoureuse d''aventure. Originaire du sud de la France, je vis au Québec depuis plus de 6 ans...'),
  ('about_photo', '/static/images/jessica-placeholder.jpg');
