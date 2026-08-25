import { getServiceSupabase } from './supabase';
import {
  CXL_SUPPLY,
  CXL_PHASES,
  AIRDROP_DAILY_RATES,
  AIRDROP_DURATION_DAYS,
  PRESALE,
  SETTLEMENT,
  L2_DIRECTS_REQUIRED,
} from './constants';

function getConfigValue(config: Record<string, string>, key: string, fallback: string = ''): string {
  return config[key] ?? fallback;
}

function getConfigNumber(config: Record<string, string>, key: string, fallback: number = 0): number {
  const val = config[key];
  if (val === undefined || val === '') return fallback;
  return Number(val);
}

export async function getConfig(): Promise<Record<string, string>> {
  const supabase = getServiceSupabase();
  const { data } = await supabase.from('airdrop_config').select('key,value');
  if (!data) return {};
  const map: Record<string, string> = {};
  for (const row of data) map[row.key] = row.value;
  return map;
}

export async function setConfig(key: string, value: string) {
  const supabase = getServiceSupabase();
  await supabase
    .from('airdrop_config')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

export async function getCurrentDay(): Promise<number> {
  const config = await getConfig();
  const startedAt = getConfigValue(config, 'airdrop_started_at');
  if (!startedAt) return 0;
  const start = new Date(startedAt);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export async function getCurrentPhase(): Promise<number> {
  const day = await getCurrentDay();
  if (day <= 0) return 0;
  if (day <= 30) return 1;
  if (day <= 60) return 2;
  return 3;
}

export async function getPresalePrice(): Promise<number> {
  const day = await getCurrentDay();
  if (day <= 0) return PRESALE.startPrice;
  const price = PRESALE.startPrice + (day - 1) * PRESALE.dailyIncrement;
  return Math.min(price, PRESALE.startPrice + (PRESALE.durationDays - 1) * PRESALE.dailyIncrement);
}

export async function ensureUserBalance(userId: string) {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('user_token_balances')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!data) {
    await supabase.from('user_token_balances').insert({
      user_id: userId,
      cxl_balance: 0,
      cxl_earned_total: 0,
      cxl_liquid: 0,
      cxl_staked: 0,
      signup_bonus_claimed: false,
      signup_bonus_amount: 0,
      consecutive_claim_days: 0,
      total_claim_days: 0,
    });
  }
}

export async function getUserBalance(userId: string) {
  const supabase = getServiceSupabase();
  await ensureUserBalance(userId);
  const { data } = await supabase
    .from('user_token_balances')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

export async function claimSignupBonus(userId: string) {
  const supabase = getServiceSupabase();
  const config = await getConfig();
  const phase = await getCurrentPhase();

  if (phase === 0) return { error: 'Airdrop not started yet' };

  const balance = await getUserBalance(userId);
  if (!balance) return { error: 'User balance not found' };
  if (balance.signup_bonus_claimed) return { error: 'Signup bonus already claimed' };

  const phaseConfig = CXL_PHASES[phase as keyof typeof CXL_PHASES];
  if (!phaseConfig) return { error: 'Invalid phase' };

  const bonus = phaseConfig.bonus;

  const { error: updateErr } = await supabase
    .from('user_token_balances')
    .update({
      cxl_balance: balance.cxl_balance + bonus,
      cxl_earned_total: balance.cxl_earned_total + bonus,
      cxl_liquid: balance.cxl_liquid + bonus,
      signup_bonus_claimed: true,
      signup_bonus_amount: bonus,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateErr) return { error: updateErr.message };

  await supabase.from('airdrop_earnings').insert({
    user_id: userId,
    day_number: 0,
    total_cxl: bonus,
    claimed_at: new Date().toISOString(),
  });

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: 'CXL Signup Bonus!',
    message: `You received ${bonus} CXL tokens as Phase ${phase} signup bonus!`,
    data: { type: 'signup_bonus', amount: bonus, phase },
  });

  return { success: true, bonus, phase };
}

export async function canClaimDaily(userId: string): Promise<{ canClaim: boolean; reason?: string }> {
  const config = await getConfig();
  const isActive = getConfigValue(config, 'is_active', 'true');
  if (isActive !== 'true') return { canClaim: false, reason: 'Airdrop is paused' };

  const day = await getCurrentDay();
  if (day <= 0) return { canClaim: false, reason: 'Airdrop not started' };
  if (day > AIRDROP_DURATION_DAYS) return { canClaim: false, reason: 'Airdrop period ended (Day 91+)' };

  const balance = await getUserBalance(userId);
  if (!balance) return { canClaim: false, reason: 'User not enrolled' };
  if (!balance.is_active) return { canClaim: false, reason: 'Account inactive' };

  const today = new Date().toISOString().split('T')[0];
  if (balance.last_claim_date === today) return { canClaim: false, reason: 'Already claimed today' };

  return { canClaim: true };
}

export async function countDirectReferrals(userId: string): Promise<number> {
  const supabase = getServiceSupabase();
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', userId);
  return count || 0;
}

export async function getL2Directs(userId: string): Promise<number> {
  const supabase = getServiceSupabase();
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', userId);
  return count || 0;
}

export async function claimDailyAirdrop(userId: string) {
  const supabase = getServiceSupabase();

  const check = await canClaimDaily(userId);
  if (!check.canClaim) return { error: check.reason };

  const day = await getCurrentDay();
  const balance = await getUserBalance(userId);
  if (!balance) return { error: 'User balance not found' };

  const directCount = await getL2Directs(userId);
  const l2Unlocked = directCount >= L2_DIRECTS_REQUIRED;

  let totalCXL = 0;
  const earnings: Record<string, number> = {
    level_1_cxl: AIRDROP_DAILY_RATES.L1,
    level_2_cxl: 0,
    level_3_cxl: 0,
    level_4_cxl: 0,
    level_5_cxl: 0,
  };

  totalCXL += earnings.level_1_cxl;

  if (l2Unlocked) {
    earnings.level_2_cxl = AIRDROP_DAILY_RATES.L2;
    earnings.level_3_cxl = AIRDROP_DAILY_RATES.L3;
    earnings.level_4_cxl = AIRDROP_DAILY_RATES.L4;
    earnings.level_5_cxl = AIRDROP_DAILY_RATES.L5;
    totalCXL += earnings.level_2_cxl + earnings.level_3_cxl + earnings.level_4_cxl + earnings.level_5_cxl;
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = balance.last_claim_date === yesterday;
  const newStreak = isConsecutive ? balance.consecutive_claim_days + 1 : 1;

  const { error: updateErr } = await supabase
    .from('user_token_balances')
    .update({
      cxl_balance: balance.cxl_balance + totalCXL,
      cxl_earned_total: balance.cxl_earned_total + totalCXL,
      cxl_liquid: balance.cxl_liquid + totalCXL,
      last_claim_date: today,
      consecutive_claim_days: newStreak,
      total_claim_days: balance.total_claim_days + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (updateErr) return { error: updateErr.message };

  await supabase.from('airdrop_earnings').insert({
    user_id: userId,
    day_number: day,
    ...earnings,
    total_cxl: totalCXL,
  });

  const levelText = l2Unlocked
    ? `L1-L5 full matrix (${totalCXL} CXL)`
    : `L1 only (${totalCXL} CXL) — invite ${L2_DIRECTS_REQUIRED} directs to unlock L2-L5`;

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: `Day ${day} Airdrop Claimed`,
    message: `You earned ${totalCXL} CXL. ${levelText}`,
    data: { type: 'daily_airdrop', amount: totalCXL, day, earnings },
  });

  return {
    success: true,
    totalCXL,
    earnings,
    day,
    l2Unlocked,
    streak: newStreak,
  };
}

export async function purchasePresale(userId: string, cxlAmount: number) {
  const supabase = getServiceSupabase();
  const config = await getConfig();
  const isActive = getConfigValue(config, 'is_active', 'true');
  if (isActive !== 'true') return { error: 'Presale is paused' };

  const day = await getCurrentDay();
  if (day <= 0) return { error: 'Presale not started' };
  if (day > AIRDROP_DURATION_DAYS) return { error: 'Presale ended (Day 91+)' };

  if (cxlAmount < PRESALE.minCXL) return { error: `Minimum purchase is ${PRESALE.minCXL} CXL` };
  if (cxlAmount > PRESALE.maxCXL) return { error: `Maximum purchase is ${PRESALE.maxCXL} CXL` };

  const totalSupply = getConfigNumber(config, 'cxl_total_supply', CXL_SUPPLY);
  const sold = getConfigNumber(config, 'cxl_sold', 0);
  if (sold + cxlAmount > totalSupply) return { error: 'Insufficient CXL supply remaining' };

  const price = await getPresalePrice();
  const totalUSDT = Math.round(cxlAmount * price * 10000) / 10000;

  const { data: userProfile, error: userErr } = await supabase
    .from('users')
    .select('id, total_earned')
    .eq('id', userId)
    .single();

  if (userErr || !userProfile) return { error: 'User not found' };

  const balance = Number(userProfile.total_earned) || 0;
  if (balance < totalUSDT) return { error: `Insufficient USDT balance. Need $${totalUSDT.toFixed(4)}, you have $${balance.toFixed(4)}` };

  const newBalance = Math.round((balance - totalUSDT) * 100) / 100;
  const { error: deductErr } = await supabase
    .from('users')
    .update({ total_earned: newBalance })
    .eq('id', userId);

  if (deductErr) return { error: 'Failed to deduct USDT balance' };

  const { error: insertErr } = await supabase.from('presale_purchases').insert({
    user_id: userId,
    cxl_amount: cxlAmount,
    price_per_cxl: price,
    total_usdt: totalUSDT,
    day_number: day,
  });

  if (insertErr) return { error: insertErr.message };

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'presale_purchase',
    amount: -totalUSDT,
    description: `Presale: ${cxlAmount} CXL @ $${price.toFixed(4)}/CXL (Day ${day})`,
  });

  await setConfig('cxl_sold', String(sold + cxlAmount));

  const tokenBalance = await getUserBalance(userId);
  if (tokenBalance) {
    await supabase
      .from('user_token_balances')
      .update({
        cxl_balance: tokenBalance.cxl_balance + cxlAmount,
        cxl_earned_total: tokenBalance.cxl_earned_total + cxlAmount,
        cxl_liquid: tokenBalance.cxl_liquid + cxlAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: 'CXL Presale Purchase',
    message: `Purchased ${cxlAmount} CXL for $${totalUSDT.toFixed(4)} at $${price.toFixed(4)}/CXL on Day ${day}`,
    data: { type: 'presale_purchase', cxlAmount, price, totalUSDT, day },
  });

  return { success: true, cxlAmount, price, totalUSDT, day, newUSDTBalance: newBalance };
}

export async function processDayEnd() {
  const config = await getConfig();
  const isActive = getConfigValue(config, 'is_active', 'true');
  if (isActive !== 'true') return { skipped: true, reason: 'Airdrop paused' };

  const day = await getCurrentDay();
  if (day <= 0 || day > AIRDROP_DURATION_DAYS) {
    return { skipped: true, reason: `Day ${day} — outside airdrop window` };
  }

  const newPrice = PRESALE.startPrice + day * PRESALE.dailyIncrement;
  await setConfig('presale_current_price', String(Math.min(newPrice, PRESALE.startPrice + (PRESALE.durationDays - 1) * PRESALE.dailyIncrement)));

  return { success: true, day, newPrice };
}

export async function processDay91Settlement() {
  const supabase = getServiceSupabase();
  const day = await getCurrentDay();
  if (day !== 91) return { skipped: true, reason: `Day ${day} — not Day 91` };

  const { data: balances } = await supabase
    .from('user_token_balances')
    .select('user_id, cxl_balance')
    .gt('cxl_balance', 0);

  if (!balances || balances.length === 0) return { success: true, settled: 0 };

  let settled = 0;
  for (const b of balances) {
    const total = Number(b.cxl_balance);
    const staked = total * (SETTLEMENT.airdropStakedPercent / 100);
    const liquid = total * (SETTLEMENT.airdropLiquidPercent / 100);

    await supabase
      .from('user_token_balances')
      .update({
        cxl_staked: staked,
        cxl_liquid: liquid,
        cxl_balance: 0,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', b.user_id);

    await supabase.from('notifications').insert({
      user_id: b.user_id,
      type: 'earnings',
      title: 'Day 91 Settlement Complete',
      message: `${total.toFixed(4)} CXL settled: ${staked.toFixed(4)} CXL staked (90%) + ${liquid.toFixed(4)} CXL liquid (10%)`,
      data: { type: 'settlement', total, staked, liquid },
    });

    settled++;
  }

  await setConfig('is_active', 'false');

  return { success: true, settled };
}

export async function getAirdropStats() {
  const config = await getConfig();
  const supabase = getServiceSupabase();

  const totalSupply = getConfigNumber(config, 'cxl_total_supply', CXL_SUPPLY);
  const sold = getConfigNumber(config, 'cxl_sold', 0);
  const day = await getCurrentDay();
  const price = await getPresalePrice();
  const phase = await getCurrentPhase();

  const { count: totalUsers } = await supabase
    .from('user_token_balances')
    .select('id', { count: 'exact', head: true });

  const { count: activeClaimers } = await supabase
    .from('user_token_balances')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: todayClaims } = await supabase
    .from('airdrop_earnings')
    .select('total_cxl')
    .eq('day_number', day);

  const todayTotalCXL = todayClaims?.reduce((sum, c) => sum + Number(c.total_cxl), 0) || 0;

  return {
    totalSupply,
    sold,
    remaining: totalSupply - sold,
    day,
    price,
    phase,
    totalUsers: totalUsers || 0,
    activeClaimers: activeClaimers || 0,
    todayTotalCXL,
    isActive: getConfigValue(config, 'is_active', 'true') === 'true',
  };
}
