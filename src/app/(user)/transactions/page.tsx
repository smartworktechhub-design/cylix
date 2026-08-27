'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { getTransactions } from '@/lib/db';
import { useAccount } from 'wagmi';
import {
  ArrowUpRight, ArrowDownRight, RefreshCw, DollarSign,
  Clock, Filter, TrendingUp, Loader2, Coins
} from 'lucide-react';

const tabs = ['All', 'Purchases', 'Withdrawals', 'Earnings', 'CXL'];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  processing: 'info',
};

const typeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; label: string }> = {
  slot_purchase: { icon: ArrowUpRight, color: '#00E5FF', label: 'Purchase' },
  upgrade: { icon: ArrowUpRight, color: '#7B61FF', label: 'Upgrade' },
  recycle: { icon: ArrowUpRight, color: '#00E5FF', label: 'Re-cycle' },
  withdraw: { icon: ArrowDownRight, color: '#FF5C7A', label: 'Withdrawal' },
  withdrawal: { icon: ArrowDownRight, color: '#FF5C7A', label: 'Withdrawal' },
  daily_earning: { icon: TrendingUp, color: '#00FFB2', label: 'Daily Yield' },
  matrix_earning: { icon: TrendingUp, color: '#7B61FF', label: 'Matrix' },
  pool_earning: { icon: TrendingUp, color: '#FFB800', label: 'Apex Pool' },
  referral: { icon: TrendingUp, color: '#00E5FF', label: 'Referral' },
  ascension_credit: { icon: TrendingUp, color: '#7B61FF', label: 'Ascension' },
  presale_purchase: { icon: Coins, color: '#FFB800', label: 'Presale' },
};

const levelColors: Record<string, string> = {
  L1: '#00E5FF',
  L2: '#7B61FF',
  L3: '#00FFB2',
  L4: '#FFB800',
  L5: '#FF5C7A',
};

