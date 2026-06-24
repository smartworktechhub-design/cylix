'use client';

import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  onMenuClick: () => void;
}

export function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  return (
    <header className="h-16 border-b border-[rgba(123,97,255,0.08)] flex items-center justify-between px-4 lg:px-6 bg-[rgba(5,8,22,0.8)] backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden text-[#94A3B8] hover:text-white transition-colors">
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 h-10 px-4 rounded-xl bg-[rgba(123,97,255,0.1)] border border-[rgba(123,97,255,0.15)] text-sm">
          <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
          <span className="text-[#94A3B8]">System Online</span>
        </div>
      </div>
    </header>
  );
}
