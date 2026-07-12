import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { userId, wallet, reason } = await req.json();
    if (!userId || !wallet || !reason) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const sb = getServiceSupabase();

    const { data: existing } = await sb
      .from('ban_appeals')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You already have a pending appeal' }, { status: 409 });
    }

    const { error } = await sb.from('ban_appeals').insert({
      user_id: userId,
      wallet: wallet,
      reason: reason.trim(),
      status: 'pending',
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}
