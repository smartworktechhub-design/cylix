import { NextRequest, NextResponse } from 'next/server';
import { purchasePresale } from '@/lib/airdrop';

export async function POST(req: NextRequest) {
  const { userId, usdtAmount } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  if (!usdtAmount || typeof usdtAmount !== 'number' || usdtAmount <= 0) {
    return NextResponse.json({ error: 'Invalid USDT amount' }, { status: 400 });
  }

  const result = await purchasePresale(userId, usdtAmount);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
