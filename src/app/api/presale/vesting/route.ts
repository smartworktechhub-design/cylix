import { NextRequest, NextResponse } from 'next/server';
import { getVestingSchedule } from '@/lib/airdrop';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const result = await getVestingSchedule(userId);
  return NextResponse.json(result);
}
