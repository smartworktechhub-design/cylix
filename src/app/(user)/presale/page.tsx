'use client';

import { useState, useEffect, useRef } from 'react';
import { Coins, ShoppingCart, Loader2, TrendingUp, Clock, ChevronRight, Zap, AlertCircle, DollarSign, Rocket, Timer, Lock, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';
import { useAppStore } from '@/stores/app-store';
import { TREASURY_WALLET, USDT_ADDRESS, USDT_DECIMALS } from '@/lib/constants';
import { useAccount, useSwitchChain } from 'wagmi';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { parseUnits } from 'viem';
import { USDT_ABI } from '@/lib/usdt';

const formatCxl = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const formatPrice = (n: number) => '$' + n.toFixed(4);

function useCountdownToMidnightUTC() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const midnight = new Date(utcMs);
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - utcMs;
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      return {
        hours: Math.floor(diff / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

interface PresaleData {
  stats: {
    totalSupply: number;
    sold: number;
    remaining: number;
    day: number;
    price: number;
    phase: number;
    totalUsers: number;
    isActive: boolean;
    presaleSupplyLimit: number;
    presaleRemaining: number;
  };
  balance: {
    cxl_balance: number;
    cxl_earned_total: number;
    cxl_liquid: number;
    cxl_staked: number;
    signup_bonus_claimed: boolean;
    total_claim_days: number;
  } | null;
  presalePrices: number[];
  dexLaunchPrice: number;
}

export default function PresalePage() {
  const isDev = useIsDev();
  const { user } = useAppStore();
  const userId = user?.id || null;
  const { address } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { writeContract, isPending: isTxPending, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isTxConfirmed, isError: isTxError } = useWaitForTransactionReceipt({ hash: txHash });
  const [data, setData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [vestingData, setVestingData] = useState<any>(null);
  const [claimingVesting, setClaimingVesting] = useState<string | null>(null);
  const [claimAction, setClaimAction] = useState<'liquid' | 'compound'>('liquid');
  const [showClaimModal, setShowClaimModal] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'approve' | 'confirm' | 'success' | 'error'>('idle');
  const [purchaseError, setPurchaseError] = useState('');
  const [pendingAmount, setPendingAmount] = useState<number | 0>(0);

  const countdown = useCountdownToMidnightUTC();

  const fetchData = () => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));

    if (userId) {
      fetch(`/api/presale/vesting?userId=${userId}`)
        .then(r => r.json())
        .then(d => setVestingData(d))
        .catch(() => {});
    }
  };

  useEffect(() => { fetchData(); }, [userId]);

  // When tx confirmed, record purchase in DB
  useEffect(() => {
    if (isTxConfirmed && pendingAmount && userId) {
      fetch('/api/presale/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, usdtAmount: pendingAmount, txHash }),
      })
        .then(r => r.json())
        .then(json => {
          if (json.error) {
            setPurchaseStatus('error');
            setPurchaseError(json.error);
          } else {
            setPurchaseStatus('success');
            setMessage(`Bought ${json.cxlAmount.toFixed(2)} CXL for $${json.totalUSDT.toFixed(4)}!`);
            fetchData();
          }
          setPendingAmount(0);
        })
        .catch(() => {
          setPurchaseStatus('error');
          setPurchaseError('Failed to record purchase');
          setPendingAmount(0);
        });
    }
  }, [isTxConfirmed, pendingAmount, userId, txHash]);

  useEffect(() => {
    if (isTxError) {
      setPurchaseStatus('error');
      setPurchaseError('Transaction failed on blockchain');
      setPendingAmount(0);
    }
  }, [isTxError]);

  useEffect(() => {
    if (txHash && pendingAmount) {
      setPurchaseStatus('confirm');
    }
  }, [txHash, pendingAmount]);

  const handleClaimVesting = async (vestingId: string) => {
    setClaimingVesting(vestingId);
    try {
      const res = await fetch('/api/presale/vesting/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, vestingId, action: claimAction }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(`Claimed ${json.claimed.toFixed(2)} CXL to ${claimAction === 'liquid' ? 'liquid wallet' : 'staking vault'}!`);
        setShowClaimModal(null);
        fetchData();
      } else {
        setMessage(json.error || 'Claim failed');
      }
    } catch {
      setMessage('Network error');
    }
    setClaimingVesting(null);
  };

  const handleBuy = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 1 || amt > 100) return;
    if (!address) {
      setMessage('Please connect your wallet first');
      return;
    }
    setPurchaseStatus('approve');
    setPurchaseError('');
    setPendingAmount(amt);
    try {
      await switchChainAsync({ chainId: bsc.id });
      const value = parseUnits(amt.toFixed(2), USDT_DECIMALS);
      await writeContract({
        address: USDT_ADDRESS,
        abi: USDT_ABI,
        functionName: 'transfer',
        args: [TREASURY_WALLET, value],
      });
    } catch (err: any) {
      setPurchaseStatus('error');
      setPurchaseError(err?.message || err?.shortMessage || 'Transaction rejected');
      setPendingAmount(0);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#FFB800]" />
      </div>
    );
  }

  const stats = data?.stats;
  const balance = data?.balance;
  const prices = data?.presalePrices || [];
  const dexPrice = data?.dexLaunchPrice || 0.15;

  if (!stats || prices.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-[rgba(255,184,0,0.08)] p-6 text-center" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <Coins size={32} className="text-[#FFB800] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL PRESALE</h2>
          <p className="text-sm text-[#7B8BA5]">Loading presale data...</p>
        </div>
      </div>
    );
  }

  const dayProgress = stats.day > 0 ? Math.min((stats.day / 90) * 100, 100) : 0;
  const presaleLimit = (stats as any).presaleSupplyLimit || 110000;
  const presaleRemaining = (stats as any).presaleRemaining || presaleLimit - stats.sold;
  const presaleSoldPercent = presaleLimit > 0 ? (stats.sold / presaleLimit) * 100 : 0;
  const totalCost = amount && parseFloat(amount) >= 1 ? parseFloat(amount) : 0;
  const cxlYouGet = totalCost > 0 ? Math.floor((totalCost / stats.price) * 100) / 100 : 0;

  const displayDay = selectedDay || hoveredDay || stats.day;
  const displayPrice = prices[displayDay - 1] || prices[0];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Purchase Status Modal */}
      {purchaseStatus !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-80 border border-[rgba(0,229,255,0.12)]" style={{ background: 'rgba(11,16,32,0.95)' }}>
            <div className="text-center">
              {purchaseStatus === 'approve' && (
                <>
                  <Clock size={40} className="text-[#FFB800] mx-auto mb-3 animate-pulse" />
                  <p className="text-white font-semibold">Approve in Wallet</p>
                  <p className="text-xs text-[#A8B8D0] mt-1">Confirm the USDT transfer in your wallet</p>
                </>
              )}
              {purchaseStatus === 'confirm' && (
                <>
                  <Loader2 size={40} className="text-[#00E5FF] mx-auto mb-3 animate-spin" />
                  <p className="text-white font-semibold">Confirming Transaction</p>
                  <p className="text-xs text-[#A8B8D0] mt-1">Waiting for blockchain confirmation...</p>
                  {txHash && (
                    <a href={`https://bscscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00E5FF] mt-2 inline-block hover:underline">
                      View on BSCScan
                    </a>
                  )}
                </>
              )}
              {purchaseStatus === 'success' && (
                <>
                  <CheckCircle2 size={40} className="text-[#00FFB2] mx-auto mb-3" />
                  <p className="text-white font-semibold">CXL Purchased!</p>
                  <p className="text-xs text-[#A8B8D0] mt-1">{message}</p>
                </>
              )}
              {purchaseStatus === 'error' && (
                <>
                  <XCircle size={40} className="text-[#FF5C7A] mx-auto mb-3" />
                  <p className="text-white font-semibold">Transaction Failed</p>
                  <p className="text-xs text-[#A8B8D0] mt-1">{purchaseError || 'Please try again.'}</p>
                </>
              )}
              <button
                onClick={() => { setPurchaseStatus('idle'); setPurchaseError(''); setMessage(''); }}
                className="mt-4 w-full h-10 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] hover:opacity-90"
              >
                {purchaseStatus === 'success' || purchaseStatus === 'error' ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="rounded-2xl overflow-hidden border border-[rgba(255,184,0,0.12)]" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(30,20,10,0.97))' }}>
        <div className="p-5 pb-4" style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.08), rgba(255,92,122,0.08))' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center shadow-lg shadow-[rgba(255,184,0,0.2)]">
                <ShoppingCart size={20} className="text-[#050816]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL PRESALE</h1>
                <p className="text-xs text-[#7B8BA5]">Micro-increment pricing, 90 days</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${stats.isActive ? 'bg-[rgba(0,255,178,0.12)] text-[#00FFB2] border border-[rgba(0,255,178,0.2)]' : 'bg-[rgba(255,92,122,0.12)] text-[#FF5C7A] border border-[rgba(255,92,122,0.2)]'}`}>
              {stats.isActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>

          {/* Day Progress */}
          {stats.day > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7B8BA5]">Day {stats.day}/90</span>
                <span className="text-xs text-[#FFB800] font-bold">{dayProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(255,184,0,0.1)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dayProgress}%`, background: 'linear-gradient(90deg, #FFB800, #FF5C7A)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-[1px] bg-[rgba(255,184,0,0.04)]">
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Supply</p>
            <p className="text-sm font-bold font-mono text-white">{formatCxl(stats.remaining)}</p>
            <p className="text-[10px] text-[#7B8BA5]">remaining</p>
          </div>
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Sold</p>
            <p className="text-sm font-bold font-mono text-[#FFB800]">{formatCxl(stats.sold)}</p>
            <p className="text-[10px] text-[#7B8BA5]">CXL</p>
          </div>
        </div>

        {/* Presale Supply */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#7B8BA5]">Presale: {formatCxl(stats.sold)} / {formatCxl(presaleLimit)} CXL (10% of supply)</span>
            <span className="text-[10px] text-[#FFB800] font-bold">{presaleSoldPercent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,184,0,0.1)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF5C7A]" style={{ width: `${presaleSoldPercent}%` }} />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-[#00FFB2] font-semibold">{formatCxl(presaleRemaining)} CXL remaining</span>
            <span className="text-[10px] text-[#7B8BA5]">Total supply: {formatCxl(stats.totalSupply)} CXL</span>
          </div>
        </div>
      </div>

      {/* Today's Price + Countdown Timer */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Price */}
        <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <div className="p-4" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={14} className="text-[#FFB800]" />
              <h3 className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Today's Price</h3>
            </div>
            <p className="text-2xl font-bold font-mono text-[#FFB800]">{formatPrice(stats.price)}</p>
            <p className="text-[10px] text-[#7B8BA5] mt-1">Day {stats.day} of 90</p>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="rounded-2xl border border-[rgba(0,229,255,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <div className="p-4" style={{ background: 'rgba(0,229,255,0.04)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Timer size={14} className="text-[#00E5FF]" />
              <h3 className="text-[10px] font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Next Price In</h3>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-[#00E5FF]">{String(countdown.hours).padStart(2, '0')}</p>
                <p className="text-[8px] text-[#7B8BA5]">HRS</p>
              </div>
              <span className="text-lg font-bold text-[#00E5FF] mt-[-12px]">:</span>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-[#00E5FF]">{String(countdown.minutes).padStart(2, '0')}</p>
                <p className="text-[8px] text-[#7B8BA5]">MIN</p>
              </div>
              <span className="text-lg font-bold text-[#00E5FF] mt-[-12px]">:</span>
              <div className="text-center">
                <p className="text-2xl font-bold font-mono text-[#00E5FF]">{String(countdown.seconds).padStart(2, '0')}</p>
                <p className="text-[8px] text-[#7B8BA5]">SEC</p>
              </div>
            </div>
            <p className="text-[10px] text-[#7B8BA5] mt-1">Changes at 12:00 AM UTC</p>
          </div>
        </div>
      </div>

      {/* Your Vesting Schedule */}
      {vestingData && vestingData.schedules && vestingData.schedules.length > 0 && (
        <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <div className="p-4 pb-3" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-[#FFB800]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Your Vesting Schedule</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(123,97,255,0.06)' }}>
                <p className="text-[10px] text-[#7B8BA5]">Staked</p>
                <p className="text-sm font-bold font-mono text-[#7B61FF]">{formatCxl(vestingData.totalStaked)}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.06)' }}>
                <p className="text-[10px] text-[#7B8BA5]">Locked</p>
                <p className="text-sm font-bold font-mono text-[#FFB800]">{formatCxl(vestingData.totalLocked)}</p>
              </div>
              <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(0,255,178,0.06)' }}>
                <p className="text-[10px] text-[#7B8BA5]">Claimed</p>
                <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCxl(vestingData.totalClaimed)}</p>
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 space-y-2">
            {vestingData.schedules.map((s: any) => {
              const unlockable = s.status === 'streaming' && s.next_unlock_at && new Date(s.next_unlock_at) <= new Date();
              const nextUnlock = s.next_unlock_at ? new Date(s.next_unlock_at) : null;
              const progress = s.total_installments > 0 ? (s.current_installment / s.total_installments) * 100 : 0;

              return (
                <div key={s.id} className="rounded-xl p-3 border border-[rgba(255,184,0,0.08)]" style={{ background: 'rgba(255,184,0,0.03)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#7B8BA5]">Purchase: {formatCxl(s.total_cxl)} CXL</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.status === 'completed' ? 'bg-[rgba(0,255,178,0.1)] text-[#00FFB2]' : s.status === 'streaming' ? 'bg-[rgba(255,184,0,0.1)] text-[#FFB800]' : 'bg-[rgba(123,97,255,0.1)] text-[#7B61FF]'}`}>
                      {s.status === 'completed' ? 'DONE' : s.status === 'streaming' ? 'STREAMING' : 'LOCKED'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#7B8BA5] mb-1">
                    <span>Month {s.current_installment}/{s.total_installments}</span>
                    <span>{formatCxl(s.monthly_amount)} CXL/month</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(255,184,0,0.1)] overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF5C7A]" style={{ width: `${progress}%` }} />
                  </div>
                  {s.status === 'streaming' && nextUnlock && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-[#7B8BA5]">
                        {unlockable ? 'Ready to claim!' : `Next unlock: ${nextUnlock.toLocaleDateString()}`}
                      </span>
                      {unlockable && (
                        <button
                          onClick={() => setShowClaimModal(s.id)}
                          className="px-3 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90"
                        >
                          Claim
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Tooltip (shows when hovering/selecting bar) */}
      {displayDay && (hoveredDay || selectedDay) && (
        <div className="rounded-2xl p-4 flex items-center justify-between border border-[rgba(255,184,0,0.12)]" style={{ background: 'rgba(255,184,0,0.06)' }}>
          <div>
            <p className="text-[10px] text-[#7B8BA5]">Day {displayDay} Price</p>
            <p className="text-2xl font-bold font-mono text-[#FFB800]">{formatPrice(displayPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#7B8BA5]">Per CXL</p>
            {displayDay < stats.day && <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,92,122,0.1)] text-[#FF5C7A] font-semibold">PAST</span>}
            {displayDay === stats.day && <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(0,255,178,0.1)] text-[#00FFB2] font-semibold">TODAY</span>}
            {displayDay > stats.day && <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(123,97,255,0.1)] text-[#7B61FF] font-semibold">UPCOMING</span>}
          </div>
        </div>
      )}

      {/* Interactive Price Timeline Card */}
      <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="p-4 pb-2" style={{ background: 'rgba(255,184,0,0.04)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#FFB800]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Price Timeline</h3>
            </div>
            <span className="text-[10px] text-[#7B8BA5]">Tap a bar for price</span>
          </div>
          <p className="text-[10px] text-[#7B8BA5]">Day 1: {formatPrice(prices[0])} → Day 90: {formatPrice(prices[89])}</p>
        </div>

        {/* Timeline Bars - candle style with phase colors */}
        <div className="px-4 pb-3 pt-2">
          <div className="flex items-end gap-[3px] h-32 relative">
            {(() => {
              const minP = Math.min(...prices);
              const maxP = Math.max(...prices);
              return prices.map((price, i) => {
              const day = i + 1;
              const isPast = day < stats.day;
              const isCurrent = day === stats.day;
              const isHovered = hoveredDay === day;
              const isSelected = selectedDay === day;

              // Candle height based on price (small to large)
              const heightPct = maxP > minP ? ((price - minP) / (maxP - minP)) * 80 + 20 : 50;

              // Phase-based colors
              let baseColor: string;
              let glowColor: string;
              if (day <= 30) {
                baseColor = 'rgba(0,229,255,0.5)';   // Phase 1 - Cyan
                glowColor = 'rgba(0,229,255,0.15)';
              } else if (day <= 60) {
                baseColor = 'rgba(123,97,255,0.5)';   // Phase 2 - Purple
                glowColor = 'rgba(123,97,255,0.15)';
              } else {
                baseColor = 'rgba(255,92,122,0.5)';   // Phase 3 - Pink
                glowColor = 'rgba(255,92,122,0.15)';
              }

              if (isCurrent) baseColor = '#FFB800';
              if (isHovered || isSelected) baseColor = '#FFB800';

              return (
                <div
                  key={day}
                  className="flex-1 cursor-pointer transition-all duration-150 rounded-t-sm relative"
                  style={{
                    height: `${heightPct}%`,
                    background: baseColor,
                    boxShadow: (isHovered || isSelected || isCurrent) ? `0 0 8px ${glowColor}` : 'none',
                    opacity: isSelected ? 1 : isHovered ? 0.95 : isPast ? 0.65 : 0.75,
                    minWidth: 0,
                  }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                />
              );
            });
            })()}
          </div>

          {/* Day labels */}
          <div className="flex justify-between mt-1">
            {[1, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(d => (
              <span key={d} className="text-[8px] text-[#7B8BA5] font-mono">{d}</span>
            ))}
          </div>

          {/* Phase labels */}
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[#00E5FF] font-semibold">Phase 1</span>
            <span className="text-[9px] text-[#7B61FF] font-semibold">Phase 2</span>
            <span className="text-[9px] text-[#FF5C7A] font-semibold">Phase 3</span>
          </div>
        </div>
      </div>

      {/* Buy Card */}
      <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="p-4 pb-3" style={{ background: 'rgba(255,184,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-[#FFB800]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Buy CXL Tokens</h3>
          </div>
          <p className="text-[10px] text-[#7B8BA5]">Spend $1-$100 USDT. USDT deducted from earnings.</p>
        </div>
        <div className="p-4 pt-3">
          {balance && (
            <div className="flex items-center justify-between mb-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.08)' }}>
              <span className="text-[10px] text-[#7B8BA5] uppercase">Your CXL Balance</span>
              <span className="text-sm font-bold font-mono text-[#FFB800]">{formatCxl(balance.cxl_balance)} CXL</span>
            </div>
          )}

          <div className="flex gap-2 mb-3">
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="USDT amount ($1-$100)"
              min={1}
              max={100}
              className="flex-1 h-12 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(255,184,0,0.15)] text-white placeholder:text-[#7B8BA5]/50 text-sm focus:outline-none focus:border-[rgba(255,184,0,0.4)] font-mono"
            />
            <button
              onClick={handleBuy}
              disabled={purchaseStatus !== 'idle' || !amount || parseFloat(amount) < 1 || parseFloat(amount) > 100 || !address}
              className="h-12 px-6 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {purchaseStatus !== 'idle' ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
              {!address ? 'Connect Wallet' : purchaseStatus === 'approve' ? 'Approving...' : purchaseStatus === 'confirm' ? 'Confirming...' : 'Buy'}
            </button>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-3">
            {[5, 10, 25, 50, 100].map(qty => (
              <button
                key={qty}
                onClick={() => setAmount(String(qty))}
                className={`flex-1 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                  amount === String(qty)
                    ? 'bg-[rgba(255,184,0,0.15)] text-[#FFB800] border border-[rgba(255,184,0,0.3)]'
                    : 'bg-[rgba(255,184,0,0.04)] text-[#7B8BA5] border border-[rgba(255,184,0,0.08)] hover:border-[rgba(255,184,0,0.2)]'
                }`}
              >
                ${qty}
              </button>
            ))}
          </div>

          {amount && parseFloat(amount) >= 1 && parseFloat(amount) <= 100 && (
            <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.1)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7B8BA5]">You Pay</span>
                <span className="text-lg font-bold font-mono text-[#FFB800]">${totalCost.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7B8BA5]">You Get</span>
                <span className="text-lg font-bold font-mono text-[#00FFB2]">{formatCxl(cxlYouGet)} CXL</span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-[rgba(255,184,0,0.08)]">
                <span className="text-[10px] text-[#7B8BA5]">Rate</span>
                <span className="text-xs font-mono text-[#7B8BA5]">{formatPrice(stats.price)}/CXL on Day {stats.day}</span>
              </div>
            </div>
          )}

          {amount && (parseFloat(amount) < 1 || parseFloat(amount) > 100) && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,92,122,0.06)', border: '1px solid rgba(255,92,122,0.1)' }}>
              <AlertCircle size={12} className="text-[#FF5C7A]" />
              <span className="text-[10px] text-[#FF5C7A]">Enter amount between $1-$100 USDT</span>
            </div>
          )}

          {message && (
            <p className={`text-xs text-center font-semibold py-1 ${message.includes('Error') || message.includes('failed') || message.includes('Insufficient') ? 'text-[#FF5C7A]' : 'text-[#00FFB2]'}`}>
              {message}
            </p>
          )}
        </div>
      </div>

      {/* DEX Launch Card */}
      <div className="rounded-2xl border border-[rgba(0,229,255,0.12)] overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(0,229,255,0.03))' }}>
        <div className="p-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(123,97,255,0.06))' }}>
          <div className="flex items-center gap-2 mb-2">
            <Rocket size={14} className="text-[#00E5FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>DEX Launch</h3>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-lg mb-2" style={{ background: 'rgba(0,229,255,0.06)' }}>
            <span className="text-xs text-[#7B8BA5]">Launch Price (Day 91)</span>
            <span className="text-lg font-bold font-mono text-[#00E5FF]">{formatPrice(dexPrice)}</span>
          </div>
          <p className="text-[10px] text-[#7B8BA5]">CXL token will be listed on PancakeSwap at <span className="text-[#00E5FF] font-bold">{formatPrice(dexPrice)}</span> per token on Day 91.</p>
        </div>
      </div>

      {/* Settlement Info */}
      <div className="rounded-2xl border border-[rgba(123,97,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Coins size={14} className="text-[#7B61FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Day 91 Settlement & Vesting</h3>
        </div>
        <p className="text-[10px] text-[#7B8BA5] mb-2">After presale ends, your tokens are split:</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(123,97,255,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">50% Staked (3% daily yield)</span>
            <span className="text-xs font-bold font-mono text-[#7B61FF]">50%</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">50% Vesting (11 months)</span>
            <span className="text-xs font-bold font-mono text-[#FFB800]">50%</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-[rgba(123,97,255,0.08)]">
          <p className="text-[10px] text-[#7B8BA5]">Vesting unlocks monthly. Each month you can claim to liquid wallet or compound back to staking.</p>
        </div>
      </div>

      {/* Referral Commission Info */}
      <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-[#00E5FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Presale Referral Commission</h3>
        </div>
        <p className="text-[10px] text-[#7B8BA5] mb-2">12% of each purchase is distributed to your 5-level upline:</p>
        <div className="space-y-1">
          {[
            { level: 'L1 Direct', percent: 5, color: '#00E5FF', req: 'Auto' },
            { level: 'L2', percent: 3, color: '#7B61FF', req: '2 directs' },
            { level: 'L3', percent: 2, color: '#00FFB2', req: '2 directs' },
            { level: 'L4', percent: 1, color: '#FFB800', req: '2 directs' },
            { level: 'L5', percent: 1, color: '#FF5C7A', req: '2 directs' },
          ].map(l => (
            <div key={l.level} className="flex items-center justify-between py-1 px-2 rounded-lg" style={{ background: `${l.color}08` }}>
              <span className="text-xs font-semibold" style={{ color: l.color }}>{l.level}</span>
              <span className="text-[10px] text-[#7B8BA5]">{l.req}</span>
              <span className="text-xs font-bold font-mono text-white">{l.percent}%</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#7B8BA5] mt-2">Commission paid in USDT to your wallet balance.</p>
      </div>

      {/* Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[rgba(255,184,0,0.15)]" style={{ background: 'linear-gradient(135deg, #0D1117, #161B22)' }}>
            <div className="p-5 text-center">
              <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>Claim Monthly Vesting</h3>
              <p className="text-xs text-[#7B8BA5] mb-4">Choose where to receive your unlocked CXL:</p>
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => setClaimAction('liquid')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${claimAction === 'liquid' ? 'border-2 border-[#00FFB2] bg-[rgba(0,255,178,0.06)]' : 'border border-[rgba(0,229,255,0.1)] bg-[rgba(0,229,255,0.03)]'}`}
                >
                  <p className="text-sm font-bold text-white">Claim to Liquid Wallet</p>
                  <p className="text-[10px] text-[#7B8BA5]">Available to trade or withdraw immediately</p>
                </button>
                <button
                  onClick={() => setClaimAction('compound')}
                  className={`w-full p-3 rounded-xl text-left transition-all ${claimAction === 'compound' ? 'border-2 border-[#7B61FF] bg-[rgba(123,97,255,0.06)]' : 'border border-[rgba(123,97,255,0.1)] bg-[rgba(123,97,255,0.03)]'}`}
                >
                  <p className="text-sm font-bold text-white">Compound to Staking</p>
                  <p className="text-[10px] text-[#7B8BA5]">Earn 3% daily compound yield</p>
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClaimModal(null)}
                  className="flex-1 h-10 rounded-xl font-semibold text-sm bg-[rgba(255,255,255,0.05)] text-[#7B8BA5] hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClaimVesting(showClaimModal)}
                  disabled={claimingVesting !== null}
                  className="flex-1 h-10 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {claimingVesting ? <Loader2 size={12} className="animate-spin" /> : null}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back to Airdrop */}
      <Link href="/airdrop" className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(255,184,0,0.08)] hover:border-[rgba(255,184,0,0.15)] transition-all" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2">
          <Coins size={14} className="text-[#FFB800]" />
          <span className="text-xs text-white font-semibold">Back to CXL Airdrop</span>
        </div>
        <ChevronRight size={14} className="text-[#7B8BA5]" />
      </Link>
    </div>
  );
}
