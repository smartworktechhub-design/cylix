'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { getUserByWallet } from '@/lib/db';
import { Orbit, ArrowRight, Loader2, Shield, Users, TrendingUp, Zap, FileText, CheckCircle2, XCircle } from 'lucide-react';

const WALLET_LOGOS: Record<string, string> = {
  'MetaMask': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 318.6 318.6"><path fill="#E2761B" stroke="#E2761B" stroke-linecap="round" stroke-linejoin="round" d="M274.1 35.5l-99.5 73.9L193 65.8z"/><path d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm42.2-1.4L318.6 107l-97.2-73.7-17 44.4zM45.6 107l-3.9 58 56.7-15.6-26.5-40.6zm153.7 99.3l-17.4 26.2 61.2 1.5 17.3-55.2zm39.1-82.6l-55.5-25.6 19.4 43.1zm-55.5 25.6l-58.3-26.8 19.3 43z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/><path fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round" d="M104.4 142.7l-17.4 26.2 59 .3v-39.7zm109.6 0v39.7l59.2-.3-17.6-26.2zm-60.7-41.2l14.1-54.8-51.4.1zm-53.4.1l-51.4-.1 14.1 54.8zm-22.8 96.3l33.8-16.2-29.5-22.8zm68 0l-29.3 22.8 33.8 16.2z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/></svg>'),
  'Trust Wallet': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><defs><linearGradient id="a" x1=".5" y1="0" x2=".5" y2="1"><stop offset="0" stop-color="#2B9ED0"/><stop offset="1" stop-color="#0077C6"/></linearGradient></defs><circle cx="120" cy="120" r="120" fill="url(#a)"/><path d="M120 65c-22.1 0-40 17.9-40 40 0 15.3 8.6 28.6 21.2 35.4l13.5 7.2c4.8 2.5 10.3 2.5 15.1 0l13.5-7.2c12.6-6.8 21.2-20.1 21.2-35.4 0-22.1-17.9-40-40-40zm16.5 59.2l-5.8 3.1c-7.3 3.9-15.9 3.9-23.2 0l-5.8-3.1c-6.8-3.6-11.5-10.7-11.5-18.7v-10.6c0-4.7 2.5-9.1 6.6-11.4l6.6-3.5c3.6-1.9 7.9-1.9 11.4 0l6.6 3.5c4.1 2.3 6.6 6.7 6.6 11.4v10.6c0 8-4.6 15.1-11.5 18.7v0z" fill="#fff"/></svg>'),
  'WalletConnect': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35"><circle cx="17.5" cy="17.5" r="17.5" fill="#3B99FC"/><path d="M12.7 14.4c2.8-2.7 7.3-2.7 10.1 0l.4.4c.1.1.1.2 0 .3l-1.1 1c-.1.1-.2.1-.3 0l-.4-.4c-1.8-1.7-4.7-1.7-6.5 0l-.5.5c-.1.1-.2.1-.3 0l-1.1-1c-.1-.1-.1-.2 0-.3l.4-.4zm14.3 5.9c-.1-.1-.3-.1-.4 0l-.5.5c-2.8 2.7-7.3 2.7-10.1 0l-.5-.5c-.1-.1-.3-.1-.4 0l-1.1 1c-.1.1-.1.3 0 .4l.5.5c3.4 3.3 8.9 3.3 12.3 0l.5-.5c.1-.1.1-.3 0-.4l-1.1-1zm-3.3 3.3c-.1-.1-.3-.1-.4 0l-.5.5c-1.6 1.5-4.1 1.5-5.6 0l-.5-.5c-.1-.1-.3-.1-.4 0l-1.1 1c-.1.1-.1.3 0 .4l.5.5c2.3 2.2 6 2.2 8.3 0l.5-.5c.1-.1.1-.3 0-.4l-1.1-1z" fill="#fff"/></svg>'),
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [refError, setRefError] = useState('');
  const [refValid, setRefValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const [checking, setChecking] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'error' | 'success' } | null>(null);

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

  const validateReferral = async (code: string) => {
    if (!code.trim()) { setRefValid(null); return; }
    setValidating(true);
    try {
      const res = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const data = await res.json();
      setRefValid(data.valid);
    } catch {
      setRefValid(null);
    }
    setValidating(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (referralCode.trim().length >= 3) validateReferral(referralCode);
      else setRefValid(null);
    }, 500);
    return () => clearTimeout(t);
  }, [referralCode]);

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = (connectorIndex: number) => {
    if (!referralCode.trim()) {
      showToast('Please enter a referral code');
      setRefError('Referral code is required');
      return;
    }
    if (refValid === false) {
      showToast('Invalid referral code');
      setRefError('Invalid referral code');
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

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.3s_ease-out]">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm border ${
            toast.type === 'error' ? 'bg-[rgba(255,92,122,0.12)] border-[rgba(255,92,122,0.2)] text-[#FF5C7A]' :
            'bg-[rgba(0,255,178,0.12)] border-[rgba(0,255,178,0.2)] text-[#00FFB2]'
          }`}>
            {toast.type === 'error' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
            <span className="text-xs font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.12)]">
            <Orbit size={18} className="text-[#050816]" />
          </div>
          <span className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
        </div>
        <a href="/cylix-whitepaper.pdf" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(123,97,255,0.08)] border border-[rgba(123,97,255,0.15)] hover:bg-[rgba(123,97,255,0.15)] transition-all">
          <FileText size={12} className="text-[#7B61FF]" />
          <span className="text-[9px] text-[#7B61FF] font-bold uppercase tracking-wider">Whitepaper</span>
        </a>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo + CYLIX text */}
          <div className="text-center mb-6" style={{ animation: 'fadeUp 0.8s ease-out' }}>
            <img src="/logo-wide.png" alt="CYLIX" className="w-[220px] mx-auto mb-2 drop-shadow-[0_0_40px_rgba(0,229,255,0.12)]" />
            <h1 className="text-2xl font-bold text-white tracking-[0.3em] mb-2" style={{ fontFamily: "'Orbitron',sans-serif", backgroundImage: 'linear-gradient(135deg, #00E5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CYLIX</h1>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2] animate-pulse" />
              <span className="text-[9px] text-[#00E5FF] font-semibold uppercase tracking-wider">Autoflow Ecosystem</span>
            </div>
          </div>

          {/* Connect Card */}
          <div className="rounded-2xl p-[1px] mb-5" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(123,97,255,0.3))', animation: 'fadeUp 0.8s ease-out 0.1s both' }}>
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
                  <label className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-2 block">Referral Code</label>
                  <div className="relative mb-1">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setRefError(''); }}
                      placeholder="e.g. CXLXXXXX"
                      className="w-full h-11 px-4 pr-10 rounded-xl bg-[rgba(11,16,32,0.8)] border text-white placeholder:text-[#94A3B8]/40 text-sm focus:outline-none transition-all font-mono tracking-wider"
                      style={{ borderColor: refValid === true ? 'rgba(0,255,178,0.3)' : refValid === false ? 'rgba(255,92,122,0.3)' : 'rgba(0,229,255,0.1)' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validating ? (
                        <Loader2 size={14} className="animate-spin text-[#4A5568]" />
                      ) : refValid === true ? (
                        <CheckCircle2 size={14} className="text-[#00FFB2]" />
                      ) : refValid === false ? (
                        <XCircle size={14} className="text-[#FF5C7A]" />
                      ) : null}
                    </div>
                  </div>
                  {refError && <p className="text-[#FF5C7A] text-[11px] mb-2">{refError}</p>}
                  {refValid === false && !refError && <p className="text-[#FF5C7A] text-[11px] mb-2">Invalid referral code</p>}

                  <button
                    onClick={() => {
                      if (!referralCode.trim()) { showToast('Please enter a referral code'); setRefError('Referral code is required'); return; }
                      if (refValid === false) { showToast('Invalid referral code'); setRefError('Invalid referral code'); return; }
                      setRefError('');
                      setShowWallets(true);
                    }}
                    className="w-full h-12 rounded-xl font-bold text-sm text-[#050816] transition-all hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] flex items-center justify-center gap-2.5 mt-3"
                    style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}
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

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-5" style={{ animation: 'fadeUp 0.8s ease-out 0.2s both' }}>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,229,255,0.06)' }}>
              <TrendingUp size={18} className="text-[#00E5FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">3% Daily</p>
              <p className="text-[8px] text-[#94A3B8]">Up to 200%</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(123,97,255,0.06)' }}>
              <Users size={18} className="text-[#7B61FF] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">2x11 Matrix</p>
              <p className="text-[8px] text-[#94A3B8]">4095 Spots</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(22,32,52,0.6)', border: '1px solid rgba(0,255,178,0.06)' }}>
              <Zap size={18} className="text-[#00FFB2] mx-auto mb-1.5" />
              <p className="text-[10px] font-bold text-white">Auto Upgrade</p>
              <p className="text-[8px] text-[#94A3B8]">Ascension Vault</p>
            </div>
          </div>

          {/* How it works */}
          <div className="mb-5 rounded-xl p-4" style={{ background: 'rgba(22,32,52,0.4)', border: '1px solid rgba(0,229,255,0.05)', animation: 'fadeUp 0.8s ease-out 0.3s both' }}>
            <p className="text-[9px] text-[#00E5FF] font-bold uppercase tracking-wider mb-3">How It Works</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#00E5FF]">1</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Connect Wallet & Enter Referral</p>
                  <p className="text-[9px] text-[#94A3B8]">Join using your sponsor&apos;s referral code.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(123,97,255,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#7B61FF]">2</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Choose Your Package</p>
                  <p className="text-[9px] text-[#94A3B8]">Start from $5 (Spark) up to $100K (Infinity Core).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,255,178,0.1)' }}>
                  <span className="text-[10px] font-bold text-[#00FFB2]">3</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Earn & Grow</p>
                  <p className="text-[9px] text-[#94A3B8]">Earn 3% daily yield + matrix commissions + pool rewards.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mb-5" style={{ animation: 'fadeUp 0.8s ease-out 0.4s both' }}>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#00E5FF]" />
              <span className="text-[9px] text-[#94A3B8]">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-[#7B61FF]" />
              <span className="text-[9px] text-[#94A3B8]">Instant Payouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-[#00FFB2]" />
              <span className="text-[9px] text-[#94A3B8]">Community Driven</span>
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
                  <p className="text-[10px] text-[#94A3B8] mt-0.5">Choose your preferred wallet</p>
                </div>
                <button onClick={() => setShowWallets(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all">&times;</button>
              </div>
              <div className="space-y-2">
                {connectors.map((connector, i) => {
                  const logo = WALLET_LOGOS[connector.name];
                  return (
                    <button
                      key={connector.uid}
                      onClick={() => handleConnect(i)}
                      className="w-full h-14 rounded-xl flex items-center gap-3 px-4 transition-all hover:bg-[rgba(0,229,255,0.05)]"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {logo ? (
                          <img src={logo} alt={connector.name} className="w-5 h-5 object-contain" />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-semibold text-white">{connector.name}</p>
                        <p className="text-[9px] text-[#94A3B8]">Browser Extension</p>
                      </div>
                      <ArrowRight size={14} className="text-[#94A3B8]" />
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[9px] text-[#94A3B8] mt-4">
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
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
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
