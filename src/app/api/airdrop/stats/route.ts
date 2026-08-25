import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAirdropStats, getUserBalance, canClaimDaily } from '@/lib/airdrop';

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const stats = await getAirdropStats();
  const balance = await getUserBalance(user.id);
  const claimStatus = await canClaimDaily(user.id);

  return NextResponse.json({
    stats,
    balance: balance
      ? {
          cxl_balance: balance.cxl_balance,
          cxl_earned_total: balance.cxl_earned_total,
          cxl_liquid: balance.cxl_liquid,
          cxl_staked: balance.cxl_staked,
          signup_bonus_claimed: balance.signup_bonus_claimed,
          signup_bonus_amount: balance.signup_bonus_amount,
          consecutive_claim_days: balance.consecutive_claim_days,
          total_claim_days: balance.total_claim_days,
          last_claim_date: balance.last_claim_date,
        }
      : null,
    canClaim: claimStatus,
  });
}
