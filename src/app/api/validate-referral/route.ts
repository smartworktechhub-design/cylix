import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ valid: false });
    }
    const sb = getServiceSupabase();
    const { data } = await sb.from('users').select('id').eq('referral_code', code.trim().toUpperCase()).maybeSingle();
    return NextResponse.json({ valid: !!data });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
