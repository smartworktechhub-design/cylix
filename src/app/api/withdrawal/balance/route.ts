import { NextResponse } from 'next/server';
import { getWithdrawalStats } from '@/lib/withdrawal-engine';

export async function GET() {
  try {
    const stats = await getWithdrawalStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
