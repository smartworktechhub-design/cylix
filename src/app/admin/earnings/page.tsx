'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { Search, DollarSign, TrendingUp, Plus, RotateCcw, Loader2 } from 'lucide-react';

interface EarningsStats {
  totalEarnings: number;
  todayEarnings: number;
  transactionCount: number;
}

interface AuditEntry {
  id: string;
  user: string;
  amount: number;
  type: string;
  date: string;
  description: string;
}

export default function AdminEarnings() {
  useEffect(() => { document.title = 'Earnings — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EarningsStats>({ totalEarnings: 0, todayEarnings: 0, transactionCount: 0 });
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [adjustmentUser, setAdjustmentUser] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('bonus');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  useEffect(() => {
    fetchEarningsData();
  }, []);

  async function fetchEarningsData() {
    setLoading(true);
    try {
      const supabase = getSupabase();

      const { data: allEarnings } = await supabase
        .from('earnings')
        .select('amount');

      const totalEarnings = (allEarnings || []).reduce(
        (sum: number, e: any) => sum + Number(e.amount || 0),
        0
      );

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayIso = todayStart.toISOString();

      const { data: todayEarningsData } = await supabase
        .from('earnings')
        .select('amount')
        .gte('created_at', todayIso);

      const todayEarnings = (todayEarningsData || []).reduce(
        (sum: number, e: any) => sum + Number(e.amount || 0),
        0
      );

      const { count: transactionCount } = await supabase
        .from('transactions')
        .select('id', { count: 'exact', head: true });

      const { data: recentTx } = await supabase
        .from('transactions')
        .select('id, type, amount, description, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data: walletMap } = await supabase
        .from('users')
        .select('id, wallet');

      const walletLookup: Record<string, string> = {};
      (walletMap || []).forEach((u: any) => {
        walletLookup[u.id] = u.wallet;
      });

      const entries: AuditEntry[] = (recentTx || []).map((t: any) => ({
        id: t.id,
        user: walletLookup[t.user_id] ? shortenAddress(walletLookup[t.user_id]) : shortenAddress(t.user_id),
        amount: Number(t.amount),
        type: t.type,
        date: t.created_at,
        description: t.description || '',
      }));

      setStats({ totalEarnings, todayEarnings, transactionCount: transactionCount || 0 });
      setAuditLog(entries);
    } catch (err) {
      console.error('Failed to fetch earnings data:', err);
    } finally {
      setLoading(false);
    }
  }

  const getBadgeVariant = (type: string) => {
    if (type === 'bonus' || type === 'pool_earning' || type === 'daily_earning' || type === 'matrix_earning') return 'success';
    if (type === 'deduction' || type === 'withdraw') return 'danger';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Earnings Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Adjust user earnings and view audit trail</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-[#00E5FF] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading earnings data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <DollarSign size={20} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Total Earnings Distributed</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                  <TrendingUp size={20} className="text-[#00FFB2]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Today&apos;s Earnings</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(stats.todayEarnings)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                  <RotateCcw size={20} className="text-[#7B61FF]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Total Transactions</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(stats.transactionCount).replace('.00', '')}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-white font-semibold font-heading">Adjust Earnings</h3>
                <p className="text-[#94A3B8] text-sm">Add or deduct earnings for a user</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="User Wallet"
                    placeholder="0x..."
                    value={adjustmentUser}
                    onChange={(e) => setAdjustmentUser(e.target.value)}
                  />
                  <Input
                    label="Amount (USD)"
                    placeholder="0.00"
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                  />
                  <Select
                    label="Type"
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value)}
                    options={[
                      { value: 'bonus', label: 'Bonus' },
                      { value: 'deduction', label: 'Deduction' },
                      { value: 'adjustment', label: 'Adjustment' },
                      { value: 'commission', label: 'Commission' },
                    ]}
                  />
                  <Input
                    label="Reason"
                    placeholder="Enter reason for adjustment"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                  />
                  <Button className="w-full">
                    <Plus size={16} />
                    Apply Adjustment
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-white font-semibold font-heading">Audit Log</h3>
                <p className="text-[#94A3B8] text-sm">Recent earnings transactions</p>
              </CardHeader>
              <CardContent>
                {auditLog.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#94A3B8] text-sm">No transactions yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>User</TableHeader>
                        <TableHeader>Amount</TableHeader>
                        <TableHeader>Type</TableHeader>
                        <TableHeader>Date</TableHeader>
                        <TableHeader>Description</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {auditLog.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-xs text-[#00E5FF]">{entry.user}</TableCell>
                          <TableCell className={`font-mono ${entry.amount >= 0 ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                            {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getBadgeVariant(entry.type)}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#94A3B8] text-xs">{formatDate(entry.date)}</TableCell>
                          <TableCell className="text-xs text-[#94A3B8] max-w-[140px] truncate">{entry.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
