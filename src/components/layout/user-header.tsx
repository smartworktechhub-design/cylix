'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAppStore } from '@/stores/app-store';
import { shortenAddress } from '@/lib/utils';
import { Menu, Bell, Wallet } from 'lucide-react';

export function UserHeader() {
  const { toggleSidebar, notifications } = useAppStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-[rgba(0,229,255,0.08)] flex items-center justify-between px-4 lg:px-6 bg-[rgba(5,8,22,0.8)] backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-[#94A3B8] hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-sm font-medium text-white">Welcome back</h1>
          <p className="text-xs text-[#94A3B8]">Track your portfolio performance</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-[rgba(0,229,255,0.08)] transition-all">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF5C7A] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <ConnectButton.Custom>
          {({ account, openConnectModal, mounted }) => {
            if (!mounted) return <div className="w-36 h-10 rounded-xl bg-[rgba(148,163,184,0.05)] animate-pulse" />;
            if (!account) {
              return (
                <button
                  onClick={openConnectModal}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[#00E5FF] text-[#050816] text-sm font-medium hover:bg-[#00E5FF]/90 transition-all"
                >
                  <Wallet size={16} />
                  Connect Wallet
                </button>
              );
            }
            return (
              <button
                className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.15)] text-sm text-white"
              >
                <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
                {shortenAddress(account.address)}
              </button>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  );
}
