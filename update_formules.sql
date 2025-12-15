UPDATE travel_packages SET 
  name = 'Parenthèse',
  description = 'Pour une courte pause bien méritée'
WHERE duration = '2-6 jours';

UPDATE travel_packages SET 
  name = 'Escapade',
  description = 'Pour un voyage complet et ressourçant'
WHERE duration = '7-14 jours';

UPDATE travel_packages SET 
  name = 'Aventure',
  description = 'Pour vivre une expérience immersive'
WHERE duration = '15-21 jours';

UPDATE travel_packages SET 
  name = 'Exploration',
  description = 'Pour les rêveurs et grands explorateurs'
WHERE duration = 'Plus de 21 jours';
