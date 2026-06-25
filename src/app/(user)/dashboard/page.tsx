'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getRecentActivity, getMatrixStats } from '@/lib/db';
import { SLOTS } from '@/lib/constants';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Loader2, Copy, CheckCheck, Wallet, Users, GitBranch,
  TrendingUp, Orbit, Vault as VaultIcon, Activity, ArrowUpRight,
  DollarSign, Zap, Globe, Shield, Gem,
} from 'lucide-react';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(2) + 'K';
  return '$' + n.toFixed(2);
}

function shortenAddress(addr: string | undefined) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export default function DashboardPage() {
  const { user, slots, earnings, vault } = useAppStore();
  const { loading } = useInitData();
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);
  const [matrixStats, setMatrixStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getMatrixStats(user.id).then(setMatrixStats);
    }
  }, [user]);

  const activeSlotIds = new Set(slots.filter(s => s.status === 'active').map(s => s.slotId));
  const completedSlotIds = new Set(slots.filter(s => s.status === 'completed').map(s => s.slotId));

  const totalEarnings = earnings.total;
  const availableBalance = Number(user?.totalEarned) - Number(user?.ascensionBalance || 0);
  const dailyYield = slots.filter(s => s.status === 'active').reduce((sum, s) => sum + s.dailyEarned, 0);
  const teamCount = matrixStats?.total || 0;
  const directsCount = matrixStats?.directsCount || 0;
  const spilloverCount = matrixStats?.spilloverCount || 0;

  const copyAddr = () => {
    if (user?.wallet) { navigator.clipboard.writeText(user.wallet); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/matrix', label: 'Matrix', icon: 'matrix' },
    { href: '/slots', label: 'My Slots', icon: 'slots' },
    { href: '/earnings', label: 'Income', icon: 'income' },
    { href: '/referrals', label: 'Team', icon: 'team' },
    { href: '/withdrawals', label: 'Wallet', icon: 'wallet' },
  ];

  const navIcon = (id: string, active: boolean) => {
    const cls = active ? 'text-[#00E5FF]' : 'text-[#4A5568]';
    const size = 20;
    switch (id) {
      case 'dashboard': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
      case 'matrix': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
      case 'slots': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>;
      case 'income': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
      case 'team': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
      case 'wallet': return <svg className={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
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
    <div className="min-h-screen" style={{ background: '#050816' }}>
      {/* ====== TOP SECTION ====== */}
      <div className="sticky top-0 z-30 backdrop-blur-xl border-b border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(5,8,22,0.85)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.2)]">
              <span className="text-[#050816] font-black text-sm" style={{ fontFamily: "'Orbitron',sans-serif" }}>C</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</h1>
              <p className="text-[8px] text-[#00E5FF] tracking-[0.2em] uppercase font-medium">Matrix DeFi</p>
            </div>
          </div>
          <ConnectButton.Custom>
            {({ openConnectModal, mounted, account, chain }) => (
              !mounted ? (
                <div className="w-32 h-9 rounded-xl bg-[rgba(148,163,184,0.05]" />
              ) : !account ? (
                <button onClick={openConnectModal}
                  className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[rgba(0,229,255,0.15)]">
                  <Wallet size={14} /> Connect
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.08)]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]" />
                  <span className="text-xs text-white font-mono">{shortenAddress(account.address)}</span>
                  <button onClick={copyAddr} className="ml-1">
                    {copied ? <CheckCheck size={12} className="text-[#00FFB2]" /> : <Copy size={12} className="text-[#4A5568]" />}
                  </button>
                </div>
              )
            )}
          </ConnectButton.Custom>
        </div>
      </div>

      {/* ====== EARNINGS + WITHDRAW STRIP ====== */}
      <div className="px-4 pt-4 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 border border-[rgba(0,229,255,0.08)]" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.04), rgba(123,97,255,0.04))' }}>
            <p className="text-[10px] text-[#4A5568] uppercase tracking-wider mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-white font-mono">{formatCompact(totalEarnings)}</p>
            <p className="text-[10px] text-[#00E5FF] mt-1 flex items-center gap-1">
              <TrendingUp size={10} /> +{formatCurrency(dailyYield)} / day
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(18,26,43,0.6)' }}>
            <p className="text-[10px] text-[#4A5568] uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-[#00FFB2] font-mono">{formatCompact(availableBalance)}</p>
            <p className="text-[10px] text-[#4A5568] mt-1 flex items-center gap-1">
              <VaultIcon size={10} /> {formatCurrency(user?.ascensionBalance || 0)} in vault
            </p>
          </div>
          <Link href="/withdrawals" className="rounded-2xl p-4 border border-[rgba(0,229,255,0.08)] flex flex-col items-center justify-center cursor-pointer hover:border-[rgba(0,229,255,0.2)] transition-all" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.08), rgba(123,97,255,0.08))' }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] flex items-center justify-center mb-2 shadow-lg shadow-[rgba(0,229,255,0.15)]">
              <ArrowUpRight size={20} className="text-[#050816]" />
            </div>
            <span className="text-sm font-semibold text-white">Withdraw</span>
          </Link>
        </div>
      </div>

      {/* ====== 11 SLOT MATRIX SYSTEM ====== */}
      <div className="px-4 pt-2 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <Orbit size={14} className="text-[#00E5FF]" />
          <h2 className="text-xs font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>11 Slot Matrix System</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.2)] to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-2.5">
          {SLOTS.map((slotDef) => {
            const isActive = activeSlotIds.has(slotDef.id);
            const isCompleted = completedSlotIds.has(slotDef.id);
            const isOwned = isActive || isCompleted;
            const isLocked = !isOwned && slotDef.orbit > 1 && !activeSlotIds.has(`orbit-${slotDef.orbit - 1}`) && !completedSlotIds.has(`orbit-${slotDef.orbit - 1}`);
            const matrixPoolValue = slotDef.price * 0.26;

            return (
              <div key={slotDef.id}
                className={cn(
                  'relative rounded-xl border transition-all duration-300 overflow-hidden',
                  isActive && 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.12)]',
                  isCompleted && 'border-[#00FFB2] opacity-80',
                  !isOwned && !isLocked && 'border-[rgba(0,229,255,0.06)] hover:border-[rgba(0,229,255,0.15)]',
                  isLocked && 'border-[rgba(148,163,184,0.04)] opacity-40',
                )}
                style={{ background: isActive ? 'linear-gradient(180deg, rgba(0,229,255,0.06), rgba(0,229,255,0.02))' : 'rgba(18,26,43,0.4)' }}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ boxShadow: 'inset 0 0 30px rgba(0,229,255,0.05)' }} />
                )}
                <div className="p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] text-[#4A5568] font-mono font-medium">Slot {String(slotDef.orbit).padStart(2, '0')}</span>
                    {isActive && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[rgba(0,229,255,0.12)] text-[#00E5FF] font-semibold tracking-wider">ACTIVE</span>}
                    {isCompleted && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[rgba(0,255,178,0.12)] text-[#00FFB2] font-semibold tracking-wider">DONE</span>}
                    {isLocked && <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[rgba(74,85,104,0.12)] text-[#4A5568] font-semibold tracking-wider">LOCKED</span>}
                  </div>
                  <p className="text-xs font-bold text-white mb-2" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{slotDef.name}</p>
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#4A5568]">Price</span>
                      <span className="text-white font-mono font-semibold">{formatCurrency(slotDef.price)}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#4A5568]">Yield</span>
                      <span className="text-[#00E5FF] font-mono">{formatCurrency(slotDef.dailyYield)}/d</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#4A5568]">Cap</span>
                      <span className="text-[#7B61FF] font-mono">{formatCurrency(slotDef.maxCap)}</span>
                    </div>
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#4A5568]">Matrix</span>
                      <span className="text-[#00FFB2] font-mono">{formatCurrency(matrixPoolValue)}</span>
                    </div>
                  </div>
                  {!isOwned && !isLocked && (
                    <Link href="/slots"
                      className="block w-full py-1.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] text-[9px] font-bold text-center hover:shadow-lg hover:shadow-[rgba(0,229,255,0.15)] transition-all">
                      BUY NOW
                    </Link>
                  )}
                  {isLocked && (
                    <div className="w-full py-1.5 rounded-lg bg-[rgba(74,85,104,0.1)] text-[#4A5568] text-[9px] font-bold text-center">
                      LOCKED
                    </div>
                  )}
                  {isOwned && (
                    <div className="w-full py-1.5 rounded-lg text-[9px] font-bold text-center"
                      style={{ background: isActive ? 'rgba(0,229,255,0.06)' : 'rgba(0,255,178,0.06)', color: isActive ? '#00E5FF' : '#00FFB2' }}>
                      {isActive ? 'LIVE' : 'CLAIMED'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== STATS GRID ====== */}
      <div className="px-4 pt-2 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { label: 'Team Count', value: teamCount, icon: 'users', color: '#00E5FF' },
            { label: 'Direct Referrals', value: directsCount, icon: 'directs', color: '#7B61FF' },
            { label: 'Spillover Income', value: spilloverCount, icon: 'spillover', color: '#FFB800' },
            { label: 'Apex Pool', value: formatCompact(earnings.pool), icon: 'pool', color: '#00FFB2' },
            { label: 'Auto Vault', value: formatCompact(user?.ascensionBalance || 0), icon: 'vault', color: '#FF5C7A' },
            { label: 'Upgrade', value: (vault?.progress || 0).toFixed(0) + '%', icon: 'upgrade', color: '#7B61FF' },
          ].map((s, i) => {
            const ico = () => {
              const c = 'currentColor';
              const sz = 16;
              switch (s.icon) {
                case 'users': return <Users size={sz} />;
                case 'directs': return <GitBranch size={sz} />;
                case 'spillover': return <TrendingUp size={sz} />;
                case 'pool': return <Globe size={sz} />;
                case 'vault': return <VaultIcon size={sz} />;
                case 'upgrade': return <Zap size={sz} />;
                default: return null;
              }
            };
            return (
              <div key={i} className="rounded-xl p-3 border border-[rgba(0,229,255,0.06)] hover:border-[rgba(0,229,255,0.12)] transition-all" style={{ background: 'rgba(18,26,43,0.4)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] text-[#4A5568] uppercase tracking-wider">{s.label}</span>
                  <span style={{ color: s.color }}>{ico()}</span>
                </div>
                <p className="text-base font-bold font-mono text-white">{s.value}</p>
              </div>
            );
          })}
        </div>
        {/* Upgrade Progress Bar */}
        <div className="mt-2.5 rounded-xl p-3 border border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(18,26,43,0.4)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-[#7B61FF]" />
              <span className="text-[9px] text-[#4A5568] uppercase tracking-wider">Upgrade Progress</span>
            </div>
            <span className="text-[10px] text-[#7B61FF] font-mono">{(vault?.progress || 0).toFixed(0)}%</span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(vault?.progress || 0, 100)}%`, background: 'linear-gradient(90deg, #7B61FF, #00E5FF)' }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[8px] text-[#4A5568]">
            <span>Next: {vault?.nextSlot || '--'}</span>
            <span className="font-mono">{formatCurrency(vault?.nextSlotCost || 0)}</span>
          </div>
        </div>
      </div>

      {/* ====== BOTTOM NAVIGATION ====== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-[rgba(0,229,255,0.08)] backdrop-blur-xl"
        style={{ background: 'rgba(5,8,22,0.92)' }}>
        <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link key={item.href} href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative',
                  active ? 'text-[#00E5FF]' : 'text-[#4A5568] hover:text-[#94A3B8]'
                )}>
                {active && <div className="absolute -top-[5px] w-8 h-0.5 rounded-full bg-[#00E5FF]" />}
                {navIcon(item.icon, active)}
                <span className={cn('text-[9px] font-semibold tracking-wider', active && 'text-[#00E5FF]')}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
