-- Vider toutes les tables pour repartir de zéro
TRUNCATE
  event_florists,
  event_flowers,
  expenses,
  events,
  clients,
  florists,
  event_templates,
  user_settings
CASCADE;

-- Réinsérer les paramètres par défaut
INSERT INTO user_settings (user_id) VALUES ('default') ON CONFLICT DO NOTHING;
