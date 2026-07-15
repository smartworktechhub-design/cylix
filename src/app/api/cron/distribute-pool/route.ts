import { NextResponse } from 'next/server';
import { distributeApexPool } from '@/lib/db';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await distributeApexPool();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Pool distribution failed:', error);
    return NextResponse.json({ error: 'Distribution failed' }, { status: 500 });
  }
}
