'use client';

import { AlertTriangle, ShieldOff, LogOut } from 'lucide-react';

interface BanScreenProps {
  reason?: string;
  onLogout: () => void;
}

export function BanScreen({ reason, onLogout }: BanScreenProps) {
  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(255,92,122,0.04)] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto rounded-3xl bg-[rgba(255,92,122,0.1)] border border-[rgba(255,92,122,0.2)] flex items-center justify-center mb-8">
          <ShieldOff size={48} className="text-[#FF5C7A]" />
        </div>

        <h1 className="text-3xl font-bold text-white font-heading mb-3">Account Suspended</h1>

        <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
          Your account has been suspended by an administrator. You can no longer access the CYLIX platform.
        </p>

        {reason && (
          <div className="p-4 rounded-xl bg-[rgba(255,92,122,0.06)] border border-[rgba(255,92,122,0.15)] mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-[#FF5C7A]" />
              <span className="text-[#FF5C7A] text-xs font-bold uppercase tracking-wider">Reason</span>
            </div>
            <p className="text-white text-sm">{reason}</p>
          </div>
        )}

        <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)] mb-6">
          <p className="text-[#94A3B8] text-xs">
            If you believe this is a mistake, please contact our support team with your wallet address for review.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[rgba(255,92,122,0.1)] border border-[rgba(255,92,122,0.2)] text-[#FF5C7A] text-sm font-medium hover:bg-[rgba(255,92,122,0.2)] transition-colors"
        >
          <LogOut size={16} />
          Disconnect Wallet
        </button>

        <p className="text-[#94A3B8]/30 text-[10px] mt-8">CYLIX — Premium DeFi Platform</p>
      </div>
    </div>
  );
}
