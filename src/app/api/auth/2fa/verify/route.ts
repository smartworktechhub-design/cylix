import { NextResponse } from 'next/server';
import { verify } from 'otplib';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId, secret, token } = await req.json();
    if (!userId || !secret || !token) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const isValid = await verify({ token, secret });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const sb = createClient(supabaseUrl, supabaseKey);
    const { error } = await sb.from('users').update({
      two_factor_secret: secret, two_factor_enabled: true,
    }).eq('id', userId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
