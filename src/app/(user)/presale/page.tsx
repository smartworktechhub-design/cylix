'use client';

import { useState, useEffect } from 'react';
import { Coins, ShoppingCart, Loader2, TrendingUp, Clock, ChevronRight, Zap, AlertCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';
import { useAppStore } from '@/stores/app-store';

const formatCxl = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const formatUsdt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

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
  const [purchases, setPurchases] = useState<any[]>([]);

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
        setMessage(`Bought ${json.cxlAmount} CXL for ${formatUsdt(json.totalUSDT)}! Day ${json.day}`);
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

  if (!stats) {
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
  const usdtBalance = balance ? Number((user as any)?.total_earned || 0) : 0;

  // Price schedule preview
  const priceSchedule = [];
  const startDay = Math.max(1, stats.day - 2);
  const endDay = Math.min(90, stats.day + 6);
  for (let d = startDay; d <= endDay; d++) {
    const price = 0.01 + (d - 1) * 0.01;
    priceSchedule.push({ day: d, price: Math.min(price, 0.90), isCurrent: d === stats.day });
  }

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
                <p className="text-xs text-[#7B8BA5]">Buy CXL tokens at discounted rates</p>
              </div>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${stats.isActive ? 'bg-[rgba(0,255,178,0.12)] text-[#00FFB2] border border-[rgba(0,255,178,0.2)]' : 'bg-[rgba(255,92,122,0.12)] text-[#FF5C7A] border border-[rgba(255,92,122,0.2)]'}`}>
              {stats.isActive ? 'ACTIVE' : 'PAUSED'}
            </span>
          </div>

          {/* Current Price */}
          <div className="rounded-xl p-4 mb-3" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#7B8BA5]">Current Price (Day {stats.day})</span>
              <span className="text-[10px] text-[#FFB800] font-bold">+${(0.01).toFixed(2)}/day</span>
            </div>
            <p className="text-3xl font-bold font-mono text-[#FFB800]">{formatUsdt(stats.price)}<span className="text-sm text-[#7B8BA5]"> / CXL</span></p>
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

      {/* Buy Card */}
      <div className="rounded-2xl border border-[rgba(255,184,0,0.12)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
        <div className="p-4 pb-3" style={{ background: 'rgba(255,184,0,0.04)' }}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-[#FFB800]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Buy CXL Tokens</h3>
          </div>
          <p className="text-[10px] text-[#7B8BA5]">Min 10 CXL, Max 100 CXL per purchase. USDT deducted from your earnings balance.</p>
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
                <span className="text-lg font-bold font-mono text-[#FFB800]">{formatUsdt(totalCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7B8BA5]">You Get</span>
                <span className="text-lg font-bold font-mono text-[#00FFB2]">{formatCxl(parseFloat(amount))} CXL</span>
              </div>
              <div className="flex items-center justify-between mt-1 pt-1 border-t border-[rgba(255,184,0,0.08)]">
                <span className="text-[10px] text-[#7B8BA5]">Rate</span>
                <span className="text-xs font-mono text-[#7B8BA5]">{formatUsdt(stats.price)}/CXL on Day {stats.day}</span>
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

      {/* Price Schedule */}
      <div className="rounded-2xl border border-[rgba(0,229,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={14} className="text-[#FFB800]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Price Schedule</h3>
        </div>
        <div className="space-y-1">
          {priceSchedule.map(p => (
            <div
              key={p.day}
              className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs ${
                p.isCurrent
                  ? 'bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.2)]'
                  : ''
              }`}
              style={p.isCurrent ? {} : { background: 'rgba(255,184,0,0.02)' }}
            >
              <span className={`font-mono ${p.isCurrent ? 'text-[#FFB800] font-bold' : 'text-[#7B8BA5]'}`}>
                Day {p.day}
                {p.isCurrent && <span className="ml-1 text-[10px]">(NOW)</span>}
              </span>
              <span className={`font-mono font-bold ${p.isCurrent ? 'text-[#FFB800]' : 'text-white'}`}>
                {formatUsdt(p.price)}/CXL
              </span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-[#7B8BA5] mt-2 text-center">Price increases $0.01 every day. Max $0.90/CXL on Day 90.</p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[rgba(0,229,255,0.08)] p-3" style={{ background: 'rgba(22,32,52,0.4)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-[#00E5FF]" />
            <span className="text-[10px] font-bold text-white uppercase" style={{ fontFamily: "'Orbitron',sans-serif" }}>Day 1 Price</span>
          </div>
          <p className="text-xl font-bold font-mono text-[#00E5FF]">$0.01</p>
          <p className="text-[10px] text-[#7B8BA5]">per CXL</p>
        </div>
        <div className="rounded-xl border border-[rgba(0,255,178,0.08)] p-3" style={{ background: 'rgba(22,32,52,0.4)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp size={12} className="text-[#00FFB2]" />
            <span className="text-[10px] font-bold text-white uppercase" style={{ fontFamily: "'Orbitron',sans-serif" }}>Day 90 Price</span>
          </div>
          <p className="text-xl font-bold font-mono text-[#00FFB2]">$0.90</p>
          <p className="text-[10px] text-[#7B8BA5]">per CXL</p>
        </div>
      </div>

      {/* Settlement Info */}
      <div className="rounded-2xl border border-[rgba(123,97,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.4)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Coins size={14} className="text-[#7B61FF]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>Day 91 Settlement</h3>
        </div>
        <p className="text-[10px] text-[#7B8BA5] mb-2">After the 90-day presale ends, your tokens are split:</p>
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
