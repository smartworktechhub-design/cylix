'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatDate, shortenAddress } from '@/lib/utils';
import { Search, Users, DollarSign, TrendingUp, UserPlus, Award } from 'lucide-react';

const referralData = [
  { referrer: '0x1a2b...3c4d', referred: '0x5e6f...7g8h', level: 1, earnings: 500, date: '2026-06-22T10:30:00' },
  { referrer: '0x1a2b...3c4d', referred: '0x9i0j...1k2l', level: 1, earnings: 250, date: '2026-06-21T14:45:00' },
  { referrer: '0x3m4n...5o6p', referred: '0x7q8r...9s0t', level: 2, earnings: 100, date: '2026-06-20T16:00:00' },
  { referrer: '0xa1b2...c3d4', referred: '0xk1l2...m3n4', level: 1, earnings: 750, date: '2026-06-19T10:00:00' },
  { referrer: '0x3m4n...5o6p', referred: '0xu1v2...w3x4', level: 2, earnings: 150, date: '2026-06-18T07:45:00' },
  { referrer: '0x1a2b...3c4d', referred: '0xy5z6...a7b8', level: 1, earnings: 300, date: '2026-06-17T12:30:00' },
];

const topReferrers = [
  { wallet: '0x1a2b...3c4d', count: 12, totalEarnings: 5200 },
  { wallet: '0x3m4n...5o6p', count: 8, totalEarnings: 3400 },
  { wallet: '0xa1b2...c3d4', count: 6, totalEarnings: 2100 },
  { wallet: '0x7q8r...9s0t', count: 4, totalEarnings: 1200 },
  { wallet: '0xk1l2...m3n4', count: 3, totalEarnings: 800 },
];

export default function AdminReferrals() {
  const [search, setSearch] = useState('');

  const filtered = referralData.filter(
    (r) => r.referrer.toLowerCase().includes(search.toLowerCase()) ||
          r.referred.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Referral Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Track referrals and team performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Users size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Referrals</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(2847)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Commission Paid</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(485000)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
              <UserPlus size={20} className="text-[#7B61FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Active Referrers</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(624)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <TrendingUp size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Avg Commission</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(170)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by wallet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Referrer</TableHeader>
                  <TableHeader>Referred User</TableHeader>
                  <TableHeader>Level</TableHeader>
                  <TableHeader>Earnings</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((ref, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{ref.referrer}</TableCell>
                    <TableCell className="font-mono text-xs">{ref.referred}</TableCell>
                    <TableCell>
                      <Badge variant="info">L{ref.level}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-[#00FFB2]">{formatCurrency(ref.earnings)}</TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(ref.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award size={16} className="text-[#FFB800]" />
              <h3 className="text-white font-semibold font-heading">Top Referrers</h3>
            </div>
            <p className="text-[#94A3B8] text-sm">Highest earning referrers</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReferrers.map((ref, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(0,229,255,0.03)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-[rgba(255,184,0,0.2)] text-[#FFB800]' :
                      i === 1 ? 'bg-[rgba(148,163,184,0.2)] text-[#94A3B8]' :
                      i === 2 ? 'bg-[rgba(123,97,255,0.2)] text-[#7B61FF]' :
                      'bg-[rgba(148,163,184,0.1)] text-[#94A3B8]'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm text-white font-mono text-xs">{ref.wallet}</p>
                      <p className="text-xs text-[#94A3B8]">{ref.count} referrals</p>
                    </div>
                  </div>
                  <span className="text-sm font-mono text-[#00FFB2]">{formatCurrency(ref.totalEarnings)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
