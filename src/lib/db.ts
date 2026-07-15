import { getSupabase } from './supabase';
import { SLOTS, MATRIX_LEVELS, APEX_POOL, SLOT_CONFIG, REBUY_MAX, ALLOCATION, POOL_SPLIT, CHAMPIONS_POOL, ACTIVE_POOL } from './constants';
import type { User, UserSlot, Transaction, Withdrawal, Notification, Earnings, Referral, AdminStats, ApexPoolState, AscensionVault, ChampionsPoolState, CommunityPoolState, ChampionsEntry } from '@/types';

function sb() { return getSupabase(); }

async function incrementField(table: string, userId: string, field: string, amount: number): Promise<void> {
  const { data: row } = await sb().from(table).select(field).eq('id', userId).single();
  const current = Number((row as any)?.[field] || 0);
  const newVal = Math.round((current + amount) * 100) / 100;
  const { error } = await sb().from(table).update({ [field]: newVal }).eq('id', userId);
  if (error) {
    console.error(`incrementField error: ${table}.${field} for ${userId}`, error);
  }
}

export async function reconcileUserBalances(userId: string): Promise<void> {
  const { data: earnings } = await sb().from('earnings').select('type, amount').eq('user_id', userId);
  if (!earnings) return;

  let dailySum = 0, ascensionSum = 0, matrixSum = 0, poolSum = 0, referralSum = 0;
  for (const e of earnings) {
    const amt = Number(e.amount);
    if (e.type === 'daily') dailySum += amt;
    else if (e.type === 'ascension') ascensionSum += amt;
    else if (e.type === 'matrix') matrixSum += amt;
    else if (e.type === 'pool') poolSum += amt;
    else if (e.type === 'referral') referralSum += amt;
  }

  const correctTotalEarned = Math.round((dailySum + matrixSum / 2 + poolSum / 2 + referralSum) * 100) / 100;
  const correctAscension = Math.round((ascensionSum + matrixSum / 2 + poolSum / 2) * 100) / 100;

  const { data: user } = await sb().from('users').select('total_earned, ascension_balance').eq('id', userId).single();
  if (!user) return;

  const curTE = Number(user.total_earned || 0);
  const curAB = Number(user.ascension_balance || 0);

  if (Math.abs(curTE - correctTotalEarned) > 0.01 || Math.abs(curAB - correctAscension) > 0.01) {
    await sb().from('users').update({
      total_earned: correctTotalEarned,
      ascension_balance: correctAscension,
    }).eq('id', userId);
  }

  const { data: slots } = await sb().from('user_slots').select('id, invested').eq('user_id', userId);
  const correctInvested = (slots || []).reduce((s: number, sl: any) => s + Number(sl.invested), 0);
  const curInv = Number((user as any)?.total_invested || 0);
  if (Math.abs(curInv - correctInvested) > 0.01) {
    await sb().from('users').update({ total_invested: correctInvested }).eq('id', userId);
  }
}

function mapUser(u: any): User {
  return {
    id: u.id, wallet: u.wallet, rank: u.rank,
    referralCode: u.referral_code, sponsorId: u.sponsor_id,
    directs: u.directs || 0, teamSize: u.team_size || 0,
    joinedAt: u.created_at, totalInvested: Number(u.total_invested),
    totalEarned: Number(u.total_earned), isActive: u.is_active,
    ascensionBalance: Number(u.ascension_balance),
    displayName: u.display_name || '',
    twoFAEnabled: u.two_factor_enabled || false,
    roiEnabled: u.roi_enabled !== false,
    banReason: u.ban_reason || '',
  };
}

function mapSlot(s: any): UserSlot {
  return {
    id: s.id, userId: s.user_id, slotId: s.slot_id,
    slotName: s.slot_name, slotOrbit: s.slot_orbit,
    invested: Number(s.invested), earned: Number(s.earned),
    dailyEarned: Number(s.daily_earned), maxCap: Number(s.max_cap),
    progress: Number(s.progress), status: s.status,
    activatedAt: s.activated_at, completedAt: s.completed_at,
  };
}

function mapTransaction(t: any): Transaction {
  const typeMap: Record<string, Transaction['type']> = {
    slot_purchase: 'slot_purchase', withdraw: 'withdraw', referral: 'referral',
    daily_earning: 'daily_earning', matrix_earning: 'matrix_earning',
    pool_earning: 'pool_earning', ascension_credit: 'ascension_credit',
    upgrade: 'upgrade', recycle: 'recycle',
  };
  return {
    id: t.id, type: typeMap[t.type] || 'slot_purchase',
    amount: Number(t.amount), status: t.status,
    timestamp: t.created_at, hash: t.tx_hash,
    description: t.description || '',
  };
}

function mapWithdrawal(w: any): Withdrawal {
  return {
    id: w.id, amount: Number(w.amount), wallet: w.wallet,
    status: w.status, timestamp: w.created_at,
    processedAt: w.processed_at, txHash: w.tx_hash,
  };
}

function mapNotification(n: any): Notification {
  return {
    id: n.id, type: n.type, title: n.title, message: n.message || '',
    read: n.is_read, timestamp: n.created_at,
  };
}

// ─── USER ───

export async function getUserByWallet(wallet: string): Promise<User | null> {
  const { data } = await sb().from('users').select('*').eq('wallet', wallet.toLowerCase()).single();
  return data ? mapUser(data) : null;
}

export async function getUserById(userId: string): Promise<User | null> {
  const { data } = await sb().from('users').select('*').eq('id', userId).single();
  return data ? mapUser(data) : null;
}

export async function updateDisplayName(userId: string, displayName: string): Promise<void> {
  await sb().from('users').update({ display_name: displayName }).eq('id', userId);
}

export async function enable2FA(userId: string, secret: string): Promise<void> {
  await sb().from('users').update({ two_factor_secret: secret, two_factor_enabled: true }).eq('id', userId);
}

export async function disable2FA(userId: string): Promise<void> {
  await sb().from('users').update({ two_factor_secret: '', two_factor_enabled: false }).eq('id', userId);
}

export async function setUserSponsor(userId: string, sponsorCode: string): Promise<User | null> {
  const { data: sponsor } = await sb().from('users').select('id').eq('referral_code', sponsorCode).single();
  if (!sponsor) return null;
  await sb().from('users').update({ sponsor_id: sponsor.id }).eq('id', userId);
  await addToMatrix(sponsor.id, userId);
  await updateTeamSize(sponsor.id);
  const { data } = await sb().from('users').select('*').eq('id', userId).single();
  return data ? mapUser(data) : null;
}

export async function createUser(wallet: string, sponsorCode?: string): Promise<User | null> {
  const code = generateReferralCode();
  let sponsorId: string | null = null;
  if (sponsorCode) {
    const { data: sponsor } = await sb().from('users').select('id').eq('referral_code', sponsorCode).single();
    if (sponsor) sponsorId = sponsor.id;
  }
  const { data, error } = await sb().from('users').insert({
    wallet: wallet.toLowerCase(), referral_code: code, sponsor_id: sponsorId,
    is_active: true,
  }).select().single();
  if (error || !data) return null;
  const user = mapUser(data);
  if (sponsorId) {
    await addToMatrix(sponsorId, user.id);
    await updateTeamSize(sponsorId);
  }
  return user;
}

