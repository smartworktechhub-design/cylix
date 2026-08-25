'use client';

import { useState, useEffect } from 'react';
import { Coins, Timer, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useIsDev } from '@/hooks/use-is-dev';

function useCountdown(targetDate: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, targetDate - Date.now());
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      };
    };

    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export function CxlLaunchCountdown() {
  const isDev = useIsDev();

  // August 28, 2026, 6:17 PM IST = 12:47 PM UTC
  const targetMs = new Date('2026-08-28T12:47:00Z').getTime();
  const { days, hours, minutes, seconds, expired } = useCountdown(targetMs);

  if (isDev === null) return null;

  // Show on both dev and production
  if (expired) {
    return (
      <div className="px-4 mb-3">
        <div className="relative rounded-2xl overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, #00FFB2, #00E5FF)' }}>
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(0,40,30,0.97))' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" />
              <span className="text-xs font-bold text-[#00FFB2] uppercase tracking-wider">LIVE NOW</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL Airdrop & Presale is LIVE!</h3>
            <p className="text-xs text-[#7B8BA5] mb-3">Start earning CXL tokens and buy at presale prices now.</p>
            <Link href="/presale" className="w-full h-10 rounded-xl font-bold text-sm bg-gradient-to-r from-[#00FFB2] to-[#00E5FF] text-[#050816] flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <Coins size={14} />
              Go to Presale
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 mb-3">
      <div className="relative rounded-2xl overflow-hidden p-[1px]" style={{ background: 'linear-gradient(135deg, #FFB800, #FF5C7A, #7B61FF)' }}>
        <div className="rounded-2xl p-4 relative" style={{ background: 'linear-gradient(135deg, rgba(9,11,20,0.97), rgba(40,20,10,0.97))' }}>
          {/* Glow effect */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ background: 'linear-gradient(135deg, #FFB800, #FF5C7A)' }} />

          {/* Header */}
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFB800] to-[#FF5C7A] flex items-center justify-center shadow-lg shadow-[rgba(255,184,0,0.2)]">
              <Rocket size={16} className="text-[#050816]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CXL Airdrop & Presale</h3>
              <p className="text-[10px] text-[#7B8BA5]">Launching soon — Be ready!</p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 relative z-10">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#FFB800]">{String(days).padStart(2, '0')}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#7B8BA5] uppercase mt-1">Days</p>
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#FFB800] mt-[-16px]">:</span>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#FFB800]">{String(hours).padStart(2, '0')}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#7B8BA5] uppercase mt-1">Hours</p>
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#FFB800] mt-[-16px]">:</span>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#FFB800]">{String(minutes).padStart(2, '0')}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#7B8BA5] uppercase mt-1">Min</p>
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#FFB800] mt-[-16px]">:</span>
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
                <p className="text-xl sm:text-2xl font-bold font-mono text-[#FFB800]">{String(seconds).padStart(2, '0')}</p>
              </div>
              <p className="text-[9px] sm:text-[10px] text-[#7B8BA5] uppercase mt-1">Sec</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2 mb-3 relative z-10">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.1)' }}>
              <p className="text-[10px] text-[#00E5FF] font-bold">Airdrop</p>
              <p className="text-[9px] text-[#7B8BA5]">90 days free</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.1)' }}>
              <p className="text-[10px] text-[#FFB800] font-bold">Presale</p>
              <p className="text-[9px] text-[#7B8BA5]">$0.01 start</p>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(123,97,255,0.05)', border: '1px solid rgba(123,97,255,0.1)' }}>
              <p className="text-[10px] text-[#7B61FF] font-bold">DEX</p>
              <p className="text-[9px] text-[#7B8BA5]">$0.15 Day 91</p>
            </div>
          </div>

          <p className="text-[10px] text-[#7B8BA5] text-center relative z-10">
            <Timer size={10} className="inline mr-1 text-[#FFB800]" />
            28 August 2026, 6:17 PM IST
          </p>
        </div>
      </div>
    </div>
  );
}
