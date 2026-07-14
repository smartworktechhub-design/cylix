'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_LINKS } from '@/lib/constants';
import { useAppStore } from '@/stores/app-store';
import {
  LayoutDashboard, Package, Orbit, GitBranch, TrendingUp,
  Vault, Wallet, ArrowLeftRight, Users, Trophy, BarChart3,
  Bell, UserCircle, LifeBuoy, X, LogOut
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Package: <Package size={18} />,
  Orbit: <Orbit size={18} />,
  GitBranch: <GitBranch size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Vault: <Vault size={18} />,
  Wallet: <Wallet size={18} />,
  ArrowLeftRight: <ArrowLeftRight size={18} />,
  Users: <Users size={18} />,
  Trophy: <Trophy size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Bell: <Bell size={18} />,
  UserCircle: <UserCircle size={18} />,
  LifeBuoy: <LifeBuoy size={18} />,
};

export function UserSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-[#0B1020] border-r border-[rgba(0,229,255,0.08)] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(0,229,255,0.08)]">
          <Link href="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="CYLIX" className="w-10 h-10 rounded-lg object-contain" />
            <span className="text-lg font-bold font-heading tracking-wider text-white">CYLIX</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[#94A3B8] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'sidebar-link',
                  isActive && 'active'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {iconMap[link.icon]}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(0,229,255,0.08)]">
          <button className="sidebar-link w-full text-[#FF5C7A] hover:bg-[rgba(255,92,122,0.1)]">
            <LogOut size={18} />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>
    </>
  );
}
