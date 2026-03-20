#!/bin/bash

# Créer le nouveau code de la route avec envoi d'email
cat > /tmp/new_route.txt << 'ROUTE_END'
// API: Soumettre une demande de devis avec envoi d'email
app.post('/api/quote-request', async (c) => {
  const data = await c.req.json();

  try {
    // 1. Vérifier que la clé Resend existe
    if (!c.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY manquante');
      return c.json({ success: false, error: 'Configuration serveur manquante' }, 500);
    }

    // 2. Sauvegarder dans la base de données
    await c.env.db.prepare(`
      INSERT INTO quote_requests (name, email, phone, destination, duration, budget, travelers, message, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.email,
      data.phone || null,
      data.destination,
      data.duration,
      data.budget || null,
      data.travelers,
      data.message,
      data.special_requests || null
    ).run();

    // 3. Envoyer l'email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Les Voyages de Jess <onboarding@resend.dev>',
        to: 'kevin.lecoq14@gmail.com',
        subject: `Nouvelle demande de devis - ${data.name}`,
        html: `
          <h2>Nouvelle demande de devis</h2>
          <p><strong>Nom:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Téléphone:</strong> ${data.phone || 'Non renseigné'}</p>
          <p><strong>Destination:</strong> ${data.destination}</p>
          <p><strong>Dates souhaitées:</strong> ${data.travel_dates || 'Flexibles'}</p>
          <p><strong>Durée:</strong> ${data.duration}</p>
          <p><strong>Nombre de voyageurs:</strong> ${data.travelers}</p>
          <p><strong>Budget:</strong> ${data.budget || 'Non précisé'}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
          ${data.special_requests ? `<p><strong>Demandes spéciales:</strong></p><p>${data.special_requests}</p>` : ''}
        `
      })
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Erreur Resend:', errorText);
      return c.json({ success: false, error: 'Erreur lors de l\'envoi de l\'email' }, 500);
    }

    return c.json({ success: true, message: 'Votre demande a été envoyée avec succès!' });

  } catch (error) {
    console.error('Erreur formulaire contact:', error);
    return c.json({ success: false, error: 'Une erreur est survenue' }, 500);
  }
});
ROUTE_END

# Créer le script Python pour remplacer la route
cat > /tmp/replace_route.py << 'PYTHON_END'
import re

# Lire le fichier
with open('src/index.tsx', 'r') as f:
    content = f.read()

# Lire la nouvelle route
with open('/tmp/new_route.txt', 'r') as f:
    new_route = f.read()

# Pattern pour trouver l'ancienne route
pattern = r"// API: Soumettre une demande de devis\napp\.post\('/api/quote-request'.*?\n\}\)"

# Remplacer
content = re.sub(pattern, new_route.strip(), content, flags=re.DOTALL)

# Écrire le résultat
with open('src/index.tsx', 'w') as f:
    f.write(content)

print("✅ Route remplacée avec succès!")
PYTHON_END

# Exécuter le script Python
python3 /tmp/replace_route.py

# Nettoyer
rm /tmp/new_route.txt /tmp/replace_route.py

echo "✅ Modification terminée!"
