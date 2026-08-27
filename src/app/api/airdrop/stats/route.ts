import { NextRequest, NextResponse } from 'next/server';
import { getAirdropStats, getUserBalance, canClaimDaily } from '@/lib/airdrop';
import { PRESALE_PRICES, DEX_LAUNCH_PRICE, PRESALE_SUPPLY_LIMIT } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const stats = await getAirdropStats();

  const presaleStats = {
    ...stats,
    presaleSupplyLimit: PRESALE_SUPPLY_LIMIT,
    presaleRemaining: PRESALE_SUPPLY_LIMIT - stats.sold,
  };

  if (!userId) {
    return NextResponse.json({
      stats: presaleStats,
      balance: null,
      canClaim: { canClaim: false, reason: 'Not logged in' },
      presalePrices: [...PRESALE_PRICES],
      dexLaunchPrice: DEX_LAUNCH_PRICE,
    });
  }

  const balance = await getUserBalance(userId);
  const claimStatus = await canClaimDaily(userId);

  return NextResponse.json({
    stats: presaleStats,
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
    presalePrices: [...PRESALE_PRICES],
    dexLaunchPrice: DEX_LAUNCH_PRICE,
  });
}
