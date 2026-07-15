import type { Metadata } from 'next';
import { Inter, Orbitron, Rajdhani } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
});

export const metadata: Metadata = {
  title: 'CYLIX MATRIX DeFi',
  description: 'CYLIX MATRIX — Decentralized 2x11 Forced Binary Matrix on BSC. Start with $5, earn 3% daily, build your team, and grow with the Autoflow Ecosystem.',
  openGraph: {
    title: 'CYLIX MATRIX DeFi',
    description: 'Decentralized 2x11 Forced Binary Matrix on BSC. Start with $5, earn 3% daily.',
    url: 'https://app.cylixdefi.live',
    siteName: 'CYLIX MATRIX DeFi',
    images: [
      { url: '/logo-square.png', width: 512, height: 512, alt: 'CYLIX MATRIX DeFi' },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CYLIX MATRIX DeFi',
    description: 'Decentralized 2x11 Forced Binary Matrix on BSC. Start with $5, earn 3% daily.',
    images: ['/logo-square.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#090B14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} ${rajdhani.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
