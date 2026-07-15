import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateAdminToken } from '../auth/route';
import { SLOTS, MATRIX_LEVELS } from '@/lib/constants';

function generateReferralCode(): string {
  return 'CXL' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-admin-token');
    if (!token || !validateAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wallet, displayName, sponsorCode, slotId, slotIds, roiEnabled } = await req.json();

    if (!wallet || !sponsorCode) {
      return NextResponse.json({ error: 'Wallet address and referral code are required' }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const selectedSlots: string[] = [];
    if (slotIds && Array.isArray(slotIds)) {
      for (const sid of slotIds) {
        if (SLOTS.find(s => s.id === sid)) selectedSlots.push(sid);
      }
    } else if (slotId && SLOTS.find(s => s.id === slotId)) {
      selectedSlots.push(slotId);
    }

    const sb = getServiceSupabase();

    const { data: existing } = await sb.from('users').select('id').eq('wallet', wallet).maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'Wallet address already registered' }, { status: 409 });
    }

    const { data: sponsor, error: sponsorErr } = await sb
      .from('users').select('id').eq('referral_code', sponsorCode.toUpperCase().trim()).single();
    if (sponsorErr || !sponsor) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    const newCode = generateReferralCode();
    const { data: newUser, error: createErr } = await sb.from('users').insert({
      wallet: wallet.toLowerCase().trim(),
      referral_code: newCode,
      sponsor_id: sponsor.id,
      display_name: displayName?.trim() || '',
      is_active: true,
      roi_enabled: roiEnabled !== false,
    }).select().single();

    if (createErr || !newUser) {
      return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 });
    }

    await addToMatrix(sb, sponsor.id, newUser.id);
    await updateTeamSize(sb, sponsor.id);

    let slotNames: string[] = [];
    let totalInvested = 0;
    for (const sid of selectedSlots) {
      const slot = SLOTS.find(s => s.id === sid)!;

      const { data: slotData, error: slotErr } = await sb.from('user_slots').insert({
        user_id: newUser.id,
        slot_id: slot.id,
        slot_name: slot.name,
        slot_orbit: slot.orbit,
        invested: slot.price,
        earned: 0,
        daily_earned: slot.dailyYield,
        max_cap: slot.maxCap,
        progress: 0,
        status: 'active',
      }).select().single();

      if (!slotErr && slotData) {
        slotNames.push(slot.name);
        totalInvested += slot.price;

        await sb.from('transactions').insert({
          user_id: newUser.id,
          type: 'slot_purchase',
          amount: slot.price,
          description: `Admin registered with ${slot.name} slot`,
        });

        await processMatrixCommission(sb, newUser.id, slot.price);
        await processApexPoolContribution(sb, slot.price);
      }
    }

    if (totalInvested > 0) {
      await sb.from('users').update({ total_invested: totalInvested }).eq('id', newUser.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        wallet: newUser.wallet,
        referralCode: newCode,
        displayName: displayName || '',
        sponsorId: sponsor.id,
        roiEnabled: roiEnabled !== false,
        slotNames: slotNames,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}

async function processMatrixCommission(sb: any, userId: string, amount: number) {
  const { data: user } = await sb.from('users').select('sponsor_id').eq('id', userId).single();
  if (!user?.sponsor_id) return;

  const { data: levels } = await sb.from('matrix_11')
    .select('id, sponsor_id, level')
    .eq('user_id', userId);
  if (!levels) return;

  for (const m of levels) {
    if (!m.sponsor_id) continue;
    const config = MATRIX_LEVELS.find(l => l.level === m.level);
    if (!config) continue;
    if (config.directsRequired > 0) {
      const { data: sponsor } = await sb.from('users').select('directs').eq('id', m.sponsor_id).single();
      if (!sponsor || (sponsor.directs || 0) < config.directsRequired) continue;
    }
    const commission = (amount * config.percent) / 100;
    const walletShare = Math.round((commission * 50) / 100 * 100) / 100;
    const ascensionShare = Math.round((commission - walletShare) * 100) / 100;

    await sb.from('matrix_earnings').insert({
      matrix_id: m.id, earned_from: userId,
      level: m.level, amount: commission,
    });

    const { data: mRow } = await sb.from('matrix_11').select('total_earnings').eq('id', m.id).single();
    await sb.from('matrix_11').update({
      total_earnings: Number((mRow as any)?.total_earnings || 0) + commission,
    }).eq('id', m.id);

    await sb.from('earnings').insert({
      user_id: m.sponsor_id, type: 'matrix', amount: commission,
      source: `Level ${m.level} commission from slot purchase`,
    });

    const { data: purchaser } = await sb.from('users').select('referral_code').eq('id', userId).single();
    await sb.from('transactions').insert({
      user_id: m.sponsor_id, type: 'matrix_earning',
      amount: commission, description: `L${m.level} from ${purchaser?.referral_code || userId.slice(0, 8)}`,
    });

    if (ascensionShare > 0) {
      const { data: sRow } = await sb.from('users').select('ascension_balance').eq('id', m.sponsor_id).single();
      await sb.from('users').update({
        ascension_balance: Math.round(((Number(sRow?.ascension_balance) || 0) + ascensionShare) * 100) / 100,
      }).eq('id', m.sponsor_id);
      await sb.from('transactions').insert({
        user_id: m.sponsor_id, type: 'ascension_credit',
        amount: ascensionShare,
        description: `50% ascension from L${m.level} matrix commission`,
      });
    }
    if (walletShare > 0) {
      const { data: sRow } = await sb.from('users').select('total_earned').eq('id', m.sponsor_id).single();
      await sb.from('users').update({
        total_earned: Math.round(((Number(sRow?.total_earned) || 0) + walletShare) * 100) / 100,
      }).eq('id', m.sponsor_id);
    }
  }
}

async function processApexPoolContribution(sb: any, amount: number) {
  const contribution = Math.round((amount * 10) / 100 * 100) / 100;
  await sb.from('apex_pool_blocks').insert({
    block_number: 0, value: contribution, completed: false, distributed: false,
  });
}

async function addToMatrix(sb: any, sponsorId: string, userId: string) {
  const { data: alreadyPlaced } = await sb
    .from('matrix_tree').select('id')
    .eq('user_id', userId).eq('owner_id', sponsorId).maybeSingle();
  if (alreadyPlaced) return;

  const { data: existingRoot } = await sb
    .from('matrix_tree').select('id')
    .eq('user_id', sponsorId).eq('owner_id', sponsorId).maybeSingle();

  if (!existingRoot) {
    await sb.from('matrix_tree').insert({
      user_id: sponsorId, owner_id: sponsorId, side: null, level: 0, position: 0,
    });
  }

  const { data: allNodes } = await sb
    .from('matrix_tree').select('id, parent_id, side, level')
    .eq('owner_id', sponsorId).order('level').order('position');

  let placed = false;

  if (allNodes && allNodes.length > 0) {
    for (const node of allNodes) {
      if (node.level >= 11) continue;
      const hasLeft = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'left');
      const hasRight = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'right');
      if (!hasLeft) {
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsorId, parent_id: node.id, side: 'left', level: node.level + 1, position: allNodes.length,
        });
        placed = true;
        break;
      }
      if (!hasRight) {
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsorId, parent_id: node.id, side: 'right', level: node.level + 1, position: allNodes.length,
        });
        placed = true;
        break;
      }
    }
    if (!placed) {
      const root = allNodes.find((n: any) => n.level === 0);
      if (root) {
        const hasLeft = allNodes.some((n: any) => n.parent_id === root.id && n.side === 'left');
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsorId, parent_id: root.id,
          side: hasLeft ? 'right' : 'left', level: 1, position: allNodes.length,
        });
      }
    }
  }

  const visited = new Set<string>();
  let walkId: string | null = sponsorId;
  let lvl = 1;
  while (walkId && lvl <= 11 && !visited.has(walkId)) {
    visited.add(walkId);
    await sb.from('matrix_11').insert({
      user_id: userId, sponsor_id: walkId, level: lvl,
    });
    const qResult: { data: { sponsor_id: string | null } | null } = await sb.from('users').select('sponsor_id').eq('id', walkId).single();
    const nextSponsor: string | null = qResult?.data?.sponsor_id || null;
    walkId = nextSponsor;
    lvl++;
  }
}

async function updateTeamSize(sb: any, sponsorId: string) {
  const { count: directs } = await sb.from('users').select('*', { count: 'exact', head: true }).eq('sponsor_id', sponsorId);
  const { count: treeCount } = await sb.from('matrix_tree').select('*', { count: 'exact', head: true }).eq('owner_id', sponsorId);
  await sb.from('users').update({
    directs: directs || 0,
    team_size: Math.max(0, (treeCount || 0) - 1),
  }).eq('id', sponsorId);
}
