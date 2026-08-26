import { NextResponse } from 'next/server';
import { processHeldWithdrawals } from '@/lib/withdrawal-engine';
import { validateAdminToken } from '@/app/api/admin/auth/route';

export async function POST(req: Request) {
  const auth = req.headers.get('authorization');
  const token = auth?.replace('Bearer ', '') || '';
  const isAdmin = await validateAdminToken(token);
  if (!isAdmin) {
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
