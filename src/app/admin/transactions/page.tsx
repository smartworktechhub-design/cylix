'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { ArrowLeftRight, Download, ShoppingCart, TrendingUp, Gift, Wallet, RefreshCw, ArrowUpRight, Users, Sparkles, Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';

type FilterType = 'all' | 'purchases' | 'earnings' | 'withdrawals' | 'referrals' | 'system';

interface TxRow {
  id: string;
  userWallet: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  description: string;
}

interface FilterDef {
  key: FilterType;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

interface TypeStyle {
  label: string;
  color: string;
  icon: ComponentType<{ size?: number; style?: React.CSSProperties }>;
}

const filters: FilterDef[] = [
  { key: 'all', label: 'All', icon: ArrowLeftRight },
  { key: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { key: 'earnings', label: 'Earnings', icon: TrendingUp },
  { key: 'withdrawals', label: 'Withdrawals', icon: Wallet },
  { key: 'referrals', label: 'Referrals', icon: Users },
  { key: 'system', label: 'System', icon: Sparkles },
];

const typeConfig: Record<string, TypeStyle> = {
  slot_purchase: { label: 'Slot Purchase', color: '#00E5FF', icon: ShoppingCart },
  daily_earning: { label: 'Daily Earning', color: '#00FFB2', icon: TrendingUp },
  matrix_earning: { label: 'Matrix Earning', color: '#7B61FF', icon: Users },
  pool_earning: { label: 'Pool Earning', color: '#FFB800', icon: Gift },
  ascension_credit: { label: 'Ascension Credit', color: '#00E5FF', icon: Sparkles },
  upgrade: { label: 'Upgrade', color: '#7B61FF', icon: ArrowUpRight },
  recycle: { label: 'Recycle', color: '#FF5C7A', icon: RefreshCw },
  withdraw: { label: 'Withdraw', color: '#FF5C7A', icon: Wallet },
  referral: { label: 'Referral Bonus', color: '#00FFB2', icon: Users },
};

function matchesFilter(type: string, filter: FilterType): boolean {
  if (filter === 'all') return true;
  if (filter === 'purchases') return type === 'slot_purchase';
  if (filter === 'earnings') return ['daily_earning', 'matrix_earning', 'pool_earning'].includes(type);
  if (filter === 'withdrawals') return type === 'withdraw';
  if (filter === 'referrals') return type === 'referral';
  if (filter === 'system') return ['ascension_credit', 'upgrade', 'recycle'].includes(type);
  return true;
}

export default function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [transactions, setTransactions] = useState<TxRow[]>([]);

  useEffect(() => {
    let mounted = true;
    getSupabase()
      .from('transactions')
      .select('*, users!inner(wallet)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        setTransactions((data || []).map((tx: Record<string, unknown>) => {
          const users = tx.users as Record<string, unknown> | undefined;
          return {
            id: String(tx.id || ''),
            userWallet: String(users?.wallet || ''),
            type: String(tx.type || ''),
            amount: Number(tx.amount || 0),
            status: String(tx.status || ''),
            date: String(tx.created_at || ''),
            description: String(tx.description || ''),
          };
        }));
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const filtered = transactions.filter((tx) => matchesFilter(tx.type, filter));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Transactions</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Complete transaction log</p>
        </div>
        <Button variant="outline">
          <Download size={16} />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(11,16,32,0.8)] overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                    filter === f.key
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  <f.icon size={14} />
                  {f.label}
                </button>
              ))}
            </div>
            <span className="text-[#94A3B8] text-sm">{filtered.length} transactions</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>User</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Description</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((tx) => {
                const config = typeConfig[tx.type] || { label: tx.type, color: '#94A3B8', icon: ArrowLeftRight };
                const Icon = config.icon;
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{shortenAddress(tx.userWallet, 6)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Icon size={14} style={{ color: config.color }} />
                        <span style={{ color: config.color }} className="text-xs font-medium">
                          {config.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tx.status === 'completed' ? 'success' :
                          tx.status === 'pending' ? 'warning' : 'danger'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(tx.date)}</TableCell>
                    <TableCell className="text-[#94A3B8] text-xs max-w-[200px] truncate">{tx.description}</TableCell>
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
