import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { deductUserBalance, createWithdrawal } from '@/lib/db';
import { processWithdrawal, MIN_WITHDRAWAL } from '@/lib/withdrawal-engine';

const RATE_LIMIT_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const { userId, amount } = await req.json();

    if (!userId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, { status: 400 });
    }

    const sb = getServiceSupabase();

    const { data: user } = await sb
      .from('users')
      .select('id, total_earned, wallet')
      .eq('id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (!user.wallet) {
      return NextResponse.json({ error: 'No wallet registered' }, { status: 400 });
    }
    if (Number(user.total_earned) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const { data: recentWd } = await sb
      .from('withdrawals')
      .select('id, created_at')
      .eq('user_id', userId)
      .in('status', ['pending', 'processing', 'held', 'completed'])
      .gte('created_at', new Date(Date.now() - RATE_LIMIT_MS).toISOString())
      .limit(1);

    if (recentWd && recentWd.length > 0) {
      return NextResponse.json({ error: 'Please wait 10 minutes between withdrawals' }, { status: 429 });
    }

    const wallet = user.wallet;

    const deducted = await deductUserBalance(userId, amount);
    if (!deducted) {
      return NextResponse.json({ error: 'Balance deduction failed' }, { status: 500 });
    }

    const withdrawalId = await createWithdrawal(userId, amount, wallet);
    if (!withdrawalId) {
      await deductUserBalance(userId, -amount);
      return NextResponse.json({ error: 'Failed to create withdrawal' }, { status: 500 });
    }

    const result = await processWithdrawal(withdrawalId);

    return NextResponse.json({
      success: true,
      withdrawalId,
      status: result.success ? 'completed' : 'held',
      txHash: result.txHash || null,
      message: result.success
        ? 'Withdrawal sent successfully!'
        : 'Withdrawal queued — will be processed when funds are available',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