function generateReferralCode(): string {
  return 'CXL' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

// ─── 2x11 FORCED BINARY MATRIX WITH ZERO-DEPTH SPILLOVER ───
// Root is level 0 (1 node), L1=2, L2=4, ..., L11=2048 → total 4095

// Find first empty position in owner's tree using BFS level-order
async function findEmptyPosition(ownerId: string): Promise<{ parentNodeId: string | null; side: 'left' | 'right'; level: number } | null> {
  const { data: root } = await sb().from('matrix_tree').select('id').eq('user_id', ownerId).eq('owner_id', ownerId).maybeSingle();
  if (!root) return { parentNodeId: null, side: 'left', level: 0 }; // Tree empty, place as root (level 0)

  const { data: allNodes } = await sb().from('matrix_tree')
    .select('id, parent_id, side, level')
    .eq('owner_id', ownerId)
    .order('level').order('position');
  if (!allNodes) return null;

  // BFS to find first empty left or right child
  // Level 0 = root, Level 1 = L1 (2 nodes), ..., Level 11 = L11 (2048 nodes)
  for (const node of allNodes) {
    if (node.level >= 11) continue; // L11 is the max level
    const hasLeft = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'left');
    const hasRight = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'right');
    if (!hasLeft) return { parentNodeId: node.id, side: 'left', level: node.level + 1 };
    if (!hasRight) return { parentNodeId: node.id, side: 'right', level: node.level + 1 };
  }

  // Also check direct left/right under root at level 1 if BFS missed them
  const hasLeft = allNodes.some((n: any) => n.parent_id === root.id && n.side === 'left');
  const hasRight = allNodes.some((n: any) => n.parent_id === root.id && n.side === 'right');
  if (!hasLeft) return { parentNodeId: root.id, side: 'left', level: 1 };
  if (!hasRight) return { parentNodeId: root.id, side: 'right', level: 1 };

  return null; // Full tree
}

export async function addToMatrix(sponsorId: string, userId: string): Promise<void> {
  // Ensure sponsor has a root node (level 0)
  const { data: sponsorRoot } = await sb().from('matrix_tree').select('id').eq('user_id', sponsorId).eq('owner_id', sponsorId).maybeSingle();
  if (!sponsorRoot) {
    await sb().from('matrix_tree').insert({
      user_id: sponsorId, owner_id: sponsorId,
      parent_id: null, side: null, level: 0, position: 1,
    });
  }

  // Step 1: Try sponsor's tree first (BFS spillover)
  let placed = await findEmptyPosition(sponsorId);

  // Step 2: If full, spill over to upline
  if (!placed) {
    let uplineId = await getDirectSponsor(sponsorId);
    while (uplineId && !placed) {
      placed = await findEmptyPosition(uplineId);
      uplineId = placed ? null : await getDirectSponsor(uplineId);
    }
  }

  if (!placed) return; // No room anywhere

  const { count: posCount } = await sb().from('matrix_tree').select('*', { count: 'exact', head: true }).eq('owner_id', placed.parentNodeId ? sponsorId : sponsorId);
  const position = (posCount || 0) + 1;

  await sb().from('matrix_tree').insert({
    user_id: userId, owner_id: sponsorId,
    parent_id: placed.parentNodeId, side: placed.side,
    level: placed.level, position,
  });

  // Add to matrix_11 for unilevel earnings (owner's upline chain)
  const visited = new Set<string>();
  let currentId: string | null = sponsorId;
  let lvl = 1;
  while (currentId && lvl <= 11 && !visited.has(currentId)) {
    visited.add(currentId);
    await sb().from('matrix_11').insert({
      user_id: userId, sponsor_id: currentId, level: lvl,
    });
    const upline = await getDirectSponsor(currentId);
    currentId = upline;
    lvl++;
  }

  const ownerId = placed.parentNodeId ? sponsorId : sponsorId;
  await updateTeamSize(ownerId);
}

async function getDirectSponsor(userId: string): Promise<string | null> {
  const { data } = await sb().from('users').select('sponsor_id').eq('id', userId).single();
  return data?.sponsor_id || null;
}

async function updateTeamSize(userId: string): Promise<void> {
  const { count: directs } = await sb().from('users').select('*', { count: 'exact', head: true }).eq('sponsor_id', userId);
  const { count: treeCount } = await sb().from('matrix_tree').select('*', { count: 'exact', head: true }).eq('owner_id', userId);
  await sb().from('users').update({
    directs: directs || 0,
    team_size: Math.max(0, (treeCount || 0) - 1), // exclude self
  }).eq('id', userId);
}

export async function getMatrixTree(userId: string): Promise<any> {
  const { data: nodes } = await sb().from('matrix_tree')
    .select('*, users!matrix_tree_user_id_fkey(wallet)')
    .eq('owner_id', userId)
    .order('level').order('position');
  if (!nodes || nodes.length === 0) return null;

  const map = new Map<string, any>();
  nodes.forEach((n: any) => {
    map.set(n.id, {
      id: n.id, userId: n.user_id, wallet: n.users?.wallet || '',
      level: n.level, side: n.side, parentId: n.parent_id,
      left: null, right: null,
    });
  });

  let root: any = null;
  nodes.forEach((n: any) => {
    const node = map.get(n.id);
    if (!n.parent_id) { root = node; return; }
    const parent = map.get(n.parent_id);
    if (parent) {
      if (n.side === 'left') parent.left = node;
      else parent.right = node;
    }
  });

  function countDescendants(node: any): number {
    if (!node) return 0;
    return 1 + countDescendants(node.left) + countDescendants(node.right);
  }

  function fillChildren(node: any): any {
    if (!node) return null;
    return {
      ...node, left: fillChildren(node.left), right: fillChildren(node.right),
    };
  }

  return fillChildren(root);
}

export async function getUserMatrixLevel(userId: string): Promise<any[]> {
  const { data } = await sb().from('matrix_11')
    .select('*, users!matrix_11_sponsor_id_fkey(wallet)')
    .eq('user_id', userId)
    .order('level');
  return (data || []).map((m: any) => ({
    sponsorId: m.sponsor_id, sponsorWallet: m.users?.wallet || '',
    level: m.level, totalEarnings: Number(m.total_earnings),
  }));
}

export async function getMatrixStats(userId: string): Promise<any> {
  const { data: treeNodes } = await sb().from('matrix_tree').select('user_id, level, side').eq('owner_id', userId);
  if (!treeNodes) return { total: 0, levels: [], directsCount: 0 };

  const { count: directs } = await sb().from('users').select('*', { count: 'exact', head: true }).eq('sponsor_id', userId);
  const levelCounts: number[] = [];
  for (let i = 1; i <= 11; i++) levelCounts.push(treeNodes.filter((n: any) => n.level === i).length);

  return {
    total: Math.max(0, treeNodes.length - 1), // exclude self (root)
    totalSponsored: treeNodes.filter((n: any) => n.level === 1).length,
    directsCount: directs || 0,
    levels: levelCounts,
  };
}

