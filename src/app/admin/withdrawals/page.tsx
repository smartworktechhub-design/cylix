'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { approveWithdrawal, rejectWithdrawal } from '@/lib/db';
import { CheckCircle, XCircle, Clock, DollarSign, Loader2 } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'rejected';

interface WdRow {
  id: string;
  userWallet: string;
  amount: number;
  wallet: string;
  date: string;
  status: string;
  processedAt: string | null;
  txHash: string | null;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminWithdrawals() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [withdrawals, setWithdrawals] = useState<WdRow[]>([]);

  async function loadWithdrawals() {
    const { data } = await getSupabase()
      .from('withdrawals')
      .select('*, users!inner(wallet)')
      .order('created_at', { ascending: false });

    setWithdrawals((data || []).map((w: Record<string, unknown>) => {
      const users = w.users as Record<string, unknown> | undefined;
      return {
        id: String(w.id || ''),
        userWallet: String(users?.wallet || ''),
        amount: Number(w.amount || 0),
        wallet: String(w.wallet || ''),
        date: String(w.created_at || ''),
        status: String(w.status || ''),
        processedAt: w.processed_at ? String(w.processed_at) : null,
        txHash: w.tx_hash ? String(w.tx_hash) : null,
      };
    }));
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadWithdrawals();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function handleApprove(id: string) {
    setActionLoading(id);
    await approveWithdrawal(id);
    await loadWithdrawals();
    setActionLoading(null);
  }

  async function handleReject(id: string) {
    setActionLoading(id);
    await rejectWithdrawal(id);
    await loadWithdrawals();
    setActionLoading(null);
  }

  const filtered = withdrawals.filter((w) => w.status === activeTab);
  const pendingTotal = withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const approvedTotal = withdrawals.filter((w) => w.status === 'approved').reduce((s, w) => s + w.amount, 0);

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
        <h2 className="text-2xl font-bold text-white font-heading">Withdrawal Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Process and review withdrawal requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <Clock size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Pending Amount</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(pendingTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Approved</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(approvedTotal)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(11,16,32,0.8)] w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[#94A3B8] text-sm">{filtered.length} withdrawals</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>User</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Wallet Address</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Status</TableHeader>
                {activeTab === 'approved' && <TableHeader>Processed At</TableHeader>}
                {activeTab === 'pending' && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-mono text-xs text-[#00E5FF]">{shortenAddress(w.userWallet, 6)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(w.amount)}</TableCell>
                  <TableCell className="font-mono text-xs text-[#94A3B8]">{shortenAddress(w.wallet, 8)}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{formatDate(w.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={w.status === 'approved' ? 'success' : w.status === 'rejected' ? 'danger' : 'warning'}
                    >
                      {w.status}
                    </Badge>
                  </TableCell>
                  {activeTab === 'approved' && (
                    <TableCell className="text-[#94A3B8] text-xs">
                      {w.processedAt ? formatDate(w.processedAt) : '-'}
                    </TableCell>
                  )}
                  {activeTab === 'pending' && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          loading={actionLoading === w.id}
                          onClick={() => handleApprove(w.id)}
                        >
                          <CheckCircle size={14} />
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={actionLoading === w.id}
                          onClick={() => handleReject(w.id)}
                        >
                          <XCircle size={14} />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <td colSpan={6} className="text-center text-[#94A3B8] py-8">
                    No {activeTab} withdrawals
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
