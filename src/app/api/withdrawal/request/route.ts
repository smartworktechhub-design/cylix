import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { deductUserBalance, createWithdrawal } from '@/lib/db';
import { processWithdrawal, MIN_WITHDRAWAL } from '@/lib/withdrawal-engine';

const WITHDRAWALS_OPEN_AT = new Date('2026-07-17T12:00:00+05:30').getTime();

export async function POST(req: Request) {
  try {
    if (Date.now() < WITHDRAWALS_OPEN_AT) {
      return NextResponse.json({ error: 'Withdrawals are not open yet. Please wait for the timer to complete.' }, { status: 403 });
    }

    const { userId, amount, wallet } = await req.json();

    if (!userId || !amount || !wallet) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Minimum withdrawal is $${MIN_WITHDRAWAL}` }, { status: 400 });
    }

    const sb = getServiceSupabase();
    const { data: user } = await sb.from('users').select('total_earned').eq('id', userId).single();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (Number(user.total_earned) < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

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
      status: result.success ? 'processing' : 'held',
      txHash: result.txHash || null,
      message: result.success
        ? 'Withdrawal is being processed'
        : 'Withdrawal queued — will be processed when funds are available',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
