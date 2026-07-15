'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Wallet, Clock, Shield, Info, ArrowUpRight,
  AlertCircle, ExternalLink, Loader2, Hourglass, Zap,
  Timer, Lock
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getWithdrawals, getUserEarnings } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';

const WITHDRAWALS_OPEN_AT = new Date('2026-07-17T12:00:00+05:30').getTime();

export default function WithdrawalsPage() {
  useEffect(() => { document.title = 'Withdrawals — CYLIX'; }, []);
  const { user } = useAppStore();
  const { loading: initLoading } = useInitData();
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false });

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

  useEffect(() => {
    function tick() {
      const diff = WITHDRAWALS_OPEN_AT - Date.now();
      if (diff <= 0) { setTimer({ d: 0, h: 0, m: 0, s: 0, expired: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimer({ d, h, m, s, expired: false });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
        <p className="text-sm text-[#94A3B8] mt-1">Request and track your withdrawal transactions</p>
      </div>

      {!timer.expired ? (
        <Card className="border-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(123,97,255,0.08), rgba(0,229,255,0.05))' }}>
          <div className="absolute inset-0 rounded-xl" style={{ border: '1.5px solid rgba(255,184,0,0.2)' }} />
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 rounded-2xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                <Lock size={36} className="text-[#FFB800]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-heading mb-2">Withdrawals Coming Soon</h3>
                <p className="text-sm text-[#94A3B8]">Withdrawals will open shortly. Your earnings are safe and accumulating.</p>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { val: timer.d, label: 'Days' },
                  { val: timer.h, label: 'Hours' },
                  { val: timer.m, label: 'Min' },
                  { val: timer.s, label: 'Sec' },
                ].map((t, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[rgba(255,184,0,0.08)] border border-[rgba(255,184,0,0.15)] flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl font-mono font-bold text-[#FFB800]">
                        {String(t.val).padStart(2, '0')}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A3B8] mt-2 uppercase tracking-wider">{t.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,184,0,0.06)] border border-[rgba(255,184,0,0.1)]">
                <Timer size={12} className="text-[#FFB800]" />
                <span className="text-xs text-[#FFB800]">Withdrawals open automatically when timer reaches zero</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
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
                  <p className="text-xl font-bold font-mono text-white">{formatCurrency(1)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#94A3B8]">Withdrawal Wallet (BEP20)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                    <Wallet size={16} className="text-[#00E5FF]" />
                  </div>
                  <span className="text-sm font-mono text-white">{walletDisplay}</span>
                </div>
              </div>
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
                        <p className="text-xs text-[#94A3B8]">{item.label}</p>
                        <p className="text-sm font-medium text-white">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

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
                      <a href={`https://bscscan.com/tx/${wd.txHash}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#00E5FF] hover:underline">
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
