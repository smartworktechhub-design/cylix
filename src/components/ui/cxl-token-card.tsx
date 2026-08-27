'use client';

import { useState, useEffect } from 'react';
import { Coins, ShoppingCart, TrendingUp, ChevronRight, Loader2, DollarSign, Timer, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';
import { useAppStore } from '@/stores/app-store';

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

interface AirdropData {
  stats: {
    totalSupply: number;
    sold: number;
    remaining: number;
    day: number;
    price: number;
    phase: number;
    totalUsers: number;
    activeClaimers: number;
    todayTotalCXL: number;
    isActive: boolean;
  };
  balance: {
    cxl_balance: number;
    cxl_earned_total: number;
    cxl_liquid: number;
    cxl_staked: number;
    signup_bonus_claimed: boolean;
    signup_bonus_amount: number;
    consecutive_claim_days: number;
    total_claim_days: number;
    last_claim_date: string;
  } | null;
  canClaim: { canClaim: boolean; reason?: string };
  presalePrices: number[];
  dexLaunchPrice: number;
}

export function CxlTokenCard() {
  const isDev = useIsDev();
  const { user } = useAppStore();
  const userId = user?.id || null;
  const [data, setData] = useState<AirdropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const countdown = useCountdownToMidnightUTC();

  useEffect(() => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleClaimBonus = async () => {
    setClaiming(true);
    setClaimMessage('');
    try {
      const res = await fetch('/api/airdrop/signup-bonus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (res.ok) {
        setClaimMessage(`+${json.bonus} CXL signup bonus!`);
        refreshData();
      } else {
        setClaimMessage(json.error || 'Failed');
      }
    } catch {
      setClaimMessage('Network error');
    }
    setClaiming(false);
  };

  const refreshData = () => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  };

  if (isDev === null) return null;
  if (!isDev) return null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-[#00E5FF]" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const balance = data?.balance;
  const canClaim = data?.canClaim || { canClaim: false, reason: 'Loading...' };
  const prices = data?.presalePrices || [];

  if (!stats) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[rgba(0,229,255,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(22,32,52,0.97))' }}>
        <div className="p-4 pb-3" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(123,97,255,0.06))' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center">
              <Coins size={16} className="text-[#050816]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL TOKEN</h3>
              <p className="text-xs text-[#7B8BA5]">Coming soon</p>
            </div>
          </div>
        </div>
        <div className="p-4 text-center">
          <p className="text-xs text-[#7B8BA5]">Airdrop data loading...</p>
        </div>
      </div>
    );
  }

  const todayPrice = stats.price;
  const tomorrowPrice = prices[stats.day] || prices[stats.day - 1] || todayPrice;

  return (
    <div className="rounded-2xl overflow-hidden border border-[rgba(0,229,255,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(22,32,52,0.97))' }}>
      {/* Header */}
      <div className="p-4 pb-3" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(123,97,255,0.06))' }}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center">
            <Coins size={16} className="text-[#050816]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL TOKEN</h3>
            <p className="text-xs text-[#7B8BA5]">Phase {stats.phase} • Day {stats.day}/90</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${stats.isActive ? 'bg-[rgba(0,255,178,0.1)] text-[#00FFB2]' : 'bg-[rgba(255,92,122,0.1)] text-[#FF5C7A]'}`}>
              {stats.isActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>
        </div>
      </div>

      {/* Today + Tomorrow Price + Timer */}
      <div className="grid grid-cols-3 gap-[1px] bg-[rgba(0,229,255,0.04)]">
        <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
          <DollarSign size={12} className="text-[#FFB800] mx-auto mb-1" />
          <p className="text-[9px] text-[#7B8BA5] uppercase">Today</p>
          <p className="text-sm font-bold font-mono text-[#FFB800]">{formatPrice(todayPrice)}</p>
          <p className="text-[9px] text-[#7B8BA5]">Day {stats.day}</p>
        </div>
        <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
          <TrendingUp size={12} className="text-[#00FFB2] mx-auto mb-1" />
          <p className="text-[9px] text-[#7B8BA5] uppercase">Tomorrow</p>
          <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatPrice(tomorrowPrice)}</p>
          <p className="text-[9px] text-[#7B8BA5]">Day {Math.min(stats.day + 1, 90)}</p>
        </div>
        <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
          <Timer size={12} className="text-[#00E5FF] mx-auto mb-1" />
          <p className="text-[9px] text-[#7B8BA5] uppercase">Next Change</p>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            <span className="text-sm font-bold font-mono text-[#00E5FF]">{String(countdown.hours).padStart(2, '0')}</span>
            <span className="text-[10px] text-[#00E5FF]">:</span>
            <span className="text-sm font-bold font-mono text-[#00E5FF]">{String(countdown.minutes).padStart(2, '0')}</span>
            <span className="text-[10px] text-[#00E5FF]">:</span>
            <span className="text-sm font-bold font-mono text-[#00E5FF]">{String(countdown.seconds).padStart(2, '0')}</span>
          </div>
          <p className="text-[9px] text-[#7B8BA5]">12 AM UTC</p>
        </div>
      </div>

      {/* Balance Section */}
      {balance && (
        <div className="p-4 pt-3">
          {/* Total Earned + Total Balance */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.1)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
              <p className="text-[9px] text-[#7B8BA5] uppercase">Total Earned</p>
              <p className="text-base font-bold font-mono text-[#00E5FF]">{formatCxl(balance.cxl_earned_total)}</p>
              <p className="text-[9px] text-[#7B8BA5]">Signup + Airdrop</p>
            </div>
            <div className="rounded-xl p-3 border border-[rgba(255,184,0,0.1)]" style={{ background: 'rgba(255,184,0,0.04)' }}>
              <p className="text-[9px] text-[#7B8BA5] uppercase">Total Balance</p>
              <p className="text-base font-bold font-mono text-[#FFB800]">{formatCxl(balance.cxl_balance)}</p>
              <p className="text-[9px] text-[#7B8BA5]">Available CXL</p>
            </div>
          </div>

          {/* Liquid + Staked */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl p-3 border border-[rgba(0,255,178,0.1)]" style={{ background: 'rgba(0,255,178,0.04)' }}>
              <p className="text-[9px] text-[#7B8BA5] uppercase">Liquid</p>
              <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCxl(balance.cxl_liquid)}</p>
            </div>
            <div className="rounded-xl p-3 border border-[rgba(123,97,255,0.1)]" style={{ background: 'rgba(123,97,255,0.04)' }}>
              <p className="text-[9px] text-[#7B8BA5] uppercase">Staked</p>
              <p className="text-sm font-bold font-mono text-[#7B61FF]">{formatCxl(balance.cxl_staked)}</p>
            </div>
          </div>

          {/* Presale Vesting */}
          {(balance as any).presale_vested_locked > 0 && (
            <div className="rounded-xl p-3 mb-3 border border-[rgba(255,184,0,0.1)]" style={{ background: 'rgba(255,184,0,0.04)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Presale Vesting</span>
                <Lock size={12} className="text-[#FFB800]" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <p className="text-[9px] text-[#7B8BA5]">Locked</p>
                  <p className="text-xs font-bold font-mono text-[#FFB800]">{formatCxl((balance as any).presale_vested_locked || 0)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-[#7B8BA5]">Claimed</p>
                  <p className="text-xs font-bold font-mono text-[#00FFB2]">{formatCxl((balance as any).presale_vested_claimed || 0)}</p>
                </div>
              </div>
              <Link href="/presale" className="mt-2 block text-center text-[10px] text-[#FFB800] font-semibold hover:underline">
                View Vesting Schedule →
              </Link>
            </div>
          )}

          {/* Signup Bonus */}
          {!balance.signup_bonus_claimed ? (
            <button
              onClick={handleClaimBonus}
              disabled={claiming}
              className="w-full h-10 rounded-xl font-semibold text-sm mb-2 transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {claiming ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
              Claim Signup Bonus (10 CXL)
            </button>
          ) : (
            <div className="rounded-xl p-3 mb-2 text-center" style={{ background: 'rgba(0,255,178,0.06)', border: '1px solid rgba(0,255,178,0.1)' }}>
              <p className="text-xs text-[#00FFB2] font-semibold">Signup Bonus Claimed</p>
              <p className="text-[10px] text-[#7B8BA5] mt-0.5">Earn CXL from your referral levels</p>
            </div>
          )}

          {claimMessage && (
            <p className={`text-xs text-center mb-2 font-semibold ${claimMessage.includes('Error') || claimMessage.includes('failed') ? 'text-[#FF5C7A]' : 'text-[#00FFB2]'}`}>
              {claimMessage}
            </p>
          )}

          {/* Buy CXL Button */}
          <Link
            href="/presale"
            className="w-full h-11 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 flex items-center justify-center gap-2 mt-2"
          >
            <ShoppingCart size={16} />
            Buy CXL Tokens
            <ArrowRight size={14} />
          </Link>

          {/* View More */}
          <div className="mt-3 pt-3 border-t border-[rgba(0,229,255,0.06)]">
            <Link href="/earnings" className="flex items-center justify-between py-2 rounded-lg hover:bg-[rgba(0,229,255,0.04)] transition-all px-2 -mx-2">
              <span className="text-xs text-[#7B8BA5]">View full CXL earnings history</span>
              <ChevronRight size={14} className="text-[#7B8BA5]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