export default function TransactionsPage() {
  useEffect(() => { document.title = 'Transactions — CYLIX'; }, []);
  const { user } = useAppStore();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cxlEarnings, setCxlEarnings] = useState<any[]>([]);
  const [cxlBalance, setCxlBalance] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState([
    { label: 'Total Transactions', value: 0, icon: RefreshCw, color: '#00E5FF' },
    { label: 'Total Volume', value: 0, icon: DollarSign, color: '#7B61FF' },
    { label: 'Pending', value: 0, icon: Clock, color: '#FFB800' },
    { label: 'Success Rate', value: '0%', icon: TrendingUp, color: '#00FFB2' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (!user) return;
        const txs = await getTransactions(user.id);
        setTransactions(txs);
        const totalVolume = txs.reduce((s, t) => s + t.amount, 0);
        const pending = txs.filter((t) => t.status === 'pending').length;
        const completed = txs.filter((t) => t.status === 'completed').length;
        const successRate = txs.length > 0 ? Math.round((completed / txs.length) * 100) + '%' : '0%';
        setSummaryStats([
          { label: 'Total Transactions', value: txs.length, icon: RefreshCw, color: '#00E5FF' },
          { label: 'Total Volume', value: totalVolume, icon: DollarSign, color: '#7B61FF' },
          { label: 'Pending', value: pending, icon: Clock, color: '#FFB800' },
          { label: 'Success Rate', value: successRate, icon: TrendingUp, color: '#00FFB2' },
        ]);

        // Load CXL airdrop earnings
        const [earningsRes, balanceRes] = await Promise.all([
          fetch(`/api/airdrop/levels?userId=${user.id}`).then(r => r.json()).catch(() => null),
          fetch(`/api/airdrop/stats?userId=${user.id}`).then(r => r.json()).catch(() => null),
        ]);
        if (earningsRes?.levels) {
          setCxlEarnings(earningsRes.levels);
        }
        if (balanceRes?.balance) {
          setCxlBalance(balanceRes.balance);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = activeTab === 'All'
    ? transactions
    : activeTab === 'CXL'
      ? []
      : transactions.filter((t) => {
          const typeMap: Record<string, string[]> = {
            Purchases: ['slot_purchase', 'upgrade', 'recycle', 'presale_purchase'],
            Withdrawals: ['withdraw', 'withdrawal'],
            Earnings: ['daily_earning', 'matrix_earning', 'pool_earning', 'referral', 'ascension_credit'],
          };
          const targets = typeMap[activeTab] || [];
          return targets.includes(t.type);
        });

  const formatCxl = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });

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
        <h2 className="text-2xl font-bold font-heading text-white">Transactions</h2>
        <p className="text-sm text-[#A8B8D0] mt-1">View all your platform transactions and history</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#A8B8D0] uppercase tracking-wider">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold font-mono text-white overflow-hidden truncate">
                  {typeof stat.value === 'number' && stat.label !== 'Success Rate' ? formatCurrency(stat.value) : stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Transaction History</h3>
            <Filter size={16} className="text-[#A8B8D0]" />
          </div>
          <div className="flex gap-1 mt-4 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? tab === 'CXL'
                      ? 'bg-[rgba(255,184,0,0.1)] text-[#FFB800]'
                      : 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                    : 'text-[#A8B8D0] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab === 'CXL' && <Coins size={12} className="inline mr-1" />}
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'CXL' ? (
            <div className="space-y-4">
              {/* CXL Balance Summary */}
              {cxlBalance && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                  <div className="rounded-xl p-3 border border-[rgba(255,184,0,0.1)]" style={{ background: 'rgba(255,184,0,0.04)' }}>
                    <p className="text-[10px] text-[#7B8BA5] uppercase">Balance</p>
                    <p className="text-sm font-bold font-mono text-[#FFB800]">{formatCxl(cxlBalance.cxl_balance)}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-[rgba(0,229,255,0.1)]" style={{ background: 'rgba(0,229,255,0.04)' }}>
                    <p className="text-[10px] text-[#7B8BA5] uppercase">Total Earned</p>
                    <p className="text-sm font-bold font-mono text-[#00E5FF]">{formatCxl(cxlBalance.cxl_earned_total)}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-[rgba(0,255,178,0.1)]" style={{ background: 'rgba(0,255,178,0.04)' }}>
                    <p className="text-[10px] text-[#7B8BA5] uppercase">Liquid</p>
                    <p className="text-sm font-bold font-mono text-[#00FFB2]">{formatCxl(cxlBalance.cxl_liquid)}</p>
                  </div>
                  <div className="rounded-xl p-3 border border-[rgba(123,97,255,0.1)]" style={{ background: 'rgba(123,97,255,0.04)' }}>
                    <p className="text-[10px] text-[#7B8BA5] uppercase">Staked</p>
                    <p className="text-sm font-bold font-mono text-[#7B61FF]">{formatCxl(cxlBalance.cxl_staked)}</p>
                  </div>
                </div>
              )}

              {/* Level Earnings */}
              <div>
                <p className="text-xs text-[#7B8BA5] uppercase tracking-wider font-semibold mb-2">Earnings by Level</p>
                <div className="space-y-2">
                  {cxlEarnings.map((level: any) => (
                    <div key={level.level} className="flex items-center justify-between p-3 rounded-xl" style={{ background: `${level.color}08`, border: `1px solid ${level.color}15` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${level.color}15` }}>
                          <span className="text-xs font-bold font-mono" style={{ color: level.color }}>L{level.level}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{level.label}</p>
                          <p className="text-[10px] text-[#7B8BA5]">{level.count} users • {formatCxl(level.rate)} CXL/referral</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold font-mono" style={{ color: level.color }}>+{formatCxl(level.totalEarned)} CXL</p>
                        <p className="text-[10px] text-[#7B8BA5]">{level.unlocked ? 'Unlocked' : 'Locked'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Description</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((tx) => {
                  const config = typeConfig[tx.type] || typeConfig.slot_purchase;
                  const Icon = config.icon;
                  return (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${config.color}15` }}>
                            <Icon size={13} style={{ color: config.color }} />
                          </div>
                          <span className="text-sm">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-mono font-medium ${
                          tx.type === 'earnings' || tx.type === 'daily' || tx.type === 'referral' || tx.type === 'matrix' || tx.type === 'pool' ? 'text-[#00FFB2]' :
                          tx.type === 'withdrawal' || tx.type === 'withdraw' ? 'text-[#FF5C7A]' : 'text-white'
                        }`}>
                          {tx.type === 'earnings' || tx.type === 'daily' || tx.type === 'referral' || tx.type === 'matrix' || tx.type === 'pool' ? '+' : tx.type === 'withdrawal' || tx.type === 'withdraw' ? '-' : ''}{formatCurrency(tx.amount)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[tx.status] || 'default'}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-[#A8B8D0] text-sm">{formatDate(tx.timestamp)}</span>
                      </TableCell>
                      <TableCell>
                        {tx.type === 'matrix_earning' ? (
                          <div className="flex items-center gap-1.5">
                            <Badge variant="info" className="text-xs">
                              {tx.description?.split(' ')[0] || 'L?'}
                            </Badge>
                            <span className="text-[#A8B8D0] text-sm">{tx.description?.replace(/^L\d+\s+from\s+/, '') || ''}</span>
                          </div>
                        ) : (
                          <span className="text-[#A8B8D0] text-sm">{tx.description}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
