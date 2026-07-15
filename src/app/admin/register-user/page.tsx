'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminToken } from '@/lib/admin-auth';
import { UserPlus, Wallet, Tag, User, CheckCircle2, AlertCircle, Loader2, Copy, CircleDollarSign, Info, ToggleLeft, ToggleRight } from 'lucide-react';

const SLOTS = [
  { id: 'orbit-1', name: 'Spark', price: 5, color: '#00E5FF' },
  { id: 'orbit-2', name: 'Vortex', price: 10, color: '#7B61FF' },
  { id: 'orbit-3', name: 'Comet Pulse', price: 50, color: '#00FFB2' },
  { id: 'orbit-4', name: 'Nova Crux', price: 100, color: '#FFB800' },
  { id: 'orbit-5', name: 'Cyber Node', price: 500, color: '#FF5C7A' },
  { id: 'orbit-6', name: 'Pulse Matrix', price: 1000, color: '#00E5FF' },
  { id: 'orbit-7', name: 'Orbit Master', price: 5000, color: '#7B61FF' },
  { id: 'orbit-8', name: 'Alpha Ledger', price: 10000, color: '#00FFB2' },
  { id: 'orbit-9', name: 'Cosmic Titan', price: 25000, color: '#FFB800' },
  { id: 'orbit-10', name: 'Apex Whale', price: 50000, color: '#FF5C7A' },
  { id: 'orbit-11', name: 'Infinity Core', price: 100000, color: '#00E5FF' },
];

interface RegisteredUser {
  id: string;
  wallet: string;
  referralCode: string;
  displayName: string;
  sponsorId: string;
  roiEnabled: boolean;
  slotNames: string[];
}

