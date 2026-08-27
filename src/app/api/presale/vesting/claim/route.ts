import { NextRequest, NextResponse } from 'next/server';
import { claimVestingInstallment } from '@/lib/airdrop';

export async function POST(req: NextRequest) {
  const { userId, vestingId, action } = await req.json();

  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  if (!vestingId) return NextResponse.json({ error: 'Missing vestingId' }, { status: 400 });
  if (!action || !['liquid', 'compound'].includes(action)) {
    return NextResponse.json({ error: 'Action must be "liquid" or "compound"' }, { status: 400 });
  }

  const result = await claimVestingInstallment(userId, vestingId, action);

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
