'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAdminToken } from '@/lib/admin-auth';
import { UserPlus, Wallet, Tag, User, CheckCircle2, AlertCircle, Loader2, Copy, ExternalLink, CircleDollarSign, Ban, Info } from 'lucide-react';

const SLOTS = [
  { id: 'orbit-1', name: 'Spark', price: 5 },
  { id: 'orbit-2', name: 'Vortex', price: 10 },
  { id: 'orbit-3', name: 'Comet Pulse', price: 50 },
  { id: 'orbit-4', name: 'Nova Crux', price: 100 },
  { id: 'orbit-5', name: 'Cyber Node', price: 500 },
  { id: 'orbit-6', name: 'Pulse Matrix', price: 1000 },
  { id: 'orbit-7', name: 'Orbit Master', price: 5000 },
  { id: 'orbit-8', name: 'Alpha Ledger', price: 10000 },
  { id: 'orbit-9', name: 'Cosmic Titan', price: 25000 },
  { id: 'orbit-10', name: 'Apex Whale', price: 50000 },
  { id: 'orbit-11', name: 'Infinity Core', price: 100000 },
];

interface RegisteredUser {
  id: string;
  wallet: string;
  referralCode: string;
  displayName: string;
  sponsorId: string;
  roiEnabled: boolean;
  slotName: string | null;
}

export default function AdminRegisterUser() {
  useEffect(() => { document.title = 'Register User — CYLIX Admin'; }, []);

  const [wallet, setWallet] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [slotId, setSlotId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; user?: RegisteredUser } | null>(null);
  const [recentUsers, setRecentUsers] = useState<RegisteredUser[]>([]);

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
          slotId: slotId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ success: true, message: 'User registered successfully!', user: data.user });
        setRecentUsers(prev => [data.user, ...prev]);
        setWallet('');
        setDisplayName('');
        setSponsorCode('');
        setSlotId('');
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

      <Card className="border-[rgba(255,92,122,0.2)] bg-[rgba(255,92,122,0.03)]">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Ban size={18} className="text-[#FF5C7A] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#FF5C7A]">No ROI Accounts</p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Admin-registered accounts do <strong className="text-white">not</strong> receive daily ROI yield.
                Matrix income (upline commission) works normally. If a slot is selected, the upline gets matrix commission but this account earns no daily returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Form */}
      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">User Details</h3>
          <p className="text-[#94A3B8] text-sm">Enter wallet address, display name, and referral code</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Wallet Address */}
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
              <p className="text-[#5A6480] text-xs mt-1.5">BNB Chain wallet address (0x... format)</p>
            </div>

            {/* Display Name */}
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
              <p className="text-[#5A6480] text-xs mt-1.5">Optional display name for the user</p>
            </div>

            {/* Sponsor Referral Code */}
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
              <p className="text-[#5A6480] text-xs mt-1.5">Referral code of the sponsor (e.g., CXL1496A6)</p>
            </div>

            {/* Slot Selection */}
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                <CircleDollarSign size={14} className="inline mr-1.5 text-[#FFB800]" />
                Select Slot (Optional)
              </label>
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                className="w-full px-4 py-3 bg-[rgba(255,184,0,0.05)] border border-[rgba(255,184,0,0.15)] rounded-xl text-white focus:outline-none focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] transition-all text-sm appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                }}
              >
                <option value="" className="bg-[#090B14] text-[#5A6480]">No slot (ID only)</option>
                {SLOTS.map(s => (
                  <option key={s.id} value={s.id} className="bg-[#090B14] text-white">
                    {s.name} — ${s.price.toLocaleString()}
                  </option>
                ))}
              </select>
              <div className="flex items-start gap-1.5 mt-2">
                <Info size={12} className="text-[#5A6480] mt-0.5 shrink-0" />
                <p className="text-[#5A6480] text-xs">
                  If slot selected, upline gets matrix commission. Account earns <strong className="text-[#FF5C7A]">no ROI</strong>.
                </p>
              </div>
            </div>

            {/* Result Message */}
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
                      {result.user.slotName && (
                        <p className="text-xs text-[#94A3B8]">
                          Slot: <span className="text-[#FFB800] font-semibold">{result.user.slotName}</span>
                          <span className="text-[#FF5C7A] ml-2 text-[10px] uppercase font-bold">No ROI</span>
                        </p>
                      )}
                      <p className="text-xs text-[#94A3B8]">
                        ROI: <span className="text-[#FF5C7A] font-semibold">Disabled</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
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

      {/* Recently Registered Users */}
      {recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Recently Registered</h3>
            <p className="text-[#94A3B8] text-sm">Users registered in this session</p>
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
                      <p className="text-sm text-white font-medium">
                        {user.displayName || 'Unnamed'}
                      </p>
                      <p className="text-xs text-[#94A3B8] font-mono">{user.wallet.slice(0, 6)}...{user.wallet.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.slotName && (
                      <Badge className="bg-[rgba(255,184,0,0.15)] text-[#FFB800] border-[rgba(255,184,0,0.3)] text-[10px]">
                        {user.slotName}
                      </Badge>
                    )}
                    <Badge className="bg-[rgba(255,92,122,0.15)] text-[#FF5C7A] border-[rgba(255,92,122,0.3)] text-[10px]">
                      No ROI
                    </Badge>
                    <Badge variant="info" className="font-mono text-xs">{user.referralCode}</Badge>
                    <button
                      onClick={() => copyToClipboard(user.referralCode)}
                      className="p-1.5 text-[#94A3B8] hover:text-[#00E5FF] transition-colors"
                      title="Copy referral code"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Guide */}
      <Card className="border-[rgba(123,97,255,0.15)]">
        <CardContent className="p-5">
          <h4 className="text-sm font-semibold text-[#7B61FF] mb-3 font-heading">Quick Guide</h4>
          <ul className="space-y-2 text-xs text-[#94A3B8]">
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] mt-0.5">1.</span>
              <span>Enter the user&apos;s <strong className="text-white">BNB Chain wallet address</strong> (0x... format)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] mt-0.5">2.</span>
              <span>Enter a <strong className="text-white">display name</strong> (optional, helps identify the user)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] mt-0.5">3.</span>
              <span>Enter the <strong className="text-white">sponsor&apos;s referral code</strong> (e.g., CXL1496A6)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] mt-0.5">4.</span>
              <span><strong className="text-white">Select a slot</strong> (optional) — upline gets matrix commission, but account earns no ROI</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00E5FF] mt-0.5">5.</span>
              <span>Click <strong className="text-[#00FFB2]">Register User</strong> — user is added to the matrix under the sponsor</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
