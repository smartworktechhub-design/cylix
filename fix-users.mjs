import { createClient } from '@supabase/supabase-js';

const sb = createClient(
  'https://pksquptfamittagmkozt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrc3FwdGZhbWl0dGFnbWtvenQiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzQ0NDkxOTU3LCJleHAiOjIwNjAwNjc5NTd9.SAKYrbh0qW9jK6ZM5P9kRZmPmGBfG2Vx0cG0TqEaK_M'
);

async function fix() {
  // Unban all banned users
  const { data: banned, error: e1 } = await sb.from('users').update({
    is_active: true,
    ban_reason: '',
  }).eq('is_active', false).select('id, wallet, display_name, referral_code');
  console.log('Unbanned users:', banned?.length || 0, banned);

  // Check all users status
  const { data: all } = await sb.from('users').select('id, wallet, display_name, referral_code, is_active, sponsor_id, roi_enabled, total_invested, total_earned');
  console.log('\nAll users:', all?.length);
  for (const u of (all || [])) {
    console.log(`  ${u.display_name || 'unnamed'} | ${u.wallet?.slice(0,10)}... | ref:${u.referral_code} | sponsor:${u.sponsor_id ? 'yes' : 'NO'} | active:${u.is_active} | roi:${u.roi_enabled} | invested:${u.total_invested} | earned:${u.total_earned}`);
  }
}

fix().catch(console.error);
