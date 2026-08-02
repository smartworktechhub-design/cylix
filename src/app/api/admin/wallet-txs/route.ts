import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { TREASURY_WALLET, USDT_ADDRESS, BSC_RPC_URL } from '@/lib/constants';
import { validateAdminToken } from '../auth/route';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token || !await validateAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wallet = TREASURY_WALLET.toLowerCase();

    const rpcBody = (method: string, params: any[]) =>
      fetch(BSC_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
      }).then(r => r.json());

    const [bnbRes, usdtBalRes] = await Promise.all([
      rpcBody('eth_getBalance', [TREASURY_WALLET, 'latest']),
      rpcBody('eth_call', [{
        to: USDT_ADDRESS,
        data: '0x70a08231' + wallet.replace('0x', '').padStart(64, '0'),
      }, 'latest']),
    ]);

    const bnb = (parseInt(bnbRes.result, 16) / 1e18).toFixed(6);
    const usdt = (parseInt(usdtBalRes.result, 16) / 1e18).toFixed(2);

    const sb = getServiceSupabase();

    const { data: slots } = await sb.from('user_slots')
      .select('id, user_id, slot_name, invested, activated_at, status')
      .order('activated_at', { ascending: false })
      .limit(50);

    const userIds = [...new Set((slots || []).map((s: any) => s.user_id).filter(Boolean))];

    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users } = await sb.from('users')
        .select('id, display_name, referral_code, wallet')
        .in('id', userIds);
      (users || []).forEach((u: any) => {
        userMap[u.id] = u.display_name || u.referral_code || u.wallet?.slice(0, 8) || 'Unknown';
      });
    }

    const deposits = (slots || []).map((s: any) => ({
      user: userMap[s.user_id] || 'Unknown',
      slot: s.slot_name,
      amount: Number(s.invested).toFixed(2),
      status: s.status,
      date: s.activated_at,
    }));

    const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount), 0);

    return NextResponse.json({
      bnb, usdt, deposits, totalDeposits,
      wallet: TREASURY_WALLET,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
