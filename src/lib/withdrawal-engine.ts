import { getSupabase, getServiceSupabase } from './supabase';
import { getHotWalletBalance, sendUSDT, isPayoutConfigured } from './payout';

const MIN_WITHDRAWAL = 1;
const MAX_RETRY = 5;

function sb() { return getSupabase(); }
function sbAdmin() { return getServiceSupabase(); }

export async function processWithdrawal(withdrawalId: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  if (!isPayoutConfigured()) {
    return { success: false, error: 'Payout wallet not configured' };
  }

  const { data: wd, error: fetchErr } = await sbAdmin()
    .from('withdrawals')
    .select('id, user_id, amount, wallet, status, retry_count')
    .eq('id', withdrawalId)
    .single();

  if (fetchErr || !wd) return { success: false, error: 'Withdrawal not found' };
  if (wd.status === 'completed' || wd.status === 'approved') {
    return { success: false, error: 'Already processed' };
  }

  const amount = Number(wd.amount);

  try {
    const walletBalance = await getHotWalletBalance();
    if (walletBalance < amount) {
      await sbAdmin().from('withdrawals').update({
        status: 'held',
        held_since: new Date().toISOString(),
        retry_count: (wd.retry_count || 0),
        error_message: `Insufficient wallet balance: $${walletBalance.toFixed(2)} available, $${amount} needed`,
      }).eq('id', withdrawalId);

      await sbAdmin().from('notifications').insert({
        user_id: wd.user_id, type: 'withdrawal', title: 'Withdrawal On Hold',
        message: `Your $${amount} withdrawal is queued. It will be processed automatically once funds are available.`,
      });

      return { success: false, error: 'Insufficient wallet balance, queued for later' };
    }

    const txHash = await sendUSDT(wd.wallet, amount);

    await sbAdmin().from('withdrawals').update({
      status: 'processing',
      tx_hash: txHash,
      processed_at: new Date().toISOString(),
      held_since: null,
      error_message: null,
    }).eq('id', withdrawalId);

    await sbAdmin().from('notifications').insert({
      user_id: wd.user_id, type: 'withdrawal', title: 'Withdrawal Processing',
      message: `Your $${amount} withdrawal is being processed. TX: ${txHash.slice(0, 10)}...`,
    });

    return { success: true, txHash };
  } catch (err: any) {
    const retryCount = (wd.retry_count || 0) + 1;
    const newStatus = retryCount >= MAX_RETRY ? 'failed' : 'held';

    await sbAdmin().from('withdrawals').update({
      status: newStatus,
      retry_count: retryCount,
      held_since: newStatus === 'held' ? new Date().toISOString() : null,
      error_message: err?.message || 'Unknown error',
    }).eq('id', withdrawalId);

    return { success: false, error: err?.message || 'Transfer failed' };
  }
}

export async function processHeldWithdrawals(): Promise<{ processed: number; failed: number }> {
  const { data: held } = await sbAdmin()
    .from('withdrawals')
    .select('id')
    .in('status', ['held', 'pending', 'processing'])
    .lt('retry_count', MAX_RETRY)
    .order('created_at', { ascending: true });

  if (!held || held.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const wd of held) {
    const result = await processWithdrawal(wd.id);
    if (result.success) processed++;
    else failed++;
  }

  return { processed, failed };
}

export async function getWithdrawalStats(): Promise<{
  walletBalance: number;
  totalHeld: number;
  heldCount: number;
  pendingCount: number;
  isConfigured: boolean;
}> {
  if (!isPayoutConfigured()) {
    return { walletBalance: 0, totalHeld: 0, heldCount: 0, pendingCount: 0, isConfigured: false };
  }

  let walletBalance = 0;
  try {
    walletBalance = await getHotWalletBalance();
  } catch { /* ignore */ }

  const { data: held } = await sbAdmin()
    .from('withdrawals')
    .select('amount')
    .eq('status', 'held');

  const { data: pending } = await sbAdmin()
    .from('withdrawals')
    .select('amount')
    .eq('status', 'pending');

  const totalHeld = (held || []).reduce((s: number, w: any) => s + Number(w.amount), 0);
  const totalPending = (pending || []).reduce((s: number, w: any) => s + Number(w.amount), 0);

  return {
    walletBalance,
    totalHeld,
    heldCount: held?.length || 0,
    pendingCount: pending?.length || 0,
    isConfigured: true,
  };
}

export { MIN_WITHDRAWAL };
