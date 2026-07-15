'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { getUserByWallet } from '@/lib/db';
import { Orbit, ArrowRight, Loader2, Shield, Users, TrendingUp, Zap, ChevronDown } from 'lucide-react';

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
      {/* Animated BG Orbs */}
      <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)', animation: 'orbFloat 15s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.03) 0%, transparent 70%)', animation: 'orbFloat 12s ease-in-out infinite alternate-reverse' }} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 2}px`, height: `${2 + Math.random() * 2}px`,
              background: i % 2 === 0 ? 'rgba(0,229,255,0.12)' : 'rgba(123,97,255,0.1)',
              animation: `particleFloat ${10 + Math.random() * 15}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }} />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.12)]">
            <Orbit size={18} className="text-[#050816]" />
          </div>
          <span className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
        </div>
        <span className="text-[8px] px-2 py-1 rounded-full bg-[rgba(0,229,255,0.06)] text-[#00E5FF] font-bold uppercase tracking-wider">Live on BSC</span>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo + Title */}
          <div className="text-center mb-8" style={{ animation: 'fadeUp 0.8s ease-out' }}>
            <img src="/logo-wide.png" alt="CYLIX" className="w-[220px] mx-auto mb-3 drop-shadow-[0_0_40px_rgba(0,229,255,0.12)]" />
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
              <span className="text-[9px] text-[#00E5FF] font-semibold uppercase tracking-wider">Autoflow Ecosystem</span>
            </div>
          </div>

          {/* What is CYLIX */}
          <div className="mb-6 text-center" style={{ animation: 'fadeUp 0.8s ease-out 0.1s both' }}>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Orbitron',sans-serif" }}>
              The Future of <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>Decentralized</span> Growth
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">
              CYLIX MATRIX is a community-driven DeFi ecosystem on Binance Smart Chain. Build your network through a 2x11 forced binary matrix and earn daily yields powered by smart automation.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-6" style={{ animation: 'fadeUp 0.8s ease-out 0.2s both' }}>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,229,255,0.06)' }}>
              <TrendingUp size={18} className="text-[#00E5FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">3% Daily</p>
              <p className="text-[8px] text-[#4A5568]">Up to 200%</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(123,97,255,0.06)' }}>
              <Users size={18} className="text-[#7B61FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">2x11 Matrix</p>
              <p className="text-[8px] text-[#4A5568]">4095 Spots</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,255,178,0.06)' }}>
              <Zap size={18} className="text-[#00FFB2] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">Auto Upgrade</p>
              <p className="text-[8px] text-[#4A5568]">Ascension Vault</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-6 rounded-xl p-4" style={{ background: 'rgba(22,32,52,0.4)', border: '1px solid rgba(0,229,255,0.05)', animation: 'fadeUp 0.8s ease-out 0.3s both' }}>
            <p className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-wider mb-3">How It Works</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#00E5FF]">1</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Connect Wallet & Enter Referral</p>
                  <p className="text-[9px] text-[#4A5568]">Join using your sponsor&apos;s referral code. MetaMask, Trust Wallet & more supported.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(123,97,255,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#7B61FF]">2</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Choose Your Package</p>
                  <p className="text-[9px] text-[#4A5568]">Start from just $5 (Spark) and progress through 11 levels up to $100K.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,255,178,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#00FFB2]">3</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Earn & Grow</p>
                  <p className="text-[9px] text-[#4A5568]">Earn 3% daily yield, matrix commissions from 11 levels, and pool rewards.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Connect Card */}
          <div className="rounded-2xl p-[1px] mb-4" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(123,97,255,0.3))', animation: 'fadeUp 0.8s ease-out 0.4s both' }}>
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
                    <p className="text-xs text-[#94A3B8] mb-4">Connected! Redirecting...</p>
                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#050816] transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
                      Go to Dashboard <ArrowRight size={14} />
                    </a>
                  </div>
                )
              ) : (
                <>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setRefError(''); }}
                    placeholder="Enter referral code"
                    className="w-full h-11 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/40 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-all font-mono tracking-wider mb-3"
                  />
                  {refError && <p className="text-[#FF5C7A] text-[11px] mb-2">{refError}</p>}
                  <button
                    onClick={() => {
                      if (!referralCode.trim()) { setRefError('Referral code is required'); return; }
                      setRefError('');
                      setShowWallets(true);
                    }}
                    className="w-full h-12 rounded-xl font-bold text-sm text-[#050816] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] flex items-center justify-center gap-2.5"
                    style={{ background: referralCode.trim() ? 'linear-gradient(135deg, #00E5FF, #7B61FF)' : 'rgba(0,229,255,0.08)', color: referralCode.trim() ? '#050816' : '#4A5568' }}
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

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mb-5" style={{ animation: 'fadeUp 0.8s ease-out 0.5s both' }}>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#00E5FF]" />
              <span className="text-[9px] text-[#4A5568]">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-[#7B61FF]" />
              <span className="text-[9px] text-[#4A5568]">Instant Payouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-[#00FFB2]" />
              <span className="text-[9px] text-[#4A5568]">Community Driven</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-4 border-t border-[rgba(0,229,255,0.04)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-2">
            <a href="/about" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">About</a>
            <a href="/terms" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Terms</a>
            <a href="/privacy-policy" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Privacy</a>
            <a href="/risk-disclosure" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Risk Disclosure</a>
            <a href="/disclaimer" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Disclaimer</a>
            <a href="https://t.me/cylixdefi" target="_blank" rel="noopener noreferrer" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">Telegram</a>
            <a href="https://youtube.com/@cylixdefi" target="_blank" rel="noopener noreferrer" className="text-[9px] text-white/20 hover:text-white/40 transition-colors">YouTube</a>
          </div>
          <p className="text-center text-[8px] text-white/10">&copy; 2026 CYLIX MATRIX. All rights reserved.</p>
        </div>
      </footer>

      {/* Wallet Modal */}
      {showWallets && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWallets(false)} />
          <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden" style={{ background: 'rgba(14,18,32,0.98)', border: '1px solid rgba(0,229,255,0.08)', animation: 'slideUp 0.3s ease-out' }}>
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/10" />
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>Connect Wallet</h3>
                  <p className="text-[10px] text-[#4A5568] mt-0.5">Choose your preferred wallet</p>
                </div>
                <button onClick={() => setShowWallets(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4A5568] hover:text-white hover:bg-white/5 transition-all">&times;</button>
              </div>
              <div className="space-y-2">
                {connectors.map((connector, i) => (
                  <button
                    key={connector.uid}
                    onClick={() => handleConnect(i)}
                    className="w-full h-14 rounded-xl flex items-center gap-3 px-4 transition-all hover:bg-[rgba(0,229,255,0.05)]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(123,97,255,0.15))' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-semibold text-white">{connector.name}</p>
                      <p className="text-[9px] text-[#4A5568]">Browser Extension</p>
                    </div>
                    <ArrowRight size={14} className="text-[#4A5568]" />
                  </button>
                ))}
              </div>
              <p className="text-center text-[9px] text-[#4A5568] mt-4">
                By connecting, you agree to our <a href="/terms" className="text-[#00E5FF] hover:underline">Terms of Service</a>
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          25% { transform: translateY(-25px) translateX(12px); opacity: 0.2; }
          50% { transform: translateY(-10px) translateX(-8px); opacity: 0.08; }
          75% { transform: translateY(-35px) translateX(15px); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
