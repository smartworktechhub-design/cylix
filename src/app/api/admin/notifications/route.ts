import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminToken } from '../auth/route';

function getSb() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, serviceKey);
}

async function isAdminAuth(req: Request): Promise<boolean> {
  const token = req.headers.get('x-admin-token');
  if (!token) return false;
  if (await validateAdminToken(token)) return true;
  if (token === process.env.ADMIN_TOKEN_SECRET || token === process.env.CRON_SECRET) return true;
  return false;
}

export async function GET(req: Request) {
  try {
    if (!await isAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const sb = getSb();
    const { data, error } = await sb.from('notifications')
      .select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!await isAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { title, message, type, userIds } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'Missing title or message' }, { status: 400 });
    }
    const sb = getSb();

    let targetUsers: { id: string }[] = [];

    if (!userIds || userIds === 'all' || (Array.isArray(userIds) && userIds.length === 0)) {
      const { data: users, error: ue } = await sb.from('users').select('id');
      if (ue || !users || users.length === 0) {
        return NextResponse.json({ success: false, error: ue?.message || 'No users found' }, { status: 500 });
      }
      targetUsers = users;
    } else if (Array.isArray(userIds)) {
      const { data: users, error: ue } = await sb.from('users').select('id').in('id', userIds);
      if (ue || !users || users.length === 0) {
        return NextResponse.json({ success: false, error: ue?.message || 'No matching users found' }, { status: 500 });
      }
      targetUsers = users;
    }

    const rows = targetUsers.map((u) => ({
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

export async function DELETE(req: Request) {
  try {
    if (!await isAdminAuth(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'No notification IDs provided' }, { status: 400 });
    }
    const sb = getSb();
    const { error } = await sb.from('notifications').delete().in('id', ids);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
