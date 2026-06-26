'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getMatrixStats, getMatrixTree } from '@/lib/db';
import { SLOTS, SLOT_CONFIG, REBUY_MAX, APP_VERSION } from '@/lib/constants';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUsdtBalance } from '@/lib/usdt';
import {
  Loader2, Users, GitBranch, TrendingUp, Orbit,
  ArrowUpRight, Shield, Coins, Copy, CheckCheck,
  Link as LinkIcon, Lock, Activity, User,
  Timer, Trophy, Layers, ChevronRight,
  ExternalLink, EyeOff, RotateCcw, Globe,
} from 'lucide-react';

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(' ');

const formatCurrency = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(2) + 'K';
  return '$' + n.toFixed(2);
};

const shortenAddress = (addr?: string) => {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};

const PLACEMENT_LABELS: Record<string, string> = {
  root: 'Self', left: 'Direct', right: 'Spillover',
};

export default function DashboardPage() {
  const { user, slots, earnings, vault, transactions, adminStats } = useAppStore();
  const { loading } = useInitData();
  const { isConnected, address } = useAccount();
  const pathname = usePathname();
  const { balance: usdtBalance } = useUsdtBalance(address);
  const [matrixStats, setMatrixStats] = useState<any>(null);
  const [refCopied, setRefCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [matrixTreeNodes, setMatrixTreeNodes] = useState<any[]>([]);
  const [matrixView, setMatrixView] = useState<'explorer' | 'activity'>('explorer');

  useEffect(() => {
    if (user) {
      getMatrixStats(user.id).then(setMatrixStats);
      getMatrixTree(user.id).then(tree => {
        if (!tree) return;
        const levels: any[] = [];
        for (let lvl = 1; lvl <= 11; lvl++) levels.push({ level: lvl, nodes: [] });
        function traverse(node: any, level: number) {
          if (!node) return;
          const lvlIdx = Math.min(level, 11) - 1;
          if (levels[lvlIdx]) {
            levels[lvlIdx].nodes.push({
              id: node.userId, wallet: node.wallet,
              type: node.side || 'root', level,
              position: levels[lvlIdx].nodes.length,
            });
          }
          traverse(node.left, level + 1);
          traverse(node.right, level + 1);
        }
        traverse(tree, 1);
        setMatrixTreeNodes(levels);
      });
    }
  }, [user]);

  const activeSlots = slots.filter(s => s.status === 'active');
  const completedSlots = slots.filter(s => s.status === 'completed');
  const activeSlotIds = new Set(activeSlots.map(s => s.slotId));
  const completedSlotIds = new Set(completedSlots.map(s => s.slotId));
  const ownedSlotIds = new Set([...activeSlotIds, ...completedSlotIds]);

  const totalEarnings = earnings.total;
  const availableBalance = Number(user?.totalEarned || 0) - Number(user?.ascensionBalance || 0);
  const dailyYield = activeSlots.reduce((sum, s) => sum + s.dailyEarned, 0);
  const refCode = user?.referralCode || (address ? 'CXL' + address.slice(2, 6).toUpperCase() : '');

  const currentActiveSlotDef = SLOTS.find(s => activeSlotIds.has(s.id));
  const currentActiveSlot = activeSlots.find(s => s.slotId === currentActiveSlotDef?.id);
  const lastOwnedIndex = Math.max(...[...ownedSlotIds].map(id => SLOTS.findIndex(s => s.id === id)), -1);
  const nextSlotDef = lastOwnedIndex >= 0 ? SLOTS[lastOwnedIndex + 1] : SLOTS[0];

  const isSlotLocked = (index: number) => {
    if (index === 0) return false;
    if (lastOwnedIndex >= index) return false;
    return !ownedSlotIds.has(SLOTS[index - 1].id);
  };

  const getGradient = (orbit: number) => {
    if (orbit <= 3) return { from: '#00E5FF', to: '#00B4D8' };
    if (orbit <= 7) return { from: '#7B61FF', to: '#C084FC' };
    return { from: '#FFB800', to: '#FF5C7A' };
  };

  const communityStats = {
    teamCount: matrixStats?.total || 0,
    directsCount: matrixStats?.directsCount || 0,
  };
  const rebuyCount = (slotId: string) => slots.filter(s => s.slotId === slotId).length;
  const autoFlowStats = [
    { label: 'Direct', value: matrixStats?.directsCount || 0, color: '#00E5FF' },
    { label: 'Spillover', value: Math.max(0, (matrixStats?.total || 0) - (matrixStats?.directsCount || 0)), color: '#7B61FF' },
    { label: 'Crossline', value: 0, color: '#00FFB2' },
    { label: 'Global', value: 0, color: '#FFB800' },
  ];

  const recentTxns = transactions.slice(0, 5);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/matrix', label: 'Matrix', icon: 'matrix' },
    { href: '/slots', label: 'Packages', icon: 'packages' },
    { href: '/earnings', label: 'Income', icon: 'income' },
    { href: '/referrals', label: 'Team', icon: 'team' },
    { href: '/withdrawals', label: 'Wallet', icon: 'wallet' },
  ];

  const NavIcon = ({ id, active }: { id: string; active: boolean }) => {
    const cls = active ? 'text-[#00E5FF]' : 'text-[#4A5568]';
    const sz = 20;
    switch (id) {
      case 'dashboard': return <svg className={cls} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
      case 'matrix': return <svg className={cls} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
      case 'packages': return <Orbit size={sz} className={cls} />;
      case 'income': return <svg className={cls} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
      case 'team': return <svg className={cls} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
      case 'wallet': return <svg className={cls} width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050816' }}>
        <Loader2 size={36} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#050816' }}>

      {/* ====== HEADER ====== */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,229,255,0.03)] to-transparent pointer-events-none" />
        <div className="px-4 pt-4 pb-3 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.15)]">
                <Orbit size={20} className="text-[#050816]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-white font-heading" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX MATRIX DeFi</h1>
                  <span className="text-[6px] px-1 py-0.5 rounded bg-[rgba(0,229,255,0.08)] text-[#00E5FF] font-mono font-bold">v{APP_VERSION}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Shield size={10} className="text-[#00FFB2]" />
                  <span className="text-[8px] text-[#00FFB2] font-medium tracking-wider">SMART CONTRACT SECURED</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                <User size={14} className="text-[#050816]" />
              </div>
              <div className="text-right">
                <p className="text-[8px] text-[#4A5568] font-mono">ID: {user?.id?.slice(0, 8) || '---'}</p>
                <p className="text-[9px] text-[#00E5FF] font-mono">{shortenAddress(address) || 'Not Connected'}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.06)]" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.04), rgba(123,97,255,0.04))' }}>
              <p className="text-[8px] text-[#4A5568] uppercase tracking-wider mb-1">Total Earnings</p>
              <p className="text-lg font-bold text-white font-mono">{formatCompact(totalEarnings)}</p>
              <p className="text-[8px] text-[#00E5FF] mt-0.5">+{formatCurrency(dailyYield)}/day</p>
            </div>
            <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(18,26,43,0.6)' }}>
              <p className="text-[8px] text-[#4A5568] uppercase tracking-wider mb-1">Available</p>
              <p className="text-lg font-bold text-[#00FFB2] font-mono">{formatCompact(availableBalance)}</p>
              <p className="text-[8px] text-[#4A5568] mt-0.5">{formatCurrency(user?.ascensionBalance || 0)} vault</p>
            </div>
            <Link href="/withdrawals" className="rounded-xl p-3 border border-[rgba(0,229,255,0.06)] flex flex-col items-center justify-center cursor-pointer hover:border-[rgba(0,229,255,0.2)] transition-all" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(123,97,255,0.08))' }}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] flex items-center justify-center mb-1 shadow-md shadow-[rgba(0,229,255,0.15)]">
                <ArrowUpRight size={16} className="text-[#050816]" />
              </div>
              <span className="text-[9px] font-bold text-white">Withdraw</span>
            </Link>
          </div>
          {/* Summary boxes */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="rounded-lg p-2 border border-[rgba(0,229,255,0.04)] text-center" style={{ background: 'rgba(0,229,255,0.02)' }}>
              <p className="text-[6px] text-[#4A5568] uppercase tracking-wider mb-0.5">Team / Direct</p>
              <p className="text-xs font-mono font-bold text-white">{communityStats.teamCount}<span className="text-[#4A5568] text-[8px]">/{communityStats.directsCount}</span></p>
            </div>
            <div className="rounded-lg p-2 border border-[rgba(0,229,255,0.04)] text-center" style={{ background: 'rgba(0,229,255,0.02)' }}>
              <p className="text-[6px] text-[#4A5568] uppercase tracking-wider mb-0.5">Community</p>
              <p className="text-xs font-mono font-bold text-[#00E5FF]">{adminStats?.totalUsers || 0}</p>
            </div>
            <div className="rounded-lg p-2 border border-[rgba(0,229,255,0.04)] text-center" style={{ background: 'rgba(0,229,255,0.02)' }}>
              <p className="text-[6px] text-[#4A5568] uppercase tracking-wider mb-0.5">24h Growth</p>
              <p className="text-xs font-mono font-bold text-[#00FFB2]">+{adminStats?.newUsersToday || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ====== REFERRAL BAR ====== */}
      {refCode && (
        <div className="px-4 mb-2">
          <div className="rounded-lg p-2.5 border border-[rgba(0,229,255,0.05)] flex items-center justify-between gap-2" style={{ background: 'rgba(0,229,255,0.02)' }}>
            <div className="flex items-center gap-2 min-w-0">
              <LinkIcon size={12} className="text-[#00E5FF] shrink-0" />
              <span className="text-[7px] text-[#4A5568] uppercase tracking-wider shrink-0">REF</span>
              <code className="text-[10px] font-mono font-bold text-[#00E5FF] truncate">{refCode}</code>
            </div>
            <button onClick={() => { const link = `${location.origin}/?ref=${refCode}`; navigator.clipboard.writeText(link); setRefCopied(true); setTimeout(() => setRefCopied(false), 2000); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(0,229,255,0.06)] hover:bg-[rgba(0,229,255,0.1)] transition-all text-[8px] text-[#00E5FF] font-semibold shrink-0">
              {refCopied ? <><CheckCheck size={10} /> Copied</> : <><Copy size={10} /> Copy Link</>}
            </button>
          </div>
        </div>
      )}

      {/* ====== 11 PACKAGES ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={12} className="text-[#00E5FF]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Packages</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.15)] to-transparent" />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {SLOTS.map((slotDef, index) => {
            const slotRecords = slots.filter(s => s.slotId === slotDef.id);
            const isActive = slotRecords.some(s => s.status === 'active');
            const isCompleted = slotRecords.some(s => s.status === 'completed');
            const isLockedPermanent = slotRecords.some(s => s.status === 'locked');
            const isOwned = isActive || isCompleted || isLockedPermanent;
            const isLocked = isSlotLocked(index) && !isOwned;
            const isCleared = !isOwned && !isLocked && lastOwnedIndex >= index;
            const grad = getGradient(slotDef.orbit);
            const totalPurchases = slotRecords.length;
            const progressPercent = currentActiveSlot && currentActiveSlot.slotId === slotDef.id
              ? (currentActiveSlot.earned / currentActiveSlot.maxCap) * 100 : 0;

            if (isLockedPermanent) {
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${grad.from}06, ${grad.to}03)`, border: `1px solid ${grad.from}15`, opacity: 0.4 }}>
                  <Lock size={12} className="text-[#4A5568] mb-1" />
                  <p className="text-[10px] font-bold text-[#4A5568] font-heading">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#4A5568]">{formatCurrency(slotDef.price)}</p>
                  <p className="text-[6px] text-[#4A5568] mt-0.5">5/5 Re-buys</p>
                </div>
              );
            }

            if (isLocked) {
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${grad.from}06, ${grad.to}03)`, border: `1px solid ${grad.from}15`, opacity: 0.3 }}>
                  <Lock size={12} className="text-[#4A5568] mb-1" />
                  <p className="text-[10px] font-bold text-[#4A5568] font-heading">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#4A5568]">{formatCurrency(slotDef.price)}</p>
                </div>
              );
            }

            if (isCompleted) {
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${grad.from}08, ${grad.to}05)`, border: `1px solid ${grad.from}30` }}>
                  <div className="absolute top-1 right-1"><span className="text-[5px] px-1 py-0.5 rounded-full bg-[rgba(0,255,178,0.1)] text-[#00FFB2] font-bold">DONE</span></div>
                  <p className="text-[10px] font-bold text-white font-heading pr-5">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#00FFB2]">{formatCurrency(slotDef.price)}</p>
                  <p className="text-[6px] text-[#00FFB2] mt-0.5">{totalPurchases}/{REBUY_MAX + 1} re-buys</p>
                </div>
              );
            }

            if (isCleared) {
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden opacity-50" style={{ background: `linear-gradient(135deg, ${grad.from}06, ${grad.to}03)`, border: `1px solid ${grad.from}15` }}>
                  <div className="absolute top-1 right-1"><span className="text-[5px] px-1 py-0.5 rounded-full bg-[rgba(0,229,255,0.08)] text-[#00E5FF] font-bold">CLRD</span></div>
                  <p className="text-[10px] font-bold text-white font-heading pr-5">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#4A5568]">{formatCurrency(slotDef.price)}</p>
                </div>
              );
            }

            return (
              <div key={slotDef.id} className="relative rounded-xl overflow-hidden p-3 flex flex-col items-center text-center"
                style={{
                  background: isActive ? `linear-gradient(180deg, ${grad.from}12, transparent)` : `linear-gradient(135deg, ${grad.from}06, ${grad.to}03)`,
                  border: `1.5px solid ${isActive ? grad.from : `${grad.from}30`}`,
                  boxShadow: isActive ? `0 0 18px ${grad.from}20` : 'none',
                  opacity: isActive ? 1 : 0.35,
                  transition: 'all 0.3s ease',
                }}>
                {isActive && (
                  <div className="absolute top-1 right-1"><span className="text-[5px] px-1 py-0.5 rounded-full bg-[rgba(0,229,255,0.12)] text-[#00E5FF] font-bold">LIVE</span></div>
                )}
                <p className="text-[10px] font-bold text-white font-heading pr-5">{slotDef.name}</p>
                <p className="text-[11px] font-mono font-bold text-white mt-0.5">{formatCurrency(slotDef.price)}</p>

                {isActive && currentActiveSlot?.slotId === slotDef.id && (
                  <div className="w-full mt-1.5 space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp size={6} className="text-[#00E5FF]" />
                      <span className="text-[6px] text-[#00E5FF] font-semibold">3% daily</span>
                    </div>
                    <div>
                      <div className="h-1 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(progressPercent, 100)}%`, background: `linear-gradient(90deg, ${grad.from}, ${grad.to})` }} />
                      </div>
                      <div className="flex justify-between text-[5px] text-[#4A5568] mt-0.5">
                        <span>{Math.min(progressPercent, 100).toFixed(0)}%</span>
                        <span>200%</span>
                      </div>
                    </div>
                  </div>
                )}

                {isActive && (
                  <div className="w-full mt-1">
                    <div className="flex gap-0.5">
                      {Array.from({ length: REBUY_MAX + 1 }).map((_, i) => (
                        <div key={i} className="flex-1 h-0.5 rounded-full" style={{ background: i < totalPurchases ? grad.from : `${grad.from}20` }} />
                      ))}
                    </div>
                  </div>
                )}

                {!isOwned && !isCleared && index === lastOwnedIndex + 1 && (
                  <Link href="/slots" className="mt-2 w-full py-1 rounded-lg text-[#050816] text-[7px] font-bold text-center" style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}>
                    BUY
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== MATRIX EXPLORER ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GitBranch size={12} className="text-[#00E5FF]" />
            <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Matrix Explorer</h2>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMatrixView('explorer')}
              className={cn('px-2 py-1 rounded text-[7px] font-semibold transition-all', matrixView === 'explorer' ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]' : 'text-[#4A5568] hover:text-white')}>Tree</button>
            <button onClick={() => setMatrixView('activity')}
              className={cn('px-2 py-1 rounded text-[7px] font-semibold transition-all', matrixView === 'activity' ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]' : 'text-[#4A5568] hover:text-white')}>Activity</button>
          </div>
        </div>

        {matrixView === 'explorer' ? (
          <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3 overflow-x-auto" style={{ background: 'rgba(11,16,32,0.5)' }}>
            <div className="flex flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: '#00E5FF', boxShadow: '0 0 6px rgba(0,229,255,0.4)' }} /><span className="text-[7px] text-[#4A5568]">Self</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00E5FF]" /><span className="text-[7px] text-[#4A5568]">Direct</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#7B61FF]" /><span className="text-[7px] text-[#4A5568]">Spillover</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00FFB2]" /><span className="text-[7px] text-[#4A5568]">Crossline</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#FFB800]" /><span className="text-[7px] text-[#4A5568]">Global</span></div>
            </div>

            {matrixTreeNodes.length === 0 ? (
              <div className="text-center py-6">
                <GitBranch size={20} className="mx-auto mb-2 text-[#4A5568]" />
                <p className="text-[8px] text-[#4A5568]">No matrix data yet</p>
                <p className="text-[7px] text-[#4A5568] mt-1">Invite referrals to build your team</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {matrixTreeNodes.map((level: any) => (
                  <div key={level.level}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[6px] text-[#4A5568] font-mono w-4">L{level.level}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.05)] to-transparent" />
                      <span className="text-[6px] text-[#4A5568] font-mono">{level.nodes.length}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {level.nodes.slice(0, 32).map((node: any, i: number) => {
                        const isSelf = level.level === 1 && i === 0;
                        const colors: Record<string, string> = {
                          root: '#00E5FF', left: '#00E5FF', right: '#7B61FF',
                        };
                        return (
                          <button key={i} onClick={() => node.id && setSelectedNode(node)}
                            className="transition-all duration-200 hover:scale-110">
                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer"
                              style={{
                                borderColor: colors[node.type] || '#7B61FF',
                                background: isSelf ? 'linear-gradient(135deg, #00E5FF, #7B61FF)' : `${(colors[node.type] || '#7B61FF')}20`,
                                boxShadow: isSelf ? '0 0 10px rgba(0,229,255,0.3)' : 'none',
                              }}>
                              {isSelf ? <User size={9} className="text-[#050816]" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Node Detail Panel */}
            {selectedNode && selectedNode.id && (
              <div className="mt-3 rounded-xl border border-[rgba(0,229,255,0.08)] p-3 relative" style={{ background: 'rgba(11,16,32,0.8)' }}>
                <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 text-[#4A5568] hover:text-white">
                  <EyeOff size={12} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                    <User size={10} className="text-[#050816]" />
                  </div>
                  <p className="text-[10px] font-mono font-bold text-white">{shortenAddress(selectedNode.wallet || selectedNode.id)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[8px]">
                  <div><span className="text-[#4A5568]">User ID:</span> <span className="text-white font-mono">{selectedNode.id?.slice(0, 10)}</span></div>
                  <div><span className="text-[#4A5568]">Source:</span> <span className="font-semibold" style={{ color: selectedNode.type === 'root' ? '#00E5FF' : selectedNode.type === 'left' ? '#00E5FF' : '#7B61FF' }}>{PLACEMENT_LABELS[selectedNode.type] || selectedNode.type}</span></div>
                  <div><span className="text-[#4A5568]">Level:</span> <span className="text-white">Level {selectedNode.level}</span></div>
                  <div><span className="text-[#4A5568]">Position:</span> <span className="text-white">#{selectedNode.position + 1}</span></div>
                </div>
              </div>
            )}

            {/* Auto Flow Placement Stats */}
            <div className="mt-3 border-t border-[rgba(0,229,255,0.05)] pt-3">
              <p className="text-[7px] text-[#4A5568] uppercase tracking-wider font-semibold mb-2">Placement Sources</p>
              <div className="grid grid-cols-4 gap-2">
                {autoFlowStats.map(s => (
                  <div key={s.label} className="rounded-lg p-2 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                    <p className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-[6px] text-[#4A5568] uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ====== MATRIX ACTIVITY ====== */
          <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3" style={{ background: 'rgba(11,16,32,0.5)' }}>
            <p className="text-[7px] text-[#4A5568] uppercase tracking-wider font-semibold mb-2">Matrix Activity History</p>
            {recentTxns.length > 0 ? (
              <div className="divide-y divide-[rgba(0,229,255,0.03)]">
                {recentTxns.map((tx, i) => (
                  <div key={tx.id || i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.06)' }}>
                        <Activity size={10} className="text-[#00E5FF]" />
                      </div>
                      <div>
                        <p className="text-[8px] text-white font-semibold">{tx.description || 'Matrix Activity'}</p>
                        <p className="text-[6px] text-[#4A5568]">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '--'}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold" style={{ color: tx.amount > 0 ? '#00FFB2' : '#FF5C7A' }}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <Activity size={14} className="mx-auto mb-1 text-[#4A5568]" />
                <p className="text-[7px] text-[#4A5568]">No matrix activity yet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ====== GLOBAL APEX POOL ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Trophy size={12} className="text-[#FFB800]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Global Apex Pool</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,184,0,0.15)] to-transparent" />
        </div>
        <div className="rounded-xl border border-[rgba(255,184,0,0.06)] p-3" style={{ background: 'linear-gradient(135deg, rgba(255,184,0,0.02), rgba(255,92,122,0.02))' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[7px] text-[#4A5568] uppercase tracking-wider mb-1">Pool Balance</p>
              <p className="text-xl font-bold font-mono text-[#FFB800]">{formatCompact(earnings.pool || 0)}</p>
              <p className="text-[7px] text-[#4A5568] mt-0.5">Unlimited Distribution Network</p>
            </div>
            <div className="text-right">
              <p className="text-[7px] text-[#4A5568] uppercase tracking-wider mb-1">Qualified</p>
              <p className="text-lg font-bold font-mono text-white">{matrixStats?.total || 0}</p>
              <p className="text-[7px] text-[#4A5568] mt-0.5">Members</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: 'rgba(255,184,0,0.04)' }}>
              <Timer size={12} className="text-[#FFB800]" />
              <div>
                <p className="text-[7px] text-[#4A5568]">Next Distribution</p>
                <p className="text-[9px] font-mono text-white">~12h 34m</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg p-2" style={{ background: 'rgba(0,255,178,0.04)' }}>
              <Coins size={12} className="text-[#00FFB2]" />
              <div>
                <p className="text-[7px] text-[#4A5568]">Per Qualifier</p>
                <p className="text-[9px] font-mono text-[#00FFB2]">{formatCurrency(earnings.pool > 0 ? earnings.pool / Math.max(matrixStats?.total || 1, 1) : 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== PACKAGE PROGRESS ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={12} className="text-[#7B61FF]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Package Progress</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(123,97,255,0.15)] to-transparent" />
        </div>
        <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3" style={{ background: 'rgba(11,16,32,0.5)' }}>
          {currentActiveSlotDef && currentActiveSlot ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[7px] text-[#4A5568] uppercase tracking-wider mb-1">Active Package</p>
                <p className="text-sm font-bold text-white font-heading" style={{ color: getGradient(currentActiveSlotDef.orbit).from }}>{currentActiveSlotDef.name}</p>
                <p className="text-[10px] font-mono text-[#4A5568]">Orbit #{currentActiveSlotDef.orbit}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] text-[#4A5568] uppercase tracking-wider mb-1">Daily Yield</p>
                <p className="text-lg font-bold font-mono" style={{ color: getGradient(currentActiveSlotDef.orbit).from }}>{formatCurrency(currentActiveSlot.dailyEarned)}</p>
                <p className="text-[8px] text-[#4A5568]">3% of {formatCurrency(currentActiveSlotDef.price)}</p>
              </div>
              <div className="col-span-2">
                <div className="flex justify-between text-[7px] text-[#4A5568] mb-1">
                  <span>Cap Progress</span>
                  <span className="font-mono">{formatCurrency(currentActiveSlot.earned)} / {formatCurrency(currentActiveSlot.maxCap)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min((currentActiveSlot.earned / currentActiveSlot.maxCap) * 100, 100)}%`, background: `linear-gradient(90deg, ${getGradient(currentActiveSlotDef.orbit).from}, ${getGradient(currentActiveSlotDef.orbit).to})` }} />
                </div>
                <div className="flex justify-between text-[7px] mt-1">
                  <span className="text-white font-mono font-semibold">{Math.min((currentActiveSlot.earned / currentActiveSlot.maxCap) * 100, 100).toFixed(1)}%</span>
                  <span className="text-[#7B61FF]">/ 200% max</span>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] text-[#4A5568] uppercase tracking-wider">Re-Buy Cycles</span>
                  <span className="text-[9px] font-mono" style={{ color: getGradient(currentActiveSlotDef.orbit).from }}>{rebuyCount(currentActiveSlotDef.id)} / {REBUY_MAX + 1}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: REBUY_MAX + 1 }).map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full"
                      style={{ background: i < rebuyCount(currentActiveSlotDef.id) ? getGradient(currentActiveSlotDef.orbit).from : `${getGradient(currentActiveSlotDef.orbit).from}20` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : nextSlotDef ? (
            <div className="text-center py-3">
              <p className="text-[9px] text-[#4A5568]">No active package</p>
              <Link href="/slots" className="inline-flex items-center gap-1 mt-2 text-[8px] text-[#00E5FF] font-semibold hover:underline">
                Activate {nextSlotDef.name} <ChevronRight size={10} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-[9px] text-[#4A5568]">All packages completed</p>
            </div>
          )}
        </div>
      </div>

      {/* ====== TRANSACTION HISTORY ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} className="text-[#00E5FF]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Transactions</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.15)] to-transparent" />
          {transactions.length > 0 && <Link href="/transactions" className="text-[7px] text-[#00E5FF] font-semibold hover:underline">View All</Link>}
        </div>
        <div className="rounded-xl border border-[rgba(0,229,255,0.06)] overflow-hidden" style={{ background: 'rgba(11,16,32,0.5)' }}>
          {recentTxns.length > 0 ? (
            <div className="divide-y divide-[rgba(0,229,255,0.03)]">
              {recentTxns.map((tx, i) => {
                const typeConfig: Record<string, { color: string; label: string }> = {
                  slot_purchase: { color: '#00E5FF', label: 'Purchase' },
                  withdraw: { color: '#FF5C7A', label: 'Withdraw' },
                  referral: { color: '#7B61FF', label: 'Referral' },
                  daily_earning: { color: '#00FFB2', label: 'Daily' },
                  matrix_earning: { color: '#00E5FF', label: 'Matrix' },
                  pool_earning: { color: '#FFB800', label: 'Pool' },
                  ascension_credit: { color: '#7B61FF', label: 'Ascension' },
                  upgrade: { color: '#7B61FF', label: 'Upgrade' },
                  recycle: { color: '#00E5FF', label: 'Re-cycle' },
                };
                const tc = typeConfig[tx.type] || { color: '#4A5568', label: tx.type };
                return (
                  <div key={tx.id || i} className="flex items-center justify-between px-3 py-2 hover:bg-[rgba(0,229,255,0.01)] transition-all">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${tc.color}10` }}>
                        <Activity size={10} style={{ color: tc.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold text-white truncate">{tx.description || tc.label}</p>
                        <p className="text-[6px] text-[#4A5568] font-mono">{tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : '--'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold shrink-0" style={{ color: tx.amount > 0 ? '#00FFB2' : '#FF5C7A' }}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center">
              <Activity size={16} className="mx-auto mb-2 text-[#4A5568]" />
              <p className="text-[8px] text-[#4A5568]">No recent transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* ====== TEAM STATS ====== */}
      <div className="px-4 mb-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2.5 border border-[rgba(0,229,255,0.04)] text-center" style={{ background: 'rgba(18,26,43,0.4)' }}>
            <Users size={12} className="mx-auto mb-1 text-[#00E5FF]" />
            <p className="text-xs font-mono font-bold text-white">{matrixStats?.total || 0}</p>
            <p className="text-[6px] text-[#4A5568] uppercase tracking-wider">Team</p>
          </div>
          <div className="rounded-lg p-2.5 border border-[rgba(0,229,255,0.04)] text-center" style={{ background: 'rgba(18,26,43,0.4)' }}>
            <Users size={12} className="mx-auto mb-1 text-[#7B61FF]" />
            <p className="text-xs font-mono font-bold text-white">{matrixStats?.directsCount || 0}</p>
            <p className="text-[6px] text-[#4A5568] uppercase tracking-wider">Directs</p>
          </div>
        </div>
      </div>

      {/* ====== WALLET INFO BAR ====== */}
      <div className="px-4 mb-3">
        <div className="rounded-lg p-2 border border-[rgba(0,229,255,0.04)] flex items-center justify-between" style={{ background: 'rgba(0,229,255,0.02)' }}>
          <div className="flex items-center gap-2">
            <Coins size={12} className="text-[#00E5FF]" />
            <span className="text-[7px] text-[#4A5568] uppercase tracking-wider">Wallet</span>
            <code className="text-[8px] font-mono text-[#00E5FF]">{shortenAddress(address) || 'Not Connected'}</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono font-bold text-white">{formatCompact(usdtBalance)} USDT</span>
            {address && (
              <a href={`https://bscscan.com/address/${address}`} target="_blank" rel="noopener noreferrer" className="text-[#4A5568] hover:text-[#00E5FF] transition-all">
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ====== BOTTOM NAVIGATION ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(0,229,255,0.08)] backdrop-blur-xl" style={{ background: 'rgba(5,8,22,0.92)' }}>
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link key={item.href} href={item.href}
                className={cn('flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative', active ? 'text-[#00E5FF]' : 'text-[#4A5568] hover:text-[#94A3B8]')}>
                {active && <div className="absolute -top-[5px] w-8 h-0.5 rounded-full bg-[#00E5FF]" />}
                <NavIcon id={item.icon} active={active} />
                <span className={cn('text-[8px] font-semibold tracking-wider', active && 'text-[#00E5FF]')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
