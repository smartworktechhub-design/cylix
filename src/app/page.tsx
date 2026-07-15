'use client';

import { useState, useEffect, useRef } from 'react';

const LAUNCH = new Date('2026-07-15T19:17:00+05:30');
const LANGS: { text: string; lang: string }[] = [
  { text: 'Launching Soon', lang: 'English' },
  { text: 'जल्द आ रहा है', lang: 'Hindi' },
  { text: 'Próximamente', lang: 'Spanish' },
  { text: 'Bientôt', lang: 'French' },
  { text: 'Bald verfügbar', lang: 'German' },
  { text: '間もなく開始', lang: 'Japanese' },
  { text: '即将推出', lang: 'Chinese' },
  { text: 'قريباً', lang: 'Arabic' },
  { text: 'Скоро запуск', lang: 'Russian' },
  { text: 'Em Breve', lang: 'Portuguese' },
];

function calc() {
  return { d: 0, h: 0, m: 0, s: 0 };
}

function FlipDigit({ value, color }: { value: number; color: string }) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      const t = setTimeout(() => { setPrev(value); setFlip(false); }, 300);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  const display = String(value).padStart(2, '0');

  return (
    <div className="relative w-[68px] h-[80px] md:w-[80px] md:h-[96px] rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.01)' }} />
      <span className="relative z-10 flex items-center justify-center h-full text-3xl md:text-4xl font-bold transition-transform duration-300"
        style={{
          fontFamily: "'Rajdhani',sans-serif", color, textShadow: `0 0 20px ${color}20`,
          transform: flip ? 'rotateX(90deg)' : 'rotateX(0deg)',
          transformStyle: 'preserve-3d',
        }}>
        {display}
      </span>
      <div className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{ background: 'rgba(255,255,255,0.03)' }} />
    </div>
  );
}

