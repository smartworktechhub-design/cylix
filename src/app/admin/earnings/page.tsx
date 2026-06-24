'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { Search, DollarSign, TrendingUp, Plus, RotateCcw } from 'lucide-react';

const auditLog = [
  { user: '0x1a2b...3c4d', amount: 500, type: 'bonus', date: '2026-06-22T10:30:00', admin: 'admin@cylix.io', reason: 'Performance bonus' },
  { user: '0x5e6f...7g8h', amount: -200, type: 'adjustment', date: '2026-06-21T15:20:00', admin: 'admin@cylix.io', reason: 'Overpayment correction' },
  { user: '0x9i0j...1k2l', amount: 1000, type: 'bonus', date: '2026-06-20T09:00:00', admin: 'admin@cylix.io', reason: 'Referral bonus' },
  { user: '0x3m4n...5o6p', amount: -150, type: 'deduction', date: '2026-06-19T14:30:00', admin: 'admin@cylix.io', reason: 'Penalty fee' },
  { user: '0x7q8r...9s0t', amount: 300, type: 'bonus', date: '2026-06-18T11:45:00', admin: 'admin@cylix.io', reason: 'Level up reward' },
];

export default function AdminEarnings() {
  const [adjustmentUser, setAdjustmentUser] = useState('');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('bonus');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Earnings Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Adjust user earnings and view audit trail</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Earnings Distributed</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(2845000)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <TrendingUp size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">This Month</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(342000)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
              <RotateCcw size={20} className="text-[#7B61FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Adjustments Today</p>
              <p className="text-white font-bold font-mono text-lg">12</p>
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
            <p className="text-[#94A3B8] text-sm">Recent earnings adjustments</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>User</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Admin</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditLog.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{entry.user}</TableCell>
                    <TableCell className={`font-mono ${entry.amount > 0 ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}`}>
                      {entry.amount > 0 ? '+' : ''}{formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.type === 'bonus' ? 'success' : entry.type === 'deduction' ? 'danger' : 'warning'}>
                        {entry.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(entry.date)}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{entry.admin}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
