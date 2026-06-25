'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime, shortenAddress } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getRecentActivity, getMatrixStats } from '@/lib/db';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { SLOTS, MATRIX_LEVELS } from '@/lib/constants';
import Link from 'next/link';
import {
  TrendingUp, Users, Wallet, Orbit, Vault, Activity, Clock,
  DollarSign, BarChart3, Layers, Copy, CheckCheck, Share2,
  Loader2, ChevronRight, Sparkles, Shield, Network, GitBranch,
  Zap, Globe, Gem, ArrowUpRight, ArrowRight, UserPlus,
  RefreshCcw, Target, Leaf, Award,
} from 'lucide-react';

const cosmicBg = 'radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.03) 0%, transparent 60%)';

export default function DashboardPage() {
  const { user, slots, earnings, vault } = useAppStore();
  const { loading } = useInitData();
  const { isConnected } = useAccount();
  const [activities, setActivities] = useState<any[]>([]);
  const [matrixStats, setMatrixStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      getRecentActivity(user.id).then(setActivities);
      getMatrixStats(user.id).then(setMatrixStats);
    }
  }, [user]);

  const activeSlots = slots.filter((s) => s.status === 'active');
  const completedSlots = slots.filter((s) => s.status === 'completed');
  const refLink = user ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${user.referralCode}` : '';
  const totalWithdrawn = earnings.total - (vault?.balance || 0);

  const copyRefLink = () => {
    if (refLink) { navigator.clipboard.writeText(refLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050816' }}>
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-[#00E5FF] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-sm">Loading your cosmic ecosystem...</p>
        </div>
      </div>
    );
  }

  const earningsTotal = earnings.daily + earnings.matrix + earnings.pool + earnings.referral;
  const dailyYield = activeSlots.reduce((s, sl) => s + sl.dailyEarned, 0);

  return (
    <div className="space-y-6" style={{ background: '#050816' }}>
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 border border-[rgba(0,229,255,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(123,97,255,0.05) 100%)' }}>
        <div className="absolute inset-0" style={{ background: cosmicBg }} />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.2)]">
                <span className="text-[#050816] font-black text-lg font-heading">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold font-heading text-white tracking-wider">CYLIX MATRIX DeFi</h1>
                <p className="text-[10px] text-[#00E5FF] tracking-[0.2em] uppercase font-medium">Hybrid Smart Contract Secured Ecosystem</p>
              </div>
            </div>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal, mounted: rkMounted, account }) => (
              <div>
                {!rkMounted ? (
                  <div className="w-36 h-10 rounded-xl bg-[rgba(148,163,184,0.05]" />
                ) : !account ? (
                  <button onClick={openConnectModal} className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] text-sm font-semibold hover:shadow-lg hover:shadow-[rgba(0,229,255,0.2)] transition-all flex items-center gap-2">
                    <Wallet size={15} /> Connect Wallet
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 h-10 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)]">
                    <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
                    <span className="text-sm text-white font-mono">{shortenAddress(account.address)}</span>
                  </div>
                )}
              </div>
            )}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: 'Team Members', value: matrixStats?.total || 0, icon: Users, color: '#00E5FF', suffix: '' },
          { label: 'Matrix Levels', value: matrixStats?.levelFill?.filter((l: any) => l.filled > 0).length || 0, icon: Layers, color: '#7B61FF', suffix: '/11' },
          { label: 'Daily Yield', value: dailyYield, icon: Zap, color: '#00FFB2', prefix: '$' },
          { label: 'Pool Rewards', value: earnings.pool, icon: Globe, color: '#FFB800', prefix: '$' },
          { label: 'Auto Flow', value: vault?.progress || 0, icon: RefreshCcw, color: '#FF5C7A', suffix: '%' },
          { label: 'Withdrawn', value: totalWithdrawn, icon: Wallet, color: '#00E5FF', prefix: '$' },
          { label: 'Balance', value: user?.totalEarned || 0, icon: DollarSign, color: '#00FFB2', prefix: '$' },
          { label: 'Vault', value: user?.ascensionBalance || 0, icon: Vault, color: '#FFB800', prefix: '$' },
        ].map((s, i) => {
          const Icon = s.icon;
          const val = typeof s.value === 'number' ? (s.prefix || '') + (s.suffix === '%' ? s.value.toFixed(1) : s.value.toLocaleString()) + (s.suffix && s.suffix !== '%' ? s.suffix : s.suffix || '') : s.value;
          return (
            <Card key={i} className="group hover:border-[rgba(0,229,255,0.15)] transition-all duration-300">
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">{s.label}</span>
                  <Icon size={14} style={{ color: s.color }} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-base font-bold font-mono text-white truncate">{val}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Referral Link Section */}
      <Card className="border-[rgba(0,229,255,0.06)] overflow-hidden">
        <div className="relative p-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.03) 0%, rgba(123,97,255,0.03) 100%)' }}>
          <div className="flex items-center gap-2 mb-2">
            <UserPlus size={14} className="text-[#00E5FF]" />
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Your Referral Link</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-lg bg-[rgba(11,16,32,0.6)] border border-[rgba(0,229,255,0.06)] text-sm text-[#94A3B8] font-mono truncate">
              {refLink || 'Connect wallet to get your link'}
            </div>
            <button onClick={copyRefLink} className="w-9 h-9 rounded-lg bg-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.15)] flex items-center justify-center transition-all">
              {copied ? <CheckCheck size={15} className="text-[#00FFB2]" /> : <Copy size={15} className="text-[#00E5FF]" />}
            </button>
            <button className="w-9 h-9 rounded-lg bg-[rgba(123,97,255,0.1)] hover:bg-[rgba(123,97,255,0.15)] flex items-center justify-center transition-all">
              <Share2 size={15} className="text-[#7B61FF]" />
            </button>
          </div>
        </div>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings + Matrix Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Breakdown */}
          <Card className="border-[rgba(0,229,255,0.06)]">
            <div className="p-5 border-b border-[rgba(148,163,184,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} className="text-[#00E5FF]" />
                  <h3 className="text-sm font-semibold text-white">Cosmic Yield Engine</h3>
                </div>
                <Link href="/earnings" className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1">
                  View All <ChevronRight size={10} />
                </Link>
              </div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'Daily Cosmic', value: earnings.daily, color: '#00E5FF' },
                  { label: 'Matrix', value: earnings.matrix, color: '#7B61FF' },
                  { label: 'Apex Pool', value: earnings.pool, color: '#00FFB2' },
                  { label: 'Referral', value: earnings.referral, color: '#FF5C7A' },
                  { label: 'Ascension', value: earnings.ascension, color: '#FFB800' },
                  { label: 'Total', value: earnings.total, color: '#fff' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-[rgba(11,16,32,0.4)] border border-[rgba(148,163,184,0.03)]">
                    <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-bold font-mono" style={{ color: item.color }}>{formatCurrency(item.value)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* 11-Layer Matrix Visualization + Spillover */}
          <Card className="border-[rgba(0,229,255,0.06)]">
            <div className="p-5 border-b border-[rgba(148,163,184,0.05)]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GitBranch size={16} className="text-[#00E5FF]" />
                  <h3 className="text-sm font-semibold text-white">11-Layer Matrix &amp; Spillover</h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-[#94A3B8]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00E5FF]" /> Directs</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7B61FF]" /> Spillover</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-1.5">
                {MATRIX_LEVELS.map((ml) => {
                  const fill = matrixStats?.levelFill?.find((l: any) => l.level === ml.level);
                  const filled = fill?.filled || 0;
                  const total = fill?.total || [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024][ml.level - 1];
                  const percent = total > 0 ? (filled / total) * 100 : 0;
                  return (
                    <div key={ml.level} className="flex items-center gap-3 py-1.5">
                      <div className="w-16 text-[10px] text-[#94A3B8] font-mono shrink-0">Lvl {ml.level}</div>
                      <div className="flex-1 h-2.5 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(percent, 100)}%`, background: ml.level <= 2 ? 'linear-gradient(90deg, #00E5FF, #7B61FF)' : 'linear-gradient(90deg, #7B61FF, #FF5C7A)' }} />
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-[10px] text-white font-mono">{filled}/{total}</span>
                      </div>
                      <div className="w-12 text-right">
                        <span className="text-[10px] text-[#00E5FF] font-mono">{ml.percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {matrixStats && (
                <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-[rgba(148,163,184,0.05)]">
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-[#00E5FF]">{matrixStats.totalSponsored}</p>
                    <p className="text-[10px] text-[#94A3B8]">Level 1 Nodes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-[#7B61FF]">{matrixStats.spilloverCount}</p>
                    <p className="text-[10px] text-[#94A3B8]">Spillover</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold font-mono text-[#00FFB2]">{matrixStats.directsCount}</p>
                    <p className="text-[10px] text-[#94A3B8]">Direct Referrals</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card className="border-[rgba(0,229,255,0.06)]">
            <div className="p-5 border-b border-[rgba(148,163,184,0.05)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-[#00E5FF]" />
                  <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
                </div>
                <Link href="/transactions" className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1">
                  View All <ChevronRight size={10} />
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(148,163,184,0.05)]">
                    <th className="text-left px-4 py-3 text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Description</th>
                    <th className="text-right px-4 py-3 text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Amount</th>
                    <th className="text-right px-4 py-3 text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-8 text-[#94A3B8] text-xs">No transactions yet</td></tr>
                  ) : activities.slice(0, 5).map((tx) => (
                    <tr key={tx.id} className="border-b border-[rgba(148,163,184,0.03)] hover:bg-[rgba(0,229,255,0.02)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.type.includes('earning') || tx.type === 'daily_earning' ? 'bg-[rgba(0,255,178,0.08)]' : tx.type === 'slot_purchase' ? 'bg-[rgba(0,229,255,0.08)]' : tx.type === 'ascension_credit' ? 'bg-[rgba(255,184,0,0.08)]' : 'bg-[rgba(123,97,255,0.08)]'}`}>
                            {tx.type.includes('earning') ? <TrendingUp size={11} className="text-[#00FFB2]" /> : tx.type === 'slot_purchase' ? <Orbit size={11} className="text-[#00E5FF]" /> : <ArrowUpRight size={11} className="text-[#7B61FF]" />}
                          </div>
                          <span className="text-xs text-white capitalize">{tx.type.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#94A3B8]">{tx.description || '-'}</td>
                      <td className="px-4 py-3 text-right text-xs font-mono text-[#00FFB2]">+{formatCurrency(tx.amount)}</td>
                      <td className="px-4 py-3 text-right text-[10px] text-[#94A3B8]">{formatRelativeTime(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Smart Upgrade Vault */}
          <Card className="border-[rgba(0,229,255,0.06)] overflow-hidden">
            <div className="p-5" style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.03) 0%, rgba(0,229,255,0.03) 100%)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Vault size={16} className="text-[#FFB800]" />
                  <h3 className="text-sm font-semibold text-white">Smart Upgrade Vault</h3>
                </div>
                <Link href="/upgrade-vault">
                  <ArrowRight size={14} className="text-[#FFB800] hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <p className="text-2xl font-bold font-mono text-[#FFB800] mb-1">{formatCurrency(user?.ascensionBalance || 0)}</p>
              <p className="text-[10px] text-[#94A3B8] mb-3">50% of daily yield auto-saved for ascension</p>
              {vault && (
                <>
                  <div className="h-2 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(vault.progress, 100)}%`, background: 'linear-gradient(90deg, #FFB800, #7B61FF)' }} />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#94A3B8]">Next: {vault.nextSlot}</span>
                    <span className="text-[#FFB800] font-mono">{formatCurrency(vault.nextSlotCost)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Package Progress Tracker */}
          <Card className="border-[rgba(0,229,255,0.06)]">
            <div className="p-5 border-b border-[rgba(148,163,184,0.05)]">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-[#00E5FF]" />
                <h3 className="text-sm font-semibold text-white">Slot Progress</h3>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {slots.filter(s => s.status === 'active').slice(0, 4).map((s) => (
                <div key={s.id}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white font-medium">{s.slotName}</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{formatCurrency(s.earned)} / {formatCurrency(s.maxCap)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(s.progress, 100)}%`, background: `linear-gradient(90deg, ${s.progress < 50 ? '#00E5FF' : s.progress < 80 ? '#7B61FF' : '#FFB800'}, ${s.progress < 50 ? '#7B61FF' : s.progress < 80 ? '#FFB800' : '#00FFB2'})` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#94A3B8] mt-0.5">
                    <span>+{formatCurrency(s.dailyEarned)}/day</span>
                    <span>{s.progress.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
              {activeSlots.length === 0 && <p className="text-xs text-[#94A3B8] text-center py-4">No active slots. <Link href="/slots" className="text-[#00E5FF]">Buy one now</Link></p>}
            </div>
          </Card>

          {/* Community Growth */}
          <Card className="border-[rgba(0,229,255,0.06)]">
            <div className="p-5" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.03) 0%, rgba(0,229,255,0.03) 100%)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Award size={16} className="text-[#7B61FF]" />
                <h3 className="text-sm font-semibold text-white">Community Growth</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.4)] text-center">
                  <Users size={18} className="text-[#00E5FF] mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{matrixStats?.total || 0}</p>
                  <p className="text-[10px] text-[#94A3B8]">Total Team</p>
                </div>
                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.4)] text-center">
                  <Network size={18} className="text-[#7B61FF] mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{matrixStats?.levelFill?.filter((l: any) => l.filled > 0).length || 0}</p>
                  <p className="text-[10px] text-[#94A3B8]">Active Levels</p>
                </div>
                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.4)] text-center">
                  <Leaf size={18} className="text-[#00FFB2] mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{matrixStats?.spilloverCount || 0}</p>
                  <p className="text-[10px] text-[#94A3B8]">Spillover</p>
                </div>
                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.4)] text-center">
                  <UserPlus size={18} className="text-[#FFB800] mx-auto mb-1" />
                  <p className="text-lg font-bold font-mono text-white">{matrixStats?.directsCount || 0}</p>
                  <p className="text-[10px] text-[#94A3B8]">Directs</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/slots">
              <div className="p-4 rounded-xl bg-[rgba(0,229,255,0.04)] border border-[rgba(0,229,255,0.08)] hover:bg-[rgba(0,229,255,0.08)] transition-all text-center cursor-pointer">
                <Orbit size={18} className="text-[#00E5FF] mx-auto mb-1" />
                <p className="text-xs text-white font-medium">Buy Slot</p>
              </div>
            </Link>
            <Link href="/matrix">
              <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.04)] border border-[rgba(123,97,255,0.08)] hover:bg-[rgba(123,97,255,0.08)] transition-all text-center cursor-pointer">
                <GitBranch size={18} className="text-[#7B61FF] mx-auto mb-1" />
                <p className="text-xs text-white font-medium">Matrix View</p>
              </div>
            </Link>
            <Link href="/upgrade-vault">
              <div className="p-4 rounded-xl bg-[rgba(255,184,0,0.04)] border border-[rgba(255,184,0,0.08)] hover:bg-[rgba(255,184,0,0.08)] transition-all text-center cursor-pointer">
                <Vault size={18} className="text-[#FFB800] mx-auto mb-1" />
                <p className="text-xs text-white font-medium">Upgrade Vault</p>
              </div>
            </Link>
            <Link href="/referrals">
              <div className="p-4 rounded-xl bg-[rgba(0,255,178,0.04)] border border-[rgba(0,255,178,0.08)] hover:bg-[rgba(0,255,178,0.08)] transition-all text-center cursor-pointer">
                <Users size={18} className="text-[#00FFB2] mx-auto mb-1" />
                <p className="text-xs text-white font-medium">Referrals</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-[rgba(148,163,184,0.05)] pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-[#94A3B8]">
          <span className="text-[#00E5FF]">11-Layer Matrix</span>
          <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
          <span>Auto Flow Ecosystem</span>
          <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
          <span className="text-[#7B61FF]">Cosmic Yield Engine</span>
          <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
          <span>Global Apex Pool</span>
          <span className="w-1 h-1 rounded-full bg-[#94A3B8]" />
          <span className="text-[#94A3B8]">CYLIX &copy; 2026</span>
        </div>
      </div>
    </div>
  );
}
