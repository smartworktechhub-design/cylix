import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Orbit, Shield, Users, Zap, TrendingUp, Globe, Layers } from 'lucide-react';
import { PublicFooter } from '@/components/layout/public-footer';

export const metadata: Metadata = {
  title: 'About — CYLIX',
  description: 'Learn about CYLIX MATRIX DeFi — a decentralized matrix growth platform on BNB Smart Chain.',
};

const features = [
  {
    icon: <Orbit className="text-[#00E5FF]" size={24} />,
    title: '11 Orbit Slots',
    desc: 'Progressive investment tiers from $5 to $100,000, each designed to compound your growth within the matrix ecosystem.',
  },
  {
    icon: <Layers className="text-[#7B61FF]" size={24} />,
    title: '2×11 Matrix',
    desc: 'A powerful binary matrix structure with 11 levels, where each level unlocks greater earning potential as your network expands.',
  },
  {
    icon: <TrendingUp className="text-[#00FFB2]" size={24} />,
    title: '3% Daily Returns',
    desc: 'Earn consistent daily yields on your active slots. Returns are automatically distributed through our smart contract on BNB Chain.',
  },
  {
    icon: <Zap className="text-[#FFB800]" size={24} />,
    title: 'Autoflow Engine',
    desc: 'Our proprietary spillover algorithm ensures new members fill available positions across the network, maximizing collective growth.',
  },
  {
    icon: <Shield className="text-[#FF5C7A]" size={24} />,
    title: 'Smart Contract Security',
    desc: 'All transactions are executed on-chain via audited smart contracts. No single point of failure. Fully transparent and immutable.',
  },
  {
    icon: <Globe className="text-[#00E5FF]" size={24} />,
    title: 'Global Community',
    desc: 'A worldwide network of participants across 50+ countries, united by a shared vision of decentralized financial empowerment.',
  },
];

const team = [
  { role: 'Core Development', desc: 'Smart contract architecture and platform engineering.' },
  { role: 'Community & Growth', desc: 'Global community building, education, and outreach.' },
  { role: 'Security & Compliance', desc: 'Continuous audit monitoring and protocol integrity.' },
  { role: 'Design & UX', desc: 'Crafting intuitive interfaces for seamless DeFi experiences.' },
];

export default function AboutPage() {
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

      <div className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
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
          About CYLIX
        </h1>
        <p className="text-[#94A3B8] text-sm mb-12 max-w-2xl">
          Redefining decentralized growth through matrix-based earning and community-driven compounding.
        </p>

        {/* What is CYLIX */}
        <section className="mb-12">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'rgba(11,16,32,0.6)',
              border: '1px solid rgba(0,229,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h2
              className="text-xl font-bold tracking-wide mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}
            >
              What is CYLIX?
            </h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
              CYLIX MATRIX DeFi is a decentralized autonomous platform built on the BNB Smart Chain (BSC).
              It combines a binary matrix structure with progressive orbit slots to create a self-sustaining
              ecosystem where participants earn daily yields and matrix commissions.
            </p>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              The platform operates entirely through smart contracts, ensuring full transparency, immutability,
              and trustless execution. There are no central authorities controlling funds — the protocol rules
              are encoded on-chain and enforced by the blockchain itself.
            </p>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mb-12">
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'rgba(11,16,32,0.6)',
              border: '1px solid rgba(123,97,255,0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <h2
              className="text-xl font-bold tracking-wide mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}
            >
              Our Mission
            </h2>
            <p className="text-[#94A3B8] text-sm leading-relaxed mb-4">
              To democratize financial growth by providing a transparent, community-driven DeFi platform
              that rewards participation and empowers individuals worldwide to build sustainable passive
              income streams.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {[
                { label: 'Transparency', desc: 'Every transaction is verifiable on-chain' },
                { label: 'Accessibility', desc: 'Start with as little as $5' },
                { label: 'Sustainability', desc: 'Self-balancing ecosystem design' },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-4 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <p className="text-sm font-semibold text-[#00E5FF] mb-1">{m.label}</p>
                  <p className="text-xs text-[#94A3B8]">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2
            className="text-xl font-bold tracking-wide mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5 transition-all hover:border-[#00E5FF]/20"
                style={{
                  background: 'rgba(11,16,32,0.6)',
                  border: '1px solid rgba(0,229,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="mb-3">{f.icon}</div>
                <h3 className="text-sm font-bold text-white mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                  {f.title}
                </h3>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h2
            className="text-xl font-bold tracking-wide mb-6"
            style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}
          >
            Our Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((t) => (
              <div
                key={t.role}
                className="rounded-2xl p-5 flex items-start gap-4"
                style={{
                  background: 'rgba(11,16,32,0.6)',
                  border: '1px solid rgba(0,229,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div className="w-10 h-10 rounded-full bg-[#00E5FF]/10 flex items-center justify-center flex-shrink-0">
                  <Users size={18} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{t.role}</p>
                  <p className="text-xs text-[#94A3B8] mt-1">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#94A3B8]/60 mt-6 text-center">
            CYLIX operates as a decentralized autonomous entity. Core contributors remain anonymous to
            protect the integrity and longevity of the protocol.
          </p>
        </section>
      </div>

      <PublicFooter />
    </div>
  );
}