export async function processMatrixCommission(purchaserId: string, amount: number): Promise<void> {
  const { data: levels } = await sb().from('matrix_11')
    .select('id, sponsor_id, level')
    .eq('user_id', purchaserId);
  if (!levels) return;
  for (const m of levels) {
    if (!m.sponsor_id) continue;
    const config = MATRIX_LEVELS.find(l => l.level === m.level);
    if (!config) continue;
    if (config.directsRequired > 0) {
      const { data: sponsor } = await sb().from('users').select('directs').eq('id', m.sponsor_id).single();
      if (!sponsor || (sponsor.directs || 0) < config.directsRequired) continue;
    }
    const commission = (amount * config.percent) / 100;
    const walletShare = Math.round((commission * SLOT_CONFIG.walletSplitPercent) / 100 * 100) / 100;
    const ascensionShare = Math.round((commission - walletShare) * 100) / 100;
    await sb().from('matrix_earnings').insert({
      matrix_id: m.id, earned_from: purchaserId,
      level: m.level, amount: commission,
    });
    const { data: mRow } = await sb().from('matrix_11').select('total_earnings').eq('id', m.id).single();
    await sb().from('matrix_11').update({
      total_earnings: Number((mRow as any)?.total_earnings || 0) + commission,
    }).eq('id', m.id);
    await sb().from('earnings').insert({
      user_id: m.sponsor_id, type: 'matrix', amount: commission,
      source: `Level ${m.level} commission from slot purchase`,
    });
    const { data: purchaser } = await sb().from('users').select('referral_code').eq('id', purchaserId).single();
    await sb().from('transactions').insert({
      user_id: m.sponsor_id, type: 'matrix_earning',
      amount: commission, description: `L${m.level} from ${purchaser?.referral_code || purchaserId.slice(0, 8)}`,
    });
    if (ascensionShare > 0) {
      await incrementField('users', m.sponsor_id, 'ascension_balance', ascensionShare);
      await sb().from('transactions').insert({
        user_id: m.sponsor_id, type: 'ascension_credit',
        amount: ascensionShare,
        description: `50% ascension from L${m.level} matrix commission`,
      });
    }
    if (walletShare > 0) {
      await incrementField('users', m.sponsor_id, 'total_earned', walletShare);
    }
  }
}

// ─── SLOTS ───

export async function purchaseSlot(userId: string, slotId: string): Promise<UserSlot | null> {
  const slot = SLOTS.find(s => s.id === slotId);
  if (!slot) return null;
  const { data: allPurchases } = await sb().from('user_slots')
    .select('id, status').eq('user_id', userId).eq('slot_id', slotId).order('activated_at', { ascending: false });
  const existingActive = allPurchases?.find(p => p.status === 'active');
  if (existingActive) return null;
  const completedCount = allPurchases?.filter(p => p.status === 'completed').length || 0;
  const isLocked = allPurchases?.some(p => p.status === 'locked');
  if (isLocked) return null;
  const rebuyCount = allPurchases?.length || 0;
  if (rebuyCount > REBUY_MAX) return null;
  const isRebuy = rebuyCount > 0;
  const slotIndex = SLOTS.findIndex(s => s.id === slotId);
  if (!isRebuy && slotIndex > 0) {
    const prevSlotId = SLOTS[slotIndex - 1].id;
    const { data: prev } = await sb().from('user_slots')
      .select('id').eq('user_id', userId).eq('slot_id', prevSlotId).maybeSingle();
    if (!prev) return null;
  }
  const { data, error } = await sb().from('user_slots').insert({
    user_id: userId, slot_id: slot.id, slot_name: slot.name,
    slot_orbit: slot.orbit, invested: slot.price,
    earned: 0, daily_earned: slot.dailyYield, max_cap: slot.maxCap,
    progress: 0, status: 'active',
  }).select().single();
  if (error || !data) return null;
  const txType = isRebuy ? 'slot_purchase' : 'slot_purchase';
  await sb().from('transactions').insert({
    user_id: userId, type: txType, amount: slot.price,
    description: isRebuy ? `Re-bought ${slot.name} slot (${rebuyCount + 1}/${REBUY_MAX + 1})` : `Purchased ${slot.name} slot`,
  });
  await incrementField('users', userId, 'total_invested', slot.price);
  await sb().from('users').update({
    is_active: true,
  }).eq('id', userId);
  await processMatrixCommission(userId, slot.price);
  await processApexPoolContribution(slot.price);
  return mapSlot(data);
}

export async function getRebuyCount(userId: string, slotId: string): Promise<number> {
  const { data } = await sb().from('user_slots')
    .select('id').eq('user_id', userId).eq('slot_id', slotId);
  return data?.length || 0;
}

export async function isSlotLocked(userId: string, slotId: string): Promise<boolean> {
  const { data } = await sb().from('user_slots')
    .select('id, status').eq('user_id', userId).eq('slot_id', slotId).eq('status', 'locked').maybeSingle();
  return !!data;
}

export async function getUserSlots(userId: string): Promise<UserSlot[]> {
  const { data } = await sb().from('user_slots')
    .select('*').eq('user_id', userId).order('activated_at', { ascending: false });
  return (data || []).map(mapSlot);
}

async function markSlotCapped(s: any, userId?: string, earned?: number): Promise<void> {
  const uid = userId || s.user_id;
  const newEarned = earned ?? Number(s.earned);
  const { data: totalPurchases } = await sb().from('user_slots')
    .select('id').eq('user_id', uid).eq('slot_id', s.slot_id);
  const purchaseCount = totalPurchases?.length || 1;
  const isFinalCycle = purchaseCount >= REBUY_MAX + 1;
  const newStatus = isFinalCycle ? 'locked' : 'completed';
  await sb().from('user_slots').update({
    status: newStatus, completed_at: new Date().toISOString(),
  }).eq('id', s.id);
  await sb().from('notifications').insert({
    user_id: uid, type: 'slot', title: isFinalCycle ? 'Slot Locked!' : 'Slot Completed!',
    message: isFinalCycle
      ? `${s.slot_name} completed ${REBUY_MAX} re-buy cycles. Permanently locked.`
      : `${s.slot_name} reached 200% cap. Re-buy available.`,
  });
  if (s.slot_orbit === 11) {
    await processOrbit11Recycle(uid, s.id, newEarned);
  } else if (!isFinalCycle) {
    await checkAutoUpgrade(uid);
  }
}

export async function processSlotEarnings(userId: string): Promise<void> {
  const { data: user } = await sb().from('users').select('roi_enabled, last_daily_process').eq('id', userId).single();
  if (user?.roi_enabled === false) return;

  const canProcess = await checkDailyProcess(userId);
  if (!canProcess) return;
  await updateLastDailyProcess(userId);
  const { data: activeSlots } = await sb().from('user_slots')
    .select('*').eq('user_id', userId).eq('status', 'active');
  if (!activeSlots || activeSlots.length === 0) return;
  for (const s of activeSlots) {
    const currentEarned = Number(s.earned);
    const dailyAmount = Number(s.daily_earned);
    const maxCap = Number(s.max_cap);
    if (currentEarned >= maxCap) {
      await markSlotCapped(s);
      continue;
    }
    const actualDaily = Math.min(dailyAmount, maxCap - currentEarned);
    const newEarned = currentEarned + actualDaily;
    const walletShare = Math.round((actualDaily * SLOT_CONFIG.walletSplitPercent) / 100 * 100) / 100;
    const ascensionShare = Math.round((actualDaily - walletShare) * 100) / 100;
    await sb().from('user_slots').update({
      earned: newEarned,
      progress: (newEarned / maxCap) * 100,
      last_earning_at: new Date().toISOString(),
    }).eq('id', s.id);
    if (ascensionShare > 0) {
      await incrementField('users', userId, 'ascension_balance', ascensionShare);
      await sb().from('earnings').insert({
        user_id: userId, type: 'ascension', amount: ascensionShare,
        source: `50% ascension from ${s.slot_name}`,
      });
      await sb().from('transactions').insert({
        user_id: userId, type: 'ascension_credit',
        amount: ascensionShare,
        description: `50% ascension from ${s.slot_name} daily yield`,
      });
    }
    if (walletShare > 0) {
      await incrementField('users', userId, 'total_earned', walletShare);
      await sb().from('earnings').insert({
        user_id: userId, type: 'daily', amount: walletShare,
        source: `Daily yield from ${s.slot_name}`,
      });
      await sb().from('transactions').insert({
        user_id: userId, type: 'daily_earning', amount: walletShare,
        description: `Daily yield from ${s.slot_name}`,
      });
    }
    if (newEarned >= maxCap) {
      await markSlotCapped(s, userId, newEarned);
    }
  }
  await checkAutoUpgrade(userId);
  await reconcileUserBalances(userId);
}

