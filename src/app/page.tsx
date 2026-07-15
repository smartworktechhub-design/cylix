'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useAppStore } from '@/stores/app-store';
import { getUserByWallet } from '@/lib/db';
import { Orbit, Wallet, ArrowRight, Users, Shield, Globe, Link as LinkIcon, Loader2, CheckCheck, Copy } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [refError, setRefError] = useState('');
  const [refSubmitting, setRefSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { setUser, setNeedsReferral } = useAppStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isConnected || !address) return;
    setChecking(true);
    getUserByWallet(address).then(user => {
      if (user) {
        window.location.href = '/dashboard';
      }
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [isConnected, address]);

  const handleConnect = (connectorIndex: number) => {
    if (!referralCode.trim()) {
      setRefError('Referral code is required');
      return;
    }
    setRefError('');
    try {
      connect({ connector: connectors[connectorIndex] });
    } catch {}
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-[rgba(0,229,255,0.08)] backdrop-blur-xl" style={{ background: 'rgba(5,8,22,0.92)' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.15)]">
              <Orbit size={20} className="text-[#050816]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX MATRIX</h1>
              <p className="text-[8px] text-[#4A5568] uppercase tracking-wider">DeFi Ecosystem</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isConnected && (
              <a href="/dashboard" className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#050816] transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
                Dashboard
                <ArrowRight size={12} />
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* BG Effects */}
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.03) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo-wide.png" alt="CYLIX" className="w-[280px] mx-auto mb-3 drop-shadow-[0_0_30px_rgba(0,229,255,0.15)]" />
            <p className="text-xs tracking-[0.4em] text-white/40 font-medium uppercase"
              style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              Matrix DeFi
            </p>
          </div>

          {/* Main Box */}
          <div className="rounded-2xl overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF, #00E5FF)' }}>
            <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(22,32,52,0.97))' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg">
                  <LinkIcon size={18} className="text-[#050816]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>ENTER WITH REFERRAL</h2>
                  <p className="text-[10px] text-[#94A3B8]">Referral code is mandatory to join</p>
                </div>
              </div>

              {/* Referral Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-[#94A3B8] mb-2">Referral Code</label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setRefError(''); }}
                  placeholder="Enter referral code (e.g. CXLXXXXX)"
                  className="w-full h-12 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/40 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-all font-mono"
                />
                {refError && <p className="text-[#FF5C7A] text-xs mt-2">{refError}</p>}
              </div>

              {/* Wallet Connect Buttons */}
              {isConnected ? (
                checking ? (
                  <div className="w-full h-12 rounded-xl flex items-center justify-center gap-2" style={{ background: 'rgba(0,229,255,0.1)' }}>
                    <Loader2 size={16} className="animate-spin text-[#00E5FF]" />
                    <span className="text-xs text-[#00E5FF] font-semibold">Checking account...</span>
                  </div>
                ) : (
                  <a href="/dashboard" className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-[#050816] font-semibold text-sm transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
                    Go to Dashboard
                    <ArrowRight size={14} />
                  </a>
                )
              ) : (
                <div className="space-y-2">
                  {connectors.map((connector, i) => (
                    <button
                      key={connector.uid}
                      onClick={() => handleConnect(i)}
                      disabled={!referralCode.trim()}
                      className="w-full h-12 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: referralCode.trim()
                          ? 'linear-gradient(135deg, #00E5FF, #7B61FF)'
                          : 'rgba(0,229,255,0.1)',
                        color: referralCode.trim() ? '#050816' : '#4A5568',
                      }}
                    >
                      <Wallet size={16} />
                      Connect {connector.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl p-3 text-center border border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
              <Shield size={16} className="text-[#00E5FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">Secure</p>
              <p className="text-[8px] text-[#4A5568]">BEP20 USDT</p>
            </div>
            <div className="rounded-xl p-3 text-center border border-[rgba(123,97,255,0.06)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
              <Globe size={16} className="text-[#7B61FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">DeFi</p>
              <p className="text-[8px] text-[#4A5568]">Decentralized</p>
            </div>
            <div className="rounded-xl p-3 text-center border border-[rgba(0,255,178,0.06)]" style={{ background: 'rgba(22,32,52,0.6)' }}>
              <Users size={16} className="text-[#00FFB2] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">Community</p>
              <p className="text-[8px] text-[#4A5568]">Driven Growth</p>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 space-y-3">
            <div className="rounded-xl p-4 border border-[rgba(0,229,255,0.06)]" style={{ background: 'rgba(22,32,52,0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <span className="text-xs font-bold text-[#00E5FF]">3%</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Daily Yield</p>
                  <p className="text-[10px] text-[#4A5568]">Up to 200% cap on every slot</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 border border-[rgba(123,97,255,0.06)]" style={{ background: 'rgba(22,32,52,0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,97,255,0.1)' }}>
                  <span className="text-xs font-bold text-[#7B61FF]">2x11</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Forced Binary Matrix</p>
                  <p className="text-[10px] text-[#4A5568]">4095 positions, BFS spillover</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-4 border border-[rgba(255,184,0,0.06)]" style={{ background: 'rgba(22,32,52,0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.1)' }}>
                  <span className="text-xs font-bold text-[#FFB800]">$5</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Start from $5</p>
                  <p className="text-[10px] text-[#4A5568]">11 levels up to $100K</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(0,229,255,0.06)] mt-auto" style={{ background: 'rgba(5,8,22,0.95)' }}>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                  <Orbit size={14} className="text-[#050816]" />
                </div>
                <span className="text-xs font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
              </div>
              <p className="text-[10px] text-[#4A5568] leading-relaxed">Decentralized Matrix DeFi Ecosystem for community-driven growth.</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Platform</p>
              <div className="space-y-1.5">
                <a href="https://app.cylixdefi.live/dashboard" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Dashboard</a>
                <a href="https://app.cylixdefi.live/slots" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Packages</a>
                <a href="https://app.cylixdefi.live/matrix" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Matrix</a>
                <a href="https://app.cylixdefi.live/earnings" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Earnings</a>
                <a href="https://app.cylixdefi.live/referrals" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Referrals</a>
                <a href="https://app.cylixdefi.live/withdrawals" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Withdrawals</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Resources</p>
              <div className="space-y-1.5">
                <a href="/about" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">About</a>
                <a href="/terms" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Terms of Service</a>
                <a href="/privacy-policy" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Privacy Policy</a>
                <a href="/risk-disclosure" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Risk Disclosure</a>
                <a href="/disclaimer" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Disclaimer</a>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-2">Community</p>
              <div className="space-y-1.5">
                <a href="https://t.me/cylixdefi" target="_blank" rel="noopener noreferrer" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">Telegram</a>
                <a href="https://youtube.com/@cylixdefi" target="_blank" rel="noopener noreferrer" className="block text-[10px] text-[#94A3B8] hover:text-[#00E5FF] transition-colors">YouTube</a>
              </div>
            </div>
          </div>
          <div className="border-t border-[rgba(0,229,255,0.04)] pt-4 text-center">
            <p className="text-[9px] text-[#4A5568]">&copy; 2026 CYLIX MATRIX DeFi. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
