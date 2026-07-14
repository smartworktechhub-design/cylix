import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Disclaimer — CYLIX',
  description: 'CYLIX MATRIX DeFi disclaimer — not financial advice. Do your own research.',
};

const disclaimers = [
  {
    title: 'Not Financial Advice',
    content: [
      'All information provided on the CYLIX MATRIX DeFi platform, including but not limited to text, graphics, data, projections, and any other materials, is for informational and educational purposes only.',
      'Nothing on this platform constitutes financial advice, investment advice, trading advice, or any other form of professional advice. You should not treat any content on CYLIX as a recommendation to buy, sell, hold, or make any investment decision.',
      'Before making any financial decisions, you should consult with a qualified financial advisor, tax professional, or legal counsel who is familiar with your individual circumstances.',
    ],
  },
  {
    title: 'Do Your Own Research (DYOR)',
    content: [
      'You are solely responsible for conducting your own due diligence before participating in CYLIX or any cryptocurrency investment. This includes understanding the technology, reviewing the smart contract, assessing the risks, and evaluating your own financial situation.',
      'The CYLIX team provides information about the platform in good faith, but cannot guarantee the accuracy, completeness, or timeliness of any information presented. Verify all information independently.',
      'Consider your own risk tolerance, investment horizon, and financial goals before committing any funds. What is appropriate for one investor may not be appropriate for another.',
    ],
  },
  {
    title: 'Past Performance',
    content: [
      'Past performance of the CYLIX platform, its yields, or any cryptocurrency asset is not a reliable indicator of future results. Historical returns, projections, or testimonials should not be interpreted as guarantees of future performance.',
      'The cryptocurrency and DeFi space is rapidly evolving. What works today may not work tomorrow. Market conditions, regulatory environments, and technological landscapes can change dramatically and without notice.',
      'Any examples, case studies, or testimonials presented on the platform are for illustrative purposes only and should not be taken as typical or guaranteed outcomes.',
    ],
  },
  {
    title: 'No Fiduciary Relationship',
    content: [
      'CYLIX MATRIX DeFi does not establish a fiduciary, advisory, or trust relationship with its users. The platform operates as a decentralized protocol, not a financial advisor, broker, or custodian.',
      'You are acting on your own behalf and at your own risk when using the platform. CYLIX has no obligation to act in your financial interest.',
    ],
  },
  {
    title: 'Forward-Looking Statements',
    content: [
      'This platform may contain forward-looking statements regarding future features, projections, roadmap items, or potential outcomes. These statements are based on current expectations and assumptions, and are subject to risks and uncertainties.',
      'Actual results, performance, or events may differ materially from those expressed or implied by any forward-looking statements. CYLIX undertakes no obligation to update or revise any forward-looking statements.',
    ],
  },
  {
    title: 'External Links',
    content: [
      'The CYLIX platform may contain links to third-party websites, social media channels, or external resources. These links are provided for convenience only and do not constitute endorsement of the linked content.',
      'CYLIX has no control over the content, privacy practices, or availability of third-party sites. Access any external links at your own risk.',
    ],
  },
  {
    title: 'Jurisdictional Limitations',
    content: [
      'CYLIX is a decentralized protocol accessible globally. However, certain features may be restricted or unavailable in certain jurisdictions due to local laws and regulations.',
      'It is your responsibility to ensure that your use of the platform complies with all applicable laws in your jurisdiction. CYLIX does not facilitate or encourage any illegal activity.',
    ],
  },
];

export default function DisclaimerPage() {
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
            background: 'linear-gradient(135deg, #FFB800, #FF5C7A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Disclaimer
        </h1>
        <p className="text-[#94A3B8] text-sm mb-6 max-w-2xl">
          Important legal disclaimers for the CYLIX MATRIX DeFi platform.
        </p>

        <div
          className="rounded-2xl p-5 mb-10 flex items-start gap-3"
          style={{
            background: 'rgba(255,184,0,0.06)',
            border: '1px solid rgba(255,184,0,0.15)',
          }}
        >
          <AlertCircle size={20} className="text-[#FFB800] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[#FFB800]/90 leading-relaxed">
            <strong>Key Notice:</strong> CYLIX MATRIX DeFi is a decentralized protocol, not a financial
            advisor. All investments carry risk. Always do your own research before participating.
          </p>
        </div>

        <div className="space-y-6">
          {disclaimers.map((d) => (
            <section
              key={d.title}
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: 'rgba(11,16,32,0.6)',
                border: '1px solid rgba(0,229,255,0.08)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h2
                className="text-lg font-bold tracking-wide mb-4"
                style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}
              >
                {d.title}
              </h2>
              <div className="space-y-3">
                {d.content.map((p, i) => (
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
            border: '1px solid rgba(255,184,0,0.12)',
          }}
        >
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            By accessing and using the CYLIX MATRIX DeFi platform, you acknowledge that you have read,
            understood, and agree to all disclaimers stated above. You accept full responsibility for your
            investment decisions and any outcomes resulting from your participation.
          </p>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
