const { createClient } = require('@supabase/supabase-js');
const sb = createClient('https://pksquptfamittagmkozt.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc3F1cHRmYW1pdHRhZ21rb3p0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE0MTQzNiwiZXhwIjoyMDk3NzE3NDM2fQ.yaswVmsbWhKUev6Q-iYSt1tDXURSf53koak60XdaYeE');

(async () => {
  const ROOT_ID = '5ae64053-0f77-4e53-bdba-f26388e89a23';
  
  // Check matrix_11 for Pulse Matrix ($1000) users
  const pulseUsers = ['5ae64053-0f77-4e53-bdba-f26388e89a23']; // Apex Circle
  const { data: testUser } = await sb.from('users').select('id').eq('display_name', 'Test User').single();
  const { data: hahaUser } = await sb.from('users').select('id').eq('display_name', 'haha').single();
  if (testUser) pulseUsers.push(testUser.id);
  if (hahaUser) pulseUsers.push(hahaUser.id);

  for (const uid of pulseUsers) {
    const { data: u } = await sb.from('users').select('display_name').eq('id', uid).single();
    const { data: m11 } = await sb.from('matrix_11').select('*').eq('user_id', uid);
    console.log('=== ' + (u?.display_name || uid.slice(0, 10)) + ' ($1000 Pulse Matrix) ===');
    console.log('matrix_11 entries:', m11?.length || 0);
    for (const m of m11 || []) {
      console.log('  L' + m.level + ' | sponsor_id:', m.sponsor_id?.slice(0, 8) + ' | total_earnings:', m.total_earnings);
    }

    // Check if admin processMatrixCommission inserted earnings
    const { data: earnings } = await sb.from('earnings').select('type, amount, source, created_at').eq('user_id', uid);
    console.log('earnings entries:', earnings?.length || 0);
    for (const e of earnings || []) {
      console.log('  type:', e.type, '| amount:', e.amount, '| source:', e.source);
    }
    console.log('');
  }

  // Check matrix_tree for these users
  console.log('=== MATRIX TREE for $1000 users ===');
  for (const uid of pulseUsers) {
    const { data: u } = await sb.from('users').select('display_name').eq('id', uid).single();
    const { data: tree } = await sb.from('matrix_tree').select('user_id, owner_id, level, side, parent_id').eq('user_id', uid);
    console.log((u?.display_name || uid.slice(0, 10)) + ': ' + (tree?.length || 0) + ' tree nodes');
    for (const t of tree || []) {
      const { data: placed } = await sb.from('users').select('display_name').eq('id', t.user_id).single();
      console.log('  owner:', t.owner_id?.slice(0, 8), '| level:', t.level, '| side:', t.side, '| placed:', placed?.display_name || t.user_id?.slice(0, 8));
    }
    console.log('');
  }

  // Check who has direct sponsor_id pointing to these users
  console.log('=== DIRECTS of $1000 users ===');
  for (const uid of pulseUsers) {
    const { data: u } = await sb.from('users').select('display_name, directs').eq('id', uid).single();
    const { data: directs } = await sb.from('users').select('display_name').eq('sponsor_id', uid);
    console.log((u?.display_name || uid.slice(0, 10)) + ': ' + (u?.directs || 0) + ' directs (DB count: ' + (directs?.length || 0) + ')');
    for (const d of directs || []) {
      console.log('  → ' + (d.display_name || 'unknown'));
    }
    console.log('');
  }
})();
