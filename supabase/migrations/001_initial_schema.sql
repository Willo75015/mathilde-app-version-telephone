-- Migration initiale : Création des tables Mathilde Fleurs
-- Date : 5 décembre 2025

-- =====================================================
-- SUPPRESSION DES TABLES EXISTANTES (si elles existent)
-- =====================================================
DROP TABLE IF EXISTS event_florists CASCADE;
DROP TABLE IF EXISTS event_flowers CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS florists CASCADE;
DROP TABLE IF EXISTS event_templates CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- =====================================================
-- TABLE : florists (Fleuristes)
-- =====================================================
CREATE TABLE florists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  experience INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  availability VARCHAR(20) DEFAULT 'available' CHECK (availability IN ('available', 'on_mission', 'unavailable')),
  location VARCHAR(255),
  completed_events INTEGER DEFAULT 0,
  avatar VARCHAR(500),
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  comments TEXT,
  unavailability_periods JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE : clients
-- =====================================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_postal_code VARCHAR(10),
  address_country VARCHAR(100) DEFAULT 'France',
  favorite_colors TEXT[] DEFAULT '{}',
  favorite_flowers TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  comments TEXT,
  manager_payment DECIMAL(10,2),
  freelance_payment DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE : events (Événements)
-- =====================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  end_date DATE,
  time VARCHAR(10),
  end_time VARCHAR(10),
  location VARCHAR(500),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name VARCHAR(200),
  client_phone VARCHAR(20),
  budget DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'confirmed', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled')),
  notes TEXT,
  images TEXT[] DEFAULT '{}',
  invoiced BOOLEAN DEFAULT FALSE,
  invoice_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  paid BOOLEAN DEFAULT FALSE,
  paid_date TIMESTAMPTZ,
  payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'card', 'transfer', 'check')),
  archived BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  florists_required INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE : event_florists (Association événement-fleuriste)
-- =====================================================
CREATE TABLE event_florists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  florist_id UUID REFERENCES florists(id) ON DELETE CASCADE,
  florist_name VARCHAR(200),
  is_confirmed BOOLEAN DEFAULT FALSE,
  is_refused BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'refused', 'not_selected')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  role VARCHAR(100),
  notes TEXT,
  pre_written_message TEXT,
  UNIQUE(event_id, florist_id)
);

-- =====================================================
-- TABLE : event_flowers (Sélection de fleurs par événement)
-- =====================================================
CREATE TABLE event_flowers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  flower_id VARCHAR(100) NOT NULL,
  quantity INTEGER DEFAULT 1,
  notes TEXT
);

-- =====================================================
-- TABLE : expenses (Dépenses)
-- =====================================================
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL CHECK (category IN ('flowers', 'materials', 'transport', 'florist_fees', 'other')),
  description VARCHAR(500),
  amount DECIMAL(10,2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  receipt VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE : event_templates (Templates d'événements)
-- =====================================================
CREATE TABLE event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('wedding', 'corporate', 'birthday', 'funeral', 'baptism', 'reception', 'custom')),
  description TEXT,
  icon VARCHAR(50),
  default_budget DECIMAL(10,2) DEFAULT 0,
  default_duration INTEGER DEFAULT 4,
  default_florists_required INTEGER DEFAULT 1,
  suggested_flowers TEXT[] DEFAULT '{}',
  suggested_materials TEXT[] DEFAULT '{}',
  checklist_items TEXT[] DEFAULT '{}',
  notes TEXT,
  is_custom BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE : user_settings (Paramètres utilisateur)
-- =====================================================
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100) UNIQUE DEFAULT 'default',
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'fr',
  notification_email BOOLEAN DEFAULT TRUE,
  notification_push BOOLEAN DEFAULT TRUE,
  notification_reminders BOOLEAN DEFAULT TRUE,
  dismissed_reminders TEXT[] DEFAULT '{}',
  read_reminders TEXT[] DEFAULT '{}',
  template_usage JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEX pour les performances
-- =====================================================
CREATE INDEX idx_events_client_id ON events(client_id);
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_florists_event_id ON event_florists(event_id);
CREATE INDEX idx_event_florists_florist_id ON event_florists(florist_id);
CREATE INDEX idx_expenses_event_id ON expenses(event_id);
CREATE INDEX idx_event_flowers_event_id ON event_flowers(event_id);

-- =====================================================
-- TRIGGERS pour updated_at automatique
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_florists_updated_at
  BEFORE UPDATE ON florists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_templates_updated_at
  BEFORE UPDATE ON event_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Pour l'instant, on permet l'accès anonyme (anon key)
-- À sécuriser plus tard avec l'authentification

ALTER TABLE florists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_florists ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies pour permettre l'accès anonyme (temporaire)
CREATE POLICY "Allow anonymous access to florists" ON florists FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to events" ON events FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to event_florists" ON event_florists FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to event_flowers" ON event_flowers FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to expenses" ON expenses FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to event_templates" ON event_templates FOR ALL USING (true);
CREATE POLICY "Allow anonymous access to user_settings" ON user_settings FOR ALL USING (true);

-- =====================================================
-- ENABLE REALTIME pour la synchronisation
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE florists;
ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_florists;
ALTER PUBLICATION supabase_realtime ADD TABLE event_flowers;
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;

-- =====================================================
-- Données initiales : Paramètres utilisateur par défaut
-- =====================================================
INSERT INTO user_settings (user_id) VALUES ('default') ON CONFLICT DO NOTHING;
