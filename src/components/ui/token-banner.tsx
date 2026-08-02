'use client';

import { useState, useEffect } from 'react';
import { Rocket, Users, ChevronRight, X, Sparkles, Zap, Gift } from 'lucide-react';
import Link from 'next/link';

const LAUNCH_DATE = new Date('2026-08-11T18:00:00+05:30').getTime();

function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    done: diff <= 0,
  };
}

function GlowDigit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[52px] h-[60px] sm:w-[68px] sm:h-[76px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(11,16,32,0.95) 0%, rgba(5,8,22,0.98) 100%)',
          border: '1px solid rgba(0,229,255,0.2)',
          boxShadow: '0 0 20px rgba(0,229,255,0.08), inset 0 1px 0 rgba(0,229,255,0.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(0,229,255,0.06)] via-transparent to-[rgba(123,97,255,0.04)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(0,229,255,0.3)] to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="relative text-[26px] sm:text-[34px] font-black tabular-nums"
            style={{
              fontFamily: "'Rajdhani', 'Orbitron', monospace",
              background: 'linear-gradient(180deg, #00E5FF 0%, #7B61FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.5)) drop-shadow(0 0 24px rgba(123,97,255,0.3))',
            }}
          >
            {String(value).padStart(2, '0')}
          </span>
        </div>
      </div>
      <span className="text-[9px] sm:text-[10px] text-[#5A6A85] mt-2 uppercase tracking-[0.2em] font-semibold">{label}</span>
    </div>
  );
}

export function TokenBanner() {
  const [dismissed, setDismissed] = useState(false);
  const countdown = useCountdown(LAUNCH_DATE);

  useEffect(() => {
    const seen = localStorage.getItem('cylix_token_banner_v3');
    if (seen) setDismissed(true);
  }, []);

  if (dismissed || countdown.done) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('cylix_token_banner_v3', '1');
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden"
      style={{
        border: '1px solid rgba(0,229,255,0.1)',
        background: 'linear-gradient(135deg, rgba(5,8,22,0.97) 0%, rgba(10,12,28,0.97) 40%, rgba(15,10,40,0.97) 100%)',
        boxShadow: '0 0 40px rgba(0,229,255,0.04), 0 0 80px rgba(123,97,255,0.03)',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[80px] opacity-40 animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-[80px] opacity-40 animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.12) 0%, transparent 70%)', animationDelay: '1.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-40 rounded-full blur-[60px]"
          style={{ background: 'rgba(0,229,255,0.03)' }}
        />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,229,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 inset-x-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, #00E5FF, #7B61FF, #00E5FF, transparent)' }}
      />

      {/* Dismiss */}
      <button onClick={handleDismiss}
        className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-[#5A6A85] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
      >
        <X size={14} />
      </button>

      <div className="relative px-4 py-5 sm:px-6 sm:py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(123,97,255,0.15))',
              border: '1px solid rgba(0,229,255,0.2)',
              boxShadow: '0 0 20px rgba(0,229,255,0.1)',
            }}
          >
            <Rocket size={18} className="text-[#00E5FF]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide"
                style={{ fontFamily: "'Orbitron', sans-serif" }}
              >
                CYLIX TOKEN
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(123,97,255,0.15))',
                  border: '1px solid rgba(0,229,255,0.2)',
                  color: '#00E5FF',
                }}
              >
                Coming Soon
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#5A6A85] mt-0.5">Launching on leading DEX & major exchanges</p>
          </div>
        </div>

        {/* Content + Countdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-5">
          {/* Left: Benefits */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(123,97,255,0.04)', border: '1px solid rgba(123,97,255,0.06)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(123,97,255,0.1)' }}
              >
                <Users size={13} className="text-[#7B61FF]" />
              </div>
              <p className="text-[11px] sm:text-xs text-[#8899B8] leading-relaxed">
                Build your team — earn <span className="text-[#00E5FF] font-semibold">FREE CYLIX tokens</span> through our Mega Airdrop
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.05)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,229,255,0.08)' }}
              >
                <Gift size={13} className="text-[#00E5FF]" />
              </div>
              <p className="text-[11px] sm:text-xs text-[#8899B8] leading-relaxed">
                Claim free tokens, hold them & participate in the ecosystem at launch
              </p>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,184,0,0.03)', border: '1px solid rgba(255,184,0,0.06)' }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,184,0,0.08)' }}
              >
                <Zap size={13} className="text-[#FFB800]" />
              </div>
              <p className="text-[11px] sm:text-xs text-[#8899B8] leading-relaxed">
                Early holders get <span className="text-[#FFB800] font-semibold">priority benefits</span> in the ecosystem
              </p>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={12} className="text-[#7B61FF]" />
              <p className="text-[10px] text-[#5A6A85] uppercase tracking-[0.25em] font-semibold">Launch Countdown</p>
              <Sparkles size={12} className="text-[#7B61FF]" />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <GlowDigit value={countdown.days} label="Days" />
              <div className="flex flex-col items-center justify-center -mt-3">
                <span className="text-[#00E5FF] text-lg font-bold opacity-40">:</span>
              </div>
              <GlowDigit value={countdown.hours} label="Hrs" />
              <div className="flex flex-col items-center justify-center -mt-3">
                <span className="text-[#7B61FF] text-lg font-bold opacity-40">:</span>
              </div>
              <GlowDigit value={countdown.minutes} label="Min" />
              <div className="flex flex-col items-center justify-center -mt-3">
                <span className="text-[#00E5FF] text-lg font-bold opacity-40">:</span>
              </div>
              <GlowDigit value={countdown.seconds} label="Sec" />
            </div>
            <p className="text-[9px] text-[#3A4A65] mt-2.5 font-medium">
              August 11, 2026 at 6:00 PM IST
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/referrals"
          className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
            color: '#050816',
            boxShadow: '0 0 24px rgba(0,229,255,0.2), 0 4px 16px rgba(123,97,255,0.15)',
          }}
        >
          <Users size={15} />
          Build Team Now
          <ChevronRight size={15} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