export default function ComingSoonPage() {
  const [t, setT] = useState(calc());
  const [mounted, setMounted] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [currentLang, setCurrentLang] = useState('English');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState('#00FFB2');
  const [showCursor, setShowCursor] = useState(true);

  const liRef = useRef(0);
  const charIdxRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timerRef = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { const iv = setInterval(() => setT(calc()), 1000); return () => clearInterval(iv); }, []);

  useEffect(() => {
    if (!mounted) return;

    function tick() {
      const cur = LANGS[liRef.current];
      if (!isDeletingRef.current) {
        if (charIdxRef.current < cur.text.length) {
          charIdxRef.current++;
          setDisplayText(cur.text.slice(0, charIdxRef.current));
          setCurrentLang(cur.lang);
          timerRef.current = window.setTimeout(tick, 50 + Math.random() * 30);
        } else {
          isDeletingRef.current = true;
          timerRef.current = window.setTimeout(tick, 2000);
        }
      } else {
        if (charIdxRef.current > 0) {
          charIdxRef.current--;
          setDisplayText(cur.text.slice(0, charIdxRef.current));
          timerRef.current = window.setTimeout(tick, 25);
        } else {
          isDeletingRef.current = false;
          liRef.current = (liRef.current + 1) % LANGS.length;
          charIdxRef.current = 0;
          timerRef.current = window.setTimeout(tick, 150);
        }
      }
    }

    setDisplayText('');
    setCurrentLang(LANGS[0].lang);
    charIdxRef.current = 0;
    isDeletingRef.current = false;
    liRef.current = 0;
    timerRef.current = window.setTimeout(tick, 500);

    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [mounted]);

  useEffect(() => {
    const iv = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(iv);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#090B14] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00CFFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const units = [
    { label: 'DAYS', value: t.d, color: '#00CFFF' },
    { label: 'HOURS', value: t.h, color: '#7B2DFF' },
    { label: 'MINS', value: t.m, color: '#00F5FF' },
    { label: 'SECS', value: t.s, color: '#FFD700' },
  ];

  return (
    <div className="min-h-screen bg-[#090B14] flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Background Orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,207,255,0.04) 0%, transparent 70%)', animation: 'orbFloat 12s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(123,45,255,0.03) 0%, transparent 70%)', animation: 'orbFloat 10s ease-in-out infinite alternate-reverse' }} />

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
              background: i % 3 === 0 ? 'rgba(0,207,255,0.15)' : i % 3 === 1 ? 'rgba(123,45,255,0.12)' : 'rgba(0,245,255,0.1)',
              animation: `particleFloat ${8 + Math.random() * 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }} />
        ))}
      </div>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
              width: `${1 + Math.random()}px`, height: `${1 + Math.random()}px`,
              opacity: 0.04,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite alternate`,
              animationDelay: `${Math.random() * 5}s`,
            }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto w-full">

        {/* Logo */}
        <img src="/logo-wide.png" alt="CYLIX" className="w-[260px] md:w-[320px] mb-2 drop-shadow-[0_0_30px_rgba(0,207,255,0.15)]" />

        {/* Tagline */}
        <p className="text-sm tracking-[0.5em] text-white/60 font-medium uppercase mb-0"
          style={{ fontFamily: "'Rajdhani',sans-serif" }}>
          Matrix DeFi
        </p>

        {/* Typewriter */}
        <div className="inline-flex flex-col items-center gap-2 mt-5 mb-4 px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
          }}>
          <span className="text-lg md:text-xl font-semibold text-white min-h-[28px]"
            style={{ fontFamily: "'Space Grotesk',sans-serif" }}>
            {displayText}
            <span className="text-[#00CFFF] ml-0.5" style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}>|</span>
          </span>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#00CFFF] animate-pulse" />
            <span className="text-[9px] tracking-[0.2em] text-white/30 font-semibold uppercase"
              style={{ fontFamily: "'Rajdhani',sans-serif", transition: 'all 0.3s' }}>
              {currentLang}
            </span>
          </div>
        </div>

        {/* Autoflow Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(123,45,255,0.06)', border: '1px solid rgba(123,45,255,0.12)' }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#7B2DFF] animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] text-[#7B2DFF] font-bold uppercase"
            style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            Autoflow Ecosystem
          </span>
        </div>

        {/* Timer */}
        <div className="flex gap-3 md:gap-5 mb-8">
          {units.map(u => (
            <div key={u.label} className="flex flex-col items-center gap-2">
              <FlipDigit value={u.value} color={u.color} />
              <span className="text-[9px] md:text-[10px] tracking-[0.2em] text-white/30 font-semibold uppercase"
                style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                {u.label}
              </span>
            </div>
          ))}
        </div>



        {/* Start with $5 highlight */}
        <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 rounded-xl"
          style={{ background: 'rgba(0,207,255,0.05)', border: '1px solid rgba(0,207,255,0.12)' }}>
          <span className="text-sm text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>
            Start with just
          </span>
          <span className="text-lg font-black text-[#00CFFF]" style={{ fontFamily: "'Orbitron',sans-serif" }}>
            $5
          </span>
          <span className="text-sm text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>
            &bull; Earn up to
          </span>
          <span className="text-lg font-black text-[#7B2DFF]" style={{ fontFamily: "'Orbitron',sans-serif" }}>
            $100K
          </span>
        </div>

        {/* Email Subscribe */}
        <div className="w-full max-w-sm">
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim() || submitting) return;
            setSubmitting(true);
            try {
              const r = await fetch('/api/launch-subscribe', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
              });
              const d = await r.json();
              if (r.ok) { setEmail(''); setToastMsg("You're on the list!"); setToastColor('#00FFB2'); }
              else { setToastMsg(d.error || 'Something went wrong'); setToastColor('#FF6B6B'); }
            } catch { setToastMsg('Network error'); setToastColor('#FF6B6B'); }
            setSubmitting(false); setToast(true); setTimeout(() => setToast(false), 3000);
          }}
            className="flex items-center gap-2 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email for launch updates"
              className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 placeholder:text-white/20 focus:outline-none" />
            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00CFFF, #7B2DFF)', color: '#090B14' }}>
              {submitting ? <span className="w-3.5 h-3.5 rounded-full border-2 border-[#090B14] border-t-transparent animate-spin" />
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>}
              {submitting ? '' : 'Notify'}
            </button>
          </form>
        </div>

        {/* Tagline Text */}
        <p className="text-[11px] text-white/30 leading-relaxed max-w-sm mt-6 text-center"
          style={{ fontFamily: "'Inter',sans-serif" }}>
          The countdown has begun. Built for Automation, Transparency, and Community-Driven Growth.<br />
          <span className="text-[#00CFFF] font-semibold">Be Ready. Be Early. Be CYLIX.</span>
        </p>
      </div>

      {/* Toast */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all duration-400 pointer-events-none z-[100]"
        style={{ background: `${toastColor}0a`, border: `1px solid ${toastColor}15`, color: toastColor, opacity: toast ? 1 : 0, transform: toast ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)' }}>
        {toastMsg}
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <a href="https://t.me/cylixdefi" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-white/5"
            title="Telegram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </a>
          <span className="text-white/10">&middot;</span>
          <a href="https://youtube.com/@cylixdefi?si=J-9sXoRzcFO4NJQI" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-white/5"
            title="YouTube">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.25)">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-white/20">
          <a href="/about" className="hover:text-white/40 transition-colors">About</a>
          <a href="/privacy-policy" className="hover:text-white/40 transition-colors">Privacy</a>
          <a href="/terms" className="hover:text-white/40 transition-colors">Terms</a>
          <a href="/risk-disclosure" className="hover:text-white/40 transition-colors">Risk Disclosure</a>
          <a href="/disclaimer" className="hover:text-white/40 transition-colors">Disclaimer</a>
        </div>
        <span className="text-[10px] text-white/20 tracking-wider">&copy; 2026 CYLIX</span>
      </div>

      <style jsx>{`
        @keyframes orbFloat {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -30px) scale(1.1); }
        }
        @keyframes twinkle {
          0% { opacity: 0.02; }
          100% { opacity: 0.08; }
        }
        @keyframes particleFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          25% { transform: translateY(-30px) translateX(15px); opacity: 0.2; }
          50% { transform: translateY(-15px) translateX(-10px); opacity: 0.08; }
          75% { transform: translateY(-40px) translateX(20px); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
