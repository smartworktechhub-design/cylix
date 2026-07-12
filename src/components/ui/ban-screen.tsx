'use client';

import { useState } from 'react';
import { AlertTriangle, ShieldOff, LogOut, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

interface BanScreenProps {
  reason?: string;
  walletAddress?: string;
  userId?: string;
  onLogout: () => void;
}

export function BanScreen({ reason, walletAddress, userId, onLogout }: BanScreenProps) {
  const [appealText, setAppealText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAppeal = async () => {
    if (!appealText.trim() || !walletAddress || !userId) return;
    setSubmitting(true);
    try {
      await getSupabase().from('ban_appeals').insert({
        user_id: userId,
        wallet: walletAddress,
        reason: appealText.trim(),
        status: 'pending',
      });
      setSubmitted(true);
    } catch {
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[rgba(255,92,122,0.04)] blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto w-full">
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

        {!submitted ? (
          <div className="p-5 rounded-xl bg-[rgba(11,16,32,0.6)] border border-[rgba(0,229,255,0.08)] mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Send size={14} className="text-[#00E5FF]" />
              <span className="text-white text-sm font-medium">Submit Appeal</span>
            </div>
            <p className="text-[#94A3B8] text-xs mb-3">
              Explain why your account should be restored. An admin will review your request.
            </p>
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              placeholder="Write your appeal here... (e.g. I believe this was a mistake because...)"
              rows={4}
              className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none mb-3"
            />
            {walletAddress && (
              <p className="text-[#94A3B8]/50 text-[10px] mb-3">Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
            )}
            <button
              onClick={handleAppeal}
              disabled={submitting || !appealText.trim()}
              className="w-full py-2.5 rounded-xl text-sm font-bold transition-all bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] text-[#00E5FF] hover:bg-[rgba(0,229,255,0.2)] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Submit Appeal'}
            </button>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-[rgba(0,255,178,0.06)] border border-[rgba(0,255,178,0.15)] mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle2 size={20} className="text-[#00FFB2]" />
              <span className="text-[#00FFB2] text-sm font-bold">Appeal Submitted!</span>
            </div>
            <p className="text-[#94A3B8] text-xs text-center">
              Your appeal has been sent to the admin team. You will be unbanned if approved. You can close this page now.
            </p>
          </div>
        )}

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
