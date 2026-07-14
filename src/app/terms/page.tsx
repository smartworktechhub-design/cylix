import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Terms & Conditions — CYLIX',
  description: 'CYLIX MATRIX DeFi terms and conditions governing platform usage and participation.',
};

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: [
      'By accessing or using the CYLIX MATRIX DeFi platform (cylixdefi.live), you agree to be bound by these Terms and Conditions in their entirety. If you do not agree with any part of these terms, you must not access or use the platform.',
      'These terms constitute a legally binding agreement between you (the "User") and the CYLIX protocol. We reserve the right to update these terms at any time, and continued use of the platform following any changes constitutes acceptance of the modified terms.',
      'You represent that you are at least 18 years of age and have the legal capacity to enter into this agreement in your jurisdiction.',
    ],
  },
  {
    title: '2. Account Registration & Wallet Connection',
    content: [
      'CYLIX does not use traditional account registration. Access to the platform is provided through decentralized wallet connection (e.g., MetaMask, WalletConnect). You are solely responsible for maintaining the security of your wallet and private keys.',
      'By connecting your wallet, you authorize the CYLIX smart contracts to execute transactions on your behalf as permitted by the platform interface. You understand that all on-chain transactions are irreversible once confirmed on the BNB Smart Chain.',
      'You are responsible for all activity that occurs through your connected wallet. CYLIX cannot recover lost wallets, forgotten passwords, or compromised private keys.',
    ],
  },
  {
    title: '3. Investment Risks',
    content: [
      'Participation in CYLIX involves significant financial risk. The value of cryptocurrency assets can fluctuate dramatically, and you may lose some or all of your invested capital. Past performance of any investment is not indicative of future results.',
      'The daily yields and matrix returns described on the platform are not guaranteed. Returns are generated through the collective activity of the network and may vary based on participation levels and market conditions.',
      'You should never invest more than you can afford to lose. CYLIX strongly recommends consulting with a qualified financial advisor before making any investment decisions.',
      'The decentralized nature of the platform means there is no central authority to appeal to in the event of losses. All transactions are final and executed on the blockchain.',
    ],
  },
  {
    title: '4. Refund Policy',
    content: [
      'All transactions on CYLIX are executed through smart contracts on the BNB Smart Chain and are inherently irreversible. Once a slot purchase is confirmed on-chain, it cannot be reversed, refunded, or cancelled by CYLIX or any central authority.',
      'Slot activations and matrix positions are permanent. You understand that your investment is subject to the rules and mechanics encoded in the smart contract, including daily yield distribution, matrix commission structures, and re-buy mechanics.',
      'In exceptional circumstances involving smart contract malfunctions or demonstrable protocol errors, the community governance process may evaluate remediation on a case-by-case basis. This does not constitute an obligation to provide refunds.',
    ],
  },
  {
    title: '5. Termination',
    content: [
      'You may terminate your participation at any time by simply disconnecting your wallet from the platform. Disconnecting does not delete your on-chain data or reverse any transactions already completed.',
      'CYLIX reserves the right to restrict or prohibit access to the platform interface for any user found to be engaging in fraudulent activity, abuse, or actions that harm the integrity of the network.',
      'Termination of access to the platform interface does not affect your on-chain assets or smart contract positions. Your blockchain-based positions remain intact regardless of interface access.',
    ],
  },
  {
    title: '6. Limitation of Liability',
    content: [
      'CYLIX is provided on an "as-is" and "as-available" basis. The CYLIX protocol, its developers, contributors, and affiliates make no warranties, express or implied, regarding the platform\'s reliability, availability, or fitness for any particular purpose.',
      'In no event shall CYLIX, its team members, developers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, assets, or business opportunities.',
      'The total liability of CYLIX to any user for all claims shall not exceed the fees paid by that user to the protocol, if any. This limitation applies regardless of the legal theory under which such damages are sought.',
      'You acknowledge that blockchain technology, smart contracts, and decentralized applications are experimental in nature, and inherent risks exist that cannot be fully mitigated by any development team.',
    ],
  },
  {
    title: '7. Governing Law',
    content: [
      'These Terms shall be governed by and construed in accordance with applicable international laws related to decentralized protocols. As CYLIX is a decentralized autonomous protocol, no single jurisdiction serves as the exclusive governing authority.',
      'Any disputes arising from these terms or platform usage shall first be addressed through the CYLIX community governance process before pursuing external legal remedies.',
    ],
  },
];

export default function TermsPage() {
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
            background: 'linear-gradient(135deg, #00E5FF, #7B61FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Terms & Conditions
        </h1>
        <p className="text-[#94A3B8]/60 text-xs mb-10">Last updated: July 14, 2026</p>

        <div className="space-y-6">
          {sections.map((s) => (
            <section
              key={s.title}
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
                {s.title}
              </h2>
              <div className="space-y-3">
                {s.content.map((p, i) => (
                  <p key={i} className="text-sm text-[#94A3B8] leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}
