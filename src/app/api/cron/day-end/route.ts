import { NextRequest, NextResponse } from 'next/server';
import { processDayEnd, processDay91Settlement } from '@/lib/airdrop';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.CRON_SECRET || process.env.ADMIN_TOKEN_SECRET;

  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  if (body.action === 'settlement') {
    const result = await processDay91Settlement();
    return NextResponse.json(result);
  }

  const result = await processDayEnd();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.CRON_SECRET || process.env.ADMIN_TOKEN_SECRET;

  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { getCurrentDay, getPresalePrice, getConfig } = await import('@/lib/airdrop');
  const day = await getCurrentDay();
  const price = await getPresalePrice();
  const config = await getConfig();

  return NextResponse.json({ day, price, config });
}
