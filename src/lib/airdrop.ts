import { getServiceSupabase } from './supabase';
import {
  CXL_SUPPLY,
  CXL_PHASES,
  SIGNUP_COMMISSION_RATES,
  AIRDROP_DURATION_DAYS,
  PRESALE,
  PRESALE_SUPPLY_LIMIT,
  PRESALE_VESTING,
  PRESALE_REFERRAL,
  SETTLEMENT,
  L2_DIRECTS_REQUIRED,
  getPresalePriceForDay,
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
  return getPresalePriceForDay(day);
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
  const stakedBonus = Math.round(bonus * 0.9 * 100) / 100;
  const liquidBonus = Math.round(bonus * 0.1 * 100) / 100;

  const { error: updateErr } = await supabase
    .from('user_token_balances')
    .update({
      cxl_balance: balance.cxl_balance + bonus,
      cxl_earned_total: balance.cxl_earned_total + bonus,
      cxl_liquid: (Number(balance.cxl_liquid) || 0) + liquidBonus,
      cxl_staked: (Number(balance.cxl_staked) || 0) + stakedBonus,
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

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'signup_bonus',
    amount: bonus,
    description: `Phase ${phase} signup bonus: ${stakedBonus} CXL staked + ${liquidBonus} CXL liquid`,
  });

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: 'CXL Signup Bonus!',
    message: `You received ${bonus} CXL tokens as Phase ${phase} signup bonus! (${stakedBonus} staked + ${liquidBonus} liquid)`,
    data: { type: 'signup_bonus', amount: bonus, phase, stakedBonus, liquidBonus },
  });

  await distributeSignupCommission(userId, bonus);

  return { success: true, bonus, phase, stakedBonus, liquidBonus };
}

export async function countDirectReferrals(userId: string): Promise<number> {
  const supabase = getServiceSupabase();
  const { count } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('sponsor_id', userId);
  return count || 0;
}

