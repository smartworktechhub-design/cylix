import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateAdminToken } from '../auth/route';

export async function POST(request: Request) {
  const token = request.headers.get('x-admin-token');
  if (!token || !validateAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = getServiceSupabase();

  const tables = [
    'ticket_replies',
    'support_tickets',
    'ban_appeals',
    'campaign_requests',
    'notifications',
    'earnings',
    'transactions',
    'user_slots',
    'matrix_tree',
    'matrix_11',
    'matrix_earnings',
    'apex_pool_blocks',
    'apex_pool_distributions',
    'apex_pool_qualifiers',
    'ascension_vault',
    'withdrawals',
  ];

  for (const t of tables) {
    await sb.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000');
  }

  await sb.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  return NextResponse.json({ success: true });
}
