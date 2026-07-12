'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, shortenAddress, formatDate } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { unbanUser } from '@/lib/db';
import {
  Loader2, ShieldCheck, ShieldOff, Clock, CheckCircle2,
  XCircle, MessageSquare, AlertTriangle, User
} from 'lucide-react';

interface Appeal {
  id: string;
  user_id: string;
  wallet: string;
  reason: string;
  status: string;
  admin_note: string;
  created_at: string;
  reviewed_at: string;
}

export default function BanAppealsPage() {
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [adminNote, setAdminNote] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await getSupabase().from('ban_appeals')
      .select('*').order('created_at', { ascending: false });
    setAppeals((data || []) as Appeal[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleApprove = async (appeal: Appeal) => {
    setProcessing(appeal.id);
    await unbanUser(appeal.user_id);
    await getSupabase().from('ban_appeals').update({
      status: 'approved',
      admin_note: adminNote || 'Approved by admin',
      reviewed_at: new Date().toISOString(),
    }).eq('id', appeal.id);
    await getSupabase().from('admin_activity_log').insert({
      action: 'ban_appeal_approved',
      target_user: appeal.wallet,
      details: `Ban appeal approved. ${adminNote || ''}`,
      admin_email: 'admin',
    });
    setToast('User unbanned and appeal approved!');
    setAdminNote('');
    await load();
    setProcessing(null);
    setTimeout(() => setToast(''), 3000);
  };

  const handleReject = async (appeal: Appeal) => {
    setProcessing(appeal.id);
    await getSupabase().from('ban_appeals').update({
      status: 'rejected',
      admin_note: adminNote || 'Rejected by admin',
      reviewed_at: new Date().toISOString(),
    }).eq('id', appeal.id);
    await getSupabase().from('admin_activity_log').insert({
      action: 'ban_appeal_rejected',
      target_user: appeal.wallet,
      details: `Ban appeal rejected. ${adminNote || ''}`,
      admin_email: 'admin',
    });
    setToast('Appeal rejected');
    setAdminNote('');
    await load();
    setProcessing(null);
    setTimeout(() => setToast(''), 3000);
  };

  const filtered = appeals.filter(a => filter === 'all' || a.status === filter);
  const pendingCount = appeals.filter(a => a.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Ban Appeals</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Review and process user ban appeal requests</p>
      </div>

      <div className="flex items-center gap-2">
        {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f
                ? 'bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] text-[#00E5FF]'
                : 'bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)] text-[#94A3B8] hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#FF5C7A] text-white text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldCheck size={48} className="text-[#94A3B8]/20 mx-auto mb-4" />
            <p className="text-[#94A3B8] text-sm">
              {filter === 'pending' ? 'No pending appeals' : `No ${filter} appeals`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((appeal) => (
            <Card key={appeal.id} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(255,92,122,0.1)] flex items-center justify-center">
                      <User size={20} className="text-[#FF5C7A]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {shortenAddress(appeal.wallet, 8)}
                      </p>
                      <p className="text-[#94A3B8] text-xs font-mono">{shortenAddress(appeal.user_id, 8)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      appeal.status === 'pending' ? 'warning' :
                      appeal.status === 'approved' ? 'success' : 'danger'
                    }>
                      {appeal.status === 'pending' && <Clock size={10} className="mr-1" />}
                      {appeal.status === 'approved' && <CheckCircle2 size={10} className="mr-1" />}
                      {appeal.status === 'rejected' && <XCircle size={10} className="mr-1" />}
                      {appeal.status}
                    </Badge>
                    <span className="text-[#94A3B8] text-xs">{formatDate(appeal.created_at)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)] mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={12} className="text-[#00E5FF]" />
                    <span className="text-[#94A3B8] text-[10px] uppercase tracking-wider">User Appeal</span>
                  </div>
                  <p className="text-white text-sm">{appeal.reason}</p>
                </div>

                {appeal.admin_note && (
                  <div className="p-3 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.1)] mb-4">
                    <p className="text-[#7B61FF] text-xs font-bold mb-1">Admin Note:</p>
                    <p className="text-white text-xs">{appeal.admin_note}</p>
                  </div>
                )}

                {appeal.status === 'pending' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Admin note (optional)..."
                      className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
                    />
                    <div className="flex items-center gap-3">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleApprove(appeal)}
                        loading={processing === appeal.id}
                        disabled={processing === appeal.id}
                      >
                        <ShieldCheck size={14} /> Approve — Unban User
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleReject(appeal)}
                        loading={processing === appeal.id}
                        disabled={processing === appeal.id}
                      >
                        <ShieldOff size={14} /> Reject Appeal
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-xs font-medium pointer-events-none z-[100] bg-[rgba(0,255,178,0.1)] border border-[rgba(0,255,178,0.2)] text-[#00FFB2]">
          {toast}
        </div>
      )}
    </div>
  );
}
