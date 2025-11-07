require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function setupDatabase() {
  console.log('🔗 Connecting to database:', process.env.POSTGRES_URL ? 'Connected' : 'Missing connection string');
  try {
    console.log('🗄️ Setting up TaskFeed database...');

    // Create templates table first (due to foreign key reference)
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title_template TEXT NOT NULL,
        tags TEXT[],
        hotkey TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    console.log('✅ Templates table created');

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        tags TEXT[],
        template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
        source TEXT NOT NULL DEFAULT 'web-admin',
        is_public BOOLEAN DEFAULT TRUE
      )
    `;
    console.log('✅ Tasks table created');

    // Create performance indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_is_public ON tasks(is_public)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_tasks_public_created ON tasks(is_public, created_at DESC) WHERE is_public = true`;
    await sql`CREATE INDEX IF NOT EXISTS idx_templates_sort_order ON templates(sort_order)`;
    console.log('✅ Database indexes created');

    // Insert default templates
    await sql`
      INSERT INTO templates (name, title_template, tags, hotkey, sort_order) VALUES
        ('Quick Task', '{title}', ARRAY[]::TEXT[], 'q', 1),
        ('Bug Report', 'Bug: {title}', ARRAY['bug'], 'b', 2),
        ('Feature', 'Feature: {title}', ARRAY['feature'], 'f', 3),
        ('Meeting', 'Meeting: {title}', ARRAY['meeting'], 'm', 4),
        ('Note', 'Note: {title}', ARRAY['note'], 'n', 5)
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Default templates inserted');

    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('Your TaskFeed app is ready to use:');
    console.log('- Homepage: http://localhost:3002');
    console.log('- Admin: http://localhost:3002/admin');
    console.log('- Public Feed: http://localhost:3002/log');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();