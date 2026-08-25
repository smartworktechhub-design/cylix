import { NextRequest, NextResponse } from 'next/server';
import { processDayEnd, processDay91Settlement } from '@/lib/airdrop';

async function verifyCronAuth(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const cronSecret = process.env.CRON_SECRET;
  const adminToken = process.env.ADMIN_TOKEN_SECRET;
  
  if (cronSecret && token === cronSecret) return true;
  if (adminToken && token === adminToken) return true;
  
  const url = new URL(req.url);
  const keyParam = url.searchParams.get('key');
  if (cronSecret && keyParam === cronSecret) return true;
  
  return false;
}

export async function GET(req: NextRequest) {
  const authorized = await verifyCronAuth(req);
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dayEndResult = await processDayEnd();
  const settlementResult = await processDay91Settlement();

  return NextResponse.json({
    dayEnd: dayEndResult,
    settlement: settlementResult,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const authorized = await verifyCronAuth(req);
  if (!authorized) {
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
