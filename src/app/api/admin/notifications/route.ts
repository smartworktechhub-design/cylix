import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { title, message, type } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ error: 'Missing title or message' }, { status: 400 });
    }
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: users, error: ue } = await sb.from('users').select('id');
    if (ue || !users || users.length === 0) {
      return NextResponse.json({ error: 'No users found' }, { status: 500 });
    }
    const rows = users.map((u: any) => ({
      user_id: u.id, title, message, type: type || 'announcement', is_read: false,
    }));
    const { error } = await sb.from('notifications').insert(rows);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, count: rows.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
