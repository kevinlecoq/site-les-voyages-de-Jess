-- Migration : Ajouter support images pour le blog
-- Date : 18 mars 2026

-- Ajouter colonne featured_image à blog_posts
ALTER TABLE blog_posts ADD COLUMN featured_image TEXT;

-- Créer table pour galerie d'images des articles
CREATE TABLE IF NOT EXISTS blog_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_blog_images_post_id ON blog_images(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_images_sort_order ON blog_images(post_id, sort_order);
