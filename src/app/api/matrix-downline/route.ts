import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const sb = getServiceSupabase();

    const [{ data: m11Data }, { data: treeData }, { data: globalSlots }] = await Promise.all([
      sb.from('matrix_11')
        .select('id, user_id, level, total_earnings, users!matrix_11_user_id_fkey(wallet)')
        .eq('sponsor_id', userId)
        .order('level'),
      sb.from('matrix_tree')
        .select('user_id')
        .eq('owner_id', userId),
      sb.from('user_slots')
        .select('user_id', { count: 'exact' })
        .eq('status', 'active'),
    ]);

    const treeUserIds = new Set((treeData || []).map((n: any) => n.user_id));

    const downline = (m11Data || []).map((m: any) => ({
      id: m.id, userId: m.user_id, wallet: m.users?.wallet || '',
      level: m.level, totalEarnings: Number(m.total_earnings || 0),
      inTree: treeUserIds.has(m.user_id),
    }));

    const crosslineCount = downline.filter(d => !d.inTree).length;

    const globalUserIds = new Set((globalSlots || []).map((s: any) => s.user_id));

    return NextResponse.json({
      downline,
      crosslineCount,
      globalCount: globalUserIds.size,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
