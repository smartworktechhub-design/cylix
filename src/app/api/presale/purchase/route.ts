import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { purchasePresale } from '@/lib/airdrop';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { cxlAmount } = body;

  if (!cxlAmount || typeof cxlAmount !== 'number' || cxlAmount <= 0) {
    return NextResponse.json({ error: 'Invalid CXL amount' }, { status: 400 });
  }

  const result = await purchasePresale(user.id, cxlAmount);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
