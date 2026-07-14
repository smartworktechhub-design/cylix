import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Risk Disclosure — CYLIX',
  description: 'Important risk disclosure for CYLIX MATRIX DeFi — understand the risks before investing.',
};

const risks = [
  {
    title: 'Market Risk',
    icon: '📉',
    color: '#FF5C7A',
    content: [
      'Cryptocurrency markets are highly volatile. The value of BNB, USDT, and other digital assets can fluctuate significantly within short periods, sometimes experiencing drops of 50% or more.',
      'The daily yields offered by CYLIX are paid in USDT (a stablecoin pegged to USD), but the underlying value of any cryptocurrency holdings may decrease. Market-wide downturns can affect overall platform participation and returns.',
      'There is no guarantee that any particular investment will maintain its value. Historical performance in crypto markets is not a reliable indicator of future performance.',
    ],
  },
  {
    title: 'Regulatory Risk',
    icon: '⚖️',
    color: '#FFB800',
    content: [
      'Cryptocurrency regulations vary significantly by jurisdiction and are subject to rapid change. Governments worldwide may introduce new laws, regulations, or enforcement actions that could affect the operation of CYLIX or your ability to participate.',
      'Some jurisdictions may classify platform participation as securities offerings, MLM activities, or other regulated financial activities. It is your responsibility to ensure compliance with local laws.',
      'Regulatory changes could result in platform restrictions, asset freezes, or legal consequences for participants. CYLIX cannot predict or control regulatory developments in any jurisdiction.',
    ],
  },
  {
    title: 'Technology Risk',
    icon: '🔧',
    color: '#00E5FF',
    content: [
      'Smart contracts, while audited, are not infallible. Bugs, vulnerabilities, or unforeseen interactions in the code could lead to loss of funds, incorrect calculations, or platform downtime.',
      'The BNB Smart Chain network may experience congestion, forks, or technical issues that could delay or affect transactions, including those related to CYLIX operations.',
      'Wallet security is your responsibility. Phishing attacks, malware, compromised private keys, or insecure wallet configurations could result in unauthorized access to your funds.',
      'Decentralized applications are experimental technology. Unforeseen technical issues could arise that have no immediate resolution.',
    ],
  },
  {
    title: 'Liquidity Risk',
    icon: '💧',
    color: '#7B61FF',
    content: [
      'While CYLIX uses USDT (a widely traded stablecoin), there may be periods of limited liquidity on decentralized exchanges or bridges that could affect your ability to move funds.',
      'Matrix positions and slot activations are locked within the smart contract. You cannot withdraw your principal investment from an active slot — you can only earn returns on it.',
      'In scenarios where the platform experiences low participation, earning rates may decrease. The sustainability of returns is directly tied to ongoing network activity.',
    ],
  },
  {
    title: 'No Guarantee of Returns',
    icon: '🚫',
    color: '#00FFB2',
    content: [
      'The daily yields, matrix commissions, and other returns described on CYLIX are not guaranteed. They are generated through the collective activity of platform participants and may vary or cease entirely.',
      'Projected returns are based on mathematical models and assumptions about participation levels. Actual results may differ materially from projections.',
      'There is no insurance, guarantee, or safety net for your investment. You may lose some or all of the capital you commit to the platform.',
      'Never invest funds that you cannot afford to lose. Do not borrow money or use emergency funds to participate in CYLIX or any other cryptocurrency investment.',
    ],
  },
];

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-[#090B14] flex flex-col">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(123,97,255,0.03) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#00E5FF] transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold tracking-wider mb-2"
          style={{
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #FF5C7A, #FFB800)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Risk Disclosure
        </h1>
        <p className="text-[#94A3B8] text-sm mb-6 max-w-2xl">
          Please read this disclosure carefully before participating in CYLIX MATRIX DeFi.
        </p>

        <div
          className="rounded-2xl p-5 mb-10 flex items-start gap-3"
          style={{
            background: 'rgba(255,92,122,0.06)',
            border: '1px solid rgba(255,92,122,0.15)',
          }}
        >
          <AlertTriangle size={20} className="text-[#FF5C7A] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#FF5C7A]/90 leading-relaxed">
            <strong>Important:</strong> Cryptocurrency investments carry significant risk. You could lose
            your entire investment. Only invest what you can afford to lose. This is not financial advice.
          </p>
        </div>

        <div className="space-y-6">
          {risks.map((r) => (
            <section
              key={r.title}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: 'rgba(11,16,32,0.6)',
                border: `1px solid ${r.color}15`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">{r.icon}</span>
                <h2
                  className="text-lg font-bold tracking-wide"
                  style={{ fontFamily: 'var(--font-heading)', color: r.color }}
                >
                  {r.title}
                </h2>
              </div>
              <div className="space-y-3">
                {r.content.map((p, i) => (
                  <p key={i} className="text-sm text-[#94A3B8] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 mt-10 text-center"
          style={{
            background: 'rgba(11,16,32,0.6)',
            border: '1px solid rgba(255,92,122,0.12)',
          }}
        >
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            By using CYLIX MATRIX DeFi, you acknowledge that you have read, understood, and accepted all
            risks described in this disclosure. You agree that the CYLIX protocol, its developers, and
            affiliates shall not be held liable for any losses incurred through platform participation.
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
