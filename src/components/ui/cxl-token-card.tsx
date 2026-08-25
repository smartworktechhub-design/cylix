'use client';

import { useState, useEffect } from 'react';
import { Coins, Zap, Clock, ShoppingCart, TrendingUp, Lock, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';
import { useAppStore } from '@/stores/app-store';

const formatCxl = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

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
}

export function CxlTokenCard() {
  const isDev = useIsDev();
  const { user } = useAppStore();
  const userId = user?.id || null;
  const [data, setData] = useState<AirdropData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [buyingPresale, setBuyingPresale] = useState(false);
  const [presaleAmount, setPresaleAmount] = useState('');
  const [presaleMessage, setPresaleMessage] = useState('');

  useEffect(() => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleClaimDaily = async () => {
    setClaiming(true);
    setClaimMessage('');
    try {
      const res = await fetch('/api/airdrop/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (res.ok) {
        setClaimMessage(`+${json.totalCXL} CXL claimed! Day ${json.day}`);
        refreshData();
      } else {
        setClaimMessage(json.error || 'Claim failed');
      }
    } catch {
      setClaimMessage('Network error');
    }
    setClaiming(false);
  };

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

  const handleBuyPresale = async () => {
    const amt = parseFloat(presaleAmount);
    if (!amt || amt <= 0) return;
    setBuyingPresale(true);
    setPresaleMessage('');
    try {
      const res = await fetch('/api/presale/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cxlAmount: amt }),
      });
      const json = await res.json();
      if (res.ok) {
        setPresaleMessage(`Bought ${json.cxlAmount} CXL for $${json.totalUSDT.toFixed(4)}`);
        setPresaleAmount('');
        refreshData();
      } else {
        setPresaleMessage(json.error || 'Purchase failed');
      }
    } catch {
      setPresaleMessage('Network error');
    }
    setBuyingPresale(false);
  };

  const refreshData = () => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  };

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

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase">Supply</p>
            <p className="text-xs font-bold font-mono text-white">{formatCxl(stats.remaining)}</p>
            <p className="text-[10px] text-[#7B8BA5]">remaining</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.1)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase">Price</p>
            <p className="text-xs font-bold font-mono text-[#FFB800]">${stats.price.toFixed(2)}</p>
            <p className="text-[10px] text-[#7B8BA5]">per CXL</p>
          </div>
          <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,255,178,0.05)', border: '1px solid rgba(0,255,178,0.1)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase">Users</p>
            <p className="text-xs font-bold font-mono text-[#00FFB2]">{stats.totalUsers}</p>
            <p className="text-[10px] text-[#7B8BA5]">enrolled</p>
          </div>
        </div>
      </div>

      {/* Balance Section */}
      {balance && (
        <div className="p-4 pt-3">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-xl p-3 border border-[rgba(255,184,0,0.1)]" style={{ background: 'rgba(255,184,0,0.04)' }}>
              <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">CXL Balance</p>
              <p className="text-lg font-bold font-mono text-[#FFB800]">{formatCxl(balance.cxl_balance)}</p>
            </div>
            <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.1)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
              <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Total Earned</p>
              <p className="text-lg font-bold font-mono text-[#00E5FF]">{formatCxl(balance.cxl_earned_total)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg p-2" style={{ background: 'rgba(0,255,178,0.04)' }}>
              <p className="text-[10px] text-[#7B8BA5] uppercase">Liquid</p>
              <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCxl(balance.cxl_liquid)}</p>
            </div>
            <div className="rounded-lg p-2" style={{ background: 'rgba(123,97,255,0.04)' }}>
              <p className="text-[10px] text-[#7B8BA5] uppercase">Staked</p>
              <p className="text-sm font-bold font-mono text-[#7B61FF]">{formatCxl(balance.cxl_staked)}</p>
            </div>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-[#00E5FF]" />
              <span className="text-xs text-[#7B8BA5]">Streak: <span className="text-white font-bold">{balance.consecutive_claim_days}d</span></span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp size={12} className="text-[#00FFB2]" />
              <span className="text-xs text-[#7B8BA5]">Total: <span className="text-white font-bold">{balance.total_claim_days}d</span></span>
            </div>
          </div>

          {/* Signup Bonus */}
          {!balance.signup_bonus_claimed && (
            <button
              onClick={handleClaimBonus}
              disabled={claiming}
              className="w-full h-10 rounded-xl font-semibold text-sm mb-2 transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {claiming ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
              Claim Signup Bonus
            </button>
          )}

          {/* Daily Claim */}
          {balance.signup_bonus_claimed && (
            <button
              onClick={handleClaimDaily}
              disabled={claiming || !canClaim.canClaim}
              className={`w-full h-10 rounded-xl font-semibold text-sm mb-2 transition-all flex items-center justify-center gap-2 ${
                canClaim.canClaim && !claiming
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] hover:opacity-90'
                  : 'bg-[rgba(0,229,255,0.05)] text-[#7B8BA5] cursor-not-allowed'
              }`}
            >
              {claiming ? (
                <><Loader2 size={14} className="animate-spin" /> Claiming...</>
              ) : canClaim.canClaim ? (
                <><Zap size={14} /> Claim Daily Airdrop</>
              ) : (
                <><Lock size={14} /> {canClaim.reason || 'Already claimed today'}</>
              )}
            </button>
          )}

          {claimMessage && (
            <p className={`text-xs text-center mb-2 font-semibold ${claimMessage.includes('Error') || claimMessage.includes('failed') ? 'text-[#FF5C7A]' : 'text-[#00FFB2]'}`}>
              {claimMessage}
            </p>
          )}

          {/* Presale Section */}
          {stats.day > 0 && stats.day <= 90 && (
            <div className="mt-3 pt-3 border-t border-[rgba(0,229,255,0.06)]">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={12} className="text-[#FFB800]" />
                <p className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Presale</p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(255,184,0,0.1)] text-[#FFB800] font-mono">${stats.price.toFixed(4)}/CXL</span>
              </div>
              <p className="text-[10px] text-[#7B8BA5] mb-2">Min 10 CXL, Max 100 CXL per purchase. USDT deducted from earnings.</p>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={presaleAmount}
                  onChange={e => setPresaleAmount(e.target.value)}
                  placeholder="CXL amount"
                  min={10}
                  max={100}
                  className="flex-1 h-10 px-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(255,184,0,0.1)] text-white placeholder:text-[#7B8BA5]/50 text-sm focus:outline-none focus:border-[rgba(255,184,0,0.3)] font-mono"
                />
                <button
                  onClick={handleBuyPresale}
                  disabled={buyingPresale || !presaleAmount || parseFloat(presaleAmount) < 10}
                  className="h-10 px-4 rounded-xl font-semibold text-sm transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
                >
                  {buyingPresale ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
                  Buy
                </button>
              </div>
              {presaleAmount && parseFloat(presaleAmount) >= 10 && (
                <p className="text-xs text-[#7B8BA5] mt-1 font-mono">
                  Cost: <span className="text-[#FFB800] font-bold">${(parseFloat(presaleAmount) * stats.price).toFixed(4)}</span> USDT
                </p>
              )}
              {presaleMessage && (
                <p className={`text-xs mt-1 font-semibold ${presaleMessage.includes('Error') || presaleMessage.includes('failed') || presaleMessage.includes('Insufficient') ? 'text-[#FF5C7A]' : 'text-[#00FFB2]'}`}>
                  {presaleMessage}
                </p>
              )}
            </div>
          )}

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
