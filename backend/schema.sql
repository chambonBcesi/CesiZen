-- =============================================================================
-- CESIZen - PostgreSQL Database Schema
-- =============================================================================
-- Execute this file on your PostgreSQL server to create all tables.
-- Usage: psql -U your_user -d your_database -f schema.sql
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TYPES
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE emotion_category AS ENUM ('positive', 'negative', 'neutral');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'user',
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emotions catalog (managed by admins/moderators)
CREATE TABLE IF NOT EXISTS emotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category emotion_category NOT NULL DEFAULT 'neutral',
  level INTEGER NOT NULL DEFAULT 1 CHECK (level IN (1, 2)),
  emoji TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#6B7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Emotion logs (user entries)
CREATE TABLE IF NOT EXISTS emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emotion_id UUID NOT NULL REFERENCES emotions(id) ON DELETE CASCADE,
  intensity INTEGER NOT NULL DEFAULT 3 CHECK (intensity >= 1 AND intensity <= 5),
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_id ON emotion_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_logged_at ON emotion_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotion_logs_user_logged ON emotion_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_emotions_level ON emotions(level);

-- =============================================================================
-- TRIGGER: auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emotions_updated_at ON emotions;
CREATE TRIGGER trg_emotions_updated_at
  BEFORE UPDATE ON emotions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_emotion_logs_updated_at ON emotion_logs;
CREATE TRIGGER trg_emotion_logs_updated_at
  BEFORE UPDATE ON emotion_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEED: Default admin account
-- Password: Admin123! (bcrypt hash)
-- IMPORTANT: Change this password immediately after first login!
-- =============================================================================

INSERT INTO users (email, password_hash, full_name, role)
VALUES (
  'admin@cesizen.fr',
  '$2b$12$LJ3.xIW1vQpYfJzHYwQ.YOF.ZWkBqPCVKfBwpmH3TfHD5V4B0rKjS',
  'Administrateur',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- =============================================================================
-- SEED: Default emotions catalog
-- =============================================================================

INSERT INTO emotions (name, category, level, emoji, color) VALUES
  ('Joie', 'positive', 1, '😊', '#F59E0B'),
  ('Tristesse', 'negative', 1, '😢', '#3B82F6'),
  ('Colère', 'negative', 1, '😡', '#EF4444'),
  ('Peur', 'negative', 1, '😨', '#8B5CF6'),
  ('Surprise', 'neutral', 1, '😮', '#EC4899'),
  ('Dégoût', 'negative', 1, '🤢', '#10B981'),
  ('Sérénité', 'positive', 2, '😌', '#06B6D4'),
  ('Anxiété', 'negative', 2, '😰', '#F97316'),
  ('Fierté', 'positive', 2, '🥲', '#EAB308'),
  ('Frustration', 'negative', 2, '😤', '#DC2626'),
  ('Gratitude', 'positive', 2, '🙏', '#14B8A6'),
  ('Ennui', 'neutral', 2, '😑', '#6B7280'),
  ('Espoir', 'positive', 2, '🌟', '#F59E0B'),
  ('Culpabilité', 'negative', 2, '😔', '#7C3AED')
ON CONFLICT DO NOTHING;
