import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { getUserBalance } from '@/lib/airdrop';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  const validToken = process.env.ADMIN_TOKEN_SECRET || process.env.CRON_SECRET;
  if (!validToken || token !== validToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const balance = await getUserBalance(userId);
  if (!balance) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const supabase = getServiceSupabase();
  const { data: user } = await supabase
    .from('users')
    .select('wallet, referral_code')
    .eq('id', userId)
    .single();

  const { data: earnings } = await supabase
    .from('airdrop_earnings')
    .select('*')
    .eq('user_id', userId)
    .order('day_number', { ascending: false })
    .limit(10);

  const { data: purchases } = await supabase
    .from('presale_purchases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    user,
    balance: {
      cxl_balance: balance.cxl_balance,
      cxl_earned_total: balance.cxl_earned_total,
      cxl_liquid: balance.cxl_liquid,
      cxl_staked: balance.cxl_staked,
      signup_bonus_claimed: balance.signup_bonus_claimed,
      signup_bonus_amount: balance.signup_bonus_amount,
      total_claim_days: balance.total_claim_days,
      consecutive_claim_days: balance.consecutive_claim_days,
      is_active: balance.is_active,
    },
    recentEarnings: earnings,
    recentPurchases: purchases,
  });
}
