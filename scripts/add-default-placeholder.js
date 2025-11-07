require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function addDefaultPlaceholder() {
  console.log('🔗 Connecting to database:', process.env.POSTGRES_URL ? 'Connected' : 'Missing connection string');
  
  try {
    console.log('🗄️ Adding default_placeholder column to templates table...');

    // Add the default_placeholder column if it doesn't exist
    await sql`
      ALTER TABLE templates 
      ADD COLUMN IF NOT EXISTS default_placeholder TEXT
    `;
    
    console.log('✅ default_placeholder column added successfully');
    console.log('🎉 Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addDefaultPlaceholder();