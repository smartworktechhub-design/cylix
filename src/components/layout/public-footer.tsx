import Link from 'next/link';
import Image from 'next/image';
import { Youtube } from 'lucide-react';

const links = [
  { label: 'About', href: '/about' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Risk Disclosure', href: '/risk-disclosure' },
  { label: 'Disclaimer', href: '/disclaimer' },
];

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[#00E5FF]/10 bg-[#0B1020]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-sm.png" alt="CYLIX" width={32} height={32} className="rounded-lg" />
              <span
                className="text-lg font-bold tracking-wider"
                style={{
                  fontFamily: 'var(--font-heading)',
                  background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CYLIX
              </span>
            </Link>
            <p className="text-xs text-[#94A3B8] text-center md:text-left max-w-xs">
              Decentralized matrix growth platform built on BNB Smart Chain.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-[#94A3B8] hover:text-[#00E5FF] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://telegram.me/cylixdefi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-[#00E5FF]/10 text-[#94A3B8] hover:text-[#00E5FF] transition-all"
              title="Telegram"
            >
              <TelegramIcon />
            </a>
            <a
              href="https://youtube.com/@cylixdefi?si=J-9sXoRzcFO4NJQI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-white/5 hover:bg-[#00E5FF]/10 text-[#94A3B8] hover:text-[#00E5FF] transition-all"
              title="YouTube"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-[#94A3B8]/60">
            &copy; 2026 CYLIX MATRIX DeFi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
