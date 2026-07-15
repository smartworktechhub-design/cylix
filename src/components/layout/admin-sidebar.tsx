'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ADMIN_NAV_LINKS } from '@/lib/constants';
import {
  LayoutDashboard, Users, Package, GitBranch, TrendingUp,
  Wallet, Trophy, Megaphone, ArrowLeftRight, Settings,
  Shield, Bell, LifeBuoy, X, ArrowLeft, Search, Activity, Mail, ShieldOff, Gift, UserPlus
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Users: <Users size={18} />,
  Package: <Package size={18} />,
  GitBranch: <GitBranch size={18} />,
  TrendingUp: <TrendingUp size={18} />,
  Wallet: <Wallet size={18} />,
  Trophy: <Trophy size={18} />,
  Megaphone: <Megaphone size={18} />,
  ArrowLeftRight: <ArrowLeftRight size={18} />,
  Settings: <Settings size={18} />,
  Shield: <Shield size={18} />,
  Bell: <Bell size={18} />,
  LifeBuoy: <LifeBuoy size={18} />,
  Search: <Search size={18} />,
  Activity: <Activity size={18} />,
  Mail: <Mail size={18} />,
  ShieldOff: <ShieldOff size={18} />,
  Gift: <Gift size={18} />,
  UserPlus: <UserPlus size={18} />,
};

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-[#0B1020] border-r border-[rgba(123,97,255,0.08)] flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-[rgba(123,97,255,0.08)]">
          <Link href="/admin" className="flex items-center gap-1.5">
            <img src="/logo-sm.png" alt="CYLIX" className="w-7 h-7 rounded object-cover cursor-pointer" />
            <span className="text-lg font-bold font-heading tracking-wider text-white">CYLIX</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-[#94A3B8] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-[rgba(123,97,255,0.08)]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-[#7B61FF] hover:text-[#7B61FF]/80 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to User Panel
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {ADMIN_NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href + '/'));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'sidebar-link',
                  isActive && 'active'
                )}
                onClick={onClose}
              >
                {iconMap[link.icon]}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[rgba(123,97,255,0.08)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-[#050816]">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-[#94A3B8]">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
