import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { validateAdminToken } from '../auth/route';
import { SLOTS } from '@/lib/constants';

function generateReferralCode(): string {
  return 'CXL' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const token = req.headers.get('x-admin-token');
    if (!token || !validateAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { wallet, displayName, sponsorCode, slotId } = await req.json();

    if (!wallet || !sponsorCode) {
      return NextResponse.json({ error: 'Wallet address and referral code are required' }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    if (slotId && !SLOTS.find(s => s.id === slotId)) {
      return NextResponse.json({ error: 'Invalid slot ID' }, { status: 400 });
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
      roi_enabled: false,
    }).select().single();

    if (createErr || !newUser) {
      return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 });
    }

    await addToMatrix(sb, sponsor.id, newUser.id);
    await updateTeamSize(sb, sponsor.id);

    let slotCreated = null;
    if (slotId) {
      const slot = SLOTS.find(s => s.id === slotId)!;

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
        slotCreated = slot.name;

        await sb.from('transactions').insert({
          user_id: newUser.id,
          type: 'slot_purchase',
          amount: slot.price,
          description: `Admin registered with ${slot.name} slot`,
        });

        await sb.from('users').update({
          total_invested: slot.price,
        }).eq('id', newUser.id);

        await processMatrixCommission(sb, newUser.id, slot.price);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        wallet: newUser.wallet,
        referralCode: newCode,
        displayName: displayName || '',
        sponsorId: sponsor.id,
        roiEnabled: false,
        slotName: slotCreated,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Something went wrong' }, { status: 500 });
  }
}

async function processMatrixCommission(sb: any, userId: string, amount: number) {
  const MATRIX_LEVELS = [
    { level: 1, percent: 4.0 },
    { level: 2, percent: 4.0 },
    { level: 3, percent: 5.0 },
    { level: 4, percent: 5.0 },
    { level: 5, percent: 5.0 },
    { level: 6, percent: 5.0 },
    { level: 7, percent: 5.0 },
    { level: 8, percent: 5.0 },
    { level: 9, percent: 5.0 },
    { level: 10, percent: 5.0 },
    { level: 11, percent: 5.0 },
  ];

  const { data: user } = await sb.from('users').select('sponsor_id').eq('id', userId).single();
  if (!user?.sponsor_id) return;

  let walkId: string | null = user.sponsor_id;
  const visited = new Set<string>();

  for (const lvl of MATRIX_LEVELS) {
    if (!walkId || visited.has(walkId)) break;
    visited.add(walkId);

    const commission = Math.round(amount * lvl.percent) / 100;
    if (commission > 0) {
      const { data: sponsorUser } = await sb.from('users').select('id').eq('id', walkId).single();
      if (sponsorUser) {
        const { data: existingEntry } = await sb.from('earnings')
          .select('id').eq('user_id', walkId).eq('type', 'matrix').eq('source', `L${lvl.level} from slot purchase`).maybeSingle();

        if (!existingEntry) {
          await sb.from('earnings').insert({
            user_id: walkId,
            type: 'matrix',
            amount: commission,
            source: `L${lvl.level} from slot purchase`,
          });

          await sb.from('transactions').insert({
            user_id: walkId,
            type: 'matrix_commission',
            amount: commission,
            description: `L${lvl.level} matrix commission from downline`,
          });

          const walletShare = Math.round(commission * 50) / 100;
          const ascensionShare = Math.round((commission - walletShare) * 100) / 100;

          const { data: sponsorRow } = await sb.from('users').select('total_earned, ascension_balance').eq('id', walkId).single();
          if (sponsorRow) {
            await sb.from('users').update({
              total_earned: Math.round(((Number(sponsorRow.total_earned) || 0) + walletShare) * 100) / 100,
              ascension_balance: Math.round(((Number(sponsorRow.ascension_balance) || 0) + ascensionShare) * 100) / 100,
            }).eq('id', walkId);
          }
        }
      }
    }

    const { data: nextUser } = await sb.from('users').select('sponsor_id').eq('id', walkId).single();
    walkId = nextUser?.sponsor_id || null;
  }
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
