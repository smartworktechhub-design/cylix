import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function POST(req: Request) {
  const { userId, sponsorCode } = await req.json();
  if (!userId || !sponsorCode) {
    return NextResponse.json({ error: 'Missing userId or sponsorCode' }, { status: 400 });
  }

  const sb = getServiceSupabase();

  // Find sponsor by referral code
  const { data: sponsor, error: sponsorErr } = await sb
    .from('users').select('id').eq('referral_code', sponsorCode).single();
  if (sponsorErr || !sponsor) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  // Update user's sponsor
  const { error: updateErr } = await sb
    .from('users').update({ sponsor_id: sponsor.id }).eq('id', userId);
  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  // Add to matrix tree
  const { data: existingRoot } = await sb
    .from('matrix_tree').select('id')
    .eq('user_id', sponsor.id).eq('owner_id', sponsor.id).maybeSingle();

  if (!existingRoot) {
    // Create root node for sponsor
    await sb.from('matrix_tree').insert({
      user_id: sponsor.id, owner_id: sponsor.id, side: null, level: 1, position: 0,
    });
  }

  // Place new user in matrix using BFS
  const { data: allNodes } = await sb
    .from('matrix_tree').select('id, parent_id, side, level')
    .eq('owner_id', sponsor.id).order('level').order('position');

  if (allNodes && allNodes.length > 0) {
    let placed = false;
    for (const node of allNodes) {
      if (node.level >= 11) continue;
      const hasLeft = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'left');
      const hasRight = allNodes.some((n: any) => n.parent_id === node.id && n.side === 'right');
      if (!hasLeft) {
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsor.id, parent_id: node.id, side: 'left', level: node.level + 1, position: allNodes.length,
        });
        placed = true;
        break;
      }
      if (!hasRight) {
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsor.id, parent_id: node.id, side: 'right', level: node.level + 1, position: allNodes.length,
        });
        placed = true;
        break;
      }
    }
    if (!placed) {
      // Fallback: place under root at level 2
      const root = allNodes.find((n: any) => n.level === 1);
      if (root) {
        const hasLeft = allNodes.some((n: any) => n.parent_id === root.id && n.side === 'left');
        await sb.from('matrix_tree').insert({
          user_id: userId, owner_id: sponsor.id, parent_id: root.id,
          side: hasLeft ? 'right' : 'left', level: 2, position: allNodes.length,
        });
      }
    }
  }

  // Update sponsor's team size and directs
  const { count: teamCount } = await sb
    .from('matrix_tree').select('id', { count: 'exact', head: true })
    .eq('owner_id', sponsor.id).neq('user_id', sponsor.id);

  const { count: directCount } = await sb
    .from('matrix_tree').select('id', { count: 'exact', head: true })
    .eq('owner_id', sponsor.id).eq('parent_id', (await sb.from('matrix_tree').select('id').eq('user_id', sponsor.id).eq('owner_id', sponsor.id).single()).data?.id);

  await sb.from('users').update({
    team_size: teamCount || 0,
    directs: directCount || 0,
  }).eq('id', sponsor.id);

  // Return updated user
  const { data: user } = await sb.from('users').select('*').eq('id', userId).single();
  return NextResponse.json({ user });
}
