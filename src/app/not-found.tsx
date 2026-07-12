'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Grid bg */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,229,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] rounded-full bg-[#00E5FF] opacity-[0.02] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] rounded-full bg-[#7B61FF] opacity-[0.02] blur-[140px] pointer-events-none" />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${1 + Math.random() * 1.5}px`,
              height: `${1 + Math.random() * 1.5}px`,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: 0.05,
            }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="mb-5">
          <img src="/logo.png" alt="CYLIX" className="w-16 h-16 md:w-20 md:h-20 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }} />
          <div className="hidden w-[72px] h-[72px] mx-auto rounded-[18px] border-[1.5px] border-[rgba(0,229,255,0.1)] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(0,229,255,0.06), rgba(123,97,255,0.06))',
              fontFamily: "'Orbitron',sans-serif",
              fontSize: '26px',
              fontWeight: 900,
              backgroundImage: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            C
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-[120px] md:text-[160px] font-black leading-none"
          style={{
            fontFamily: "'Orbitron',sans-serif",
            background: 'linear-gradient(135deg, #00CFFF, #00F5FF, #7B2DFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}>
          404
        </h1>

        <p className="text-white text-lg md:text-xl font-semibold mb-2"
          style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
          Page Not Found
        </p>

        <p className="text-[#4A5568] text-xs md:text-sm mb-8 max-w-xs"
          style={{ fontFamily: "'Inter',sans-serif" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
            color: '#050816',
          }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0% { opacity: 0.05; transform: scale(0.5); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}