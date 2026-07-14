import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — CYLIX',
  description: 'CYLIX MATRIX DeFi privacy policy — how we handle your data on our decentralized platform.',
};

const sections = [
  {
    title: '1. Information Collection',
    content: [
      'When you connect your wallet to CYLIX MATRIX DeFi, we collect only the minimum data necessary to provide our services. This includes your public wallet address, transaction history on the BNB Smart Chain, and basic account preferences.',
      'We do not collect personal identifying information such as your name, email address, phone number, or physical address. All interactions on the platform are pseudonymous and tied solely to your blockchain wallet address.',
      'We may automatically collect certain technical information including browser type, device type, IP address, and usage patterns to improve platform performance and security.',
    ],
  },
  {
    title: '2. Data Usage',
    content: [
      'Your data is used exclusively to operate and improve the CYLIX platform. We use wallet addresses to process transactions, calculate earnings, manage matrix positions, and distribute rewards through our smart contracts.',
      'Technical data is used to monitor platform health, detect suspicious activity, prevent abuse, and optimize the user experience across different devices and browsers.',
      'We do not sell, rent, or share your data with third parties for marketing or advertising purposes. Your data is never used for targeted advertising.',
    ],
  },
  {
    title: '3. Data Security',
    content: [
      'CYLIX implements industry-standard security measures to protect any data we collect. All data transmission is encrypted using TLS 1.3 protocols. Our infrastructure is hosted on enterprise-grade cloud providers with robust security certifications.',
      'All financial operations are executed through audited smart contracts on the BNB Smart Chain, meaning your funds are protected by blockchain-level cryptography rather than centralized custodial systems.',
      'We maintain strict access controls and conduct regular security assessments of our systems and codebase.',
    ],
  },
  {
    title: '4. Third-Party Services',
    content: [
      'CYLIX integrates with third-party services including wallet providers (e.g., MetaMask, WalletConnect), blockchain RPC providers, and analytics tools. These services have their own privacy policies governing data handling.',
      'When you connect your wallet, your wallet provider may share your public address with us. We do not control the data practices of third-party wallet providers.',
      'We may use third-party analytics to understand platform usage. These analytics are aggregated and anonymized, and do not include personally identifiable information.',
    ],
  },
  {
    title: '5. Cookies and Tracking',
    content: [
      'CYLIX uses minimal cookies essential for platform functionality, including session management and preference storage. We do not use advertising cookies or cross-site tracking mechanisms.',
      'Local storage may be used to save your UI preferences and wallet connection state. This data remains on your device and is not transmitted to our servers.',
      'You can manage cookie preferences through your browser settings. Disabling essential cookies may affect platform functionality.',
    ],
  },
  {
    title: '6. Data Retention',
    content: [
      'Since CYLIX operates on a public blockchain, transaction data is inherently permanent and publicly visible on the BNB Smart Chain. We do not control blockchain data retention.',
      'Off-chain data we collect is retained only as long as necessary to provide our services. If you disconnect your wallet and cease platform usage, we will purge any stored data within a reasonable timeframe.',
    ],
  },
  {
    title: '7. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or regulatory requirements. Material changes will be announced through our official communication channels.',
      'Continued use of the platform after policy changes constitutes acceptance of the updated terms. We encourage you to review this policy periodically.',
    ],
  },
  {
    title: '8. Contact',
    content: [
      'If you have questions about this Privacy Policy or our data practices, please reach out through our official Telegram channel: https://t.me/cylixdefi.',
    ],
  },
];

export default function PrivacyPolicyPage() {
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
          Privacy Policy
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
