import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const { error } = await getSupabase().from('users').update({ ip_address: ip }).eq('id', userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, ip });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
