'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getMatrixStats, getMatrixTree, getRecentJoins, getActiveCampaign, getUserDirectCount, getUserCampaignRequest, submitCampaignRequest } from '@/lib/db';
import { SLOTS, REBUY_MAX, APP_VERSION } from '@/lib/constants';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUsdtBalance } from '@/lib/usdt';
import {
  Loader2, Users, GitBranch, TrendingUp, Orbit,
  ArrowUpRight, Shield, Crown, Copy, CheckCheck,
  Link as LinkIcon, Lock, Activity, User,
  Timer, Trophy, Layers, ChevronRight,
  EyeOff, UserPlus,
} from 'lucide-react';
import { BanScreen } from '@/components/ui/ban-screen';
import { useDisconnect } from 'wagmi';
import { PublicFooter } from '@/components/layout/public-footer';

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

const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const PLACEMENT_LABELS: Record<string, string> = {
  root: 'Self', left: 'Direct', right: 'Spillover',
};

export default function DashboardPage() {
  useEffect(() => { document.title = 'Dashboard — CYLIX'; }, []);
  const { user, slots, earnings, vault, transactions, adminStats, needsReferral, setNeedsReferral } = useAppStore();
  const { loading, isBanned, banReason } = useInitData();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const pathname = usePathname();
  const { balance: usdtBalance } = useUsdtBalance(address);
  const [matrixStats, setMatrixStats] = useState<any>(null);
  const [refCopied, setRefCopied] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [matrixTreeNodes, setMatrixTreeNodes] = useState<any[]>([]);
  const [matrixView, setMatrixView] = useState<'explorer' | 'activity'>('explorer');
  const [recentJoins, setRecentJoins] = useState<any[]>([]);
  const [refInput, setRefInput] = useState('');
  const [refSubmitting, setRefSubmitting] = useState(false);
  const [refError, setRefError] = useState('');
  const [campaign, setCampaign] = useState<any>(null);
  const [userDirectCount, setUserDirectCount] = useState(0);
  const [userCampaignRequest, setUserCampaignRequest] = useState<any>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (user) {
      getMatrixStats(user.id).then(setMatrixStats);
      getRecentJoins(5).then(setRecentJoins);
      getActiveCampaign().then(c => {
        setCampaign(c);
        if (c && user) {
          getUserDirectCount(user.id).then(setUserDirectCount);
          getUserCampaignRequest(c.id, user.id).then(setUserCampaignRequest);
        }
      });
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

  useEffect(() => {
    if (!campaign) return;
    function updateCountdown() {
      const end = new Date(campaign.end_time).getTime();
      const now = Date.now();
      const diff = Math.max(0, end - now);
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown({ hours, minutes, seconds });
    }
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [campaign]);

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

  if (isBanned) {
    return <BanScreen reason={banReason} walletAddress={address} userId={user?.id} onLogout={() => disconnect()} />;
  }

  if (needsReferral) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center p-4">
        <div className="max-w-sm w-full rounded-2xl bg-[rgba(28,38,58,0.6)] border border-[rgba(0,229,255,0.08)] p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center mx-auto mb-4">
            <Users size={20} className="text-[#00E5FF]" />
          </div>
          <h2 className="text-lg font-bold text-white font-heading mb-2">Referral Code Required</h2>
          <p className="text-xs text-[#94A3B8] mb-4">Enter your sponsor&apos;s referral code to continue</p>
          <input
            value={refInput}
            onChange={(e) => { setRefInput(e.target.value.toUpperCase()); setRefError(''); }}
            placeholder="Enter referral code"
            className="w-full h-11 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] mb-2"
          />
          {refError && <p className="text-[#FF5C7A] text-xs mb-3">{refError}</p>}
          <button
            onClick={async () => {
              if (!refInput.trim() || !user) return;
              setRefSubmitting(true);
              setRefError('');
              try {
                const res = await fetch('/api/set-sponsor', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, sponsorCode: refInput.trim().toUpperCase() }),
                });
                const json = await res.json();
                if (res.ok && json.user) {
                  useAppStore.getState().setUser(json.user as any);
                  setNeedsReferral(false);
                } else {
                  setRefError(json.error || 'Invalid referral code. Please check and try again.');
                }
              } catch (e) {
                setRefError('Something went wrong. Please try again.');
              }
              setRefSubmitting(false);
            }}
            disabled={refSubmitting || !refInput.trim()}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {refSubmitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : 'Submit'}
          </button>
        </div>
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
            <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(28,38,58,0.6)' }}>
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
              <p className="text-[6px] text-[#4A5568] uppercase tracking-wider mb-0.5">Wallet</p>
              <p className="text-[11px] font-mono font-bold text-white">{formatCompact(usdtBalance)} <span className="text-[6px] text-[#4A5568]">USDT</span></p>
              <p className="text-[6px] text-[#00E5FF] font-mono">{shortenAddress(address) || 'Not Connected'}</p>
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

      {/* ====== REFERRAL CARD ====== */}
      {refCode && (
        <div className="px-4 mb-3">
          <div className="relative rounded-2xl overflow-hidden p-[2px]" style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF, #00E5FF)' }}>
            <div className="rounded-2xl p-4 relative" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(22,32,52,0.97))' }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl" style={{ background: 'rgba(0,229,255,0.06)' }} />

              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.2)]">
                  <LinkIcon size={16} className="text-[#050816]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>INVITE & EARN</h3>
                  <p className="text-[10px] text-[#94A3B8]">Share your referral code with others</p>
                </div>
              </div>

              <div className="rounded-xl p-3 relative z-10" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)' }}>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xl font-mono font-bold text-[#00E5FF] tracking-widest">{refCode}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${location.origin}/?ref=${refCode}`); setRefCopied(true); setTimeout(() => setRefCopied(false), 2000); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-xs transition-all shrink-0"
                    style={{ background: refCopied ? 'rgba(0,255,178,0.15)' : 'rgba(0,229,255,0.1)', border: `1px solid ${refCopied ? 'rgba(0,255,178,0.3)' : 'rgba(0,229,255,0.2)'}` }}>
                    {refCopied ? <><CheckCheck size={12} className="text-[#00FFB2]" /><span className="text-[#00FFB2]">Copied!</span></> : <><Copy size={12} className="text-[#00E5FF]" /><span className="text-[#00E5FF]">Copy</span></>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== CAMPAIGN BANNER ====== */}
      {campaign && showBanner && new Date(campaign.end_time) > new Date() && (
        <div className="px-4 mb-3">
          <div className="relative rounded-2xl overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
            <div className="rounded-2xl p-4 relative" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.95), rgba(22,32,52,0.95))' }}>
              <button onClick={() => setShowBanner(false)} className="absolute top-3 right-3 text-[#4A5568] hover:text-white text-xs">✕</button>

              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
                <span className="text-[8px] font-bold text-[#00E5FF] uppercase tracking-wider">Live Campaign</span>
              </div>

              <h3 className="text-lg font-bold text-white font-heading mb-1" style={{ fontFamily: "'Orbitron',sans-serif" }}>{campaign.name}</h3>
              <p className="text-[10px] text-[#94A3B8] mb-3">{campaign.description}</p>

              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-white">{String(countdown.hours).padStart(2, '0')}</p>
                  <p className="text-[7px] text-[#4A5568] uppercase">HRS</p>
                </div>
                <span className="text-lg text-[#4A5568] font-mono">:</span>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-white">{String(countdown.minutes).padStart(2, '0')}</p>
                  <p className="text-[7px] text-[#4A5568] uppercase">MIN</p>
                </div>
                <span className="text-lg text-[#4A5568] font-mono">:</span>
                <div className="text-center">
                  <p className="text-2xl font-bold font-mono text-white">{String(countdown.seconds).padStart(2, '0')}</p>
                  <p className="text-[7px] text-[#4A5568] uppercase">SEC</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">Reward</p>
                  <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCurrency(campaign.reward_per_referral)}/ref</p>
                </div>
                <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(123,97,255,0.06)', border: '1px solid rgba(123,97,255,0.1)' }}>
                  <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">Minimum</p>
                  <p className="text-sm font-bold font-mono text-[#7B61FF]">{campaign.min_referrals_required} refs</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">Your Directs</p>
                  <p className="text-sm font-bold font-mono text-white">{userDirectCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">Eligible For</p>
                  <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCurrency(Math.max(0, userDirectCount) * campaign.reward_per_referral)}</p>
                </div>
              </div>

              {userCampaignRequest ? (
                <div className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.1)' }}>
                  <p className="text-[9px] font-semibold" style={{
                    color: userCampaignRequest.status === 'approved' ? '#00FFB2' :
                           userCampaignRequest.status === 'rejected' ? '#FF5C7A' :
                           userCampaignRequest.status === 'paid' ? '#00E5FF' : '#FFB800'
                  }}>
                    Request {userCampaignRequest.status === 'approved' ? '— Approved' :
                            userCampaignRequest.status === 'rejected' ? '— Rejected' :
                            userCampaignRequest.status === 'paid' ? '— Paid' : '— Pending Review'}
                  </p>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (!user || !campaign) return;
                    setCampaignLoading(true);
                    const result = await submitCampaignRequest(campaign.id, user.id);
                    if (result.success) {
                      const updated = await getUserCampaignRequest(campaign.id, user.id);
                      setUserCampaignRequest(updated);
                    }
                    setCampaignLoading(false);
                  }}
                  disabled={campaignLoading || userDirectCount < campaign.min_referrals_required}
                  className={`w-full h-10 rounded-xl font-semibold text-sm transition-all ${
                    campaignLoading || userDirectCount < campaign.min_referrals_required
                      ? 'bg-[rgba(0,229,255,0.05)] text-[#4A5568] cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] hover:opacity-90'
                  }`}
                >
                  {campaignLoading ? 'Submitting...' :
                   userDirectCount < campaign.min_referrals_required
                     ? `Need ${campaign.min_referrals_required - userDirectCount} more referrals`
                     : 'Request Reward'}
                </button>
              )}
            </div>
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
            const activeRecord = slotRecords.find(s => s.status === 'active');
            const progressPercent = activeRecord
              ? (activeRecord.earned / activeRecord.maxCap) * 100 : 0;

            if (isLockedPermanent) {
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${grad.from}06, ${grad.to}03)`, border: `1px solid ${grad.from}15`, opacity: 0.4 }}>
                  <Lock size={12} className="text-[#4A5568] mb-1" />
                  <p className="text-[10px] font-bold text-[#4A5568] font-heading">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#4A5568]">{formatCurrency(slotDef.price)}</p>
                  <p className="text-[6px] text-[#4A5568] mt-0.5">{REBUY_MAX}/{REBUY_MAX} Re-buys</p>
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
              const canRebuy = totalPurchases < REBUY_MAX + 1;
              return (
                <div key={slotDef.id} className="relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${grad.from}08, ${grad.to}05)`, border: `1px solid ${grad.from}30`, opacity: canRebuy ? 1 : 0.4 }}>
                  <div className="absolute top-1 right-1"><span className="text-[5px] px-1 py-0.5 rounded-full bg-[rgba(0,255,178,0.1)] text-[#00FFB2] font-bold">{canRebuy ? 'CAPPED' : 'LOCKED'}</span></div>
                  <p className="text-[10px] font-bold text-white font-heading pr-5">{slotDef.name}</p>
                  <p className="text-[11px] font-mono font-bold text-[#00FFB2]">{formatCurrency(slotDef.price)}</p>
                  <p className="text-[6px] text-[#00FFB2] mt-0.5">{totalPurchases}/{REBUY_MAX + 1} re-buys</p>
                  {canRebuy && (
                    <Link href={`/slots?rebuy=${slotDef.id}`} className="mt-1.5 w-full py-1 rounded-lg text-[#050816] text-[7px] font-bold text-center" style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }}>
                      RE-BUY
                    </Link>
                  )}
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

                {isActive && (
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
          <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3 overflow-x-auto" style={{ background: 'rgba(22,32,52,0.6)' }}>
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
          <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3" style={{ background: 'rgba(22,32,52,0.6)' }}>
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
        <div className="grid grid-cols-2 gap-2">
          <Link href="/apex-pool" className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3 block" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.02), rgba(123,97,255,0.02))' }}>
            <div className="flex items-center gap-2 mb-2">
              <Crown size={10} className="text-[#00E5FF]" />
              <span className="text-[7px] font-bold text-[#00E5FF] uppercase tracking-wider">Champions Pool</span>
            </div>
            <p className="text-sm font-bold font-mono text-white">{formatCompact(adminStats?.poolFund ? adminStats.poolFund / 2 : 0)}</p>
            <p className="text-[6px] text-[#4A5568] mt-0.5">Top {10} daily performers</p>
          </Link>
          <Link href="/apex-pool" className="rounded-xl border border-[rgba(123,97,255,0.06)] p-3 block" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.02), rgba(0,229,255,0.02))' }}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={10} className="text-[#7B61FF]" />
              <span className="text-[7px] font-bold text-[#7B61FF] uppercase tracking-wider">Community Pool</span>
            </div>
            <p className="text-sm font-bold font-mono text-white">{formatCompact(adminStats?.poolFund ? adminStats.poolFund / 2 : 0)}</p>
            <p className="text-[6px] text-[#4A5568] mt-0.5">1+ active direct required</p>
          </Link>
        </div>
      </div>

      {/* ====== PACKAGE PROGRESS ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={12} className="text-[#7B61FF]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Package Progress</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(123,97,255,0.15)] to-transparent" />
        </div>
        <div className="rounded-xl border border-[rgba(0,229,255,0.06)] p-3" style={{ background: 'rgba(22,32,52,0.6)' }}>
          {activeSlots.length > 0 ? (
            <div className="space-y-4">
              <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">{activeSlots.length} Active Package{activeSlots.length > 1 ? 's' : ''}</p>
              {activeSlots.map((aslot) => {
                const sdef = SLOTS.find(s => s.id === aslot.slotId);
                if (!sdef) return null;
                const g = getGradient(sdef.orbit);
                return (
                  <div key={aslot.id} className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs font-bold text-white font-heading" style={{ color: g.from }}>{sdef.name}</p>
                      <p className="text-[8px] font-mono text-[#4A5568]">Orbit #{sdef.orbit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[7px] text-[#4A5568] uppercase tracking-wider">Daily Yield</p>
                      <p className="text-sm font-bold font-mono" style={{ color: g.from }}>{formatCurrency(aslot.dailyEarned)}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between text-[6px] text-[#4A5568] mb-0.5">
                        <span className="font-mono">{formatCurrency(aslot.earned)} / {formatCurrency(aslot.maxCap)}</span>
                        <span>{Math.min((aslot.earned / aslot.maxCap) * 100, 100).toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[rgba(11,16,32,0.6)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((aslot.earned / aslot.maxCap) * 100, 100)}%`, background: `linear-gradient(90deg, ${g.from}, ${g.to})` }} />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-[6px] text-[#4A5568]">Re-buys</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: REBUY_MAX + 1 }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-full"
                            style={{ background: i < rebuyCount(sdef.id) ? g.from : `${g.from}20` }} />
                        ))}
                        <span className="text-[7px] font-mono text-[#4A5568] ml-1">{rebuyCount(sdef.id)}/{REBUY_MAX + 1}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* ====== LIVE FEED ====== */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity size={12} className="text-[#00E5FF]" />
          <h2 className="text-[9px] font-bold text-white uppercase tracking-[0.15em]" style={{ fontFamily: "'Orbitron',sans-serif" }}>Live Feed</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.15)] to-transparent" />
        </div>
        <div className="rounded-xl border border-[rgba(0,229,255,0.06)] overflow-hidden" style={{ background: 'rgba(22,32,52,0.6)' }}>
          {recentJoins.length > 0 ? (
            <div className="divide-y divide-[rgba(0,229,255,0.03)]">
              {recentJoins.map((j: any, i: number) => (
                <div key={j.id || i} className="flex items-center justify-between px-3 py-2 hover:bg-[rgba(0,229,255,0.01)] transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(0,229,255,0.08)' }}>
                      <UserPlus size={10} className="text-[#00E5FF]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-semibold text-white truncate">{shortenAddress(j.wallet || j.id)}</p>
                      <p className="text-[6px] text-[#4A5568] font-mono">Ref: {j.referralCode || '---'}</p>
                    </div>
                  </div>
                  <span className="text-[7px] text-[#4A5568] font-mono">{j.timestamp ? formatTimeAgo(j.timestamp) : '--'}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <UserPlus size={16} className="mx-auto mb-2 text-[#4A5568]" />
              <p className="text-[8px] text-[#4A5568]">No recent joins</p>
            </div>
          )}
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

      {/* ====== FOOTER ====== */}
      <div className="px-4 pt-6 pb-20 border-t border-[rgba(0,229,255,0.06)] mt-4">
        <PublicFooter />
      </div>
    </div>
  );
}
