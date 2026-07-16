import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || '';

export function validateAdminToken(token: string): boolean {
  return token === ADMIN_TOKEN_SECRET;
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

    return NextResponse.json({
      token: ADMIN_TOKEN_SECRET,
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
