'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { getTransactions } from '@/lib/db';

const formatCxl = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

const tabs = ['Presale Commission', 'CXL Airdrop'];

export default function CxlTransactionsPage() {
  useEffect(() => { document.title = 'CXL Transactions — CYLIX'; }, []);
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('Presale Commission');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cxlBalance, setCxlBalance] = useState<any>(null);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [txs, statsRes, levelsRes] = await Promise.all([
          getTransactions(user.id),
          fetch(`/api/airdrop/stats?userId=${user.id}`).then(r => r.json()).catch(() => null),
          fetch(`/api/airdrop/levels?userId=${user.id}`).then(r => r.json()).catch(() => null),
        ]);
        setTransactions(txs);
        if (statsRes?.balance) setCxlBalance(statsRes.balance);
        if (levelsRes?.levels) setLevels(levelsRes.levels);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const presaleCommissionTxs = transactions.filter(
    (t) => t.type === 'presale_referral' || t.type === 'signup_commission'
  );

  const airdropTxs = transactions.filter(
    (t) => t.type === 'signup_bonus' || t.type === 'presale_purchase'
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">CXL Transactions</h2>
        <p className="text-sm text-[#A8B8D0] mt-1">View your CXL token commissions and airdrop history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? 'bg-[rgba(255,184,0,0.1)] text-[#FFB800]'
                : 'text-[#A8B8D0] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'CXL Airdrop' && <Coins size={12} className="inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Presale Commission' ? (
        <div className="space-y-4">
          {/* CXL Balance Summary */}
          {cxlBalance && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <div className="rounded-xl p-3 border border-[rgba(255,184,0,0.1)]" style={{ background: 'rgba(255,184,0,0.04)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Balance</p>
                <p className="text-sm font-bold font-mono text-[#FFB800]">{formatCxl(cxlBalance.cxl_balance)}</p>
              </div>
              <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.1)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Total Earned</p>
                <p className="text-sm font-bold font-mono text-[#00E5FF]">{formatCxl(cxlBalance.cxl_earned_total)}</p>
              </div>
              <div className="rounded-xl p-3 border border-[rgba(0,255,178,0.1)]" style={{ background: 'rgba(0,255,178,0.04)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Liquid</p>
                <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCxl(cxlBalance.cxl_liquid)}</p>
              </div>
              <div className="rounded-xl p-3 border border-[rgba(123,97,255,0.1)]" style={{ background: 'rgba(123,97,255,0.04)' }}>
                <p className="text-[10px] text-[#7B8BA5] uppercase">Staked</p>
                <p className="text-sm font-bold font-mono text-[#7B61FF]">{formatCxl(cxlBalance.cxl_staked)}</p>
              </div>
            </div>
          )}

          {/* Commission Transactions */}
          <div>
            <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold mb-2">Presale & Signup Commissions</p>
            {presaleCommissionTxs.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,229,255,0.08)' }}>
                <TrendingUp size={24} className="text-[#7B8BA5] mx-auto mb-2 opacity-30" />
                <p className="text-sm text-[#7B8BA5]">No commissions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {presaleCommissionTxs.map((tx: any) => {
                  const isPresale = tx.type === 'presale_referral';
                  const color = isPresale ? '#FFB800' : '#00E5FF';
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                          <TrendingUp size={14} style={{ color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{isPresale ? 'Presale Referral' : 'Signup Commission'}</p>
                          <p className="text-[10px] text-[#7B8BA5]">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono text-[#00FFB2]">
                          +{formatCxl(tx.amount)} CXL
                        </p>
                        <p className="text-[10px] text-[#7B8BA5]">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Level Earnings */}
          <div>
            <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold mb-2">Commission by Level</p>
            <div className="space-y-2">
              {levels.map((level: any) => (
                <div key={level.level} className="flex items-center justify-between p-3 rounded-xl" style={{ background: `${level.color}08`, border: `1px solid ${level.color}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${level.color}15` }}>
                      <span className="text-xs font-bold font-mono" style={{ color: level.color }}>L{level.level}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{level.label}</p>
                      <p className="text-[10px] text-[#7B8BA5]">{level.count} users • {formatCxl(level.rate)} CXL/referral</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-mono" style={{ color: level.color }}>+{formatCxl(level.totalEarned)} CXL</p>
                    <p className="text-[10px] text-[#7B8BA5]">{level.unlocked ? 'Unlocked' : 'Locked'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Airdrop Transactions */}
          <div>
            <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold mb-2">Airdrop Activity</p>
            {airdropTxs.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,229,255,0.08)' }}>
                <Coins size={24} className="text-[#7B8BA5] mx-auto mb-2 opacity-30" />
                <p className="text-sm text-[#7B8BA5]">No airdrop activity yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {airdropTxs.map((tx: any) => {
                  const isBonus = tx.type === 'signup_bonus';
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: isBonus ? 'rgba(255,184,0,0.06)' : 'rgba(0,229,255,0.06)', border: `1px solid ${isBonus ? 'rgba(255,184,0,0.15)' : 'rgba(0,229,255,0.15)'}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: isBonus ? 'rgba(255,184,0,0.15)' : 'rgba(0,229,255,0.15)' }}>
                          {isBonus ? <Coins size={14} className="text-[#FFB800]" /> : <ArrowUpRight size={14} className="text-[#00E5FF]" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{isBonus ? 'Signup Bonus' : 'Presale Purchase'}</p>
                          <p className="text-[10px] text-[#7B8BA5]">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold font-mono ${tx.amount > 0 ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatCxl(Math.abs(tx.amount))} CXL
                        </p>
                        <p className="text-[10px] text-[#7B8BA5]">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
