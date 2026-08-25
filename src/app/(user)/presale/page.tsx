'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Coins, ShoppingCart, Loader2, TrendingUp, Clock, ChevronRight, Zap, AlertCircle, DollarSign, Rocket } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';
import { useAppStore } from '@/stores/app-store';

const formatCxl = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const formatPrice = (n: number) => '$' + n.toFixed(4);

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
  const [data, setData] = useState<PresaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const fetchData = () => {
    fetch(`/api/airdrop/stats${userId ? `?userId=${userId}` : ''}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [userId]);

  const handleBuy = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 10 || amt > 100) return;
    setBuying(true);
    setMessage('');
    try {
      const res = await fetch('/api/presale/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cxlAmount: amt }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage(`Bought ${json.cxlAmount} CXL for $${json.totalUSDT.toFixed(4)}!`);
        setAmount('');
        fetchData();
      } else {
        setMessage(json.error || 'Purchase failed');
      }
    } catch {
      setMessage('Network error');
    }
    setBuying(false);
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
  const supplyPercent = stats.totalSupply > 0 ? ((stats.totalSupply - stats.remaining) / stats.totalSupply) * 100 : 0;
  const totalCost = amount && parseFloat(amount) >= 10 ? parseFloat(amount) * stats.price : 0;

  const displayDay = selectedDay || hoveredDay || stats.day;
  const displayPrice = prices[displayDay - 1] || prices[0];

  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);

  return (
    <div className="max-w-lg mx-auto space-y-4">
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

          {/* Current Price Display */}
          <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#7B8BA5]">Current Price (Day {stats.day})</span>
              <span className="text-[10px] text-[#FFB800] font-bold">+~$0.001/day</span>
            </div>
            <p className="text-3xl font-bold font-mono text-[#FFB800]">{formatPrice(stats.price)}<span className="text-sm text-[#7B8BA5]"> / CXL</span></p>
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
        <div className="grid grid-cols-3 gap-[1px] bg-[rgba(255,184,0,0.04)]">
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
          <div className="p-3 text-center" style={{ background: 'rgba(9,11,20,0.97)' }}>
            <p className="text-[10px] text-[#7B8BA5] uppercase tracking-wider">Users</p>
            <p className="text-sm font-bold font-mono text-[#00FFB2]">{stats.totalUsers}</p>
            <p className="text-[10px] text-[#7B8BA5]">enrolled</p>
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

      {/* Interactive Price Timeline Card */}
      <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="p-4 pb-2" style={{ background: 'rgba(255,184,0,0.04)' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#FFB800]" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Price Timeline</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#7B8BA5]">Tap a bar for price</span>
            </div>
          </div>
          <p className="text-[10px] text-[#7B8BA5] mb-1">Day 1: {formatPrice(prices[0])} → Day 90: {formatPrice(prices[89])}</p>
        </div>

        {/* Price Tooltip */}
        {displayDay && (
          <div className="mx-4 mb-2 rounded-xl p-3 flex items-center justify-between" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.2)' }}>
            <div>
              <p className="text-[10px] text-[#7B8BA5]">Day {displayDay}</p>
              <p className="text-lg font-bold font-mono text-[#FFB800]">{formatPrice(displayPrice)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#7B8BA5]">Per CXL</p>
              {displayDay < stats.day && <span className="text-[10px] text-[#FF5C7A] font-semibold">PAST</span>}
              {displayDay === stats.day && <span className="text-[10px] text-[#00FFB2] font-semibold">NOW</span>}
              {displayDay > stats.day && <span className="text-[10px] text-[#7B61FF] font-semibold">UPCOMING</span>}
            </div>
          </div>
        )}

        {/* Timeline Bars */}
        <div className="px-4 pb-3">
          <div ref={timelineRef} className="flex items-end gap-[2px] h-32 relative">
            {prices.map((price, i) => {
              const day = i + 1;
              const height = maxPrice > minPrice ? ((price - minPrice) / (maxPrice - minPrice)) * 100 : 50;
              const isPast = day < stats.day;
              const isCurrent = day === stats.day;
              const isFuture = day > stats.day;
              const isHovered = hoveredDay === day;
              const isSelected = selectedDay === day;

              let barColor = 'rgba(255,184,0,0.3)';
              if (isPast) barColor = 'rgba(0,229,255,0.4)';
              if (isCurrent) barColor = '#FFB800';
              if (isHovered || isSelected) barColor = '#FFB800';
              if (isFuture && !isHovered && !isSelected) barColor = 'rgba(255,184,0,0.25)';

              return (
                <div
                  key={day}
                  className="flex-1 cursor-pointer transition-all duration-150 rounded-t-sm group relative"
                  style={{
                    height: `${Math.max(height, 4)}%`,
                    background: barColor,
                    opacity: isSelected ? 1 : isHovered ? 0.9 : isPast ? 0.6 : 0.7,
                    minWidth: 0,
                  }}
                  onMouseEnter={() => setHoveredDay(day)}
                  onMouseLeave={() => setHoveredDay(null)}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                >
                  {/* Phase markers */}
                  {(day === 30 || day === 60) && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#7B61FF]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="flex justify-between mt-1 px-0">
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
          <p className="text-[10px] text-[#7B8BA5]">Min 10 CXL, Max 100 CXL per purchase. USDT deducted from earnings.</p>
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
              placeholder="CXL amount (10-100)"
              min={10}
              max={100}
              className="flex-1 h-12 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(255,184,0,0.15)] text-white placeholder:text-[#7B8BA5]/50 text-sm focus:outline-none focus:border-[rgba(255,184,0,0.4)] font-mono"
            />
            <button
              onClick={handleBuy}
              disabled={buying || !amount || parseFloat(amount) < 10 || parseFloat(amount) > 100}
              className="h-12 px-6 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
            >
              {buying ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
              Buy
            </button>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mb-3">
            {[10, 25, 50, 75, 100].map(qty => (
              <button
                key={qty}
                onClick={() => setAmount(String(qty))}
                className={`flex-1 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                  amount === String(qty)
                    ? 'bg-[rgba(255,184,0,0.15)] text-[#FFB800] border border-[rgba(255,184,0,0.3)]'
                    : 'bg-[rgba(255,184,0,0.04)] text-[#7B8BA5] border border-[rgba(255,184,0,0.08)] hover:border-[rgba(255,184,0,0.2)]'
                }`}
              >
                {qty}
              </button>
            ))}
          </div>

          {amount && parseFloat(amount) >= 10 && parseFloat(amount) <= 100 && (
            <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,184,0,0.04)', border: '1px solid rgba(255,184,0,0.1)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#7B8BA5]">You Pay</span>
                <span className="text-lg font-bold font-mono text-[#FFB800]">${totalCost.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7B8BA5]">You Get</span>
                <span className="text-lg font-bold font-mono text-[#00FFB2]">{formatCxl(parseFloat(amount))} CXL</span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-[rgba(255,184,0,0.08)]">
                <span className="text-[10px] text-[#7B8BA5]">Rate</span>
                <span className="text-xs font-mono text-[#7B8BA5]">{formatPrice(stats.price)}/CXL on Day {stats.day}</span>
              </div>
            </div>
          )}

          {amount && (parseFloat(amount) < 10 || parseFloat(amount) > 100) && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,92,122,0.06)', border: '1px solid rgba(255,92,122,0.1)' }}>
              <AlertCircle size={12} className="text-[#FF5C7A]" />
              <span className="text-[10px] text-[#FF5C7A]">Enter amount between 10-100 CXL</span>
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

      {/* Pricing Logic Info */}
      <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Zap size={14} className="text-[#FFB800]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Pricing Logic</h3>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">Day 1 Price</span>
            <span className="text-xs font-bold font-mono text-[#00E5FF]">{formatPrice(prices[0])}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">Day 30 Price</span>
            <span className="text-xs font-bold font-mono text-[#7B61FF]">{formatPrice(prices[29])}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">Day 60 Price</span>
            <span className="text-xs font-bold font-mono text-[#FF5C7A]">{formatPrice(prices[59])}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,184,0,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">Day 90 Price</span>
            <span className="text-xs font-bold font-mono text-[#FFB800]">{formatPrice(prices[89])}</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(0,229,255,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">DEX Launch (Day 91)</span>
            <span className="text-xs font-bold font-mono text-[#00E5FF]">{formatPrice(dexPrice)}</span>
          </div>
        </div>
        <p className="text-[10px] text-[#7B8BA5] mt-2 text-center">Linear micro-increment: ~$0.0010-$0.0011 per day with phase jumps</p>
      </div>

      {/* Settlement Info */}
      <div className="rounded-2xl border border-[rgba(123,97,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Coins size={14} className="text-[#7B61FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Day 91 Settlement</h3>
        </div>
        <p className="text-[10px] text-[#7B8BA5] mb-2">After presale ends, your tokens split:</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(123,97,255,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">50% Staked (locked)</span>
            <span className="text-xs font-bold font-mono text-[#7B61FF]">50%</span>
          </div>
          <div className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(0,255,178,0.04)' }}>
            <span className="text-xs text-[#7B8BA5]">50% Liquid (tradeable)</span>
            <span className="text-xs font-bold font-mono text-[#00FFB2]">50%</span>
          </div>
        </div>
      </div>

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
