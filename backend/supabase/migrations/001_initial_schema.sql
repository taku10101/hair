-- Initial schema for Hair Vision 3D platform
-- Migration: 001_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles table (User profiles)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  preference_style JSONB,
  hair_characteristics JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_last_active ON profiles(last_active);

-- Trigger for profiles
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE
  ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Hair templates table
CREATE TABLE hair_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  style_tags VARCHAR(50)[],
  gender_target VARCHAR(10) CHECK (gender_target IN ('male', 'female', 'unisex')),
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  model_data JSONB NOT NULL,
  preview_images TEXT[],
  metadata JSONB,
  is_popular BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for hair_templates
CREATE INDEX idx_hair_templates_category ON hair_templates(category);
CREATE INDEX idx_hair_templates_style_tags ON hair_templates USING gin(style_tags);
CREATE INDEX idx_hair_templates_gender_target ON hair_templates(gender_target);
CREATE INDEX idx_hair_templates_popular ON hair_templates(is_popular);
CREATE INDEX idx_hair_templates_rating ON hair_templates(rating DESC);

-- Trigger for hair_templates
CREATE TRIGGER update_hair_templates_updated_at BEFORE UPDATE
  ON hair_templates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- User models table
CREATE TABLE user_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  face_model_data JSONB NOT NULL,
  head_measurements JSONB,
  hair_texture VARCHAR(50),
  hair_density VARCHAR(50),
  hair_color VARCHAR(7) DEFAULT '#000000',
  model_images TEXT[],
  is_primary BOOLEAN DEFAULT FALSE,
  processing_status VARCHAR(20) DEFAULT 'pending',
  model_quality INTEGER CHECK (model_quality BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for user_models
CREATE INDEX idx_user_models_user_id ON user_models(user_id);
CREATE INDEX idx_user_models_primary ON user_models(is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_user_models_status ON user_models(processing_status);

-- Unique constraint for primary model
CREATE UNIQUE INDEX idx_user_models_primary_unique 
  ON user_models(user_id) WHERE is_primary = TRUE;

-- Trigger for user_models
CREATE TRIGGER update_user_models_updated_at BEFORE UPDATE
  ON user_models FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Hair designs table
CREATE TABLE hair_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  user_model_id UUID REFERENCES user_models(id) NOT NULL,
  template_id UUID REFERENCES hair_templates(id),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  design_data JSONB NOT NULL,
  customizations JSONB,
  color_scheme VARCHAR(7)[],
  render_images TEXT[],
  is_ai_generated BOOLEAN DEFAULT FALSE,
  ai_prompt TEXT,
  generation_parameters JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for hair_designs
CREATE INDEX idx_hair_designs_user_id ON hair_designs(user_id);
CREATE INDEX idx_hair_designs_user_model_id ON hair_designs(user_model_id);
CREATE INDEX idx_hair_designs_template_id ON hair_designs(template_id);
CREATE INDEX idx_hair_designs_public ON hair_designs(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_hair_designs_favorite ON hair_designs(user_id, is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_hair_designs_status ON hair_designs(status);

-- Trigger for hair_designs
CREATE TRIGGER update_hair_designs_updated_at BEFORE UPDATE
  ON hair_designs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Salons table
CREATE TABLE salons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES profiles(id),
  address JSONB NOT NULL,
  coordinates POINT,
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  business_hours JSONB,
  services JSONB,
  pricing_range VARCHAR(20),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending',
  images TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for salons
CREATE INDEX idx_salons_coordinates ON salons USING gist(coordinates);
CREATE INDEX idx_salons_rating ON salons(rating DESC);
CREATE INDEX idx_salons_active ON salons(is_active) WHERE is_active = TRUE;

-- Trigger for salons
CREATE TRIGGER update_salons_updated_at BEFORE UPDATE
  ON salons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Stylists table
CREATE TABLE stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  salon_id UUID REFERENCES salons(id),
  professional_name VARCHAR(100) NOT NULL,
  bio TEXT,
  specialties VARCHAR(50)[],
  experience_years INTEGER,
  certifications JSONB,
  portfolio_images TEXT[],
  hourly_rate DECIMAL(10,2),
  is_available BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  verification_status VARCHAR(20) DEFAULT 'pending',
  availability_schedule JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for stylists
CREATE INDEX idx_stylists_salon_id ON stylists(salon_id);
CREATE INDEX idx_stylists_profile_id ON stylists(profile_id);
CREATE INDEX idx_stylists_available ON stylists(is_available) WHERE is_available = TRUE;
CREATE INDEX idx_stylists_rating ON stylists(rating DESC);

-- Trigger for stylists
CREATE TRIGGER update_stylists_updated_at BEFORE UPDATE
  ON stylists FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  stylist_id UUID REFERENCES stylists(id) NOT NULL,
  salon_id UUID REFERENCES salons(id) NOT NULL,
  hair_design_id UUID REFERENCES hair_designs(id),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  services JSONB NOT NULL,
  estimated_cost DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  special_requirements TEXT,
  confirmation_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for appointments
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_stylist_id ON appointments(stylist_id);
CREATE INDEX idx_appointments_salon_id ON appointments(salon_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- Trigger for appointments
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE
  ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  content TEXT NOT NULL,
  attachments TEXT[],
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for chat_messages
CREATE INDEX idx_chat_messages_appointment_id ON chat_messages(appointment_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_unread ON chat_messages(receiver_id, is_read) WHERE is_read = FALSE;

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE hair_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stylists ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view public profiles" ON profiles
  FOR SELECT USING (true);

-- Hair templates policies (public read)
CREATE POLICY "Anyone can view active hair templates" ON hair_templates
  FOR SELECT USING (is_active = true);

-- User models policies
CREATE POLICY "Users can view own models" ON user_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own models" ON user_models
  FOR ALL USING (auth.uid() = user_id);

-- Hair designs policies
CREATE POLICY "Users can view own designs" ON hair_designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own designs" ON hair_designs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public designs" ON hair_designs
  FOR SELECT USING (is_public = true);

-- Chat messages policies
CREATE POLICY "Users can view related messages" ON chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Insert sample data
INSERT INTO hair_templates (name, description, category, style_tags, gender_target, difficulty_level, model_data, preview_images, is_popular) VALUES
('Classic Bob', 'Timeless bob hairstyle', 'Short', ARRAY['Classic', 'Professional', 'Easy'], 'female', 2, '{"type": "bob", "length": "short"}', ARRAY['/images/bob-1.jpg'], true),
('Pixie Cut', 'Modern pixie cut', 'Short', ARRAY['Modern', 'Edgy', 'Low-maintenance'], 'female', 3, '{"type": "pixie", "length": "very_short"}', ARRAY['/images/pixie-1.jpg'], true),
('Long Layers', 'Layered long hair', 'Long', ARRAY['Layered', 'Versatile', 'Popular'], 'female', 4, '{"type": "layered", "length": "long"}', ARRAY['/images/layers-1.jpg'], true),
('Crew Cut', 'Classic men''s crew cut', 'Short', ARRAY['Classic', 'Professional', 'Easy'], 'male', 1, '{"type": "crew", "length": "short"}', ARRAY['/images/crew-1.jpg'], true),
('Pompadour', 'Vintage pompadour style', 'Medium', ARRAY['Vintage', 'Formal', 'Bold'], 'male', 4, '{"type": "pompadour", "length": "medium"}', ARRAY['/images/pompadour-1.jpg'], false);