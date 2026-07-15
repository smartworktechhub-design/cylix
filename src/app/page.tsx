'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { getUserByWallet } from '@/lib/db';
import { Orbit, ArrowRight, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [refError, setRefError] = useState('');
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [checking, setChecking] = useState(false);
  const [showWallets, setShowWallets] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
      localStorage.setItem('cylix_ref', ref.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (!isConnected || !address) return;
    setChecking(true);
    getUserByWallet(address).then(user => {
      if (user) window.location.href = '/dashboard';
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [isConnected, address]);

  const handleConnect = (connectorIndex: number) => {
    if (!referralCode.trim()) {
      setRefError('Referral code is required');
      return;
    }
    setRefError('');
    localStorage.setItem('cylix_ref', referralCode.trim().toUpperCase());
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
    <div className="min-h-screen bg-[#050816] flex flex-col relative overflow-hidden">
      {/* BG */}
      <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.03) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.025) 0%, transparent 70%)' }} />

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.12)]">
            <Orbit size={18} className="text-[#050816]" />
          </div>
          <span className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
        </div>
        <span className="text-[8px] px-2 py-1 rounded-full bg-[rgba(0,229,255,0.06)] text-[#00E5FF] font-bold uppercase tracking-wider">Matrix DeFi</span>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-10">
            <img src="/logo-wide.png" alt="CYLIX" className="w-[240px] mx-auto mb-2 drop-shadow-[0_0_40px_rgba(0,229,255,0.12)]" />
            <p className="text-[10px] tracking-[0.5em] text-white/30 uppercase" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              Autoflow Ecosystem
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-[1px] mb-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(123,97,255,0.3))' }}>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(9,11,20,0.95)' }}>
              {isConnected ? (
                checking ? (
                  <div className="text-center py-6">
                    <Loader2 size={28} className="animate-spin text-[#00E5FF] mx-auto mb-3" />
                    <p className="text-xs text-[#94A3B8]">Connecting your account...</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center mx-auto mb-3">
                      <Orbit size={22} className="text-[#050816]" />
                    </div>
                    <p className="text-xs text-[#94A3B8] mb-4">Connected! Redirecting to dashboard...</p>
                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#050816] transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
                      Go to Dashboard <ArrowRight size={14} />
                    </a>
                  </div>
                )
              ) : (
                <>
                  {/* Referral Input */}
                  <div className="mb-4">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setRefError(''); }}
                      placeholder="Enter referral code"
                      className="w-full h-12 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/40 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-all font-mono tracking-wider"
                    />
                    {refError && <p className="text-[#FF5C7A] text-[11px] mt-1.5">{refError}</p>}
                  </div>

                  {/* Single Connect Button */}
                  <button
                    onClick={() => {
                      if (!referralCode.trim()) { setRefError('Referral code is required'); return; }
                      setRefError('');
                      setShowWallets(true);
                    }}
                    className="w-full h-12 rounded-xl font-bold text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{
                      background: referralCode.trim()
                        ? 'linear-gradient(135deg, #00E5FF, #7B61FF)'
                        : 'rgba(0,229,255,0.08)',
                      color: referralCode.trim() ? '#050816' : '#4A5568',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Connect Wallet
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Small Stats */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
              <span className="text-[9px] text-[#4A5568]">3% Daily</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7B61FF]" />
              <span className="text-[9px] text-[#4A5568]">2x11 Matrix</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]" />
              <span className="text-[9px] text-[#4A5568]">From $5</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-[10px] text-white/20 leading-relaxed">
            Built for Automation, Transparency, and Community-Driven Growth.<br />
            <span className="text-[#00E5FF]/60">Be Ready. Be Early. Be CYLIX.</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <a href="/about" className="text-[9px] text-white/15 hover:text-white/30 transition-colors">About</a>
          <a href="/privacy-policy" className="text-[9px] text-white/15 hover:text-white/30 transition-colors">Privacy</a>
          <a href="/terms" className="text-[9px] text-white/15 hover:text-white/30 transition-colors">Terms</a>
          <a href="/risk-disclosure" className="text-[9px] text-white/15 hover:text-white/30 transition-colors">Risk</a>
          <a href="/disclaimer" className="text-[9px] text-white/15 hover:text-white/30 transition-colors">Disclaimer</a>
        </div>
        <p className="text-[8px] text-white/10">&copy; 2026 CYLIX MATRIX</p>
      </footer>

      {/* Wallet Connect Modal */}
      {showWallets && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWallets(false)} />
          <div className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden" style={{ background: 'rgba(14,18,32,0.98)', border: '1px solid rgba(0,229,255,0.1)' }}>
            {/* Handle bar mobile */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>Connect Wallet</h3>
                <button onClick={() => setShowWallets(false)} className="text-[#4A5568] hover:text-white text-lg transition-colors">&times;</button>
              </div>

              <div className="space-y-2.5">
                {connectors.map((connector, i) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(i)}
                    className="w-full h-14 rounded-xl flex items-center gap-3 px-4 transition-all hover:bg-[rgba(0,229,255,0.05)]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050816" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{connector.name}</p>
                      <p className="text-[9px] text-[#4A5568]">Browser Extension</p>
                    </div>
                    <ArrowRight size={14} className="text-[#4A5568] ml-auto" />
                  </button>
                ))}
              </div>

              <p className="text-center text-[9px] text-[#4A5568] mt-4">
                By connecting, you agree to our <a href="/terms" className="text-[#00E5FF] hover:underline">Terms</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
