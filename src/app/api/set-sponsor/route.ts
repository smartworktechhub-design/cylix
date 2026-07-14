import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

function generateReferralCode(): string {
  return 'CXL' + Math.random().toString(36).substring(2, 7).toUpperCase();
}

export async function POST(req: Request) {
  const { wallet, userId, sponsorCode } = await req.json();
  if (!sponsorCode) {
    return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
  }

  const sb = getServiceSupabase();

  // Find sponsor by referral code
  const { data: sponsor, error: sponsorErr } = await sb
    .from('users').select('id').eq('referral_code', sponsorCode.toUpperCase()).single();
  if (sponsorErr || !sponsor) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  let targetUserId = userId;

  // If no userId, create user first (wallet connected but no account yet)
  if (!userId && wallet) {
    const { data: existing } = await sb.from('users').select('id').eq('wallet', wallet).maybeSingle();
    if (existing) {
      targetUserId = existing.id;
    } else {
      const newCode = generateReferralCode();
      const { data: newUser, error: createErr } = await sb.from('users').insert({
        wallet,
        referral_code: newCode,
        sponsor_id: sponsor.id,
        is_active: true,
      }).select().single();
      if (createErr || !newUser) {
        return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
      }
      targetUserId = newUser.id;

      // Add to matrix
      await addToMatrix(sb, sponsor.id, targetUserId);
      await updateTeamSize(sb, sponsor.id);

      const { data: user } = await sb.from('users').select('*').eq('id', targetUserId).single();
      return NextResponse.json({ user });
    }
  }

  if (!targetUserId) {
    return NextResponse.json({ error: 'Missing user info' }, { status: 400 });
  }

  // Update user's sponsor
  const { error: updateErr } = await sb
    .from('users').update({ sponsor_id: sponsor.id }).eq('id', targetUserId);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Add to matrix
  await addToMatrix(sb, sponsor.id, targetUserId);
  await updateTeamSize(sb, sponsor.id);

  const { data: user } = await sb.from('users').select('*').eq('id', targetUserId).single();
  return NextResponse.json({ user });
}

async function addToMatrix(sb: any, sponsorId: string, userId: string) {
  // Check if sponsor has a root node
  const { data: existingRoot } = await sb
    .from('matrix_tree').select('id')
    .eq('user_id', sponsorId).eq('owner_id', sponsorId).maybeSingle();

  if (!existingRoot) {
    await sb.from('matrix_tree').insert({
      user_id: sponsorId, owner_id: sponsorId, side: null, level: 1, position: 0,
    });
  }

  // BFS to find first empty position
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
      const root = allNodes.find((n: any) => n.level === 1);
      if (root) {
        const hasLeft = allNodes.some((n: any) => n.parent_id === root.id && n.side === 'left');
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsorId, parent_id: root.id,
          side: hasLeft ? 'right' : 'left', level: 2, position: allNodes.length,
        });
      }
    }
  }

  // Populate matrix_11 for commission tracking
  const visited = new Set<string>();
  let curSponsorId: string | null = sponsorId;
  let lvl = 1;
  while (curSponsorId && lvl <= 11 && !visited.has(curSponsorId)) {
    visited.add(curSponsorId);
    await sb.from('matrix_11').insert({
      user_id: userId, sponsor_id: curSponsorId, level: lvl,
    });
    const { data: uplineRow } = await sb.from('users').select('sponsor_id').eq('id', curSponsorId).single() as { data: { sponsor_id: string | null } | null };
    curSponsorId = uplineRow?.sponsor_id || null;
    lvl++;
  }
}

async function updateTeamSize(sb: any, sponsorId: string) {
  const { data: root } = await sb
    .from('matrix_tree').select('id')
    .eq('user_id', sponsorId).eq('owner_id', sponsorId).maybeSingle();

  const { count: teamCount } = await sb
    .from('matrix_tree').select('id', { count: 'exact', head: true })
    .eq('owner_id', sponsorId).neq('user_id', sponsorId);

  const { count: directCount } = root
    ? await sb.from('matrix_tree').select('id', { count: 'exact', head: true })
        .eq('owner_id', sponsorId).eq('parent_id', root.id)
    : { count: 0 };

  await sb.from('users').update({
    team_size: teamCount || 0,
    directs: directCount || 0,
  }).eq('id', sponsorId);
}
