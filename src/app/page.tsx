'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { getUserByWallet } from '@/lib/db';
import { Orbit, ArrowRight, Loader2, Shield, Users, Zap, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [refError, setRefError] = useState('');
  const [refValid, setRefValid] = useState<boolean | null>(null);
  const [validating, setValidating] = useState(false);
  const { isConnected, address } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { openConnectModal } = useConnectModal();
  const [checking, setChecking] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
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

  const validateReferral = async (code: string, signal?: AbortSignal) => {
    if (!code.trim()) { setRefValid(null); return; }
    setValidating(true);
    try {
      const res = await fetch('/api/validate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
        signal,
      });
      const data = await res.json();
      setRefValid(data.valid);
    } catch {
      if (!signal?.aborted) setRefValid(null);
    }
    setValidating(false);
  };

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(() => {
      if (referralCode.trim().length >= 3) validateReferral(referralCode, controller.signal);
      else setRefValid(null);
    }, 500);
    return () => { clearTimeout(t); controller.abort(); };
  }, [referralCode]);

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = async (connector: typeof connectors[number]) => {
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
    setConnectingId(connector.uid);
    localStorage.setItem('cylix_ref', referralCode.trim().toUpperCase());
    try {
      await connect({ connector });
    } catch (e: any) {
      showToast(e?.message?.slice(0, 60) || 'Connection failed');
    }
    setConnectingId(null);
  };

  const handleBrowserWallet = async () => {
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
    const injected = connectors.find(c => c.id === 'injected' || c.name === 'Injected');
    if (injected) {
      setConnectingId(injected.uid);
      try {
        await connect({ connector: injected });
      } catch (e: any) {
        showToast(e?.message?.slice(0, 60) || 'No wallet detected. Install MetaMask or SafePal.');
      }
      setConnectingId(null);
    } else {
      showToast('No browser wallet detected. Install MetaMask or SafePal.');
    }
  };

  const handleWalletConnect = () => {
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
    setShowWallets(false);
    openConnectModal?.();
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

      {/* Risk Disclaimer Banner */}
      <div className="relative z-10 bg-[rgba(255,180,0,0.06)] border-b border-[rgba(255,180,0,0.12)]">
        <div className="max-w-3xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
          <AlertTriangle size={12} className="text-[#FFB400] shrink-0" />
          <p className="text-[10px] text-[#FFB400] text-center">
            CYLIX MATRIX is a decentralized application on BNB Smart Chain. Participating involves financial risk. Only invest what you can afford to lose. Past performance is not indicative of future results.
          </p>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-4 flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center shadow-lg shadow-[rgba(0,229,255,0.12)]">
            <Orbit size={18} className="text-[#050816]" />
          </div>
          <span className="text-sm font-bold text-white tracking-wider" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/about" className="text-[11px] text-white/40 hover:text-white/60 transition-colors hidden sm:block">About</a>
          <a href="https://t.me/cylixdefi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] hover:bg-[rgba(0,229,255,0.12)] transition-all">
            <span className="text-[11px] text-[#00E5FF] font-bold uppercase tracking-wider">Community</span>
            <ExternalLink size={10} className="text-[#00E5FF]" />
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo + CYLIX text */}
          <div className="text-center mb-6" style={{ animation: 'fadeUp 0.8s ease-out' }}>
            <img src="/logo-wide.png" alt="CYLIX MATRIX" className="w-[220px] mx-auto mb-2 drop-shadow-[0_0_40px_rgba(0,229,255,0.12)]" />
            <h1 className="text-2xl font-bold text-white tracking-[0.3em] mb-2" style={{ fontFamily: "'Orbitron',sans-serif", backgroundImage: 'linear-gradient(135deg, #00E5FF, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CYLIX</h1>
            <p className="text-[11px] text-[#A8B8D0] max-w-xs mx-auto leading-relaxed">
              Decentralized yield protocol on BNB Smart Chain. Smart contracts distribute yields from a shared pool to active participants.
            </p>
          </div>

          {/* Connect Card */}
          <div className="rounded-2xl p-[1px] mb-5" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(123,97,255,0.3))', animation: 'fadeUp 0.8s ease-out 0.1s both' }}>
            <div className="rounded-2xl p-5" style={{ background: 'rgba(9,11,20,0.95)' }}>
              {isConnected ? (
                checking ? (
                  <div className="text-center py-6">
                    <Loader2 size={28} className="animate-spin text-[#00E5FF] mx-auto mb-3" />
                    <p className="text-xs text-[#A8B8D0]">Connecting your account...</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center mx-auto mb-3">
                      <Orbit size={22} className="text-[#050816]" />
                    </div>
                    <p className="text-xs text-[#A8B8D0] mb-4">Connected! Redirecting...</p>
                    <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[#050816] transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}>
                      Go to Dashboard <ArrowRight size={14} />
                    </a>
                  </div>
                )
              ) : (
                <>
                  <label className="text-xs text-[#A8B8D0] font-semibold uppercase tracking-wider mb-2 block">Referral Code</label>
                  <div className="relative mb-1">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setRefError(''); }}
                      placeholder="e.g. CXLXXXXX"
                      className="w-full h-11 px-4 pr-10 rounded-xl bg-[rgba(11,16,32,0.8)] border text-white placeholder:text-[#A8B8D0]/40 text-sm focus:outline-none transition-all font-mono tracking-wider"
                      style={{ borderColor: refValid === true ? 'rgba(0,255,178,0.3)' : refValid === false ? 'rgba(255,92,122,0.3)' : 'rgba(0,229,255,0.1)' }}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validating ? (
                        <Loader2 size={14} className="animate-spin text-[#7B8BA5]" />
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

          {/* How It Works */}
          <div className="mb-5 rounded-xl p-4" style={{ background: 'rgba(22,32,52,0.4)', border: '1px solid rgba(0,229,255,0.05)', animation: 'fadeUp 0.8s ease-out 0.2s both' }}>
            <p className="text-[11px] text-[#00E5FF] font-bold uppercase tracking-wider mb-3">How It Works</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,229,255,0.1)' }}>
                  <span className="text-xs font-bold text-[#00E5FF]">1</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Connect & Verify</p>
                  <p className="text-[11px] text-[#A8B8D0]">Connect your Web3 wallet with a valid referral code from an existing member.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(123,97,255,0.1)' }}>
                  <span className="text-xs font-bold text-[#7B61FF]">2</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Select a Slot</p>
                  <p className="text-[11px] text-[#A8B8D0]">Choose from 11 available slots ranging from $5 to $100,000 USDT.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,255,178,0.1)' }}>
                  <span className="text-xs font-bold text-[#00FFB2]">3</span>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-white">Participate & Earn</p>
                  <p className="text-[11px] text-[#A8B8D0]">Yields are generated from the pool and distributed to active participants via smart contracts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Disclaimer */}
          <div className="mb-5 rounded-xl p-4" style={{ background: 'rgba(255,180,0,0.04)', border: '1px solid rgba(255,180,0,0.12)', animation: 'fadeUp 0.8s ease-out 0.3s both' }}>
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={14} className="text-[#FFB400] shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-bold text-[#FFB400] uppercase tracking-wider mb-1">Important Disclaimer</p>
                <p className="text-[10px] text-[#A8B8D0] leading-relaxed">
                  CYLIX MATRIX is a decentralized application built on BNB Smart Chain. This is not a guarantee of income or returns.
                  All investments carry risk. The value of your participation may go down as well as up. You may not get back the amount you originally invested.
                  Users are solely responsible for their participation. Always do your own research (DYOR) before investing in any DeFi protocol.
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mb-5" style={{ animation: 'fadeUp 0.8s ease-out 0.4s both' }}>
            <div className="flex items-center gap-1.5">
              <Shield size={12} className="text-[#00E5FF]" />
              <span className="text-[11px] text-[#A8B8D0]">Non-Custodial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-[#7B61FF]" />
              <span className="text-[11px] text-[#A8B8D0]">BSC Network</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-[#00FFB2]" />
              <span className="text-[11px] text-[#A8B8D0]">Community Driven</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-5 border-t border-[rgba(0,229,255,0.04)]">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3">
            <a href="/about" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">About</a>
            <a href="/terms" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">Terms of Service</a>
            <a href="/privacy-policy" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">Privacy Policy</a>
            <a href="/risk-disclosure" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">Risk Disclosure</a>
            <a href="/disclaimer" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">Disclaimer</a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3">
            <a href="https://t.me/cylixdefi" target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1">Telegram <ExternalLink size={8} /></a>
            <a href="https://youtube.com/@cylixdefi" target="_blank" rel="noopener noreferrer" className="text-[11px] text-white/30 hover:text-white/50 transition-colors flex items-center gap-1">YouTube <ExternalLink size={8} /></a>
          </div>
          <div className="text-center border-t border-white/5 pt-3">
            <p className="text-[10px] text-white/15 mb-1">&copy; 2026 CYLIX MATRIX. All rights reserved. Decentralized Application on BNB Smart Chain.</p>
            <p className="text-[9px] text-white/10">This platform does not guarantee returns. Participation involves financial risk. Not financial advice. DYOR.</p>
          </div>
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
                  <p className="text-xs text-[#A8B8D0] mt-0.5">Choose your connection method</p>
                </div>
                <button onClick={() => setShowWallets(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A8B8D0] hover:text-white hover:bg-white/5 transition-all">&times;</button>
              </div>

              <div className="space-y-3">
                {/* Browser Wallet */}
                <button
                  onClick={handleBrowserWallet}
                  disabled={connectingId !== null || isPending}
                  className="w-full h-16 rounded-xl flex items-center gap-4 px-5 transition-all hover:bg-[rgba(0,229,255,0.05)] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,229,255,0.12)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(0,229,255,0.08)' }}>
                    {connectingId ? (
                      <Loader2 size={22} className="animate-spin text-[#00E5FF]" />
                    ) : (
                      <svg viewBox="0 0 318.6 318.6" className="w-7 h-7">
                        <path fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round" d="M274.1 35.5l-99.5 73.9L193 65.8z"/>
                        <path d="M44.4 35.5l98.7 74.6-17.5-44.3zm193.9 171.3l-26.5 40.6 56.7 15.6 16.3-55.3zm42.2-1.4L318.6 107l-97.2-73.7-17 44.4zM45.6 107l-3.9 58 56.7-15.6-26.5-40.6zm153.7 99.3l-17.4 26.2 61.2 1.5 17.3-55.2zm39.1-82.6l-55.5-25.6 19.4 43.1zm-55.5 25.6l-58.3-26.8 19.3 43z" fill="#E4761B"/>
                        <path fill="#E4761B" d="M104.4 142.7l-17.4 26.2 59 .3v-39.7zm109.6 0v39.7l59.2-.3-17.6-26.2zm-60.7-41.2l14.1-54.8-51.4.1zm-53.4.1l-51.4-.1 14.1 54.8zm-22.8 96.3l33.8-16.2-29.5-22.8zm68 0l-29.3 22.8 33.8 16.2z"/>
                      </svg>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-white">Browser Wallet</p>
                    <p className="text-[11px] text-[#A8B8D0]">MetaMask, SafePal, Base Wallet</p>
                  </div>
                  <ArrowRight size={16} className="text-[#A8B8D0]" />
                </button>

                {/* WalletConnect */}
                <button
                  onClick={handleWalletConnect}
                  disabled={connectingId !== null || isPending}
                  className="w-full h-16 rounded-xl flex items-center gap-4 px-5 transition-all hover:bg-[rgba(59,153,252,0.05)] disabled:opacity-50"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(59,153,252,0.12)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(59,153,252,0.1)' }}>
                    <svg viewBox="0 0 35 35" className="w-7 h-7">
                      <circle cx="17.5" cy="17.5" r="17.5" fill="#3B99FC"/>
                      <path d="M12.7 14.4c2.8-2.7 7.3-2.7 10.1 0l.4.4c.1.1.1.2 0 .3l-1.1 1c-.1.1-.2.1-.3 0l-.4-.4c-1.8-1.7-4.7-1.7-6.5 0l-.5.5c-.1.1-.2.1-.3 0l-1.1-1c-.1-.1-.1-.2 0-.3l.4-.4zm14.3 5.9c-.1-.1-.3-.1-.4 0l-.5.5c-2.8 2.7-7.3 2.7-10.1 0l-.5-.5c-.1-.1-.3-.1-.4 0l-1.1 1c-.1.1-.1.3 0 .4l.5.5c3.4 3.3 8.9 3.3 12.3 0l.5-.5c.1-.1.1-.3 0-.4l-1.1-1zm-3.3 3.3c-.1-.1-.3-.1-.4 0l-.5.5c-1.6 1.5-4.1 1.5-5.6 0l-.5-.5c-.1-.1-.3-.1-.4 0l-1.1 1c-.1.1-.1.3 0 .4l.5.5c2.3 2.2 6 2.2 8.3 0l.5-.5c.1-.1.1-.3 0-.4l-1.1-1z" fill="#fff"/>
                    </svg>
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm font-semibold text-white">WalletConnect</p>
                    <p className="text-[11px] text-[#A8B8D0]">Trust, Coinbase, Rainbow & more</p>
                  </div>
                  <ArrowRight size={16} className="text-[#A8B8D0]" />
                </button>
              </div>

              <p className="text-center text-[10px] text-[#A8B8D0] mt-4 leading-relaxed">
                By connecting, you agree to our <a href="/terms" className="text-[#00E5FF] hover:underline">Terms of Service</a> and confirm you have read the <a href="/risk-disclosure" className="text-[#00E5FF] hover:underline">Risk Disclosure</a>.
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
