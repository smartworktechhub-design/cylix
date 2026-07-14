'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAppStore } from '@/stores/app-store';
import { shortenAddress } from '@/lib/utils';
import Link from 'next/link';
import { Menu, Bell, Wallet, X } from 'lucide-react';

export function UserHeader() {
  const { sidebarOpen, setSidebarOpen, notifications } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-14 border-b border-[rgba(0,229,255,0.08)] flex items-center justify-between px-3 lg:px-5 bg-[rgba(5,8,22,0.9)] backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-[#94A3B8] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[rgba(0,229,255,0.06)]"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="CYLIX" className="w-9 h-9 rounded-lg object-contain" />
          <span className="text-sm font-bold tracking-wider text-white" style={{ fontFamily: "'Orbitron',sans-serif" }}>CYLIX</span>
          <span className="hidden sm:inline text-[8px] text-[#00E5FF] tracking-[0.2em] uppercase font-medium">Matrix DeFi</span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/notifications" className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[rgba(0,229,255,0.06)] transition-all">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FF5C7A] text-white text-[8px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <ConnectButton.Custom>
          {({ account, openConnectModal, mounted }) => {
            if (!mounted) return <div className="w-28 h-8 rounded-lg bg-[rgba(148,163,184,0.05)] animate-pulse" />;
            if (!account) {
              return (
                <button onClick={openConnectModal}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] text-[#050816] text-xs font-semibold hover:shadow-lg hover:shadow-[rgba(0,229,255,0.15)] transition-all">
                  <Wallet size={13} /> Connect
                </button>
              );
            }
            return (
              <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[rgba(0,229,255,0.06)] border border-[rgba(0,229,255,0.08)] text-xs text-white font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]" />
                {shortenAddress(account.address)}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
