'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getChampionsPoolState, getCommunityPoolState } from '@/lib/db';
import { ALLOCATION, POOL_SPLIT } from '@/lib/constants';
import type { ChampionsPoolState, CommunityPoolState } from '@/types';
import {
  Trophy, Clock, Users, Loader2, Timer,
  DollarSign, TrendingUp, History, UserCheck,
  Crown, Medal, Zap,
} from 'lucide-react';

type PoolTab = 'champions' | 'community';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

const shortenAddress = (addr?: string) => {
  if (!addr) return '---';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};

export default function ApexPoolPage() {
  const [tab, setTab] = useState<PoolTab>('champions');
  const [champions, setChampions] = useState<ChampionsPoolState>({
    totalFund: 0, lastDistribution: '', nextDistributionTime: '',
    todayDistribution: 0, lifetimeDistribution: 0,
    leaderboard: [], topCount: 10,
  });
  const [community, setCommunity] = useState<CommunityPoolState>({
    totalFund: 0, lastDistribution: '', nextDistributionTime: '',
    todayDistribution: 0, lifetimeDistribution: 0,
    qualifiedCount: 0, perPerson: 0, history: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, cm] = await Promise.all([
          getChampionsPoolState(),
          getCommunityPoolState(),
        ]);
        setChampions(c);
        setCommunity(cm);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const state = tab === 'champions' ? champions : community;
  const nextDist = state.nextDistributionTime ? new Date(state.nextDistributionTime) : null;
  const now = new Date();
  const diffMs = nextDist ? nextDist.getTime() - now.getTime() : 0;
  const diffH = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffM = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Global Apex Pool</h2>
        <p className="text-sm text-[#94A3B8] mt-1">
          <span className="text-[#00E5FF]">{POOL_SPLIT.championsPercent}% Champions</span>
          {' + '}
          <span className="text-[#7B61FF]">{POOL_SPLIT.communityPercent}% Community</span>
          {' | '}{ALLOCATION.poolPercent}% of purchases
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('champions')}
          className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border',
            tab === 'champions'
              ? 'bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.2)] text-[#00E5FF]'
              : 'border-transparent text-[#4A5568] hover:text-white hover:bg-[rgba(0,229,255,0.03)]')}>
          <Crown size={16} /> Champions Pool
        </button>
        <button onClick={() => setTab('community')}
          className={cn('flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border',
            tab === 'community'
              ? 'bg-[rgba(123,97,255,0.08)] border-[rgba(123,97,255,0.2)] text-[#7B61FF]'
              : 'border-transparent text-[#4A5568] hover:text-white hover:bg-[rgba(123,97,255,0.03)]')}>
          <Users size={16} /> Community Pool
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Pool Balance</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: tab === 'champions' ? 'rgba(0,229,255,0.1)' : 'rgba(123,97,255,0.1)' }}>
                <DollarSign size={16} className={tab === 'champions' ? 'text-[#00E5FF]' : 'text-[#7B61FF]'} />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(state.totalFund)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {tab === 'champions' ? `${POOL_SPLIT.championsPercent}% of 10% pool` : `${POOL_SPLIT.communityPercent}% of 10% pool`}
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                {tab === 'champions' ? 'Top Performers' : 'Qualified Members'}
              </span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: tab === 'champions' ? 'rgba(255,184,0,0.1)' : 'rgba(0,255,178,0.1)' }}>
                {tab === 'champions' ? <Medal size={16} className="text-[#FFB800]" /> : <UserCheck size={16} className="text-[#00FFB2]" />}
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {tab === 'champions' ? formatNumber(champions.leaderboard.length) : formatNumber(community.qualifiedCount)}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              {tab === 'champions' ? `Top ${champions.topCount} daily performers` : 'Users with 1+ active direct'}
            </p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Today's Distribution</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: tab === 'champions' ? 'rgba(0,255,178,0.1)' : 'rgba(0,255,178,0.1)' }}>
                <TrendingUp size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00FFB2]">{formatCurrency(state.todayDistribution)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Lifetime Distributed</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: tab === 'champions' ? 'rgba(123,97,255,0.1)' : 'rgba(123,97,255,0.1)' }}>
                <History size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#7B61FF]">{formatCurrency(state.lifetimeDistribution)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer size={18} className={tab === 'champions' ? 'text-[#00E5FF]' : 'text-[#7B61FF]'} />
              <h3 className="text-lg font-semibold text-white font-heading">
                {tab === 'champions' ? 'Champions Pool' : 'Active Community Pool'}
              </h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer + Info */}
            <div className="p-6 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#94A3B8]">Next Distribution Timer</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} className={tab === 'champions' ? 'text-[#00E5FF]' : 'text-[#7B61FF]'} />
                  <span className="text-lg font-mono font-bold text-white">{diffH}h {diffM}m</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-[#94A3B8]" />
                <span className="text-xs text-[#94A3B8]">
                  {tab === 'champions'
                    ? `${champions.leaderboard.length} top performers share ${formatCurrency(champions.totalFund)}`
                    : `${community.qualifiedCount} eligible members share ${formatCurrency(community.totalFund)}`
                  }
                </span>
              </div>
              {tab === 'community' && community.qualifiedCount > 0 && community.totalFund > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]">
                  <span className="text-xs text-[#00FFB2]">
                    Estimated per person: <strong>{formatCurrency(community.totalFund / community.qualifiedCount)}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Champions Leaderboard */}
            {tab === 'champions' && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown size={16} className="text-[#FFB800]" />
                  <h4 className="text-sm font-semibold text-white font-heading">Today's Top Performers</h4>
                </div>
                {champions.leaderboard.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] text-center">
                    <Medal size={24} className="mx-auto mb-2 text-[#4A5568]" />
                    <p className="text-sm text-[#94A3B8]">No performers today yet</p>
                    <p className="text-xs text-[#4A5568] mt-1">Activity resets every 24 hours</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {champions.leaderboard.map((entry) => {
                      const rankColor = entry.rank === 1 ? '#FFB800' : entry.rank === 2 ? '#94A3B8' : entry.rank === 3 ? '#CD7F32' : '#4A5568';
                      return (
                        <div key={entry.userId} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.03)]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                              style={{ background: `${rankColor}15`, color: rankColor }}>
                              #{entry.rank}
                            </div>
                            <div>
                              <p className="text-sm font-mono font-semibold text-white">{shortenAddress(entry.wallet)}</p>
                              <div className="flex items-center gap-3 text-[10px] text-[#4A5568] mt-0.5">
                                <span>{entry.referrals24h} refs</span>
                                <span>{entry.purchases24h} buys</span>
                                <span>${entry.volume24h.toFixed(0)} vol</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-bold" style={{ color: rankColor }}>{formatCurrency(entry.reward)}</p>
                            <p className="text-[10px] text-[#4A5568]">score: {entry.score.toFixed(0)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Community Info */}
            {tab === 'community' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-xs text-[#94A3B8] mb-1">Last Distribution</p>
                  {community.lastDistribution ? (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#94A3B8]" />
                      <span className="text-sm font-mono text-white">{formatDate(community.lastDistribution)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#94A3B8]">No distribution yet</span>
                  )}
                </div>
                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-xs text-[#94A3B8] mb-1">Pool Allocation</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#7B61FF]" />
                    <span className="text-sm font-mono text-white">{ALLOCATION.poolPercent}% of purchases</span>
                  </div>
                </div>
              </div>
            )}

            {/* Community Distribution History */}
            {tab === 'community' && community.history.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <History size={14} className="text-[#7B61FF]" />
                  <h4 className="text-sm font-semibold text-white font-heading">Distribution History</h4>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {community.history.map((d) => (
                    <div key={d.id} className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(123,97,255,0.03)]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#94A3B8]">{formatDate(d.distributedAt)}</span>
                        <span className="text-xs font-mono text-[#FFB800]">{formatCurrency(d.totalFund)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#4A5568]">{d.qualifiedCount} qualifiers</span>
                        <span className="text-[#00FFB2] font-mono">{formatCurrency(d.perPerson)} each</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Champions Distribution History hint */}
            {tab === 'champions' && champions.lifetimeDistribution > 0 && (
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] text-center">
                <p className="text-xs text-[#94A3B8]">
                  <span className="text-[#FFB800]">{formatCurrency(champions.lifetimeDistribution)}</span> distributed to champions to date
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar — Qualifiers / How It Works */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap size={18} className={tab === 'champions' ? 'text-[#FFB800]' : 'text-[#00E5FF]'} />
              <h3 className="text-lg font-semibold text-white font-heading">
                {tab === 'champions' ? 'How to Win' : 'Eligibility'}
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            {tab === 'champions' ? (
              <div className="space-y-3">
                <p className="text-xs text-[#94A3B8]">Top {champions.topCount} performers every 24h share the Champions Pool:</p>
                <div className="space-y-2">
                  {[
                    { label: 'Referrals', desc: '10 pts each', icon: Users, color: '#00E5FF' },
                    { label: 'Package Purchases', desc: '5 pts each', icon: TrendingUp, color: '#00FFB2' },
                    { label: 'Business Volume', desc: '1 pt per $1K', icon: DollarSign, color: '#FFB800' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.03)]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}10` }}>
                        <item.icon size={14} className={`text-[${item.color}]`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-[#4A5568]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#4A5568] mt-2">Resets every 24 hours. Rewards auto-distributed.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[#94A3B8]">Requirements to qualify for Community Pool:</p>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(0,255,178,0.03)] border border-[rgba(0,255,178,0.06)]">
                  <UserCheck size={16} className="text-[#00FFB2]" />
                  <div>
                    <p className="text-xs font-semibold text-white">At least 1 active direct referral</p>
                    <p className="text-[10px] text-[#4A5568]">Must have sponsored at least one active member</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(0,229,255,0.03)] border border-[rgba(0,229,255,0.06)]">
                  <Zap size={16} className="text-[#00E5FF]" />
                  <div>
                    <p className="text-xs font-semibold text-white">24h qualifying activity</p>
                    <p className="text-[10px] text-[#4A5568]">One activity per cycle (referral, purchase, upgrade, or re-buy)</p>
                  </div>
                </div>
                <p className="text-[10px] text-[#4A5568] mt-2">Rewards shared equally among all eligible members.</p>
              </div>
            )}

            {/* Fund split card */}
            <div className="mt-4 p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <p className="text-xs text-[#94A3B8] mb-2">Distribution Split</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">50% Wallet</span>
                  <span className="text-[10px] text-[#00E5FF]">Instantly credited</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">50% Ascension Vault</span>
                  <span className="text-[10px] text-[#7B61FF]">Auto-upgrade fund</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}