export default function AdminRegisterUser() {
  useEffect(() => { document.title = 'Register User — CYLIX Admin'; }, []);

  const [wallet, setWallet] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [roiEnabled, setRoiEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; user?: RegisteredUser } | null>(null);
  const [recentUsers, setRecentUsers] = useState<RegisteredUser[]>([]);

  const toggleSlot = (slotId: string) => {
    setSelectedSlots(prev =>
      prev.includes(slotId) ? prev.filter(s => s !== slotId) : [...prev, slotId]
    );
  };

  const selectAll = () => setSelectedSlots(SLOTS.map(s => s.id));
  const clearAll = () => setSelectedSlots([]);

  const totalSlotPrice = selectedSlots.reduce((sum, id) => {
    const slot = SLOTS.find(s => s.id === id);
    return sum + (slot?.price || 0);
  }, 0);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/register-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'x-admin-token': token } : {}),
        },
        body: JSON.stringify({
          wallet: wallet.trim(),
          displayName: displayName.trim(),
          sponsorCode: sponsorCode.trim(),
          slotIds: selectedSlots.length > 0 ? selectedSlots : undefined,
          roiEnabled,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ success: true, message: 'User registered successfully!', user: data.user });
        setRecentUsers(prev => [data.user, ...prev]);
        setWallet('');
        setDisplayName('');
        setSponsorCode('');
        setSelectedSlots([]);
      } else {
        setResult({ success: false, message: data.error || 'Registration failed' });
      }
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading flex items-center gap-3">
          <UserPlus size={24} className="text-[#00E5FF]" />
          Register New User
        </h2>
        <p className="text-[#94A3B8] text-sm mt-1">Manually register a new user via wallet address</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">User Details</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                <Wallet size={14} className="inline mr-1.5 text-[#00E5FF]" />
                Wallet Address
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                required
                className="w-full px-4 py-3 bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.15)] rounded-xl text-white placeholder-[#5A6480] focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF] transition-all font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                <User size={14} className="inline mr-1.5 text-[#7B61FF]" />
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter name (optional)"
                className="w-full px-4 py-3 bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.15)] rounded-xl text-white placeholder-[#5A6480] focus:outline-none focus:border-[#7B61FF] focus:ring-1 focus:ring-[#7B61FF] transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                <Tag size={14} className="inline mr-1.5 text-[#00FFB2]" />
                Sponsor Referral Code
              </label>
              <input
                type="text"
                value={sponsorCode}
                onChange={(e) => setSponsorCode(e.target.value)}
                placeholder="CXL..."
                required
                className="w-full px-4 py-3 bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.15)] rounded-xl text-white placeholder-[#5A6480] focus:outline-none focus:border-[#00FFB2] focus:ring-1 focus:ring-[#00FFB2] transition-all font-mono text-sm uppercase"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[#94A3B8] flex items-center gap-1.5">
                  <CircleDollarSign size={14} className="text-[#FFB800]" />
                  ROI Daily Yield
                </label>
                <button
                  type="button"
                  onClick={() => setRoiEnabled(!roiEnabled)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                  style={{
                    background: roiEnabled ? 'rgba(0,255,178,0.1)' : 'rgba(255,92,122,0.1)',
                    border: `1px solid ${roiEnabled ? 'rgba(0,255,178,0.3)' : 'rgba(255,92,122,0.3)'}`,
                  }}
                >
                  {roiEnabled ? (
                    <ToggleRight size={20} className="text-[#00FFB2]" />
                  ) : (
                    <ToggleLeft size={20} className="text-[#FF5C7A]" />
                  )}
                  <span className={`text-sm font-semibold ${roiEnabled ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                    {roiEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>
              <p className="text-[#5A6480] text-xs">
                {roiEnabled
                  ? 'User will receive 3% daily ROI on purchased slots.'
                  : 'User will NOT receive daily ROI. Matrix commission still works.'}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-[#94A3B8] flex items-center gap-1.5">
                  <CircleDollarSign size={14} className="text-[#FFB800]" />
                  Select Slots
                </label>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={selectAll} className="text-xs text-[#00E5FF] hover:underline">Select All</button>
                  <span className="text-[#5A6480]">|</span>
                  <button type="button" onClick={clearAll} className="text-xs text-[#FF5C7A] hover:underline">Clear</button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SLOTS.map(slot => {
                  const isSelected = selectedSlots.includes(slot.id);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => toggleSlot(slot.id)}
                      className="p-3 rounded-xl text-left transition-all border"
                      style={{
                        background: isSelected ? `${slot.color}12` : 'rgba(11,16,32,0.5)',
                        borderColor: isSelected ? `${slot.color}50` : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center border"
                          style={{
                            borderColor: isSelected ? slot.color : '#5A6480',
                            background: isSelected ? slot.color : 'transparent',
                          }}
                        >
                          {isSelected && <CheckCircle2 size={10} className="text-[#090B14]" />}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white">{slot.name}</p>
                          <p className="text-[10px] font-mono" style={{ color: slot.color }}>${slot.price.toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedSlots.length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-[rgba(255,184,0,0.05)] border border-[rgba(255,184,0,0.15)]">
                  <p className="text-xs text-[#FFB800]">
                    {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected — Total: ${totalSlotPrice.toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {result && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                result.success
                  ? 'bg-[rgba(0,255,178,0.05)] border-[rgba(0,255,178,0.2)]'
                  : 'bg-[rgba(255,92,122,0.05)] border-[rgba(255,92,122,0.2)]'
              }`}>
                {result.success ? (
                  <CheckCircle2 size={18} className="text-[#00FFB2] mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-[#FF5C7A] mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`text-sm font-medium ${result.success ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                    {result.message}
                  </p>
                  {result.user && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-[#94A3B8]">
                        Wallet: <span className="text-[#00E5FF] font-mono">{result.user.wallet}</span>
                      </p>
                      <p className="text-xs text-[#94A3B8]">
                        Referral Code:{' '}
                        <span className="text-[#7B61FF] font-mono font-bold">{result.user.referralCode}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(result.user!.referralCode)}
                          className="ml-2 text-[#00E5FF] hover:text-[#00E5FF]/80"
                        >
                          <Copy size={12} />
                        </button>
                      </p>
                      {result.user.displayName && (
                        <p className="text-xs text-[#94A3B8]">
                          Name: <span className="text-white">{result.user.displayName}</span>
                        </p>
                      )}
                      {result.user.slotNames && result.user.slotNames.length > 0 && (
                        <p className="text-xs text-[#94A3B8]">
                          Slots: {result.user.slotNames.map((n, i) => (
                            <span key={i}>
                              <span className="text-[#FFB800] font-semibold">{n}</span>
                              {i < result.user!.slotNames.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </p>
                      )}
                      <p className="text-xs text-[#94A3B8]">
                        ROI:{' '}
                        <span className={`font-semibold ${result.user.roiEnabled ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                          {result.user.roiEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !wallet || !sponsorCode}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: loading || !wallet || !sponsorCode
                  ? 'rgba(0,229,255,0.2)'
                  : 'linear-gradient(135deg, #00E5FF 0%, #7B61FF 100%)',
                color: '#090B14',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Register User
                </>
              )}
            </button>
          </form>
        </CardContent>
      </Card>

      {recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Recently Registered</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-[rgba(0,229,255,0.03)] border border-[rgba(0,229,255,0.08)] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center text-[#090B14] font-bold text-xs">
                      {user.displayName?.charAt(0)?.toUpperCase() || user.wallet.charAt(2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{user.displayName || 'Unnamed'}</p>
                      <p className="text-xs text-[#94A3B8] font-mono">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.slotNames && user.slotNames.map((name, i) => (
                      <Badge key={i} className="bg-[rgba(255,184,0,0.15)] text-[#FFB800] border-[rgba(255,184,0,0.3)] text-[10px]">
                        {name}
                      </Badge>
                    ))}
                    <Badge className={user.roiEnabled
                      ? 'bg-[rgba(0,255,178,0.15)] text-[#00FFB2] border-[rgba(0,255,178,0.3)] text-[10px]'
                      : 'bg-[rgba(255,92,122,0.15)] text-[#FF5C7A] border-[rgba(255,92,122,0.3)] text-[10px]'
                    }>
                      {user.roiEnabled ? 'ROI ON' : 'No ROI'}
                    </Badge>
                    <Badge variant="info" className="font-mono text-xs">{user.referralCode}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
