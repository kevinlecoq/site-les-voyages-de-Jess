#!/bin/bash

echo "🎨 Application de la refonte page d'accueil..."

# Backup
cp src/index.tsx src/index.tsx.backup
cp public/static/css/styles.css public/static/css/styles.css.backup

# Modification src/index.tsx
sed -i '' '608,623d' src/index.tsx
sed -i '' '607a\
    {/* Section Hero - Image uniquement */}\
<section class="hero hero-home hero-homepage">\
  <div style={{background: '"'"'rgba(0,0,0,0.2)'"'"', position: '"'"'absolute'"'"', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1}}></div>\
  <div style={{position: '"'"'relative'"'"', zIndex: 2}}>\
    <h1 class="hero-title" style={{color: '"'"'white'"'"', fontSize: '"'"'4rem'"'"'}}>Les Voyages de Jess</h1>\
    <p class="hero-subtitle" style={{fontSize: '"'"'1.2rem'"'"', color: '"'"'white'"'"', fontFamily: "'"'"'"'"'"'"'"'"'Alice'"'"'"'"'"'"'"'"', serif"}}>Créatrice de voyages sur mesure</p>\
  </div>\
</section>\
\
{/* Section Citation élégante - Nouvelle */}\
<section style={{\
  padding: '"'"'4rem 1.5rem'"'"',\
  background: '"'"'linear-gradient(to bottom, #ffffff 0%, #f8faf9 100%)'"'"',\
  display: '"'"'flex'"'"',\
  justifyContent: '"'"'center'"'"',\
  alignItems: '"'"'center'"'"'\
}}>\
  <div style={{\
    maxWidth: '"'"'800px'"'"',\
    width: '"'"'100%'"'"',\
    background: '"'"'white'"'"',\
    borderRadius: '"'"'16px'"'"',\
    padding: '"'"'3rem 2.5rem'"'"',\
    boxShadow: '"'"'0 10px 40px rgba(0,0,0,0.08)'"'"',\
    textAlign: '"'"'center'"'"',\
    border: '"'"'1px solid rgba(146, 181, 168, 0.1)'"'"'\
  }}>\
    <blockquote style={{\
      margin: '"'"'0 0 2rem 0'"'"',\
      padding: 0,\
      borderLeft: '"'"'none'"'"'\
    }}>\
      <p style={{\
        fontSize: '"'"'1.8rem'"'"',\
        lineHeight: 1.6,\
        color: '"'"'#2c3e50'"'"',\
        fontFamily: "'"'"'"'"'"'"'"'"'Alice'"'"'"'"'"'"'"'"', serif",\
        fontStyle: '"'"'italic'"'"',\
        fontWeight: 400,\
        margin: 0\
      }}>\
        "Parce que chaque voyageur est unique, chaque voyage doit l'"'"'être aussi."\
      </p>\
    </blockquote>\
    \
    <div style={{\
      width: '"'"'60px'"'"',\
      height: '"'"'3px'"'"',\
      background: '"'"'linear-gradient(to right, transparent, #92B5A8, transparent)'"'"',\
      margin: '"'"'2rem auto'"'"'\
    }}></div>\
    \
    <div style={{marginTop: '"'"'2rem'"'"'}}>\
      <a href="/contact" class="btn btn-primary" style={{\
        fontSize: '"'"'1.1rem'"'"',\
        padding: '"'"'1rem 2.5rem'"'"',\
        display: '"'"'inline-flex'"'"',\
        alignItems: '"'"'center'"'"',\
        gap: '"'"'0.5rem'"'"',\
        boxShadow: '"'"'0 4px 12px rgba(107, 144, 128, 0.3)'"'"',\
        transition: '"'"'all 0.3s ease'"'"'\
      }}>\
        <i class="fas fa-compass"></i> Je crée mon voyage\
      </a>\
    </div>\
  </div>\
</section>
' src/index.tsx

# Ajout CSS
cat >> public/static/css/styles.css << 'CSS_END'

/* Section Citation élégante - Page d'accueil */
.quote-card-section {
  padding: 4rem 1.5rem;
  background: linear-gradient(to bottom, #ffffff 0%, #f8faf9 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.quote-card {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 3rem 2.5rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  text-align: center;
  border: 1px solid rgba(146, 181, 168, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.quote-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0,0,0,0.12);
}

.quote-card blockquote {
  margin: 0 0 2rem 0;
  padding: 0;
  border-left: none;
}

.quote-card blockquote p {
  font-size: 1.8rem;
  line-height: 1.6;
  color: #2c3e50;
  font-family: 'Alice', serif;
  font-style: italic;
  font-weight: 400;
  margin: 0;
}

.quote-card-divider {
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, transparent, #92B5A8, transparent);
  margin: 2rem auto;
}

/* Responsive mobile pour la carte citation */
@media (max-width: 767px) {
  .quote-card-section {
    padding: 3rem 1rem;
  }
  
  .quote-card {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }
  
  .quote-card blockquote p {
    font-size: 1.3rem;
    line-height: 1.5;
  }
  
  .quote-card-divider {
    width: 40px;
    height: 2px;
    margin: 1.5rem auto;
  }
}
CSS_END

echo "✅ Modifications appliquées !"
echo "📋 Backups créés : src/index.tsx.backup et styles.css.backup"
