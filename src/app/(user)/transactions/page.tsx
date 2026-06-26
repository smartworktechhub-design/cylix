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
  Clock, Filter, TrendingUp, Loader2
} from 'lucide-react';

const tabs = ['All', 'Purchases', 'Withdrawals', 'Earnings'];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
  processing: 'info',
};

const typeConfig: Record<string, { icon: typeof ArrowUpRight; color: string; label: string }> = {
  purchase: { icon: ArrowUpRight, color: '#00E5FF', label: 'Purchase' },
  withdrawal: { icon: ArrowDownRight, color: '#FF5C7A', label: 'Withdrawal' },
  withdraw: { icon: ArrowDownRight, color: '#FF5C7A', label: 'Withdrawal' },
  earnings: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  daily: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  referral: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  matrix: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  pool: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  upgrade: { icon: ArrowUpRight, color: '#7B61FF', label: 'Upgrade' },
};

export default function TransactionsPage() {
  const { user } = useAppStore();
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState('All');
  const [transactions, setTransactions] = useState<any[]>([]);
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
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filtered = activeTab === 'All'
    ? transactions
    : transactions.filter((t) => {
        const typeMap: Record<string, string> = { Purchases: 'purchase', Withdrawals: 'withdrawal', Earnings: 'earnings' };
        const target = typeMap[activeTab];
        return t.type === target || (target === 'earnings' && ['earnings', 'daily', 'referral', 'matrix', 'pool'].includes(t.type));
      });

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
        <p className="text-sm text-[#94A3B8] mt-1">View all your platform transactions and history</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-white">
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
            <Filter size={16} className="text-[#94A3B8]" />
          </div>
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
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
                const config = typeConfig[tx.type] || typeConfig.purchase;
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
                      <span className="text-[#94A3B8] text-sm">{formatDate(tx.timestamp)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[#94A3B8] text-sm">{tx.description}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
