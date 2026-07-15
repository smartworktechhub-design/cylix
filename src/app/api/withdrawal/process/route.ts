import { NextResponse } from 'next/server';
import { processHeldWithdrawals } from '@/lib/withdrawal-engine';

function verifyAdmin(req: Request): boolean {
  const auth = req.headers.get('authorization');
  if (!auth) return false;
  const token = auth.replace('Bearer ', '');
  return token === process.env.ADMIN_TOKEN || token === process.env.CRON_SECRET;
}

export async function POST(req: Request) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processHeldWithdrawals();
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      message: `Processed ${result.processed} withdrawals, ${result.failed} failed`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
