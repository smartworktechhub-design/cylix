'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, shortenAddress, formatDate } from '@/lib/utils';
import { searchUsers, getUserSlots, toggleROI, adminActivateSlot, banUser, unbanUser } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import { SLOTS } from '@/lib/constants';
import {
  Search, Loader2, User, Wallet, Copy, Zap, Shield, Users,
  TrendingUp, ArrowUpRight, Clock, Package, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, AlertTriangle, Award, DollarSign, Activity,
  ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import type { User as UserType, UserSlot } from '@/types';

export default function UserLookupPage() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<UserType[]>([]);
  const [selected, setSelected] = useState<UserType | null>(null);
  const [slots, setSlots] = useState<UserSlot[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [slotFilter, setSlotFilter] = useState('orbit-1');
  const [activating, setActivating] = useState(false);
  const [togglingROI, setTogglingROI] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [copied, setCopied] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [directsList, setDirectsList] = useState<{ wallet: string; referralCode: string }[]>([]);
  const [banReason, setBanReason] = useState('');
  const [showBanInput, setShowBanInput] = useState(false);
  const [banning, setBanning] = useState(false);

  const showToast = (msg: string, color: string) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSelected(null);
    setSlots([]);
    const users = await searchUsers(query.trim());
    setResults(users);
    setSearching(false);
    if (users.length === 0) showToast('No users found', '#FF5C7A');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const loadProfile = async (user: UserType) => {
    setLoadingProfile(true);
    setSelected(user);
    setResults([]);

    const userSlots = await getUserSlots(user.id);
    setSlots(userSlots);

    if (user.sponsorId) {
      const { data: sponsor } = await getSupabase().from('users')
        .select('wallet, referral_code').eq('id', user.sponsorId).single();
      if (sponsor) setSponsorName(`${shortenAddress(sponsor.wallet, 6)} (${sponsor.referral_code})`);
      else setSponsorName('None');
    } else {
      setSponsorName('None (Apex)');
    }

    const { data: directs } = await getSupabase().from('users')
      .select('wallet, referral_code').eq('sponsor_id', user.id).limit(10);
    setDirectsList((directs || []).map((d: any) => ({ wallet: d.wallet, referralCode: d.referral_code })));

    setLoadingProfile(false);
  };

  const handleActivate = async () => {
    if (!selected) return;
    setActivating(true);
    const result = await adminActivateSlot(selected.id, slotFilter);
    if (result) {
      showToast(`Slot activated! (${SLOTS.find(s => s.id === slotFilter)?.name})`, '#00FFB2');
      const updated = await getUserSlots(selected.id);
      setSlots(updated);
    } else {
      showToast('Failed — slot may already be active', '#FF5C7A');
    }
    setActivating(false);
  };

  const handleToggleROI = async () => {
    if (!selected) return;
    setTogglingROI(true);
    const success = await toggleROI(selected.id);
    if (success) {
      const newEnabled = selected.roiEnabled === false ? true : false;
      setSelected({ ...selected, roiEnabled: newEnabled });
      showToast(`ROI ${newEnabled ? 'Enabled' : 'Disabled'}`, newEnabled ? '#00FFB2' : '#FFB800');
    }
    setTogglingROI(false);
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  const handleBan = async () => {
    if (!selected) return;
    setBanning(true);
    const success = await banUser(selected.id, banReason || 'Banned by admin');
    if (success) {
      setSelected({ ...selected, isActive: false });
      showToast('User banned', '#FF5C7A');
      setShowBanInput(false);
      setBanReason('');
    }
    setBanning(false);
  };

  const handleUnban = async () => {
    if (!selected) return;
    setBanning(true);
    const success = await unbanUser(selected.id);
    if (success) {
      setSelected({ ...selected, isActive: true });
      showToast('User unbanned', '#00FFB2');
    }
    setBanning(false);
  };

  const activeSlots = slots.filter(s => s.status === 'active');
  const completedSlots = slots.filter(s => s.status === 'completed');
  const lockedSlots = slots.filter(s => s.status === 'locked');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">User Lookup</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Search by User ID, Referral Code, or Wallet Address</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter User ID, Referral Code (CXL...), or Wallet Address (0x...)"
                className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-colors"
              />
            </div>
            <Button variant="primary" onClick={handleSearch} loading={searching} disabled={searching}>
              <Search size={14} /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <p className="text-sm text-[#94A3B8]">{results.length} result(s) found</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((u) => (
                <button
                  key={u.id}
                  onClick={() => loadProfile(u)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)] hover:border-[rgba(0,229,255,0.2)] hover:bg-[rgba(0,229,255,0.03)] transition-all text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                      <User size={18} className="text-[#050816]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{shortenAddress(u.wallet, 8)}</p>
                      <p className="text-[#94A3B8] text-xs font-mono">{u.referralCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[#00FFB2] font-mono text-sm">{formatCurrency(u.totalEarned)}</p>
                      <p className="text-[#94A3B8] text-xs">earned</p>
                    </div>
                    <Badge variant={u.isActive ? 'success' : 'default'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <ExternalLink size={14} className="text-[#94A3B8]" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loadingProfile && (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
        </div>
      )}

      {selected && !loadingProfile && (
        <div className="space-y-6">
          <Card gradient>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                    <User size={24} className="text-[#050816]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-heading">
                      {selected.displayName || shortenAddress(selected.wallet, 10)}
                    </h3>
                    <p className="text-[#94A3B8] text-xs font-mono">ID: {shortenAddress(selected.id, 8)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selected.isActive ? 'success' : 'danger'}>
                    {selected.isActive ? 'Active' : 'Banned'}
                  </Badge>
                  <Badge variant={selected.roiEnabled !== false ? 'success' : 'warning'}>
                    ROI {selected.roiEnabled !== false ? 'ON' : 'OFF'}
                  </Badge>
                  {selected.isActive ? (
                    showBanInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Ban reason..."
                          className="bg-[rgba(11,16,32,0.8)] border border-[rgba(255,92,122,0.2)] rounded-lg px-2 py-1 text-xs text-white w-36 focus:outline-none"
                        />
                        <Button variant="danger" size="sm" onClick={handleBan} loading={banning} disabled={banning}>
                          Confirm
                        </Button>
                        <button onClick={() => { setShowBanInput(false); setBanReason(''); }} className="text-[#94A3B8] text-xs hover:text-white">Cancel</button>
                      </div>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => setShowBanInput(true)}>
                        Ban User
                      </Button>
                    )
                  ) : (
                    <Button variant="success" size="sm" onClick={handleUnban} loading={banning} disabled={banning}>
                      Unban
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet size={14} className="text-[#00E5FF]" />
                    <span className="text-[#94A3B8] text-xs">Wallet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-white text-xs font-mono truncate">{shortenAddress(selected.wallet, 10)}</p>
                    <button onClick={() => copyText(selected.wallet, 'wallet')} className="text-[#94A3B8] hover:text-[#00E5FF]">
                      {copied === 'wallet' ? <CheckCircle2 size={12} className="text-[#00FFB2]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(123,97,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={14} className="text-[#7B61FF]" />
                    <span className="text-[#94A3B8] text-xs">Referral Code</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[#7B61FF] text-xs font-mono font-bold">{selected.referralCode}</p>
                    <button onClick={() => copyText(selected.referralCode, 'ref')} className="text-[#94A3B8] hover:text-[#7B61FF]">
                      {copied === 'ref' ? <CheckCircle2 size={12} className="text-[#00FFB2]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,255,178,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-[#00FFB2]" />
                    <span className="text-[#94A3B8] text-xs">Total Earned</span>
                  </div>
                  <p className="text-[#00FFB2] text-sm font-mono font-bold">{formatCurrency(selected.totalEarned)}</p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(255,184,0,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={14} className="text-[#FFB800]" />
                    <span className="text-[#94A3B8] text-xs">Total Invested</span>
                  </div>
                  <p className="text-[#FFB800] text-sm font-mono font-bold">{formatCurrency(selected.totalInvested)}</p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-[#00E5FF]" />
                    <span className="text-[#94A3B8] text-xs">Direct Referrals</span>
                  </div>
                  <p className="text-white text-sm font-mono font-bold">{selected.directs}</p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(123,97,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} className="text-[#7B61FF]" />
                    <span className="text-[#94A3B8] text-xs">Team Size</span>
                  </div>
                  <p className="text-white text-sm font-mono font-bold">{formatNumber(selected.teamSize)}</p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(255,184,0,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={14} className="text-[#FFB800]" />
                    <span className="text-[#94A3B8] text-xs">Ascension Balance</span>
                  </div>
                  <p className="text-[#FFB800] text-sm font-mono font-bold">{formatCurrency(selected.ascensionBalance)}</p>
                </div>

                <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-[#94A3B8]" />
                    <span className="text-[#94A3B8] text-xs">Joined</span>
                  </div>
                  <p className="text-white text-xs">{formatDate(selected.joinedAt)}</p>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={14} className="text-[#94A3B8]" />
                  <span className="text-[#94A3B8] text-xs">Sponsor</span>
                </div>
                <p className="text-white text-xs font-mono">{sponsorName}</p>
              </div>
            </CardContent>
          </Card>

          {directsList.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Users size={16} className="text-[#00E5FF]" />
                  Direct Referrals ({directsList.length})
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {directsList.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                        <span className="text-[#00E5FF] text-xs font-bold">{i + 1}</span>
                      </div>
                      <div>
                        <p className="text-white text-xs font-mono">{shortenAddress(d.wallet, 8)}</p>
                        <p className="text-[#7B61FF] text-xs font-mono">{d.referralCode}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Package size={16} className="text-[#00E5FF]" />
                  User Slots ({slots.length})
                </h3>
              </CardHeader>
              <CardContent>
                {slots.length === 0 ? (
                  <p className="text-[#94A3B8] text-sm text-center py-4">No slots purchased yet</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            s.status === 'active' ? 'bg-[rgba(0,255,178,0.1)]' :
                            s.status === 'completed' ? 'bg-[rgba(123,97,255,0.1)]' :
                            s.status === 'locked' ? 'bg-[rgba(255,92,122,0.1)]' :
                            'bg-[rgba(148,163,184,0.1)]'
                          }`}>
                            <span className={`text-xs font-bold ${
                              s.status === 'active' ? 'text-[#00FFB2]' :
                              s.status === 'completed' ? 'text-[#7B61FF]' :
                              s.status === 'locked' ? 'text-[#FF5C7A]' :
                              'text-[#94A3B8]'
                            }`}>O{s.slotOrbit}</span>
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{s.slotName}</p>
                            <p className="text-[#94A3B8] text-xs font-mono">
                              {formatCurrency(s.invested)} invested · {formatCurrency(s.earned)} earned
                            </p>
                          </div>
                        </div>
                        <Badge variant={
                          s.status === 'active' ? 'success' :
                          s.status === 'completed' ? 'primary' :
                          s.status === 'locked' ? 'danger' : 'default'
                        }>
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-3">
                  <select
                    value={slotFilter}
                    onChange={(e) => setSlotFilter(e.target.value)}
                    className="flex-1 bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none"
                  >
                    {SLOTS.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — ${s.price.toLocaleString()}</option>
                    ))}
                  </select>
                  <Button variant="success" onClick={handleActivate} loading={activating} disabled={activating}>
                    <Zap size={14} /> Activate Slot
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Activity size={16} className="text-[#FFB800]" />
                  ROI & Earnings Control
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {selected.roiEnabled !== false ? (
                          <ToggleRight size={24} className="text-[#00FFB2] cursor-pointer" onClick={handleToggleROI} />
                        ) : (
                          <ToggleLeft size={24} className="text-[#FFB800] cursor-pointer" onClick={handleToggleROI} />
                        )}
                        <span className="text-white text-sm font-medium">Daily ROI Yield</span>
                      </div>
                      <Badge variant={selected.roiEnabled !== false ? 'success' : 'warning'}>
                        {selected.roiEnabled !== false ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </div>
                    <p className="text-[#94A3B8] text-xs mb-3">
                      {selected.roiEnabled !== false
                        ? 'User receives 3% daily yield on active slots'
                        : 'Daily yield is paused for this user'}
                    </p>
                    <button
                      onClick={handleToggleROI}
                      disabled={togglingROI}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        selected.roiEnabled !== false
                          ? 'bg-[rgba(255,92,122,0.1)] border border-[rgba(255,92,122,0.2)] text-[#FF5C7A] hover:bg-[rgba(255,92,122,0.2)]'
                          : 'bg-[rgba(0,255,178,0.1)] border border-[rgba(0,255,178,0.2)] text-[#00FFB2] hover:bg-[rgba(0,255,178,0.2)]'
                      }`}
                    >
                      {togglingROI ? <Loader2 size={14} className="animate-spin mx-auto" /> : (
                        selected.roiEnabled !== false ? 'Disable ROI' : 'Enable ROI'
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign size={14} className="text-[#00FFB2]" />
                      <span className="text-white text-sm font-medium">Earnings Summary</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.05)]">
                        <p className="text-[#94A3B8] text-xs">Total Earned</p>
                        <p className="text-[#00FFB2] text-sm font-mono font-bold">{formatCurrency(selected.totalEarned)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(123,97,255,0.05)]">
                        <p className="text-[#94A3B8] text-xs">Ascension</p>
                        <p className="text-[#FFB800] text-sm font-mono font-bold">{formatCurrency(selected.ascensionBalance)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.05)]">
                        <p className="text-[#94A3B8] text-xs">Active Slots</p>
                        <p className="text-white text-sm font-mono font-bold">{activeSlots.length}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-[rgba(123,97,255,0.05)]">
                        <p className="text-[#94A3B8] text-xs">Completed</p>
                        <p className="text-[#7B61FF] text-sm font-mono font-bold">{completedSlots.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={14} className="text-[#FFB800]" />
                      <span className="text-white text-sm font-medium">Quick Stats</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Rank</span>
                        <span className="text-white font-mono">{selected.rank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">2FA</span>
                        <span className="text-white font-mono">{selected.twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Total Invested</span>
                        <span className="text-[#FFB800] font-mono">{formatCurrency(selected.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#94A3B8]">Locked Slots</span>
                        <span className="text-[#FF5C7A] font-mono">{lockedSlots.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 pointer-events-none z-[100]"
          style={{
            background: `${toast.color}0a`,
            border: `1px solid ${toast.color}15`,
            color: toast.color,
          }}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}