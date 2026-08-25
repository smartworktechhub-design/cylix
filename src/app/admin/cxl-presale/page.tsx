'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, DollarSign, Coins, Calendar } from 'lucide-react';

interface Purchase {
  id: string;
  user_id: string;
  cxl_amount: number;
  price_per_cxl: number;
  total_usdt: number;
  day_number: number;
  status: string;
  created_at: string;
  users?: { wallet: string; referral_code: string };
}

export default function AdminCxlPresalePage() {
  useEffect(() => { document.title = 'CXL Presale — Admin'; }, []);

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSold: 0, totalUSDT: 0, totalPurchases: 0 });

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const token = sessionStorage.getItem('cx_admin_token');
      const res = await fetch('/api/admin/airdrop', {
        headers: { authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // We need to fetch presale purchases separately
      const presaleRes = await fetch('/api/admin/airdrop/user?userId=all', {
        headers: { authorization: `Bearer ${token}` },
      });

      setPurchases([]);
    } catch {
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050816' }}>
        <Loader2 size={36} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-4" style={{ background: '#050816' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center">
            <ShoppingCart size={20} className="text-[#050816]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL Presale</h1>
            <p className="text-xs text-[#7B8BA5]">Presale purchases and stats</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <div className="flex items-center gap-1 mb-1">
              <Coins size={10} className="text-[#FFB800]" />
              <p className="text-[10px] text-[#7B8BA5] uppercase">Total Sold</p>
            </div>
            <p className="text-sm font-bold font-mono text-[#FFB800]">{stats.totalSold}</p>
          </div>
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign size={10} className="text-[#00FFB2]" />
              <p className="text-[10px] text-[#7B8BA5] uppercase">Total USDT</p>
            </div>
            <p className="text-sm font-bold font-mono text-[#00FFB2]">${stats.totalUSDT.toFixed(2)}</p>
          </div>
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <div className="flex items-center gap-1 mb-1">
              <ShoppingCart size={10} className="text-[#00E5FF]" />
              <p className="text-[10px] text-[#7B8BA5] uppercase">Purchases</p>
            </div>
            <p className="text-sm font-bold font-mono text-[#00E5FF]">{stats.totalPurchases}</p>
          </div>
        </div>

        {/* Purchases List */}
        <div className="space-y-2">
          <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold">Recent Purchases</p>
          {purchases.length === 0 ? (
            <div className="rounded-xl border border-[rgba(0,229,255,0.08)] p-6 text-center" style={{ background: 'rgba(22,32,52,0.6)' }}>
              <ShoppingCart size={24} className="mx-auto mb-2 text-[#7B8BA5]" />
              <p className="text-sm text-[#7B8BA5]">No purchases yet</p>
            </div>
          ) : (
            <div className="rounded-xl border border-[rgba(0,229,255,0.08)] divide-y divide-[rgba(0,229,255,0.05)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
              {purchases.map(p => (
                <div key={p.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-mono text-white">{p.users?.wallet?.slice(0, 10) || p.user_id.slice(0, 10)}...</p>
                    <p className="text-xs text-[#7B8BA5]">Day {p.day_number} • ${p.price_per_cxl.toFixed(2)}/CXL</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-[#FFB800]">{p.cxl_amount} CXL</p>
                    <p className="text-xs text-[#00FFB2]">${p.total_usdt.toFixed(4)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