export async function getAscensionVault(userId: string): Promise<AscensionVault> {
  const { data: user } = await sb().from('users').select('ascension_balance').eq('id', userId).single();
  const balance = Number(user?.ascension_balance || 0);
  const nextSlot = SLOTS.find(s => s.price > 0 && s.price <= balance * 2);
  const { data: owned } = await sb().from('user_slots').select('slot_orbit').eq('user_id', userId).order('slot_orbit', { ascending: false });
  const maxOrbit = owned?.length ? Math.max(...owned.map((o: any) => o.slot_orbit)) : 0;
  const nextAvailable = SLOTS.find(s => s.orbit === maxOrbit + 1);
  return {
    balance,
    autoUpgrade: true,
    nextSlot: nextAvailable?.id || 'orbit-11',
    nextSlotCost: nextAvailable?.price || 100000,
    progress: nextAvailable ? (balance / nextAvailable.price) * 100 : 100,
  };
}

async function checkAutoUpgrade(userId: string): Promise<void> {
  const { data: user } = await sb().from('users').select('ascension_balance').eq('id', userId).single();
  if (!user) return;
  const balance = Number(user.ascension_balance);
  const { data: owned } = await sb().from('user_slots').select('slot_orbit').eq('user_id', userId).order('slot_orbit', { ascending: false });
  const maxOrbit = owned?.length ? Math.max(...owned.map((o: any) => o.slot_orbit)) : 0;
  const nextAvailable = SLOTS.find(s => s.orbit === maxOrbit + 1);
  if (!nextAvailable || balance < nextAvailable.price) return;
  const result = await purchaseSlot(userId, nextAvailable.id);
  if (!result) return;
  await sb().from('users').update({
    ascension_balance: balance - nextAvailable.price,
  }).eq('id', userId);
  await sb().from('transactions').insert({
    user_id: userId, type: 'upgrade', amount: nextAvailable.price,
    description: `Auto-upgraded to ${nextAvailable.name} via ascension vault`,
  });
}

async function processOrbit11Recycle(userId: string, slotId: string, earned: number): Promise<void> {
  const walletShare = Math.round(earned / 2 * 100) / 100;
  const rebuyShare = Math.round((earned - walletShare) * 100) / 100;
  await sb().from('user_slots').insert({
    user_id: userId, slot_id: 'orbit-11', slot_name: 'Infinity Core',
    slot_orbit: 11, invested: 0, earned: 0, daily_earned: 3000,
    max_cap: 200000, progress: 0, status: 'active',
  });
  await sb().from('transactions').insert({
    user_id: userId, type: 'recycle', amount: walletShare,
    description: 'Orbit 11 re-cycle: 50% wallet (credited via daily yield) + 50% re-buy',
  });
  await sb().from('transactions').insert({
    user_id: userId, type: 'slot_purchase', amount: rebuyShare,
    description: 'Auto re-buy Orbit 11 from re-cycle',
  });
}

// ─── GLOBAL APEX POOL — Champions (50%) + Active (50%) ───
// Champions: any user with ≥1 direct referral + team activity (new placements in 24h)
// Active: any active user + team activity (new placements in 24h)
// Both: equal share; carry-forward if no qualifiers

async function processApexPoolContribution(amount: number): Promise<void> {
  const contribution = (amount * ALLOCATION.poolPercent) / 100;
  await sb().from('apex_pool_blocks').insert({
    block_number: 0, value: contribution, completed: false, distributed: false,
  });
}

async function hasTeamActivity(userId: string): Promise<boolean> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await sb().from('matrix_tree')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', userId)
    .neq('user_id', userId)
    .gte('created_at', since);
  return (count || 0) > 0;
}

async function getActiveOwnerIds(): Promise<Set<string>> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data } = await sb().from('matrix_tree')
    .select('owner_id').gte('created_at', since);
  const ids = new Set<string>();
  (data || []).forEach((r: any) => {
    if (r.owner_id) ids.add(r.owner_id);
  });
  return ids;
}

// ─── CHAMPIONS POOL (50% of 10% = 5%) ───
// Qualification: ≥1 direct referral AND team activity in last 24h
// Distribution: equal share among all qualifiers

async function getChampionsLeaderboard(): Promise<ChampionsEntry[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: users } = await sb().from('users').select('id, wallet, directs');
  if (!users || users.length === 0) return [];

  const userIds = users.map((u: any) => u.id);

  const [{ data: recentRefs }, { data: recentPurchases }] = await Promise.all([
    sb().from('users').select('sponsor_id').in('sponsor_id', userIds).gte('created_at', since),
    sb().from('user_slots').select('user_id, invested').in('user_id', userIds).gte('activated_at', since),
  ]);

  const refCounts: Record<string, number> = {};
  (recentRefs || []).forEach((r: any) => { refCounts[r.sponsor_id] = (refCounts[r.sponsor_id] || 0) + 1; });

  const purchaseCounts: Record<string, number> = {};
  const volumes: Record<string, number> = {};
  (recentPurchases || []).forEach((p: any) => {
    purchaseCounts[p.user_id] = (purchaseCounts[p.user_id] || 0) + 1;
    volumes[p.user_id] = (volumes[p.user_id] || 0) + Number(p.invested || 0);
  });

  const entries: ChampionsEntry[] = [];
  const activeOwners = await getActiveOwnerIds();
  for (const u of users) {
    const hasDirects = (u.directs || 0) > 0;
    const teamAct = hasDirects ? activeOwners.has(u.id) : false;
    const qualified = hasDirects && teamAct;
    const buys = purchaseCounts[u.id] || 0;
    const vol = volumes[u.id] || 0;
    const score = (refCounts[u.id] || 0) * 10 + buys * 5 + vol * 0.001;
    let qualifiedReason = '';
    if (!hasDirects) qualifiedReason = 'No direct referrals';
    else if (!teamAct) qualifiedReason = 'No team activity in 24h';
    entries.push({
      userId: u.id, wallet: u.wallet, score, rank: 0, reward: 0,
      referrals24h: refCounts[u.id] || 0, purchases24h: buys, volume24h: vol,
      qualified, qualifiedReason,
    });
  }
  entries.sort((a, b) => b.score - a.score);
  return entries.map((e, i) => ({ ...e, rank: i + 1 }));
}

