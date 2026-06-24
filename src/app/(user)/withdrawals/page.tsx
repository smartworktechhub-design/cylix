'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, getStatusColor, getStatusBg } from '@/lib/utils';
import { getUserByWallet, getWithdrawals, getUserEarnings } from '@/lib/db';
import { useWeb3Store } from '@/stores/web3-store';
import {
  Wallet, Clock, Shield, Info, ArrowUpRight, CheckCircle2,
  XCircle, AlertCircle, Copy, ExternalLink, DollarSign, Banknote, Loader2
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const minWithdrawal = 50;
const maxWithdrawal = 5000;
const processingTime = '24-48 hours';

export default function WithdrawalsPage() {
  const { address } = useWeb3Store();
  const [amount, setAmount] = useState('');
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const [withdrawals, earnings] = await Promise.all([
            getWithdrawals(user.id),
            getUserEarnings(user.id),
          ]);
          setWithdrawalHistory(withdrawals);
          setAvailableBalance(earnings.total);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const walletDisplay = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x1a2...b3c4';

  if (loading) {
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
                <p className="text-xs text-[#94A3B8] mb-1">Min / Max</p>
                <p className="text-xl font-bold font-mono text-white">
                  {formatCurrency(minWithdrawal)} / {formatCurrency(maxWithdrawal)}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#94A3B8]">Withdrawal Wallet</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
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
                onChange={(e) => setAmount(e.target.value)}
                icon={<DollarSign size={16} />}
                type="number"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#94A3B8]">Processing time: {processingTime}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#94A3B8]">Max:</span>
                  <button
                    className="text-xs font-mono text-[#00E5FF] hover:underline"
                    onClick={() => setAmount(String(Math.min(availableBalance, maxWithdrawal)))}
                  >
                    {formatCurrency(Math.min(availableBalance, maxWithdrawal))}
                  </button>
                </div>
              </div>
            </div>

            <Button variant="primary" className="w-full" disabled={!amount || Number(amount) < minWithdrawal || Number(amount) > maxWithdrawal || Number(amount) > availableBalance}>
              <Wallet size={16} />
              Request Withdrawal
            </Button>

            {(Number(amount) > 0 && Number(amount) < minWithdrawal) && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,92,122,0.08)] border border-[rgba(255,92,122,0.15)]">
                <AlertCircle size={14} className="text-[#FF5C7A]" />
                <span className="text-xs text-[#FF5C7A]">Minimum withdrawal is {formatCurrency(minWithdrawal)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-[#7B61FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Requirements</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { icon: DollarSign, label: 'Minimum Withdrawal', value: formatCurrency(minWithdrawal), color: '#00E5FF' },
                { icon: Banknote, label: 'Maximum Withdrawal', value: formatCurrency(maxWithdrawal), color: '#7B61FF' },
                { icon: Clock, label: 'Processing Time', value: processingTime, color: '#FFB800' },
                { icon: CheckCircle2, label: 'Network Fee', value: 'Covered by platform', color: '#00FFB2' },
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
                <h3 className="text-lg font-semibold text-white font-heading">Important Notes</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                'Withdrawals are processed within 24-48 hours on business days.',
                'Minimum withdrawal amount is 50 USDT.',
                'Maximum withdrawal per transaction is 5000 USDT.',
                'Withdrawals are sent to your connected wallet address.',
                'Network fees are covered by the platform for all withdrawals.',
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
                <TableHeader>Processed</TableHeader>
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
                    <span className="text-sm font-mono text-[#94A3B8]">{wd.wallet}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-[#94A3B8]" />
                      <span className="text-xs text-[#94A3B8]">{formatDate(wd.timestamp)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {wd.processedAt ? (
                      <div className="flex items-center gap-1.5">
                        <Clock size={11} className="text-[#94A3B8]" />
                        <span className="text-xs text-[#94A3B8]">{formatDate(wd.processedAt)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">--</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        wd.status === 'completed' ? 'success' :
                        wd.status === 'processing' ? 'info' :
                        wd.status === 'pending' ? 'warning' : 'danger'
                      }
                      className="text-xs"
                    >
                      {wd.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {wd.txHash ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono text-[#94A3B8]">{wd.txHash}</span>
                        <ExternalLink size={10} className="text-[#00E5FF] cursor-pointer" />
                      </div>
                    ) : (
                      <span className="text-xs text-[#94A3B8]">--</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
