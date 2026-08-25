const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.SUPABASE_DB_URL;

if (!DATABASE_URL) {
  console.error('❌ Set DATABASE_URL first!');
  console.error('');
  console.error('Get it from: Supabase Dashboard → Settings → Database → Connection string → URI');
  console.error('Format: postgresql://postgres.pksquptfamittagmkozt:YOUR_DB_PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres');
  console.error('');
  console.error('Run: $env:SUPABASE_DB_URL="postgresql://..."; node scripts/run-migration.js');
  process.exit(1);
}

const sql = fs.readFileSync(
  path.join(__dirname, '../supabase-migrations/001_airdrop_presale.sql'),
  'utf8'
);

async function runMigration() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🚀 Running migration...');
    await pool.query(sql);
    console.log('✅ Migration completed!');
    console.log('Tables created: airdrop_config, user_token_balances, airdrop_earnings, presale_purchases');
    console.log('Columns added: full_name, email, phone, l2_directs, l2_unlocked on users');
    console.log('Columns added: data on notifications');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