export async function getChampionsPoolState(): Promise<ChampionsPoolState> {
  const { data: pending } = await sb().from('apex_pool_blocks').select('value').eq('distributed', false);
  const totalPending = pending?.reduce((s: number, r: any) => s + Number(r.value), 0) || 0;
  const half = totalPending / 2;
  const { data: lastWinner } = await sb().from('champions_pool_winners')
    .select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle();
  const lastDist = lastWinner?.created_at || '';
  const nextTime = lastDist
    ? new Date(new Date(lastDist).getTime() + APEX_POOL.distributionInterval * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const todayStr = new Date().toDateString();
  const { data: todayWinners } = await sb().from('champions_pool_winners')
    .select('reward, created_at').order('created_at', { ascending: false });
  const todayDist = (todayWinners as any[])?.filter(w => new Date(w.created_at).toDateString() === todayStr)
    .reduce((s: number, w: any) => s + Number(w.reward), 0) || 0;
  const lifetimeDist = (todayWinners as any[])?.reduce((s: number, w: any) => s + Number(w.reward), 0) || 0;
  const leaderboard = await getChampionsLeaderboard();
  const qualifiedCount = leaderboard.filter(e => e.qualified).length;
  return { totalFund: half, lastDistribution: lastDist, nextDistributionTime: nextTime,
    todayDistribution: todayDist, lifetimeDistribution: lifetimeDist,
    leaderboard, qualifiedCount, totalQualifiedCount: qualifiedCount };
}

async function distributeChampionsPool(totalFund: number): Promise<void> {
  const leaderboard = await getChampionsLeaderboard();
  const qualified = leaderboard.filter(e => e.qualified);
  if (qualified.length === 0) return;
  const perPerson = totalFund / qualified.length;
  for (const entry of qualified) {
    const walletShare = Math.round(perPerson * SLOT_CONFIG.walletSplitPercent / 100 * 100) / 100;
    const ascensionShare = Math.round((perPerson - walletShare) * 100) / 100;
    await sb().from('champions_pool_winners').insert({
      user_id: entry.userId, distribution_cycle: new Date().toISOString().slice(0, 10),
      score: entry.score, rank: entry.rank, reward: perPerson,
    });
    if (walletShare > 0) {
      await incrementField('users', entry.userId, 'total_earned', walletShare);
    }
    if (ascensionShare > 0) {
      await incrementField('users', entry.userId, 'ascension_balance', ascensionShare);
    }
    await sb().from('earnings').insert({
      user_id: entry.userId, type: 'pool', amount: perPerson,
      source: 'Champions Pool (equal share)',
    });
    await sb().from('transactions').insert({
      user_id: entry.userId, type: 'pool_earning', amount: perPerson,
      description: `Champions Pool — ${qualified.length} qualifiers, $${perPerson.toFixed(2)} each`,
    });
    if (ascensionShare > 0) {
      await sb().from('transactions').insert({
        user_id: entry.userId, type: 'ascension_credit', amount: ascensionShare,
        description: '50% ascension from Champions Pool',
      });
    }
  }
}

// ─── ACTIVE POOL (50% of 10% = 5%) ───
// Qualification: user is active (has active slot) AND team activity in last 24h
// Distribution: equal share among all qualifiers

export async function getCommunityPoolState(): Promise<CommunityPoolState> {
  const { data: pending } = await sb().from('apex_pool_blocks').select('value').eq('distributed', false);
  const totalPending = pending?.reduce((s: number, r: any) => s + Number(r.value), 0) || 0;
  const half = totalPending / 2;

  const { data: activeSlotUsers } = await sb().from('user_slots')
    .select('user_id').eq('status', 'active');
  const uniqueUserIds = [...new Set((activeSlotUsers || []).map((s: any) => s.user_id))];
  const activeOwners = await getActiveOwnerIds();
  let qualifiedCount = 0;
  for (const uid of uniqueUserIds) {
    if (activeOwners.has(uid)) qualifiedCount++;
  }

  const { data: lastDist } = await sb().from('community_pool_distributions')
    .select('*').order('distributed_at', { ascending: false }).limit(1).maybeSingle();
  const lastDistTime = lastDist?.distributed_at || '';
  const nextTime = lastDistTime
    ? new Date(new Date(lastDistTime).getTime() + APEX_POOL.distributionInterval * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: allDists } = await sb().from('community_pool_distributions')
    .select('*').order('distributed_at', { ascending: false });
  const todayStr = new Date().toDateString();
  const todayDist = allDists?.filter(d => new Date(d.distributed_at).toDateString() === todayStr)
    .reduce((s: number, d: any) => s + Number(d.total_fund), 0) || 0;
  const lifetimeDist = allDists?.reduce((s: number, d: any) => s + Number(d.total_fund), 0) || 0;
  return {
    totalFund: half, lastDistribution: lastDistTime, nextDistributionTime: nextTime,
    todayDistribution: todayDist, lifetimeDistribution: lifetimeDist,
    qualifiedCount, perPerson: lastDist ? Number(lastDist.per_person) : 0,
    history: (allDists || []).map(d => ({
      id: d.id, totalFund: Number(d.total_fund),
      qualifiedCount: d.qualified_count, perPerson: Number(d.per_person),
      distributedAt: d.distributed_at,
    })),
  };
}

async function distributeCommunityPool(totalFund: number): Promise<void> {
  const { data: activeSlotUsers } = await sb().from('user_slots')
    .select('user_id').eq('status', 'active');
  const uniqueUserIds = [...new Set((activeSlotUsers || []).map((s: any) => s.user_id))];

  const qualifiers: { id: string }[] = [];
  const activeOwners = await getActiveOwnerIds();
  for (const uid of uniqueUserIds) {
    if (activeOwners.has(uid)) qualifiers.push({ id: uid });
  }
  if (qualifiers.length === 0) return;
  const perPerson = totalFund / qualifiers.length;
  const { data: dist } = await sb().from('community_pool_distributions').insert({
    total_fund: totalFund, qualified_count: qualifiers.length, per_person: perPerson,
  }).select().single();
  if (!dist) return;
  for (const q of qualifiers) {
    const walletShare = Math.round(perPerson * SLOT_CONFIG.walletSplitPercent / 100 * 100) / 100;
    const ascensionShare = Math.round((perPerson - walletShare) * 100) / 100;
    await sb().from('community_pool_qualifiers').insert({
      distribution_id: dist.id, user_id: q.id, amount: perPerson, claimed: false,
    });
    if (walletShare > 0) {
      await incrementField('users', q.id, 'total_earned', walletShare);
    }
    if (ascensionShare > 0) {
      await incrementField('users', q.id, 'ascension_balance', ascensionShare);
    }
    await sb().from('earnings').insert({
      user_id: q.id, type: 'pool', amount: perPerson,
      source: 'Active Pool (equal share)',
    });
    await sb().from('transactions').insert({
      user_id: q.id, type: 'pool_earning', amount: perPerson,
      description: `Active Pool — ${qualifiers.length} qualifiers, $${perPerson.toFixed(2)} each`,
    });
    if (ascensionShare > 0) {
      await sb().from('transactions').insert({
        user_id: q.id, type: 'ascension_credit', amount: ascensionShare,
        description: '50% ascension from Active Pool',
      });
    }
  }
}

// ─── APEX POOL STATE (combined) ───

export async function getApexPoolState(): Promise<ApexPoolState> {
  const { data: pending } = await sb().from('apex_pool_blocks').select('value').eq('distributed', false);
  const totalPoolFund = pending?.reduce((s, r) => s + Number(r.value), 0) || 0;
  const championsFund = totalPoolFund / 2;
  const activeFund = totalPoolFund / 2;
  const { data: lastDist } = await sb().from('apex_pool_distributions')
    .select('*').order('distributed_at', { ascending: false }).limit(1).maybeSingle();
  const { data: allDists } = await sb().from('apex_pool_distributions')
    .select('*').order('distributed_at', { ascending: false });
  const lifetimeDistribution = allDists?.reduce((s, d) => s + Number(d.total_fund), 0) || 0;
  const todayStr = new Date().toDateString();
  const todayDistribution = allDists?.filter(d => new Date(d.distributed_at).toDateString() === todayStr)
    .reduce((s, d) => s + Number(d.total_fund), 0) || 0;
  const nextTime = lastDist
    ? new Date(new Date(lastDist.distributed_at).getTime() + APEX_POOL.distributionInterval * 60 * 60 * 1000).toISOString()
    : new Date().toISOString();

  const { count: activeSlots } = await sb().from('user_slots')
    .select('*', { count: 'exact', head: true }).eq('status', 'active');

  return {
    totalPoolFund, lastDistribution: lastDist?.distributed_at || '',
    qualifiedCount: activeSlots || 0,
    distributePerPerson: activeSlots && activeSlots > 0 ? totalPoolFund / activeSlots : 0,
    todayDistribution, lifetimeDistribution, nextDistributionTime: nextTime,
    distributionHistory: (allDists || []).map(d => ({
      id: d.id, totalFund: Number(d.total_fund),
      qualifiedCount: d.qualified_count, perPerson: Number(d.per_person),
      distributedAt: d.distributed_at, safetyReserve: Number(d.safety_reserve),
    })),
    championsFund, activeFund,
    championsQualified: 0, activeQualified: 0,
  };
}

export async function distributeApexPool(): Promise<void> {
  const { data: pending } = await sb().from('apex_pool_blocks')
    .update({ distributed: true })
    .eq('distributed', false)
    .select('id, value');
  if (!pending || pending.length === 0) return;
  const totalFund = pending.reduce((s, r) => s + Number(r.value), 0);

  const halfFund = totalFund / 2;
  await distributeChampionsPool(halfFund);
  await distributeCommunityPool(halfFund);

  await sb().from('apex_pool_distributions').insert({
    total_fund: totalFund, qualified_count: 0, per_person: 0, safety_reserve: 0,
  });
}

// ─── DAILY PROCESSING (CRON / ON-LOGIN TRIGGER) ───

export async function checkDailyProcess(userId: string): Promise<boolean> {
  const { data } = await sb().from('users').select('last_daily_process, created_at').eq('id', userId).single();
  if (!data?.last_daily_process) {
    const { data: lastDaily } = await sb().from('earnings')
      .select('created_at').eq('user_id', userId).eq('type', 'daily')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (lastDaily) {
      return Date.now() - new Date(lastDaily.created_at).getTime() >= 24 * 60 * 60 * 1000;
    }
    return true;
  }
  const { count } = await sb().from('earnings').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  if (count === 0) return true;
  const lastProcess = new Date(data.last_daily_process).getTime();
  return Date.now() - lastProcess >= 24 * 60 * 60 * 1000;
}

export async function updateLastDailyProcess(userId: string): Promise<void> {
  try {
    await sb().from('users').update({ last_daily_process: new Date().toISOString() }).eq('id', userId);
  } catch (_) { /* column may not exist */ }
}

export async function processAllDailyEarnings(): Promise<{ processed: number }> {
  const { data: users } = await sb().from('users').select('id').eq('is_active', true);
  if (!users) return { processed: 0 };
  let count = 0;
  for (const u of users) {
    await processSlotEarnings(u.id);
    await updateLastDailyProcess(u.id);
    await checkAutoUpgrade(u.id);
    count++;
  }
  return { processed: count };
}

export async function checkApexPoolDistribution(): Promise<boolean> {
  const { data: last } = await sb().from('apex_pool_distributions')
    .select('distributed_at').order('distributed_at', { ascending: false }).limit(1).maybeSingle();
  if (!last) return true;
  const elapsed = Date.now() - new Date(last.distributed_at).getTime();
  return elapsed >= 24 * 60 * 60 * 1000;
}

// ─── EARNINGS ───

export async function getUserEarnings(userId: string): Promise<Earnings> {
  const { data } = await sb().from('earnings').select('type, amount').eq('user_id', userId);
  const result: Earnings = { daily: 0, total: 0, matrix: 0, pool: 0, referral: 0, ascension: 0 };
  (data || []).forEach((e: any) => {
    const amt = Number(e.amount);
    result.total += amt;
    if (e.type === 'daily') result.daily += amt;
    else if (e.type === 'matrix') result.matrix += amt;
    else if (e.type === 'pool') result.pool += amt;
    else if (e.type === 'referral') result.referral += amt;
    else if (e.type === 'ascension') result.ascension += amt;
  });
  return result;
}

// ─── REFERRALS ───

export async function getReferrals(userId: string): Promise<Referral[]> {
  const { data } = await sb().from('users')
    .select('id, wallet, created_at, total_earned, team_size')
    .eq('sponsor_id', userId);
  return (data || []).map((u: any) => ({
    id: u.id, wallet: u.wallet, level: 1, joinedAt: u.created_at,
    earnings: Number(u.total_earned), teamSize: u.team_size,
  }));
}

// ─── TRANSACTIONS ───

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data } = await sb().from('transactions')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapTransaction);
}

