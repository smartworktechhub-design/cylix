'use client';

import { useState, useEffect } from 'react';
import { Coins, Zap, Clock, ShoppingCart, TrendingUp, Lock, ChevronRight, Loader2, Gift, Flame, Shield, Info, Wallet, Users, ArrowDown } from 'lucide-react';
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

interface LevelData {
  level: number;
  label: string;
  count: number;
  rate: number;
  totalEarned: number;
  unlocked: boolean;
  color: string;
}

export default function AirdropPage() {
  const isDev = useIsDev();
  const { user } = useAppStore();
  const userId = user?.id || null;
  const [data, setData] = useState<AirdropData | null>(null);
  const [levels, setLevels] = useState<LevelData[]>([]);
  const [l2Unlocked, setL2Unlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const fetchData = () => {
    const qs = userId ? `?userId=${userId}` : '';
    Promise.all([
      fetch(`/api/airdrop/stats${qs}`).then(r => r.json()),
      fetch(`/api/airdrop/levels${qs}`).then(r => r.json()),
    ]).then(([statsData, levelsData]) => {
      setData(statsData);
      setLevels(levelsData.levels || []);
      setL2Unlocked(levelsData.l2Unlocked || false);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [userId]);

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
        fetchData();
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
        fetchData();
      } else {
        setClaimMessage(json.error || 'Failed');
      }
    } catch {
      setClaimMessage('Network error');
    }
    setClaiming(false);
  };

  if (!isDev) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Coins size={32} className="text-[#7B8BA5] mx-auto mb-3 opacity-30" />
          <p className="text-sm text-[#7B8BA5]">This feature is available on the development environment only.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const stats = data?.stats;
  const balance = data?.balance;
  const canClaim = data?.canClaim || { canClaim: false, reason: 'Loading...' };

  if (!stats) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] p-6 text-center" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <Coins size={32} className="text-[#FFB800] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL TOKEN</h2>
          <p className="text-sm text-[#7B8BA5]">Airdrop system loading. Please try again.</p>
        </div>
      </div>
    );
  }

  const dayProgress = stats.day > 0 ? Math.min((stats.day / 90) * 100, 100) : 0;
  const supplyPercent = stats.totalSupply > 0 ? ((stats.totalSupply - stats.remaining) / stats.totalSupply) * 100 : 0;
  const totalTeam = levels.reduce((s, l) => s + l.count, 0);
  const totalEarned = levels.reduce((s, l) => s + l.totalEarned, 0);

  const phaseLabels: Record<number, string> = { 1: 'Early Adopters', 2: 'Growth Phase', 3: 'Final Phase' };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Hero Header */}
      <div className="rounded-2xl overflow-hidden border border-[rgba(0,229,255,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(22,32,52,0.97))' }}>
        <div className="p-5 pb-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(123,97,255,0.08))' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center shadow-lg shadow-[rgba(255,184,0,0.2)]">
                <Coins size={20} className="text-[#050816]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL TOKEN</h1>
                <p className="text-xs text-[#7B8BA5]">90-Day Airdrop Program</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${stats.isActive ? 'bg-[rgba(0,255,178,0.12)] text-[#00FFB2] border border-[rgba(0,255,178,0.2)]' : 'bg-[rgba(255,92,122,0.12)] text-[#FF5C7A] border border-[rgba(255,92,122,0.2)]'}`}>
              {stats.isActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>

          {/* Phase & Day */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#7B61FF]" />
              <span className="text-xs font-semibold text-white">Phase {stats.phase}</span>
              <span className="text-[10px] text-[#7B8BA5]">({phaseLabels[stats.phase] || 'Not started'})</span>
            </div>
          </div>

          {/* Day Progress */}
          {stats.day > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7B8BA5]">Day {stats.day}/90</span>
                <span className="text-xs text-[#00E5FF] font-bold">{dayProgress.toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full bg-[rgba(0,229,255,0.1)] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${dayProgress}%`, background: 'linear-gradient(90deg, #00E5FF, #7B61FF)' }} />
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-[1px] bg-[rgba(0,229,255,0.04)]">
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Supply</p>
            <p className="text-sm font-bold font-mono text-white">{formatCxl(stats.remaining)}</p>
            <p className="text-[10px] text-[#7B8BA5]">remaining</p>
          </div>
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Price</p>
            <p className="text-sm font-bold font-mono text-[#FFB800]">${stats.price.toFixed(2)}</p>
            <p className="text-[10px] text-[#7B8BA5]">per CXL</p>
          </div>
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Team</p>
            <p className="text-sm font-bold font-mono text-[#00FFB2]">{totalTeam}</p>
            <p className="text-[10px] text-[#7B8BA5]">users</p>
          </div>
        </div>

        {/* Supply bar */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-[#7B8BA5]">Sold: {formatCxl(stats.sold)} / {formatCxl(stats.totalSupply)}</span>
            <span className="text-[10px] text-[#FFB800] font-bold">{supplyPercent.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[rgba(255,184,0,0.1)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FFB800] to-[#FF5C7A]" style={{ width: `${supplyPercent}%` }} />
          </div>
        </div>
      </div>

      {/* User Balance Card */}
      {balance && (
        <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
          <div className="p-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Wallet size={14} className="text-[#FFB800]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Your Wallet</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-xl p-3 border border-[rgba(255,184,0,0.12)]" style={{ background: 'rgba(255,184,0,0.05)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">CXL Balance</p>
                <p className="text-xl font-bold font-mono text-[#FFB800]">{formatCxl(balance.cxl_balance)}</p>
              </div>
              <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.12)]" style={{ background: 'rgba(0,229,255,0.05)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Total Earned</p>
                <p className="text-xl font-bold font-mono text-[#00E5FF]">{formatCxl(balance.cxl_earned_total)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="rounded-lg p-2.5" style={{ background: 'rgba(0,255,178,0.04)', border: '1px solid rgba(0,255,178,0.08)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Liquid</p>
                <p className="text-base font-bold font-mono text-[#00FFB2]">{formatCxl(balance.cxl_liquid)}</p>
              </div>
              <div className="rounded-lg p-2.5" style={{ background: 'rgba(123,97,255,0.04)', border: '1px solid rgba(123,97,255,0.08)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Staked</p>
                <p className="text-base font-bold font-mono text-[#7B61FF]">{formatCxl(balance.cxl_staked)}</p>
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center gap-4 mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <Flame size={14} className="text-[#FF5C7A]" />
                <span className="text-xs text-[#7B8BA5]">Streak: <span className="text-white font-bold">{balance.consecutive_claim_days}d</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[#00FFB2]" />
                <span className="text-xs text-[#7B8BA5]">Total Claims: <span className="text-white font-bold">{balance.total_claim_days}d</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 pb-4 space-y-2">
            {/* Signup Bonus */}
            {!balance.signup_bonus_claimed && (
              <button
                onClick={handleClaimBonus}
                disabled={claiming}
                className="w-full h-12 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[rgba(255,184,0,0.15)]"
              >
                {claiming ? <Loader2 size={16} className="animate-spin" /> : <Gift size={16} />}
                Claim Signup Bonus
              </button>
            )}

            {/* Daily Claim */}
            {balance.signup_bonus_claimed && (
              <button
                onClick={handleClaimDaily}
                disabled={claiming || !canClaim.canClaim}
                className={`w-full h-12 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                  canClaim.canClaim && !claiming
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] hover:opacity-90 shadow-[rgba(0,229,255,0.15)]'
                    : 'bg-[rgba(0,229,255,0.05)] text-[#7B8BA5] cursor-not-allowed'
                }`}
              >
                {claiming ? (
                  <><Loader2 size={16} className="animate-spin" /> Claiming...</>
                ) : canClaim.canClaim ? (
                  <><Zap size={16} /> Claim Daily Airdrop</>
                ) : (
                  <><Lock size={16} /> {canClaim.reason || 'Already claimed today'}</>
                )}
              </button>
            )}

            {claimMessage && (
              <p className={`text-xs text-center font-semibold py-1 ${claimMessage.includes('Error') || claimMessage.includes('failed') ? 'text-[#FF5C7A]' : 'text-[#00FFB2]'}`}>
                {claimMessage}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Level Breakdown */}
      <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="p-4 pb-3" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(123,97,255,0.06))' }}>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-[#00E5FF]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Airdrop Levels</h3>
          </div>
          <p className="text-[10px] text-[#7B8BA5]">No daily earning cap. Earn until Day 91.</p>
        </div>

        <div className="p-3 space-y-2">
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className="rounded-xl p-3 transition-all"
              style={{
                background: lvl.unlocked ? `${lvl.color}08` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${lvl.unlocked ? `${lvl.color}20` : 'rgba(255,255,255,0.04)'}`,
                opacity: lvl.unlocked ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: `${lvl.color}20`, color: lvl.color }}>
                    L{lvl.level}
                  </div>
                  <span className="text-xs font-semibold text-white">{lvl.label}</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: lvl.color }}>
                  {lvl.rate.toFixed(2)} CXL per referral
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#7B8BA5]">
                    Users: <span className="text-white font-bold">{lvl.count}</span>
                  </span>
                  <span className="text-[10px] text-[#7B8BA5]">
                    Earned: <span className="font-bold" style={{ color: lvl.color }}>{formatCxl(lvl.totalEarned)} CXL</span>
                  </span>
                </div>
                {!lvl.unlocked && lvl.level > 1 && (
                  <span className="text-[10px] text-[#FF5C7A] font-semibold flex items-center gap-0.5">
                    <Lock size={10} /> Locked
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* L2 Unlock Status */}
          <div className="rounded-xl p-3 mt-2" style={{ background: l2Unlocked ? 'rgba(0,255,178,0.04)' : 'rgba(255,92,122,0.04)', border: `1px solid ${l2Unlocked ? 'rgba(0,255,178,0.15)' : 'rgba(255,92,122,0.15)'}` }}>
            <div className="flex items-center gap-2">
              {l2Unlocked ? (
                <Shield size={14} className="text-[#00FFB2]" />
              ) : (
                <Lock size={14} className="text-[#FF5C7A]" />
              )}
              <div>
                <p className={`text-xs font-semibold ${l2Unlocked ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                  {l2Unlocked ? 'L2-L5 Unlocked!' : 'L2-L5 Locked'}
                </p>
                <p className="text-[10px] text-[#7B8BA5]">
                  {l2Unlocked
                    ? `You have ${levels[0]?.count || 0} directs. Earning extra CXL from L2-L5 referrals`
                    : `Invite 2 direct referrals to unlock L2-L5 earnings`
                  }
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Presale CTA */}
      <Link href="/presale" className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(255,184,0,0.08)] hover:border-[rgba(255,184,0,0.15)] transition-all" style={{ background: 'rgba(255,184,0,0.04)' }}>
        <div className="flex items-center gap-2">
          <ShoppingCart size={14} className="text-[#FFB800]" />
          <div>
            <span className="text-xs text-white font-semibold block">Buy CXL in Presale</span>
            <span className="text-[10px] text-[#7B8BA5]">{formatCxl(stats.remaining)} CXL remaining @ ${stats.price.toFixed(2)}/CXL</span>
          </div>
        </div>
        <ChevronRight size={14} className="text-[#7B8BA5]" />
      </Link>

      {/* Earnings History Link */}
      <Link href="/earnings" className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(0,229,255,0.08)] hover:border-[rgba(0,229,255,0.15)] transition-all" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#00E5FF]" />
          <span className="text-xs text-white font-semibold">View Full Earnings History</span>
        </div>
        <ChevronRight size={14} className="text-[#7B8BA5]" />
      </Link>
    </div>
  );
}
