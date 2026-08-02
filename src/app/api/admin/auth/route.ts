import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';

function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export async function validateAdminToken(token: string): Promise<boolean> {
  if (!token) return false;
  const sb = getServiceSupabase();
  const { data } = await sb
    .from('admin_sessions')
    .select('id, expires_at')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();
  return !!data;
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const sb = getServiceSupabase();
    const { data: admin, error } = await sb
      .from('admins')
      .select('id, email, name, role, password_hash, is_active')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!admin.is_active) {
      return NextResponse.json({ error: 'Account disabled' }, { status: 403 });
    }

    if (admin.password_hash !== password) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await sb.from('admin_sessions').delete().eq('admin_id', admin.id);
    const { error: sessionErr } = await sb.from('admin_sessions').insert({
      admin_id: admin.id,
      token: sessionToken,
      expires_at: expiresAt,
    });

    if (sessionErr) {
      console.error('Failed to create admin session:', sessionErr);
      return NextResponse.json({ error: 'Session creation failed' }, { status: 500 });
    }

    return NextResponse.json({
      token: sessionToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}