// ─── WITHDRAWALS ───

export async function getWithdrawals(userId: string): Promise<Withdrawal[]> {
  const { data } = await sb().from('withdrawals')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapWithdrawal);
}

export async function requestWithdrawal(userId: string, amount: number, wallet: string): Promise<boolean> {
  if (amount < 1) return false;
  const { data: user } = await sb().from('users').select('total_earned').eq('id', userId).single();
  if (!user) return false;
  if (Number(user.total_earned) < amount) return false;
  await incrementField('users', userId, 'total_earned', -amount);
  const { error } = await sb().from('withdrawals').insert({
    user_id: userId, amount, wallet, status: 'pending',
  });
  if (error) return false;
  await sb().from('notifications').insert({
    user_id: userId, type: 'withdrawal', title: 'Withdrawal Requested',
    message: `$${amount} withdrawal request submitted.`,
  });
  return true;
}

export async function createWithdrawal(userId: string, amount: number, wallet: string): Promise<string | null> {
  const { data, error } = await sb().from('withdrawals').insert({
    user_id: userId, amount, wallet, status: 'pending',
  }).select('id').single();
  if (error || !data) return null;
  await sb().from('notifications').insert({
    user_id: userId, type: 'withdrawal', title: 'Withdrawal Requested',
    message: `$${amount} withdrawal request submitted.`,
  });
  return data.id;
}

export async function updateWithdrawalStatus(id: string, status: string, extra?: Record<string, any>): Promise<boolean> {
  const update: Record<string, any> = { status, ...extra };
  if (status === 'approved' || status === 'processing') {
    update.processed_at = new Date().toISOString();
  }
  const { error } = await sb().from('withdrawals').update(update).eq('id', id);
  return !error;
}

