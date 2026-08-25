'use client';

import { useState, useEffect } from 'react';
import { Coins, Play, Pause, RotateCcw, Settings, Loader2, Users, TrendingUp, Calendar } from 'lucide-react';

interface Config {
  [key: string]: string;
}

export default function AdminCxlAirdropPage() {
  useEffect(() => { document.title = 'CXL Airdrop — Admin'; }, []);

  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [message, setMessage] = useState('');
  const [searchUserId, setSearchUserId] = useState('');
  const [userBalance, setUserBalance] = useState<any>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const token = sessionStorage.getItem('cx_admin_token');
    const res = await fetch('/api/admin/airdrop', {
      headers: { authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setConfig(data.config || {});
    setLoading(false);
  };

  const handleAction = async (action: string, extra?: any) => {
    setActionLoading(action);
    setMessage('');
    try {
      const token = sessionStorage.getItem('cx_admin_token');
      const res = await fetch('/api/admin/airdrop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Done!');
        fetchConfig();
      } else {
        setMessage(data.error || 'Failed');
      }
    } catch {
      setMessage('Network error');
    }
    setActionLoading('');
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    await handleAction('update_config', { key, value });
  };

  const handleSearchUser = async () => {
    if (!searchUserId.trim()) return;
    const token = sessionStorage.getItem('cx_admin_token');
    const res = await fetch(`/api/admin/airdrop/user?userId=${searchUserId.trim()}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUserBalance(data);
    } else {
      setUserBalance(null);
      setMessage('User not found');
    }
  };

  const started = !!config['airdrop_started_at'];
  const isActive = config['is_active'] === 'true';

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
            <Coins size={20} className="text-[#050816]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL Airdrop</h1>
            <p className="text-xs text-[#7B8BA5]">Manage CXL token airdrop system</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl text-sm font-semibold" style={{
            background: message.includes('error') || message.includes('Error') || message.includes('failed')
              ? 'rgba(255,92,122,0.1)' : 'rgba(0,255,178,0.1)',
            border: `1px solid ${message.includes('error') || message.includes('Error') || message.includes('failed') ? 'rgba(255,92,122,0.2)' : 'rgba(0,255,178,0.2)'}`,
            color: message.includes('error') || message.includes('Error') || message.includes('failed') ? '#FF5C7A' : '#00FFB2',
          }}>
            {message}
          </div>
        )}

        {/* Status */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <p className="text-xs text-[#7B8BA5] uppercase">Status</p>
            <p className={`text-sm font-bold ${isActive ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
              {!started ? 'NOT STARTED' : isActive ? 'ACTIVE' : 'PAUSED'}
            </p>
          </div>
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <p className="text-xs text-[#7B8BA5] uppercase">Phase</p>
            <p className="text-sm font-bold text-[#FFB800]">Phase {config['airdrop_phase'] || '1'}</p>
          </div>
        </div>

        {/* Current Day & Price */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <p className="text-xs text-[#7B8BA5] uppercase">Started</p>
            <p className="text-xs font-mono text-white">{config['airdrop_started_at'] ? new Date(config['airdrop_started_at']).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <p className="text-xs text-[#7B8BA5] uppercase">CXL Sold</p>
            <p className="text-xs font-mono text-[#00E5FF]">{config['cxl_sold'] || '0'}</p>
          </div>
          <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.08)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            <p className="text-xs text-[#7B8BA5] uppercase">Presale Price</p>
            <p className="text-xs font-mono text-[#FFB800]">${config['presale_current_price'] || '0.01'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mb-6">
          <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold">Actions</p>

          {!started ? (
            <button
              onClick={() => handleAction('start')}
              disabled={!!actionLoading}
              className="w-full h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#00FFB2] to-[#00E5FF] text-[#050816] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {actionLoading === 'start' ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
              Start Airdrop
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleAction(isActive ? 'pause' : 'resume')}
                disabled={!!actionLoading}
                className="flex-1 h-11 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isActive ? 'rgba(255,184,0,0.1)' : 'rgba(0,255,178,0.1)',
                  border: `1px solid ${isActive ? 'rgba(255,184,0,0.2)' : 'rgba(0,255,178,0.2)'}`,
                  color: isActive ? '#FFB800' : '#00FFB2',
                }}
              >
                {actionLoading === 'pause' || actionLoading === 'resume' ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isActive ? (
                  <Pause size={14} />
                ) : (
                  <Play size={14} />
                )}
                {isActive ? 'Pause' : 'Resume'}
              </button>
            </div>
          )}
        </div>

        {/* Phase Selector */}
        <div className="space-y-2 mb-6">
          <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold">Phase Control</p>
          <div className="flex gap-2">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                onClick={() => handleAction('set_phase', { phase: p })}
                disabled={!!actionLoading || config['airdrop_phase'] === String(p)}
                className={`flex-1 h-10 rounded-xl font-semibold text-xs transition-all ${
                  config['airdrop_phase'] === String(p)
                    ? 'bg-gradient-to-r from-[#FFB800] to-[#FF5C7A] text-[#050816]'
                    : 'bg-[rgba(0,229,255,0.05)] text-[#7B8BA5] border border-[rgba(0,229,255,0.08)] hover:text-white'
                } disabled:opacity-50`}
              >
                Phase {p}
              </button>
            ))}
          </div>
        </div>

        {/* Config Editor */}
        <div className="space-y-2 mb-6">
          <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold">Configuration</p>
          <div className="rounded-xl border border-[rgba(0,229,255,0.08)] divide-y divide-[rgba(0,229,255,0.05)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
            {[
              { key: 'cxl_total_supply', label: 'Total Supply', type: 'number' },
              { key: 'phase1_bonus', label: 'Phase 1 Bonus (CXL)', type: 'number' },
              { key: 'phase2_bonus', label: 'Phase 2 Bonus (CXL)', type: 'number' },
              { key: 'phase3_bonus', label: 'Phase 3 Bonus (CXL)', type: 'number' },
              { key: 'l1_rate', label: 'L1 Daily Rate (CXL)', type: 'number' },
              { key: 'l2_rate', label: 'L2 Daily Rate (CXL)', type: 'number' },
              { key: 'l3_rate', label: 'L3 Daily Rate (CXL)', type: 'number' },
              { key: 'l4_rate', label: 'L4 Daily Rate (CXL)', type: 'number' },
              { key: 'l5_rate', label: 'L5 Daily Rate (CXL)', type: 'number' },
              { key: 'presale_min_cxl', label: 'Presale Min CXL', type: 'number' },
              { key: 'presale_max_cxl', label: 'Presale Max CXL', type: 'number' },
              { key: 'presale_start_price', label: 'Presale Start Price', type: 'number' },
              { key: 'presale_daily_increment', label: 'Daily Price Increment', type: 'number' },
            ].map(({ key, label, type }) => (
              <div key={key} className="flex items-center gap-2 p-3">
                <label className="text-xs text-[#7B8BA5] min-w-[120px]">{label}</label>
                <input
                  type={type}
                  value={config[key] || ''}
                  onChange={e => setConfig({ ...config, [key]: e.target.value })}
                  className="flex-1 h-8 px-2 rounded-lg bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.08)] text-white text-xs font-mono focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
                />
                <button
                  onClick={() => handleUpdateConfig(key, config[key])}
                  disabled={!!actionLoading}
                  className="h-8 px-3 rounded-lg bg-[rgba(0,229,255,0.1)] text-[#00E5FF] text-xs font-semibold hover:bg-[rgba(0,229,255,0.2)] transition-all"
                >
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* User Lookup */}
        <div className="space-y-2">
          <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold">User Lookup</p>
          <div className="flex gap-2 mb-3">
            <input
              value={searchUserId}
              onChange={e => setSearchUserId(e.target.value)}
              placeholder="User ID"
              className="flex-1 h-10 px-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#7B8BA5]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
            />
            <button
              onClick={handleSearchUser}
              className="h-10 px-4 rounded-xl bg-[rgba(0,229,255,0.1)] text-[#00E5FF] text-sm font-semibold hover:bg-[rgba(0,229,255,0.2)] transition-all"
            >
              Search
            </button>
          </div>

          {userBalance && (
            <div className="rounded-xl border border-[rgba(0,229,255,0.08)] p-4" style={{ background: 'rgba(22,32,52,0.6)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-[#00E5FF]" />
                <p className="text-xs font-mono text-white">{userBalance.user?.wallet?.slice(0, 10)}...</p>
                <span className="text-xs text-[#7B8BA5]">Ref: {userBalance.user?.referral_code}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-[#7B8BA5]">Balance:</span> <span className="text-[#FFB800] font-mono">{userBalance.balance?.cxl_balance} CXL</span></div>
                <div><span className="text-[#7B8BA5]">Earned:</span> <span className="text-[#00E5FF] font-mono">{userBalance.balance?.cxl_earned_total} CXL</span></div>
                <div><span className="text-[#7B8BA5]">Liquid:</span> <span className="text-[#00FFB2] font-mono">{userBalance.balance?.cxl_liquid} CXL</span></div>
                <div><span className="text-[#7B8BA5]">Staked:</span> <span className="text-[#7B61FF] font-mono">{userBalance.balance?.cxl_staked} CXL</span></div>
                <div><span className="text-[#7B8BA5]">Claims:</span> <span className="text-white">{userBalance.balance?.total_claim_days} days</span></div>
                <div><span className="text-[#7B8BA5]">Bonus:</span> <span className="text-white">{userBalance.balance?.signup_bonus_claimed ? `Yes (${userBalance.balance?.signup_bonus_amount} CXL)` : 'No'}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
