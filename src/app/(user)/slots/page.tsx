'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { purchaseSlot } from '@/lib/db';
import { SLOTS, SLOT_CONFIG, TREASURY_WALLET, USDT_ADDRESS, USDT_DECIMALS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { parseUnits } from 'viem';
import { useUsdtBalance, USDT_ABI } from '@/lib/usdt';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2, Orbit, TrendingUp, Shield, Sparkles,
  Copy, CheckCheck, ExternalLink, Coins, Wallet, CheckCircle2, XCircle, Clock,
  Lock, LockKeyhole,
} from 'lucide-react';
import Link from 'next/link';

const SLOT_ICONS: Record<string, React.ReactNode> = {
  spark: <Sparkles size={20} />, vortex: <Orbit size={20} />, comet: <Sparkles size={20} />,
  nova: <Sparkles size={20} />, cyber: <Sparkles size={20} />, pulse: <Orbit size={20} />,
  master: <Sparkles size={20} />, alpha: <Sparkles size={20} />, titan: <Sparkles size={20} />,
  whale: <Sparkles size={20} />, infinity: <Sparkles size={20} />,
};

export default function SlotsPage() {
  const { user, slots } = useAppStore();
  const { loading } = useInitData();
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { balance: usdtBalance, refetch: refetchBalance } = useUsdtBalance(address);
  const { writeContract, isPending: isTxPending, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isTxConfirmed, isError: isTxError } = useWaitForTransactionReceipt({ hash: txHash });
  const [pendingSlot, setPendingSlot] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'approve' | 'confirm' | 'success' | 'error'>('idle');
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [depositCopied, setDepositCopied] = useState(false);

  const activeSlotIds = new Set(slots.filter((s) => s.status === 'active').map((s) => s.slotId));
  const ownedSlotIds = new Set(slots.map((s) => s.slotId));
  const maxOwnedIndex = Math.max(...[...ownedSlotIds].map(id => SLOTS.findIndex(s => s.id === id)), -1);

  // When tx confirmed, activate slot in DB
  useEffect(() => {
    if (isTxConfirmed && pendingSlot) {
      if (user) {
        purchaseSlot(user.id, pendingSlot).then((result) => {
          if (result) {
            setPurchaseStatus('success');
            refetchBalance();
          } else {
            setPurchaseStatus('error');
          }
          setPendingSlot(null);
        });
      } else {
        setPurchaseStatus('success');
        setPendingSlot(null);
        refetchBalance();
      }
    }
  }, [isTxConfirmed, pendingSlot, user, refetchBalance]);

  // Show confirming state when tx submitted
  useEffect(() => {
    if (txHash && pendingSlot) {
      setPurchaseStatus('confirm');
    }
  }, [txHash, pendingSlot]);

  // Reset on error
  useEffect(() => {
    if (isTxError) {
      setPurchaseStatus('error');
      setPendingSlot(null);
    }
  }, [isTxError]);

  const handlePurchase = async (slotDef: typeof SLOTS[0]) => {
    if (!address) return;
    setPendingSlot(slotDef.id);
    setPurchaseStatus('approve');
    setPurchaseError('');
    try {
      await switchChainAsync({ chainId: bsc.id });
      const value = parseUnits(slotDef.price.toString(), USDT_DECIMALS);
      await writeContract({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'transfer',
        args: [TREASURY_WALLET, value],
      });
    } catch (err: any) {
      setPurchaseError(err?.message || err?.shortMessage || 'Transaction rejected');
      setPurchaseStatus('error');
      setPendingSlot(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const isSlotLocked = (index: number) => {
    if (index === 0) return false;
    if (maxOwnedIndex >= index) return false;
    return !ownedSlotIds.has(SLOTS[index - 1].id);
  };

  const statusModal = () => {
    if (purchaseStatus === 'idle') return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="rounded-2xl p-6 w-80 border border-[rgba(0,229,255,0.12)]" style={{ background: 'rgba(11,16,32,0.95)' }}>
          <div className="text-center">
            {purchaseStatus === 'approve' && (
              <><Clock size={40} className="text-[#FFB800] mx-auto mb-3 animate-pulse" /><p className="text-white font-semibold">Approve in Wallet</p><p className="text-xs text-[#94A3B8] mt-1">Confirm the transaction in your wallet</p></>
            )}
            {purchaseStatus === 'confirm' && (
              <><Loader2 size={40} className="text-[#00E5FF] mx-auto mb-3 animate-spin" /><p className="text-white font-semibold">Confirming Transaction</p><p className="text-xs text-[#94A3B8] mt-1">Waiting for blockchain confirmation...</p><a href={`https://bscscan.com/tx/${txHash}`} target="_blank" className="text-[10px] text-[#00E5FF] mt-2 inline-block hover:underline">View on BSCScan</a></>
            )}
            {purchaseStatus === 'success' && (
              <><CheckCircle2 size={40} className="text-[#00FFB2] mx-auto mb-3" /><p className="text-white font-semibold">Slot Activated!</p><p className="text-xs text-[#94A3B8] mt-1">Your slot is now live and earning.</p></>
            )}
            {purchaseStatus === 'error' && (
              <><XCircle size={40} className="text-[#FF5C7A] mx-auto mb-3" /><p className="text-white font-semibold">Transaction Failed</p><p className="text-xs text-[#94A3B8] mt-1">{purchaseError || 'Please try again or check BSCScan.'}</p></>
            )}
            {(purchaseStatus === 'success' || purchaseStatus === 'error') && (
              <button onClick={() => setPurchaseStatus('idle')} className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] text-sm font-semibold">Close</button>
            )}
            {purchaseStatus === 'confirm' && (
              <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" className="mt-4 w-full block py-2 rounded-xl border border-[rgba(0,229,255,0.15)] text-[#00E5FF] text-sm font-semibold text-center">View on BSCScan</a>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {statusModal()}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Orbit Slots</h2>
          <p className="text-sm text-[#94A3B8] mt-1">Purchase slots with USDT on BSC</p>
        </div>
        {address && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.08)]">
            <Coins size={14} className="text-[#00E5FF]" />
            <span className="text-xs text-[#4A5568]">USDT:</span>
            <span className="text-sm font-mono font-semibold text-white">{usdtBalance.toFixed(2)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {SLOTS.map((slot, index) => {
          const isOwned = activeSlotIds.has(slot.id);
          const locked = isSlotLocked(index);
          const dailyYield = slot.price * (SLOT_CONFIG.dailyYieldPercent / 100);
          const maxCap = slot.price * SLOT_CONFIG.maxCapMultiplier;
          const isBuying = pendingSlot === slot.id && (purchaseStatus === 'approve' || purchaseStatus === 'confirm');

          const isCleared = !isOwned && !locked && maxOwnedIndex >= index;

          if (isCleared) {
            return (
              <Card key={slot.id} className="relative flex flex-col opacity-60">
                <CardContent className="p-5 flex flex-col flex-1 items-center text-center">
                  <div className="absolute top-2 right-2">
                    <Badge variant="success" className="px-2 py-0.5 text-[10px]">Cleared</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 font-heading">{slot.name}</h3>
                  <p className="text-2xl font-bold font-mono text-[#00FFB2] mb-2">{formatCurrency(slot.price)}</p>
                  <p className="text-[10px] text-[#4A5568]">Already progressed past this slot</p>
                </CardContent>
              </Card>
            );
          }

          if (locked) {
            return (
              <Card key={slot.id} className="relative flex flex-col opacity-40">
                <CardContent className="p-5 flex flex-col flex-1 items-center text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(148,163,184,0.08)' }}>
                    <LockKeyhole size={22} className="text-[#4A5568]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#4A5568] mb-1 font-heading">{slot.name}</h3>
                  <p className="text-2xl font-bold font-mono text-[#4A5568] mb-2">{formatCurrency(slot.price)}</p>
                  <p className="text-[10px] text-[#4A5568]">Buy {SLOTS[index - 1].name} first to unlock</p>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card key={slot.id} hover className={`relative flex flex-col ${isOwned ? 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]' : ''}`}>
              {isOwned && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="info" className="px-3 py-0.5 text-xs">Active</Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${slot.color}15` }}>
                    <div style={{ color: slot.color }}>{SLOT_ICONS[slot.icon] || <Sparkles size={20} />}</div>
                  </div>
                  <Badge variant="default" className="text-xs">Orbit #{slot.orbit}</Badge>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 font-heading">{slot.name}</h3>
                <p className="text-2xl font-bold font-mono text-white mb-4">{formatCurrency(slot.price)}</p>
                <div className="space-y-2.5 mb-5 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5"><TrendingUp size={14} /> Daily Yield (3%)</span>
                    <span className="font-mono font-medium text-[#00FFB2]">{formatCurrency(dailyYield)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5"><Shield size={14} /> Max Cap (200%)</span>
                    <span className="font-mono font-medium text-white">{formatCurrency(maxCap)}</span>
                  </div>
                </div>
                {!address ? (
                  <Link href="/" className="w-full">
                    <Button variant="primary" className="w-full"><Wallet size={14} /> Connect Wallet</Button>
                  </Link>
                ) : isOwned ? (
                  <Button variant="outline" className="w-full" disabled>Active Slot</Button>
                ) : (
                  <div className="space-y-2">
                    <Button variant="primary" className="w-full" onClick={() => handlePurchase(slot)} loading={isBuying} disabled={isBuying || !address}>
                      {isBuying ? (purchaseStatus === 'approve' ? 'Approve...' : 'Confirming...') : <><Coins size={14} /> Buy with USDT</>}
                    </Button>
                    <p className="text-[9px] text-[#4A5568] text-center">Send to: {TREASURY_WALLET.slice(0, 6)}...{TREASURY_WALLET.slice(-4)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Deposit Address */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.08)] flex items-center justify-center shrink-0">
              <Wallet size={18} className="text-[#00E5FF]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">Deposit Address (BSC)</h4>
              <p className="text-xs text-[#94A3B8] mb-2">Send USDT (BEP-20) to activate slots automatically.</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                <code className="flex-1 text-xs font-mono text-[#00E5FF] truncate">{TREASURY_WALLET}</code>
                <button onClick={() => { navigator.clipboard.writeText(TREASURY_WALLET); setDepositCopied(true); setTimeout(() => setDepositCopied(false), 2000); }}
                  className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.08)] hover:bg-[rgba(0,229,255,0.12)] flex items-center justify-center shrink-0">
                  {depositCopied ? <CheckCheck size={14} className="text-[#00FFB2]" /> : <Copy size={14} className="text-[#00E5FF]" />}
                </button>
                <a href={`https://bscscan.com/address/${TREASURY_WALLET}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[rgba(123,97,255,0.08)] hover:bg-[rgba(123,97,255,0.12)] flex items-center justify-center shrink-0">
                  <ExternalLink size={14} className="text-[#7B61FF]" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
