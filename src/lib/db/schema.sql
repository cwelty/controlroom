-- TaskFeed Database Schema for Vercel Postgres

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[], -- PostgreSQL array for tags
  template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
  source TEXT NOT NULL DEFAULT 'web-admin',
  is_public BOOLEAN DEFAULT TRUE
);

-- Templates table for hot-key buttons
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title_template TEXT NOT NULL,
  tags TEXT[],
  hotkey TEXT, -- Single character for hotkey
  default_placeholder TEXT, -- Default value to replace {title} placeholder
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_is_public ON tasks(is_public);
CREATE INDEX IF NOT EXISTS idx_tasks_public_created ON tasks(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_templates_sort_order ON templates(sort_order);

-- Insert some default templates
INSERT INTO templates (name, title_template, tags, hotkey, sort_order) VALUES
  ('Quick Task', '{title}', ARRAY[]::TEXT[], 'q', 1),
  ('Bug Report', 'Bug: {title}', ARRAY['bug'], 'b', 2),
  ('Feature', 'Feature: {title}', ARRAY['feature'], 'f', 3),
  ('Meeting', 'Meeting: {title}', ARRAY['meeting'], 'm', 4),
  ('Note', 'Note: {title}', ARRAY['note'], 'n', 5)
ON CONFLICT DO NOTHING;