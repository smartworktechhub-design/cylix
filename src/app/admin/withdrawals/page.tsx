'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { approveWithdrawal, rejectWithdrawal } from '@/lib/db';
import {
  CheckCircle, XCircle, Clock, DollarSign, Loader2, Wallet,
  Hourglass, AlertTriangle, ExternalLink, RefreshCw, Zap
} from 'lucide-react';

type TabType = 'pending' | 'held' | 'processing' | 'completed' | 'rejected';

interface WdRow {
  id: string;
  userWallet: string;
  amount: number;
  wallet: string;
  date: string;
  status: string;
  processedAt: string | null;
  txHash: string | null;
  heldSince: string | null;
  retryCount: number;
  errorMessage: string | null;
}

interface WalletInfo {
  walletBalance: number;
  totalHeld: number;
  heldCount: number;
  pendingCount: number;
  isConfigured: boolean;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'held', label: 'Held' },
  { key: 'processing', label: 'Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
];

export default function AdminWithdrawals() {
  useEffect(() => { document.title = 'Withdrawals — CYLIX Admin'; }, []);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [withdrawals, setWithdrawals] = useState<WdRow[]>([]);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [processLoading, setProcessLoading] = useState(false);
  const [processMsg, setProcessMsg] = useState<string | null>(null);

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
        heldSince: w.held_since ? String(w.held_since) : null,
        retryCount: Number(w.retry_count || 0),
        errorMessage: w.error_message ? String(w.error_message) : null,
      };
    }));
  }

  async function loadWalletInfo() {
    try {
      const res = await fetch('/api/withdrawal/balance');
      if (res.ok) {
        const data = await res.json();
        setWalletInfo(data);
      }
    } catch { /* ignore */ }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await Promise.all([loadWithdrawals(), loadWalletInfo()]);
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

  async function handleProcessHeld() {
    setProcessLoading(true);
    setProcessMsg(null);
    try {
      const res = await fetch('/api/withdrawal/process', {
        method: 'POST',
        headers: { authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProcessMsg(data.message);
        await Promise.all([loadWithdrawals(), loadWalletInfo()]);
      } else {
        setProcessMsg(data.error || 'Failed');
      }
    } catch {
      setProcessMsg('Network error');
    }
    setProcessLoading(false);
  }

  const filtered = withdrawals.filter((w) => w.status === activeTab);
  const pendingTotal = withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);
  const heldTotal = withdrawals.filter((w) => w.status === 'held').reduce((s, w) => s + w.amount, 0);
  const completedTotal = withdrawals.filter((w) => w.status === 'completed').reduce((s, w) => s + w.amount, 0);

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">{status}</Badge>;
      case 'processing':
        return <Badge variant="info" className="flex items-center gap-1"><Zap size={10} />processing</Badge>;
      case 'held':
        return <Badge variant="warning" className="flex items-center gap-1"><Hourglass size={10} />held</Badge>;
      case 'pending':
        return <Badge variant="warning">{status}</Badge>;
      case 'rejected':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

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
        <p className="text-[#94A3B8] text-sm mt-1">Auto-process payouts with hot wallet</p>
      </div>

      {walletInfo && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <Wallet size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Hot Wallet Balance</p>
                <p className="text-white font-bold font-mono text-lg">{formatCurrency(walletInfo.walletBalance)}</p>
                {!walletInfo.isConfigured && (
                  <p className="text-[#FF5C7A] text-xs">Not configured</p>
                )}
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                <Clock size={20} className="text-[#FFB800]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Pending</p>
                <p className="text-white font-bold font-mono text-lg">{formatCurrency(pendingTotal)}</p>
                <p className="text-[#94A3B8] text-xs">{walletInfo.pendingCount} requests</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,92,122,0.1)] flex items-center justify-center">
                <Hourglass size={20} className="text-[#FF5C7A]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Total On Hold</p>
                <p className="text-white font-bold font-mono text-lg">{formatCurrency(heldTotal)}</p>
                <p className="text-[#94A3B8] text-xs">{walletInfo.heldCount} held</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                <DollarSign size={20} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Total Completed</p>
                <p className="text-white font-bold font-mono text-lg">{formatCurrency(completedTotal)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {walletInfo && walletInfo.heldCount > 0 && (
        <Card className="p-4 border border-[rgba(255,184,0,0.2)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-[#FFB800]" />
              <div>
                <p className="text-white font-medium text-sm">{walletInfo.heldCount} withdrawals on hold</p>
                <p className="text-[#94A3B8] text-xs">
                  Total: {formatCurrency(heldTotal)} — will auto-process when wallet is funded
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              loading={processLoading}
              onClick={handleProcessHeld}
            >
              <RefreshCw size={14} />
              Process Now
            </Button>
          </div>
          {processMsg && (
            <p className="text-xs text-[#00E5FF] mt-2">{processMsg}</p>
          )}
        </Card>
      )}

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
                <TableHeader>TX Hash</TableHeader>
                {(activeTab === 'pending' || activeTab === 'held') && <TableHeader>Actions</TableHeader>}
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
                    {statusBadge(w.status)}
                    {w.status === 'held' && w.errorMessage && (
                      <p className="text-[10px] text-[#FFB800] mt-1 max-w-[160px] truncate" title={w.errorMessage}>
                        {w.errorMessage}
                      </p>
                    )}
                    {w.status === 'held' && (
                      <p className="text-[10px] text-[#94A3B8] mt-1">Retry {w.retryCount}/5</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {w.txHash ? (
                      <a
                        href={`https://bscscan.com/tx/${w.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00E5FF] hover:underline"
                      >
                        <span className="text-xs font-mono">{w.txHash.slice(0, 8)}...</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">--</span>
                    )}
                  </TableCell>
                  {(activeTab === 'pending' || activeTab === 'held') && (
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
                  <td colSpan={7} className="text-center text-[#94A3B8] py-8">
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
