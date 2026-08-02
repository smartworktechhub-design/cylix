'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet, Clock, Shield, Info, ArrowUpRight,
  AlertCircle, ExternalLink, Loader2, Hourglass, Zap,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getWithdrawals } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';

const MIN_WITHDRAWAL = 10;
const WITHDRAWAL_FREEZE_HOURS = 24;

function getFreezeEndTime(): number {
  const stored = localStorage.getItem('cylix_withdrawal_freeze_start');
  let start: number;
  if (stored) {
    start = parseInt(stored, 10);
  } else {
    start = Date.now();
    localStorage.setItem('cylix_withdrawal_freeze_start', String(start));
  }
  return start + WITHDRAWAL_FREEZE_HOURS * 3600 * 1000;
}

function useFreezeCountdown() {
  const [target, setTarget] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    setTarget(getFreezeEndTime());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = target - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function WithdrawalsPage() {
  useEffect(() => { document.title = 'Withdrawals — CYLIX'; }, []);
  const { user } = useAppStore();
  const { loading: initLoading } = useInitData();
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const freezeCountdown = useFreezeCountdown();
  const withdrawalsOpen = !freezeCountdown;

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const withdrawals = await getWithdrawals(user.id);
        setWithdrawalHistory(withdrawals);
        setAvailableBalance(Number(user.totalEarned || 0));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || !withdrawAmount) return;
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < MIN_WITHDRAWAL) {
      setMessage({ type: 'error', text: `Minimum withdrawal is $${MIN_WITHDRAWAL}` });
      return;
    }
    if (amt > availableBalance) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, amount: amt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed' });
      } else {
        setMessage({ type: 'success', text: data.message || 'Withdrawal submitted!' });
        setWithdrawAmount('');
        setAvailableBalance(prev => prev - amt);
        setWithdrawalHistory(prev => [{ id: data.withdrawalId, amount: amt, wallet: user.wallet, timestamp: new Date().toISOString(), status: data.status, txHash: data.txHash }, ...prev]);
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSubmitting(false);
    }
  };

  const walletDisplay = user?.wallet ? `${user.wallet.slice(0, 6)}...${user.wallet.slice(-4)}` : 'Not Connected';

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
        <p className="text-sm text-[#A8B8D0] mt-1">Request and track your withdrawal transactions</p>
      </div>

      {!withdrawalsOpen && freezeCountdown && (
        <div className="p-5 rounded-2xl border border-[rgba(255,92,122,0.3)] bg-[rgba(255,92,122,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,92,122,0.15)] flex items-center justify-center">
              <Clock size={20} className="text-[#FF5C7A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Withdrawals Frozen</p>
              <p className="text-xs text-[#A8B8D0]">Withdrawals are temporarily frozen for 24 hours</p>
            </div>
          </div>
          <div className="flex gap-3">
            {[
              { val: freezeCountdown.d, label: 'DD' },
              { val: freezeCountdown.h, label: 'HH' },
              { val: freezeCountdown.m, label: 'MM' },
              { val: freezeCountdown.s, label: 'SS' },
            ].map((u) => (
              <div key={u.label} className="flex-1 text-center">
                <div className="py-2.5 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(255,92,122,0.2)]">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-[#FF5C7A]">{String(u.val).padStart(2, '0')}</span>
                </div>
                <p className="text-[10px] text-[#A8B8D0] mt-1">{u.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {withdrawalsOpen && (
        <div className="p-3 rounded-xl bg-[rgba(0,255,178,0.06)] border border-[rgba(0,255,178,0.15)]">
          <p className="text-sm text-[#00FFB2] font-medium text-center">Withdrawals are now open</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className={`lg:col-span-2 ${!withdrawalsOpen ? 'opacity-50 pointer-events-none' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Request Withdrawal</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-xs text-[#A8B8D0] mb-1">Available Balance</p>
                  <p className="text-lg sm:text-xl font-bold font-mono text-white overflow-hidden truncate">{formatCurrency(availableBalance)}</p>
                </div>
                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-xs text-[#A8B8D0] mb-1">Minimum Withdrawal</p>
                  <p className="text-lg sm:text-xl font-bold font-mono text-white overflow-hidden truncate">{formatCurrency(MIN_WITHDRAWAL)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#A8B8D0]">Withdrawal Wallet (BEP20)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                    <Wallet size={16} className="text-[#00E5FF]" />
                  </div>
                  <span className="text-sm font-mono text-white">{walletDisplay}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-[#A8B8D0]">Amount (USDT)</label>
                <input
                  type="number"
                  min={MIN_WITHDRAWAL}
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => { setWithdrawAmount(e.target.value); setMessage(null); }}
                  placeholder={`Min $${MIN_WITHDRAWAL}`}
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.15)] text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
              {message && (
                <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-[rgba(0,255,178,0.08)] text-[#00FFB2] border border-[rgba(0,255,178,0.15)]' : 'bg-[rgba(255,92,122,0.08)] text-[#FF5C7A] border border-[rgba(255,92,122,0.15)]'}`}>
                  {message.text}
                </div>
              )}
              <button
                onClick={handleWithdraw}
                disabled={submitting || !withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAWAL}
                className="w-full py-3 rounded-xl font-bold text-sm text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #7B61FF)' }}
              >
                {submitting ? 'Processing...' : 'Withdraw Now'}
              </button>
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
                  { icon: Zap, label: 'Processing', value: 'Auto — Instant', color: '#00FFB2' },
                  { icon: Clock, label: 'Hold Status', value: 'Auto-retry when funded', color: '#FFB800' },
                  { icon: AlertCircle, label: 'Network', value: 'BEP20 (BSC)', color: '#FF5C7A' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}12` }}>
                        <Icon size={14} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#A8B8D0]">{item.label}</p>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
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
                    <span className="text-sm font-mono text-[#A8B8D0]">{wd.wallet.slice(0, 6)}...{wd.wallet.slice(-4)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-[#A8B8D0]" />
                      <span className="text-xs text-[#A8B8D0]">{formatDate(wd.timestamp)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {statusBadge(wd.status)}
                  </TableCell>
                  <TableCell>
                    {wd.txHash ? (
                      <a href={`https://bscscan.com/tx/${wd.txHash}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00E5FF] hover:underline">
                        <span className="text-xs font-mono">{wd.txHash.slice(0, 8)}...</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-[#A8B8D0]">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawalHistory.length === 0 && (
                <TableRow>
                  <td colSpan={5} className="text-center text-[#A8B8D0] py-8">
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