export async function getHeldWithdrawals(): Promise<Withdrawal[]> {
  const { data } = await sb().from('withdrawals')
    .select('*').eq('status', 'held').order('held_since', { ascending: true });
  return (data || []).map(mapWithdrawal);
}

export async function getPendingWithdrawals(): Promise<Withdrawal[]> {
  const { data } = await sb().from('withdrawals')
    .select('*').eq('status', 'pending').order('created_at', { ascending: true });
  return (data || []).map(mapWithdrawal);
}

export async function deductUserBalance(userId: string, amount: number): Promise<boolean> {
  const { data: user } = await sb().from('users').select('total_earned').eq('id', userId).single();
  if (!user) return false;
  if (Number(user.total_earned) < amount) return false;
  await incrementField('users', userId, 'total_earned', -amount);
  return true;
}

// ─── NOTIFICATIONS ───

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await sb().from('notifications')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await sb().from('notifications').update({ is_read: true }).eq('id', id);
}

export async function deleteNotification(id: string): Promise<boolean> {
  const { error } = await sb().from('notifications').delete().eq('id', id);
  return !error;
}

export async function getAllNotifications(): Promise<any[]> {
  const { data } = await sb().from('notifications')
    .select('*').order('created_at', { ascending: false }).limit(100);
  return (data || []).map((n: any) => mapNotification(n));
}

export async function createNotification(userId: string, title: string, message: string, type = 'system'): Promise<void> {
  await sb().from('notifications').insert({
    user_id: userId, title, message, type, is_read: false,
  });
}

export async function createGlobalNotification(title: string, message: string, type = 'announcement'): Promise<boolean> {
  try {
    const { data: users, error: userError } = await sb().from('users').select('id');
    if (userError || !users || users.length === 0) return false;
    const rows = users.map((u: any) => ({
      user_id: u.id, title, message, type, is_read: false,
    }));
    const { error } = await sb().from('notifications').insert(rows);
    return !error;
  } catch { return false; }
}

// ─── SUPPORT TICKETS ───

