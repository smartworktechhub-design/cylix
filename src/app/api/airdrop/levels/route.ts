import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { SIGNUP_COMMISSION_RATES } from '@/lib/constants';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  const supabase = getServiceSupabase();

  // L1 = direct referrals
  const { data: l1Users } = await supabase
    .from('users')
    .select('id')
    .eq('sponsor_id', userId);

  const l1Ids = (l1Users || []).map((u: any) => u.id);
  const l1Count = l1Ids.length;

  // L2 = users whose sponsor is in L1
  let l2Ids: string[] = [];
  if (l1Ids.length > 0) {
    const { data: l2Users } = await supabase
      .from('users')
      .select('id')
      .in('sponsor_id', l1Ids);
    l2Ids = (l2Users || []).map((u: any) => u.id);
  }
  const l2Count = l2Ids.length;

  // L3 = users whose sponsor is in L2
  let l3Ids: string[] = [];
  if (l2Ids.length > 0) {
    const { data: l3Users } = await supabase
      .from('users')
      .select('id')
      .in('sponsor_id', l2Ids);
    l3Ids = (l3Users || []).map((u: any) => u.id);
  }
  const l3Count = l3Ids.length;

  // L4 = users whose sponsor is in L3
  let l4Ids: string[] = [];
  if (l3Ids.length > 0) {
    const { data: l4Users } = await supabase
      .from('users')
      .select('id')
      .in('sponsor_id', l3Ids);
    l4Ids = (l4Users || []).map((u: any) => u.id);
  }
  const l4Count = l4Ids.length;

  // L5 = users whose sponsor is in L4
  let l5Ids: string[] = [];
  if (l4Ids.length > 0) {
    const { data: l5Users } = await supabase
      .from('users')
      .select('id')
      .in('sponsor_id', l4Ids);
    l5Ids = (l5Users || []).map((u: any) => u.id);
  }
  const l5Count = l5Ids.length;

  const totalTeam = l1Count + l2Count + l3Count + l4Count + l5Count;
  const l2Unlocked = l1Count >= 2;

  // Get user's signup commission earnings from transactions
  const { data: commissionTxs } = await supabase
    .from('transactions')
    .select('amount, description')
    .eq('user_id', userId)
    .eq('type', 'signup_commission');

  const totalEarned = { L1: 0, L2: 0, L3: 0, L4: 0, L5: 0 };
  for (const tx of commissionTxs || []) {
    const match = tx.description?.match(/^L(\d)/);
    if (match) {
      const level = `L${match[1]}` as keyof typeof totalEarned;
      totalEarned[level] += Number(tx.amount) || 0;
    }
  }

  return NextResponse.json({
    levels: [
      { level: 1, label: 'Direct Referrals', count: l1Count, rate: SIGNUP_COMMISSION_RATES.L1, totalEarned: totalEarned.L1, unlocked: true, color: '#00E5FF' },
      { level: 2, label: 'Level 2', count: l2Count, rate: SIGNUP_COMMISSION_RATES.L2, totalEarned: totalEarned.L2, unlocked: l2Unlocked, color: '#7B61FF' },
      { level: 3, label: 'Level 3', count: l3Count, rate: SIGNUP_COMMISSION_RATES.L3, totalEarned: totalEarned.L3, unlocked: l2Unlocked, color: '#00FFB2' },
      { level: 4, label: 'Level 4', count: l4Count, rate: SIGNUP_COMMISSION_RATES.L4, totalEarned: totalEarned.L4, unlocked: l2Unlocked, color: '#FFB800' },
      { level: 5, label: 'Level 5', count: l5Count, rate: SIGNUP_COMMISSION_RATES.L5, totalEarned: totalEarned.L5, unlocked: l2Unlocked, color: '#FF5C7A' },
    ],
    l1Count,
    totalTeam,
    l2Unlocked,
    directsRequired: 2,
  });
}
