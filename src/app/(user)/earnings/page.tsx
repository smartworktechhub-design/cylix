'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getUserByWallet, getUserEarnings } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import {
  TrendingUp, GitBranch, Gift, Wallet, Activity,
  Clock, Loader2, Rocket
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const earningCards = [
  { key: 'daily' as const, label: 'Daily Earnings', icon: TrendingUp, color: '#00E5FF', desc: 'Slot daily yield payouts' },
  { key: 'matrix' as const, label: 'Matrix Commissions', icon: GitBranch, color: '#7B61FF', desc: '11-level unilevel commissions' },
  { key: 'referral' as const, label: 'Referral Bonuses', icon: Gift, color: '#FF5C7A', desc: 'Direct referral rewards' },
  { key: 'pool' as const, label: 'Apex Pool', icon: Activity, color: '#00FFB2', desc: 'Pool distribution earnings' },
  { key: 'ascension' as const, label: 'Ascension Credits', icon: Rocket, color: '#FFB800', desc: '50% daily yield to vault' },
];

export default function EarningsPage() {
  const { earnings, setEarnings } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const data = await getUserEarnings(user.id);
          setEarnings(data);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setEarnings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const maxEarning = Math.max(
    earnings.daily, earnings.matrix, earnings.referral,
    earnings.pool, earnings.ascension, 1
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Earnings</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Track all your income sources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {earningCards.map((card) => {
          const Icon = card.icon;
          const value = earnings[card.key];
          const share = earnings.total > 0 ? (value / earnings.total) * 100 : 0;
          return (
            <Card key={card.key} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{card.label}</span>
                    <p className="text-2xl font-bold font-mono mt-1" style={{ color: card.color }}>
                      {formatCurrency(value)}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                    <Icon size={20} style={{ color: card.color }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#94A3B8]">{card.desc}</span>
                  <span className="text-xs font-mono text-[#94A3B8]">{share.toFixed(1)}%</span>
                </div>
                <Progress value={value} max={maxEarning} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Earnings Distribution</h3>
              </div>
              <Badge variant="info" className="text-xs">Total: {formatCurrency(earnings.total)}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {earnings.total === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-8">No earnings yet</p>
            ) : (
              <div className="space-y-4">
                {earningCards.map((card) => {
                  const Icon = card.icon;
                  const value = earnings[card.key];
                  const share = (value / earnings.total) * 100;
                  if (value === 0) return null;
                  return (
                    <div key={card.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${card.color}15` }}>
                            <Icon size={14} style={{ color: card.color }} />
                          </div>
                          <span className="text-sm text-white">{card.label}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono" style={{ color: card.color }}>{formatCurrency(value)}</span>
                          <span className="text-xs font-mono text-[#94A3B8] w-12 text-right">{share.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="relative h-3 rounded-full bg-[rgba(11,16,32,0.5)] overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{ width: `${share}%`, background: card.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