export async function getAllTickets(): Promise<any[]> {
  try {
    const { data: tickets } = await sb().from('support_tickets')
      .select('*').order('created_at', { ascending: false });
    if (!tickets) return [];
    const userIds = [...new Set(tickets.map((t: any) => t.user_id))];
    const { data: users } = await sb().from('users').select('id, wallet').in('id', userIds);
    const walletMap: Record<string, string> = {};
    (users || []).forEach((u: any) => { walletMap[u.id] = u.wallet; });
    return tickets.map((t: any) => ({
      id: t.id, userId: t.user_id, wallet: walletMap[t.user_id] || '',
      subject: t.subject, message: t.message, status: t.status || 'open',
      priority: t.priority || 'medium', createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
  } catch { return []; }
}

export async function createTicket(userId: string, subject: string, message: string, priority = 'medium'): Promise<{ success: boolean; error?: string }> {
  const { error } = await sb().from('support_tickets').insert({
    user_id: userId, subject, message, priority, status: 'open',
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateTicketStatus(id: string, status: string): Promise<void> {
  await sb().from('support_tickets').update({
    status, updated_at: new Date().toISOString(),
  }).eq('id', id);
}

export async function getUserTickets(userId: string): Promise<any[]> {
  const { data } = await sb().from('support_tickets')
    .select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map((t: any) => ({
    id: t.id, subject: t.subject, message: t.message,
    status: t.status, priority: t.priority,
    createdAt: t.created_at, updatedAt: t.updated_at,
  }));
}

export async function addTicketReply(ticketId: string, message: string, userId: string): Promise<boolean> {
  const { error } = await sb().from('ticket_replies').insert({
    ticket_id: ticketId, user_id: userId, message,
  });
  if (error) return false;
  await sb().from('support_tickets').update({
    status: 'in_progress', updated_at: new Date().toISOString(),
  }).eq('id', ticketId);
  return true;
}

export async function getTicketReplies(ticketId: string): Promise<any[]> {
  const { data } = await sb().from('ticket_replies')
    .select('*, users(wallet)').eq('ticket_id', ticketId).order('created_at', { ascending: true });
  return (data || []).map((r: any) => ({
    id: r.id, message: r.message, wallet: r.users?.wallet || '',
    createdAt: r.created_at,
  }));
}

// ─── LEADERBOARD ───

export async function getLeaderboard(limit = 10): Promise<any[]> {
  const { data } = await sb().from('users')
    .select('wallet, total_earned, team_size')
    .order('total_earned', { ascending: false }).limit(limit);
  return (data || []).map((u: any, i: number) => ({
    wallet: u.wallet, earnings: Number(u.total_earned),
    teamSize: u.team_size, rank: i + 1,
  }));
}

// ─── ADMIN ───

export async function getAdminStats(): Promise<AdminStats> {
  const { count: totalUsers } = await sb().from('users').select('*', { count: 'exact', head: true });
  const { data: slotData } = await sb().from('user_slots').select('invested').eq('status', 'active');
  const { data: wdData } = await sb().from('withdrawals').select('amount, status');
  const { data: poolContribs } = await sb().from('apex_pool_blocks').select('value').eq('distributed', false);
  const { data: totalDistributed } = await sb().from('apex_pool_distributions').select('total_fund');
  const activeSlots = slotData?.length || 0;
  const totalRevenue = slotData?.reduce((s: number, p: any) => s + Number(p.invested), 0) || 0;
  const pendingWithdrawals = wdData?.filter((w: any) => w.status === 'pending').length || 0;
  const totalWithdrawals = wdData?.reduce((s: number, w: any) => s + Number(w.amount), 0) || 0;
  const poolFund = poolContribs?.reduce((s: number, p: any) => s + Number(p.value), 0) || 0;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: newUsersToday } = await sb().from('users').select('*', { count: 'exact', head: true }).gte('created_at', yesterday);
  return {
    totalUsers: totalUsers || 0, totalRevenue, activeSlots,
    pendingWithdrawals, totalWithdrawals, newUsersToday: newUsersToday || 0, growthRate: 0,
    poolFund,
    totalBlocks: totalDistributed?.length || 0,
  };
}

export async function getRecentJoins(limit = 10): Promise<any[]> {
  const { data } = await sb().from('users')
    .select('id, wallet, referral_code, sponsor_id, created_at')
    .order('created_at', { ascending: false }).limit(limit);
  return (data || []).map((u: any) => ({
    id: u.id, wallet: u.wallet, referralCode: u.referral_code,
    sponsorId: u.sponsor_id, timestamp: u.created_at,
  }));
}

export async function getAllUsers(): Promise<any[]> {
  const { data } = await sb().from('users').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapUser);
}

export async function searchUsers(query: string): Promise<any[]> {
  const q = query.trim();
  if (!q) return [];
  const results = new Map<string, any>();

  const { data: byId } = await sb().from('users').select('*').eq('id', q).limit(5);
  (byId || []).forEach(u => results.set(u.id, mapUser(u)));

  const { data: byRef } = await sb().from('users').select('*').ilike('referral_code', q).limit(5);
  (byRef || []).forEach(u => results.set(u.id, mapUser(u)));

  const { data: byWallet } = await sb().from('users').select('*').ilike('wallet', `%${q}%`).limit(10);
  (byWallet || []).forEach(u => results.set(u.id, mapUser(u)));

  return Array.from(results.values()).slice(0, 20);
}

export async function toggleROI(userId: string): Promise<boolean> {
  const { data: user } = await sb().from('users').select('roi_enabled').eq('id', userId).single();
  if (!user) return false;
  const newVal = user.roi_enabled === false ? true : false;
  const { error } = await sb().from('users').update({ roi_enabled: newVal }).eq('id', userId);
  return !error;
}

export async function adminActivateSlot(userId: string, slotId: string): Promise<UserSlot | null> {
  const slot = SLOTS.find(s => s.id === slotId);
  if (!slot) return null;
  const { data: existing } = await sb().from('user_slots')
    .select('id, status').eq('user_id', userId).eq('slot_id', slotId).eq('status', 'active').maybeSingle();
  if (existing) return null;
  const { data, error } = await sb().from('user_slots').insert({
    user_id: userId, slot_id: slot.id, slot_name: slot.name,
    slot_orbit: slot.orbit, invested: slot.price,
    earned: 0, daily_earned: slot.dailyYield, max_cap: slot.maxCap,
    progress: 0, status: 'active',
  }).select().single();
  if (error || !data) return null;
  await sb().from('transactions').insert({
    user_id: userId, type: 'slot_purchase', amount: slot.price,
    description: `Admin activated ${slot.name} slot`,
  });
  return mapSlot(data);
}

export async function banUser(userId: string, reason: string): Promise<boolean> {
  const { error } = await sb().from('users').update({
    is_active: false, ban_reason: reason,
  }).eq('id', userId);
  return !error;
}

export async function unbanUser(userId: string): Promise<boolean> {
  const { error } = await sb().from('users').update({
    is_active: true, ban_reason: '',
  }).eq('id', userId);
  return !error;
}

export async function getAllWithdrawals(): Promise<Withdrawal[]> {
  const { data } = await sb().from('withdrawals').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapWithdrawal);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const { data } = await sb().from('transactions').select('*').order('created_at', { ascending: false });
  return (data || []).map(mapTransaction);
}

export async function approveWithdrawal(id: string): Promise<boolean> {
  const { data: wd } = await sb().from('withdrawals').select('user_id, amount').eq('id', id).single();
  if (!wd) return false;
  const { error } = await sb().from('withdrawals').update({
    status: 'approved', processed_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) return false;
  await incrementField('users', wd.user_id, 'total_earned', -Number(wd.amount));
  await sb().from('notifications').insert({
    user_id: wd.user_id, type: 'withdrawal', title: 'Withdrawal Approved',
    message: `$${Number(wd.amount)} withdrawal has been approved.`,
  });
  return true;
}

export async function rejectWithdrawal(id: string): Promise<boolean> {
  const { error } = await sb().from('withdrawals').update({ status: 'rejected' }).eq('id', id);
  return !error;
}

// ─── ACTIVITY ───

export async function getRecentActivity(userId: string): Promise<any[]> {
  const { data } = await sb().from('transactions')
    .select('id, type, amount, description, created_at')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
  return (data || []).map((t: any) => ({
    id: t.id, type: t.type, description: t.description || '',
    amount: Number(t.amount), timestamp: t.created_at,
  }));
}

export { sb as getDb };

// ─── CAMPAIGN ───

export async function getActiveCampaign(): Promise<any | null> {
  try {
    const { data } = await sb().from('campaigns')
      .select('*').eq('is_enabled', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!data) return null;
    if (new Date(data.end_time) < new Date()) return null;
    return data;
  } catch { return null; }
}

export async function getAllCampaigns(): Promise<any[]> {
  try {
    const { data } = await sb().from('campaigns')
      .select('*').order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function createCampaign(name: string, description: string, durationHours: number, rewardPerReferral: number, minReferrals: number): Promise<any | null> {
  const startTime = new Date().toISOString();
  const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();
  try {
    const { data, error } = await sb().from('campaigns').insert({
      name, description, duration_hours: durationHours,
      reward_per_referral: rewardPerReferral,
      min_referrals_required: minReferrals,
      start_time: startTime, end_time: endTime, is_enabled: true,
    }).select().single();
    if (error) throw error;
    return data;
  } catch { return null; }
}

export async function toggleCampaign(campaignId: string, enabled: boolean): Promise<boolean> {
  try {
    const { error } = await sb().from('campaigns').update({ is_enabled: enabled }).eq('id', campaignId);
    return !error;
  } catch { return false; }
}

export async function getCampaignRequests(campaignId?: string): Promise<any[]> {
  try {
    let query = sb().from('campaign_requests').select('*, users!campaign_requests_user_id_fkey(wallet, referral_code)');
    if (campaignId) query = query.eq('campaign_id', campaignId);
    const { data } = await query.order('created_at', { ascending: false });
    return data || [];
  } catch { return []; }
}

export async function submitCampaignRequest(campaignId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: existing } = await sb().from('campaign_requests')
      .select('id').eq('campaign_id', campaignId).eq('user_id', userId).eq('status', 'pending').maybeSingle();
    if (existing) return { success: false, error: 'You already have a pending request' };

    const { data: campaign } = await sb().from('campaigns').select('*').eq('id', campaignId).single();
    if (!campaign) return { success: false, error: 'Campaign not found' };

    // Count direct referrals who have at least 1 active slot
    const { data: activeRefs } = await sb().from('users')
      .select('id').eq('sponsor_id', userId);
    if (!activeRefs || activeRefs.length === 0) return { success: false, error: 'No referrals found' };

    const refIds = activeRefs.map((r: any) => r.id);
    const { data: slotsData } = await sb().from('user_slots')
      .select('user_id').in('user_id', refIds).eq('status', 'active');
    const uniqueActiveRefUsers = new Set((slotsData || []).map((s: any) => s.user_id));
    const refs = uniqueActiveRefUsers.size;
    if (refs < campaign.min_referrals_required) {
      return { success: false, error: `Minimum ${campaign.min_referrals_required} verified referrals required. You have ${refs}.` };
    }

    const reward = refs * campaign.reward_per_referral;
    const { error } = await sb().from('campaign_requests').insert({
      campaign_id: campaignId, user_id: userId,
      verified_refs: refs, reward_amount: reward, status: 'pending',
    });
    if (error) throw error;
    return { success: true };
  } catch (e: any) { return { success: false, error: e.message }; }
}

export async function updateCampaignRequest(requestId: string, status: string, adminNote?: string): Promise<boolean> {
  try {
    const update: any = { status, reviewed_at: new Date().toISOString() };
    if (adminNote) update.admin_note = adminNote;
    if (status === 'paid') update.paid_at = new Date().toISOString();
    const { error } = await sb().from('campaign_requests').update(update).eq('id', requestId);
    return !error;
  } catch { return false; }
}

export async function getUserDirectCount(userId: string): Promise<number> {
  try {
    const { data: refs } = await sb().from('users')
      .select('id').eq('sponsor_id', userId);
    if (!refs || refs.length === 0) return 0;
    const refIds = refs.map((r: any) => r.id);
    const { data: slotsData } = await sb().from('user_slots')
      .select('user_id').in('user_id', refIds).eq('status', 'active');
    const unique = new Set((slotsData || []).map((s: any) => s.user_id));
    return unique.size;
  } catch { return 0; }
}

export async function getUserCampaignRequest(campaignId: string, userId: string): Promise<any | null> {
  try {
    const { data } = await sb().from('campaign_requests')
      .select('*').eq('campaign_id', campaignId).eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    return data || null;
  } catch { return null; }
}
