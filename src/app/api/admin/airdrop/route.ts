import { NextRequest, NextResponse } from 'next/server';
import { getConfig, setConfig } from '@/lib/airdrop';
import { getServiceSupabase } from '@/lib/supabase';

async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN_SECRET || process.env.CRON_SECRET;
  if (!validToken || token !== validToken) return false;

  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', token)
    .single();
  return !!data;
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN_SECRET || process.env.CRON_SECRET;
  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === 'start') {
    const config = await getConfig();
    if (config['airdrop_started_at']) {
      return NextResponse.json({ error: 'Airdrop already started' }, { status: 400 });
    }

    await setConfig('airdrop_started_at', new Date().toISOString());
    await setConfig('is_active', 'true');

    return NextResponse.json({ success: true, message: 'Airdrop started!' });
  }

  if (action === 'pause') {
    await setConfig('is_active', 'false');
    return NextResponse.json({ success: true, message: 'Airdrop paused' });
  }

  if (action === 'resume') {
    await setConfig('is_active', 'true');
    return NextResponse.json({ success: true, message: 'Airdrop resumed' });
  }

  if (action === 'update_config') {
    const { key, value } = body;
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'key and value required' }, { status: 400 });
    }
    await setConfig(key, String(value));
    return NextResponse.json({ success: true });
  }

  if (action === 'set_phase') {
    const { phase } = body;
    if (![1, 2, 3].includes(phase)) {
      return NextResponse.json({ error: 'Invalid phase (1-3)' }, { status: 400 });
    }
    await setConfig('airdrop_phase', String(phase));
    return NextResponse.json({ success: true, phase });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN_SECRET || process.env.CRON_SECRET;
  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = await getConfig();
  return NextResponse.json({ config });
}
