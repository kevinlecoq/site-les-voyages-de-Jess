-- Ajouter sort_order à travel_packages si elle n'existe pas
ALTER TABLE travel_packages ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Ajouter sort_order à faqs si elle n'existe pas
ALTER TABLE faqs ADD COLUMN sort_order INTEGER DEFAULT 0;

-- Mettre des valeurs par défaut
UPDATE travel_packages SET sort_order = id WHERE sort_order IS NULL OR sort_order = 0;
UPDATE faqs SET sort_order = id WHERE sort_order IS NULL OR sort_order = 0;
