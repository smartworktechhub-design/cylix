import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateAdminToken } from '../auth/route';

export async function GET(request: Request) {
  const token = request.headers.get('x-admin-token');
  if (!token || !validateAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const sb = getServiceSupabase();
  const { data, error } = await sb.from('launch_emails').select('*').order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ emails: data || [] });
}

export async function DELETE(req: Request) {
  const token = req.headers.get('x-admin-token');
  if (!token || !validateAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const sb = getServiceSupabase();
  const { error } = await sb.from('launch_emails').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
