import { NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: user } = await sb.from('users').select('wallet').eq('id', userId).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const secret = generateSecret();
    const otpauth = generateURI({
      strategy: 'totp',
      label: user.wallet,
      issuer: 'CYLIX MATRIX',
      secret,
    });

    return NextResponse.json({ secret, otpauth });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
