'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getWithdrawals, getUserEarnings } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import {
  Wallet, Clock, Shield, Info, ArrowUpRight, CheckCircle2,
  AlertCircle, Copy, ExternalLink, DollarSign, Banknote, Loader2,
  Hourglass, Zap
} from 'lucide-react';

const minWithdrawal = 1;
const processingTime = 'Instant — 24h';

export default function WithdrawalsPage() {
  useEffect(() => { document.title = 'Withdrawals — CYLIX'; }, []);
  const { user } = useAppStore();
  const { loading: initLoading } = useInitData();
  const [amount, setAmount] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitType, setSubmitType] = useState<'success' | 'info' | 'error' | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const [withdrawals, earnings] = await Promise.all([
          getWithdrawals(user.id),
          getUserEarnings(user.id),
        ]);
        setWithdrawalHistory(withdrawals);
        setAvailableBalance(earnings.total);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const walletDisplay = user?.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'Not Connected';

  async function handleSubmit() {
    if (!user || !amount) return;
    setSubmitting(true);
    setSubmitMsg(null);
    try {
      const res = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: Number(amount), wallet: user.wallet }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg(data.error || 'Request failed');
        setSubmitType('error');
      } else {
        setAmount('');
        if (data.status === 'processing') {
          setSubmitMsg(`Withdrawal processing! TX: ${data.txHash?.slice(0, 10)}...`);
          setSubmitType('success');
        } else {
          setSubmitMsg('Withdrawal queued — will process when funds are available.');
          setSubmitType('info');
        }
        const [withdrawals, earnings] = await Promise.all([
          getWithdrawals(user.id),
          getUserEarnings(user.id),
        ]);
        setWithdrawalHistory(withdrawals);
        setAvailableBalance(earnings.total);
      }
    } catch {
      setSubmitMsg('Network error. Please try again.');
      setSubmitType('error');
    }
    setSubmitting(false);
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <Badge variant="success" className="text-xs">{status}</Badge>;
      case 'processing':
        return <Badge variant="info" className="text-xs flex items-center gap-1"><Zap size={10} />processing</Badge>;
      case 'held':
        return <Badge variant="warning" className="text-xs flex items-center gap-1"><Hourglass size={10} />held</Badge>;
      case 'pending':
        return <Badge variant="warning" className="text-xs">pending</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge variant="danger" className="text-xs">{status}</Badge>;
      default:
        return <Badge variant="default" className="text-xs">{status}</Badge>;
    }
  };

  if (loading || initLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Withdrawals</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Request and track your withdrawal transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Request Withdrawal</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Available Balance</p>
                <p className="text-xl font-bold font-mono text-white">{formatCurrency(availableBalance)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Minimum Withdrawal</p>
                <p className="text-xl font-bold font-mono text-white">{formatCurrency(minWithdrawal)}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#94A3B8]">Withdrawal Wallet (BEP20)</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"
                  onClick={() => { navigator.clipboard.writeText(user?.wallet || ''); }}>
                  <Copy size={11} className="mr-1" /> Copy
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <Wallet size={16} className="text-[#00E5FF]" />
                </div>
                <span className="text-sm font-mono text-white">{walletDisplay}</span>
              </div>
            </div>

            <div>
              <Input
                label="Withdrawal Amount (USDT)"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setSubmitMsg(null); }}
                icon={<DollarSign size={16} />}
                type="number"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#94A3B8]">Processing: {processingTime}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#94A3B8]">Max:</span>
                  <button
                    className="text-xs font-mono text-[#00E5FF] hover:underline"
                    onClick={() => setAmount(String(Math.floor(availableBalance * 100) / 100))}
                  >
                    {formatCurrency(Math.floor(availableBalance * 100) / 100)}
                  </button>
                </div>
              </div>
            </div>

            <Button variant="primary" className="w-full"
              disabled={!amount || Number(amount) < minWithdrawal || Number(amount) > availableBalance || submitting || !user}
              loading={submitting}
              onClick={handleSubmit}>
              <Wallet size={16} />
              Request Withdrawal
            </Button>

            {(Number(amount) > 0 && Number(amount) < minWithdrawal) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,92,122,0.08)] border border-[rgba(255,92,122,0.15)]">
                <AlertCircle size={14} className="text-[#FF5C7A]" />
                <span className="text-xs text-[#FF5C7A]">Minimum withdrawal is {formatCurrency(minWithdrawal)}</span>
              </div>
            )}

            {submitMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                submitType === 'success' ? 'bg-[rgba(0,255,178,0.08)] border-[rgba(0,255,178,0.15)]' :
                submitType === 'info' ? 'bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.15)]' :
                'bg-[rgba(255,92,122,0.08)] border-[rgba(255,92,122,0.15)]'
              }`}>
                {submitType === 'success' ? <CheckCircle2 size={14} className="text-[#00FFB2]" /> :
                 submitType === 'info' ? <Hourglass size={14} className="text-[#00E5FF]" /> :
                 <AlertCircle size={14} className="text-[#FF5C7A]" />}
                <span className={`text-xs ${
                  submitType === 'success' ? 'text-[#00FFB2]' :
                  submitType === 'info' ? 'text-[#00E5FF]' : 'text-[#FF5C7A]'
                }`}>{submitMsg}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#7B61FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Info</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: DollarSign, label: 'Minimum', value: formatCurrency(minWithdrawal), color: '#00E5FF' },
                { icon: Zap, label: 'Processing', value: 'Auto — Instant', color: '#00FFB2' },
                { icon: Clock, label: 'Hold Status', value: 'Auto-retry when funded', color: '#FFB800' },
                { icon: CheckCircle2, label: 'Network Fee', value: 'Covered by platform', color: '#7B61FF' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>
                      <Icon size={14} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#94A3B8]">{item.label}</p>
                      <p className="text-sm font-medium text-white">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info size={18} className="text-[#FFB800]" />
                <h3 className="text-lg font-semibold text-white font-heading">Notes</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Automatic withdrawal — processed instantly when wallet has funds.',
                'If insufficient funds, withdrawal is held and retried automatically.',
                'BEP20 (BSC) network only. Ensure your wallet supports BSC.',
                'Network fees are covered by the platform.',
                'Minimum withdrawal: 1 USDT.',
              ].map((note, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#94A3B8] mt-1.5 shrink-0" />
                  <span className="text-xs text-[#94A3B8]">{note}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Withdrawal History</h3>
            </div>
            <Badge variant="default" className="text-xs">{withdrawalHistory.length} requests</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Requested</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>TX Hash</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawalHistory.map((wd) => (
                <TableRow key={wd.id}>
                  <TableCell>
                    <span className="text-sm font-mono font-medium text-white">{formatCurrency(wd.amount)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-[#94A3B8]">{wd.wallet.slice(0, 6)}...{wd.wallet.slice(-4)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-[#94A3B8]" />
                      <span className="text-xs text-[#94A3B8]">{formatDate(wd.timestamp)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {statusBadge(wd.status)}
                  </TableCell>
                  <TableCell>
                    {wd.txHash ? (
                      <a
                        href={`https://bscscan.com/tx/${wd.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00E5FF] hover:underline"
                      >
                        <span className="text-xs font-mono">{wd.txHash.slice(0, 8)}...</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawalHistory.length === 0 && (
                <TableRow>
                  <td colSpan={5} className="text-center text-[#94A3B8] py-8">
                    No withdrawals yet
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
