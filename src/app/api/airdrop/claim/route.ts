import { NextRequest, NextResponse } from 'next/server';
import { claimDailyAirdrop } from '@/lib/airdrop';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const result = await claimDailyAirdrop(userId);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
