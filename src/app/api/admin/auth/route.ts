import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import crypto from 'crypto';

const adminSessions = new Map<string, { adminId: string; expiresAt: number }>();

export function validateAdminToken(token: string): boolean {
  const session = adminSessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return false;
  }
  return true;
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

    const token = crypto.randomUUID();
    adminSessions.set(token, {
      adminId: admin.id,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json({
      token,
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