async function distributeSignupCommission(userId: string, bonusAmount: number) {
  const supabase = getServiceSupabase();

  const { data: userProfile } = await supabase
    .from('users')
    .select('sponsor_id')
    .eq('id', userId)
    .single();

  if (!userProfile?.sponsor_id) return;

  let currentUserId = userProfile.sponsor_id;
  const levels = [
    { level: 1, cxl: SIGNUP_COMMISSION_RATES.L1 },
    { level: 2, cxl: SIGNUP_COMMISSION_RATES.L2 },
    { level: 3, cxl: SIGNUP_COMMISSION_RATES.L3 },
    { level: 4, cxl: SIGNUP_COMMISSION_RATES.L4 },
    { level: 5, cxl: SIGNUP_COMMISSION_RATES.L5 },
  ];

  for (const lvl of levels) {
    if (!currentUserId) break;

    if (lvl.level > 1) {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('sponsor_id', currentUserId);
      const directCount = count || 0;
      if (directCount < L2_DIRECTS_REQUIRED) {
        const { data: parent } = await supabase
          .from('users')
          .select('sponsor_id')
          .eq('id', currentUserId)
          .single();
        currentUserId = parent?.sponsor_id || null;
        continue;
      }
    }

    const commissionCXL = lvl.cxl;
    const stakedCXL = Math.round(commissionCXL * 0.9 * 100) / 100;
    const liquidCXL = Math.round(commissionCXL * 0.1 * 100) / 100;

    const { data: upline } = await supabase
      .from('user_token_balances')
      .select('cxl_balance, cxl_staked, cxl_liquid, cxl_earned_total')
      .eq('user_id', currentUserId)
      .single();

    if (upline) {
      await supabase
        .from('user_token_balances')
        .update({
          cxl_balance: (Number(upline.cxl_balance) || 0) + commissionCXL,
          cxl_earned_total: (Number(upline.cxl_earned_total) || 0) + commissionCXL,
          cxl_staked: (Number(upline.cxl_staked) || 0) + stakedCXL,
          cxl_liquid: (Number(upline.cxl_liquid) || 0) + liquidCXL,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUserId);
    }

    await supabase.from('transactions').insert({
      user_id: currentUserId,
      type: 'signup_commission',
      amount: commissionCXL,
      description: `L${lvl.level} signup commission: ${stakedCXL} CXL staked + ${liquidCXL} CXL liquid`,
    });

    const { data: parent } = await supabase
      .from('users')
      .select('sponsor_id')
      .eq('id', currentUserId)
      .single();
    currentUserId = parent?.sponsor_id || null;
  }
}

export async function purchasePresale(userId: string, usdtAmount: number) {
  const supabase = getServiceSupabase();
  const config = await getConfig();
  const isActive = getConfigValue(config, 'is_active', 'true');
  if (isActive !== 'true') return { error: 'Presale is paused' };

  const day = await getCurrentDay();
  if (day <= 0) return { error: 'Presale not started' };
  if (day > AIRDROP_DURATION_DAYS) return { error: 'Presale ended (Day 91+)' };

  if (usdtAmount < PRESALE.minUSDT) return { error: `Minimum purchase is $${PRESALE.minUSDT}` };
  if (usdtAmount > PRESALE.maxUSDT) return { error: `Maximum purchase is $${PRESALE.maxUSDT}` };

  const price = await getPresalePrice();
  const cxlAmount = Math.floor((usdtAmount / price) * 100) / 100;

  const sold = getConfigNumber(config, 'cxl_sold', 0);
  if (sold + cxlAmount > PRESALE_SUPPLY_LIMIT) return { error: `Presale supply limit reached. Only ${(PRESALE_SUPPLY_LIMIT - sold).toFixed(2)} CXL remaining.` };

  const totalUSDT = Math.round(usdtAmount * 100) / 100;

  const { data: userProfile, error: userErr } = await supabase
    .from('users')
    .select('id, total_earned, sponsor_id')
    .eq('id', userId)
    .single();

  if (userErr || !userProfile) return { error: 'User not found' };

  const { data: purchase, error: insertErr } = await supabase.from('presale_purchases').insert({
    user_id: userId,
    cxl_amount: cxlAmount,
    price_per_cxl: price,
    total_usdt: totalUSDT,
    day_number: day,
  }).select('id').single();

  if (insertErr) return { error: insertErr.message };

  await supabase.from('transactions').insert({
    user_id: userId,
    type: 'presale_purchase',
    amount: -totalUSDT,
    description: `Presale: ${cxlAmount.toFixed(2)} CXL @ $${price.toFixed(4)}/CXL (Day ${day})`,
  });

  await setConfig('cxl_sold', String(sold + cxlAmount));

  const stakedCxl = cxlAmount * (PRESALE_VESTING.stakedPercent / 100);
  const streamedCxl = cxlAmount * (PRESALE_VESTING.streamedPercent / 100);
  const monthlyAmount = streamedCxl / PRESALE_VESTING.totalInstallments;

  await supabase.from('presale_vesting_schedule').insert({
    user_id: userId,
    presale_purchase_id: purchase?.id,
    total_cxl: cxlAmount,
    staked_cxl: stakedCxl,
    vested_cxl: 0,
    monthly_amount: monthlyAmount,
    current_installment: 0,
    total_installments: PRESALE_VESTING.totalInstallments,
    next_unlock_at: null,
    status: 'locked',
  });

  await supabase
    .from('user_token_balances')
    .update({
      presale_vested_locked: (await getUserBalance(userId))?.presale_vested_locked || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  const balanceRow = await getUserBalance(userId);
  if (balanceRow) {
    await supabase
      .from('user_token_balances')
      .update({
        presale_vested_locked: (Number(balanceRow.presale_vested_locked) || 0) + cxlAmount,
        cxl_staked: (Number(balanceRow.cxl_staked) || 0) + stakedCxl,
        cxl_balance: (Number(balanceRow.cxl_balance) || 0) + cxlAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  await distributePresaleReferralCommission(userId, totalUSDT, day);

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: 'CXL Presale Purchase',
    message: `Purchased ${cxlAmount.toFixed(2)} CXL for $${totalUSDT.toFixed(4)} at $${price.toFixed(4)}/CXL on Day ${day}. 50% staked at launch, 50% vested over 11 months.`,
    data: { type: 'presale_purchase', cxlAmount, price, totalUSDT, day, stakedCxl, streamedCxl },
  });

  return { success: true, cxlAmount, price, totalUSDT, day, stakedCxl, streamedCxl };
}

async function distributePresaleReferralCommission(userId: string, purchaseUSDT: number, day: number) {
  const supabase = getServiceSupabase();
  const commissionPool = purchaseUSDT * (PRESALE_REFERRAL.totalPercent / 100);

  let currentUserId = userId;
  let directCount = 0;

  const { data: currentUser } = await supabase
    .from('users')
    .select('sponsor_id')
    .eq('id', userId)
    .single();

  if (!currentUser?.sponsor_id) return;

  currentUserId = currentUser.sponsor_id;

  for (const levelConfig of PRESALE_REFERRAL.levels) {
    if (!currentUserId) break;

    if (levelConfig.level > 1) {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('sponsor_id', currentUserId);

      directCount = count || 0;
      if (directCount < levelConfig.requiresDirects) {
        const { data: parent } = await supabase
          .from('users')
          .select('sponsor_id')
          .eq('id', currentUserId)
          .single();
        currentUserId = parent?.sponsor_id || null;
        continue;
      }
    }

    const commission = Math.round(commissionPool * (levelConfig.percent / 100) * 100) / 100;

    if (commission > 0) {
      const { data: upline } = await supabase
        .from('users')
        .select('id, total_earned')
        .eq('id', currentUserId)
        .single();

      if (upline) {
        const newUplineBalance = Math.round((Number(upline.total_earned) + commission) * 100) / 100;
        await supabase
          .from('users')
          .update({ total_earned: newUplineBalance })
          .eq('id', currentUserId);

        await supabase.from('transactions').insert({
          user_id: currentUserId,
          type: 'presale_referral',
          amount: commission,
          description: `L${levelConfig.level} presale referral commission from direct`,
        });
      }
    }

    const { data: parent } = await supabase
      .from('users')
      .select('sponsor_id')
      .eq('id', currentUserId)
      .single();
    currentUserId = parent?.sponsor_id || null;
  }
}

export async function processDayEnd() {
  const config = await getConfig();
  const isActive = getConfigValue(config, 'is_active', 'true');
  if (isActive !== 'true') return { skipped: true, reason: 'Airdrop paused' };

  const day = await getCurrentDay();
  if (day <= 0 || day > AIRDROP_DURATION_DAYS) {
    return { skipped: true, reason: `Day ${day} — outside airdrop window` };
  }

  const nextDay = day + 1;
  const newPrice = getPresalePriceForDay(nextDay);
  await setConfig('presale_current_price', String(newPrice));

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

  const { data: vestingSchedules } = await supabase
    .from('presale_vesting_schedule')
    .select('id, user_id, total_cxl, staked_cxl')
    .eq('status', 'locked');

  if (vestingSchedules && vestingSchedules.length > 0) {
    const day91 = new Date();
    const firstUnlock = new Date(day91);
    firstUnlock.setDate(firstUnlock.getDate() + PRESALE_VESTING.installmentIntervalDays);

    for (const vs of vestingSchedules) {
      await supabase
        .from('presale_vesting_schedule')
        .update({
          status: 'streaming',
          next_unlock_at: firstUnlock.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', vs.id);

      const userBalance = await getUserBalance(vs.user_id);
      if (userBalance) {
        await supabase
          .from('user_token_balances')
          .update({
            cxl_staked: Number(userBalance.cxl_staked) + Number(vs.staked_cxl),
            presale_vested_locked: Number(userBalance.presale_vested_locked) - Number(vs.total_cxl),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', vs.user_id);
      }

      await supabase.from('notifications').insert({
        user_id: vs.user_id,
        type: 'earnings',
        title: 'Presale Vesting Activated',
        message: `${Number(vs.staked_cxl).toFixed(2)} CXL staked at 3% daily yield. ${Number(vs.total_cxl - vs.staked_cxl).toFixed(2)} CXL locked for 11-month vesting.`,
        data: { type: 'presale_vesting_activated', stakedCxl: vs.staked_cxl, totalCxl: vs.total_cxl },
      });
    }
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

export async function getVestingSchedule(userId: string) {
  const supabase = getServiceSupabase();
  const { data } = await supabase
    .from('presale_vesting_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!data) return { schedules: [], totalLocked: 0, totalClaimed: 0, totalStaked: 0 };

  let totalLocked = 0;
  let totalClaimed = 0;
  let totalStaked = 0;

  for (const s of data) {
    if (s.status === 'streaming' || s.status === 'locked') {
      totalLocked += Number(s.total_cxl) - Number(s.staked_cxl) - Number(s.vested_cxl);
    }
    totalClaimed += Number(s.vested_cxl);
    totalStaked += Number(s.staked_cxl);
  }

  return { schedules: data, totalLocked, totalClaimed, totalStaked };
}

export async function claimVestingInstallment(userId: string, vestingId: string, action: 'liquid' | 'compound') {
  const supabase = getServiceSupabase();

  const { data: schedule, error: fetchErr } = await supabase
    .from('presale_vesting_schedule')
    .select('*')
    .eq('id', vestingId)
    .eq('user_id', userId)
    .single();

  if (fetchErr || !schedule) return { error: 'Vesting schedule not found' };
  if (schedule.status !== 'streaming') return { error: 'Vesting not yet active' };
  if (schedule.current_installment >= schedule.total_installments) return { error: 'All installments claimed' };

  const now = new Date();
  if (schedule.next_unlock_at && new Date(schedule.next_unlock_at) > now) {
    const unlockTime = new Date(schedule.next_unlock_at);
    const diffMs = unlockTime.getTime() - now.getTime();
    const days = Math.floor(diffMs / 86400000);
    const hours = Math.floor((diffMs % 86400000) / 3600000);
    return { error: `Next unlock in ${days}d ${hours}h` };
  }

  const claimable = Number(schedule.monthly_amount);
  const newInstallment = schedule.current_installment + 1;
  const isLast = newInstallment >= schedule.total_installments;

  const nextUnlock = new Date(now);
  nextUnlock.setDate(nextUnlock.getDate() + PRESALE_VESTING.installmentIntervalDays);

  const { error: updateErr } = await supabase
    .from('presale_vesting_schedule')
    .update({
      current_installment: newInstallment,
      vested_cxl: Number(schedule.vested_cxl) + claimable,
      next_unlock_at: isLast ? null : nextUnlock.toISOString(),
      status: isLast ? 'completed' : 'streaming',
      updated_at: now.toISOString(),
    })
    .eq('id', vestingId);

  if (updateErr) return { error: updateErr.message };

  const userBalance = await getUserBalance(userId);
  if (!userBalance) return { error: 'User balance not found' };

  if (action === 'liquid') {
    await supabase
      .from('user_token_balances')
      .update({
        cxl_liquid: Number(userBalance.cxl_liquid) + claimable,
        cxl_balance: Number(userBalance.cxl_balance) + claimable,
        cxl_earned_total: Number(userBalance.cxl_earned_total) + claimable,
        presale_vested_claimed: Number(userBalance.presale_vested_claimed) + claimable,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId);
  } else {
    await supabase
      .from('user_token_balances')
      .update({
        cxl_staked: Number(userBalance.cxl_staked) + claimable,
        cxl_balance: Number(userBalance.cxl_balance) + claimable,
        cxl_earned_total: Number(userBalance.cxl_earned_total) + claimable,
        presale_vested_claimed: Number(userBalance.presale_vested_claimed) + claimable,
        updated_at: now.toISOString(),
      })
      .eq('user_id', userId);
  }

  await supabase.from('transactions').insert({
    user_id: userId,
    type: action === 'liquid' ? 'vesting_claim_liquid' : 'vesting_claim_compound',
    amount: claimable,
    description: `Vesting installment ${newInstallment}/${schedule.total_installments}: ${claimable.toFixed(2)} CXL ${action === 'liquid' ? 'claimed to liquid' : 'compounded to staking'}`,
  });

  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'earnings',
    title: `Vesting Installment ${newInstallment}/${schedule.total_installments}`,
    message: `${claimable.toFixed(2)} CXL ${action === 'liquid' ? 'claimed to liquid wallet' : 'compounded to staking vault (3% daily yield)'}`,
    data: { type: 'vesting_claim', amount: claimable, action, installment: newInstallment },
  });

  return { success: true, claimed: claimable, action, installment: newInstallment, isLast };
}
