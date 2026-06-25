const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const PROJECT_REF = 'pksquptfamittagmkozt';

async function main() {
  console.log('\n🔑 Supabase Personal Access Token chahiye.');
  console.log('   Is link pe jaake 30 sec mein bana lo:');
  console.log('   https://supabase.com/dashboard/account/tokens\n');
  console.log('   ✅ "New Token" → name: "cylix-setup" → scope: all → Create');
  console.log('   ✅ Copy the token and paste below\n');

  const pat = await new Promise(res => rl.question('Paste token here: ', res));
  rl.close();

  if (!pat.trim()) { console.log('No token. Exiting.'); return; }

  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-schema.sql'), 'utf-8');
  const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`\n🚀 Running ${statements.length} SQL statements...\n`);

  // First, enable pg_net extension if not exists
  try {
    await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pat.trim()}` },
      body: JSON.stringify({ query: "CREATE EXTENSION IF NOT EXISTS pg_net;" }),
    });
  } catch (_) {}

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    process.stdout.write(`  [${i + 1}/${statements.length}] ${stmt.replace(/\n/g, ' ').slice(0, 60).trim()}... `);
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pat.trim()}`,
        },
        body: JSON.stringify({ query: stmt + ';' }),
      });
      if (res.ok) {
        console.log('✅');
      } else {
        const txt = await res.text();
        if (txt.includes('already exists')) console.log('⚠️ already exists');
        else if (txt.includes('duplicate key')) console.log('⚠️ already exists');
        else console.log(`❌ ${res.status}`);
      }
    } catch (err) {
      console.log(`❌ ${err.message.slice(0, 60)}`);
    }
  }
  console.log('\n🎉 Done! Sab tables ban gaye. Ab app refresh karo.\n');
}
main();
