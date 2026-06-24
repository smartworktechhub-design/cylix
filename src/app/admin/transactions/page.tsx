'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { ArrowLeftRight, Download, Filter, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

type FilterType = 'all' | 'deposits' | 'withdrawals';

const filters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'deposits', label: 'Deposits' },
  { key: 'withdrawals', label: 'Withdrawals' },
];

export default function AdminTransactions() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    getSupabase().from('transactions').select('*, users!inner(wallet)').order('created_at', { ascending: false }).then(({ data }) => {
      setTransactions((data || []).map((tx: any) => ({
        hash: tx.tx_hash ? tx.tx_hash.slice(0, 14) + '...' : 'N/A',
        user: tx.users?.wallet ? tx.users.wallet.slice(0, 10) + '...' : 'Unknown',
        type: tx.type === 'purchase' || tx.type === 'deposit' ? 'deposit' as const : 'withdrawal' as const,
        amount: Number(tx.amount),
        status: tx.status,
        date: tx.created_at,
      })));
      setLoading(false);
    });
  }, []);

  const filtered = transactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'deposits') return tx.type === 'deposit';
    if (filter === 'withdrawals') return tx.type === 'withdrawal';
    return true;
  });

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
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(11,16,32,0.8)]">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    filter === f.key
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {f.key === 'all' && <ArrowLeftRight size={14} />}
                  {f.key === 'deposits' && <ArrowDownLeft size={14} />}
                  {f.key === 'withdrawals' && <ArrowUpRight size={14} />}
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
                <TableHeader>Tx Hash</TableHeader>
                <TableHeader>User</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((tx, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs text-[#00E5FF]">{tx.hash}</TableCell>
                  <TableCell className="font-mono text-xs">{tx.user}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {tx.type === 'deposit' ? (
                        <ArrowDownLeft size={12} className="text-[#00FFB2]" />
                      ) : (
                        <ArrowUpRight size={12} className="text-[#FF5C7A]" />
                      )}
                      <span className={tx.type === 'deposit' ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}>
                        {tx.type}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
