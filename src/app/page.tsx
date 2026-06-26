'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wallet, Shield, BarChart3, Users, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const ref = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null;
    if (ref) setReferralCode(ref.toUpperCase());
  }, []);
  useEffect(() => {
    if (isConnected && mounted) {
      if (referralCode.trim()) {
        localStorage.setItem('cylix_ref', referralCode.trim().toUpperCase());
      }
      router.push('/dashboard');
    }
  }, [isConnected, mounted, referralCode, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816]">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,229,255,0.08)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
            <span className="text-[#050816] font-bold text-sm font-heading">C</span>
          </div>
          <span className="text-lg font-bold font-heading tracking-wider text-white">CYLIX</span>
        </div>
        <ConnectButton.Custom>
          {({ openConnectModal, openAccountModal, mounted: rkMounted, authenticationStatus, account }) => {
            const ready = rkMounted && authenticationStatus !== 'loading';
            const connected = ready && account && !authenticationStatus;
            return (
              <div className={!rkMounted ? 'w-36 h-10 rounded-xl bg-[rgba(148,163,184,0.05)]' : ''}>
                {!ready ? <div className="w-36 h-10 rounded-xl bg-[rgba(148,163,184,0.05)]" /> :
                  connected ? (
                    <button onClick={openAccountModal}
                      className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)] text-white text-sm font-semibold hover:bg-[rgba(0,229,255,0.12)] transition-all">
                      <div className="w-5 h-5 rounded-full bg-[#00E5FF] flex items-center justify-center">
                        <Wallet size={10} className="text-[#050816]" />
                      </div>
                      {account.displayName}
                    </button>
                  ) : (
                    <button onClick={openConnectModal}
                      className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#00E5FF] text-[#050816] text-sm font-semibold hover:bg-[#00E5FF]/90 transition-all">
                      <Wallet size={16} />
                      Connect Wallet
                    </button>
                  )}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] mb-6">
            <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
            <span className="text-xs text-[#00E5FF] font-medium">BNB Smart Chain</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-white leading-tight mb-6">
            Premium <span className="text-gradient">Orbit Investment</span> Platform
          </h1>
          <p className="text-lg text-[#94A3B8] mb-10 max-w-xl mx-auto">
            Connect your wallet, choose your Orbit package, and start earning daily returns.
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <div className="rounded-2xl bg-[rgba(18,26,43,0.6)] border border-[rgba(0,229,255,0.08)] p-4">
              <label className="block text-sm text-[#94A3B8] mb-2">
                Referral Code <span className="text-[#FF5C7A]">*</span>
              </label>
              <input
                value={referralCode}
                onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="Enter referral code (required)"
                className="w-full h-12 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
              />
              {error && <p className="text-[10px] text-[#FF5C7A] mt-1">{error}</p>}
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal, openAccountModal, mounted: rkMounted, authenticationStatus, account }) => {
                const ready = rkMounted && authenticationStatus !== 'loading';
                const connected = ready && account && !authenticationStatus;
                return (
                  <div className={!rkMounted ? 'h-12 rounded-xl bg-[rgba(148,163,184,0.05)] animate-pulse' : ''}>
                    {!ready ? <div className="h-12 rounded-xl bg-[rgba(148,163,184,0.05)] animate-pulse" /> :
                      connected ? (
                        <button onClick={openAccountModal}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                          <Wallet size={16} />
                          {account.displayName}
                        </button>
                      ) : (
                        <button onClick={openConnectModal}
                          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                          Connect Wallet to Start
                          <ArrowRight size={16} />
                        </button>
                      )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { icon: Shield, title: 'Secure & Transparent', desc: 'All transactions verified on BNB Smart Chain.' },
            { icon: BarChart3, title: 'Daily Earnings', desc: 'Earn daily returns on your investment.' },
            { icon: Users, title: 'Team Building', desc: 'Binary matrix system. Build your team.' },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl bg-[rgba(18,26,43,0.6)] border border-[rgba(0,229,255,0.08)] p-6 text-center hover:border-[rgba(0,229,255,0.2)] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-[#00E5FF]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
          {[
            { label: 'Total Invested', value: '$2.4M+' },
            { label: 'Active Users', value: '2,483' },
            { label: 'Daily Payouts', value: '$18.5K' },
            { label: 'Slots', value: '11 Orbits' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-[rgba(18,26,43,0.6)] border border-[rgba(0,229,255,0.08)] p-5 text-center">
              <p className="text-2xl font-bold font-mono text-gradient">{s.value}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-[rgba(0,229,255,0.08)] py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-sm text-[#94A3B8]">CYLIX &copy; 2026</span>
          <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
            <span>BNB Smart Chain</span>
            <span>BEP20 USDT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
