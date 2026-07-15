import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminToken } from '../auth/route';

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-admin-token');
    if (!token || !validateAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, message, type } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
    }
    // Use service_role key to bypass RLS on server-side admin API
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
    }
    const sb = createClient(supabaseUrl, serviceKey);
    const { data: users, error: ue } = await sb.from('users').select('id');
    if (ue || !users || users.length === 0) {
      return NextResponse.json({ success: false, error: ue?.message || 'No users found' }, { status: 500 });
    }
    const rows = users.map((u: any) => ({
      user_id: u.id, title, message, type: type || 'announcement', is_read: false,
    }));
    const { error } = await sb.from('notifications').insert(rows);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: rows.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
