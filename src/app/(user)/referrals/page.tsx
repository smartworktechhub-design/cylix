'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, shortenAddress, formatDate } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { useAccount } from 'wagmi';
import {
  Users, Copy, Check, Link, DollarSign, TrendingUp,
  UserPlus, Loader2
} from 'lucide-react';
import { MATRIX_LEVELS } from '@/lib/constants';

const commissionTiers = MATRIX_LEVELS.map((ml) => ({
  level: `Level ${ml.level}`,
  commission: `${ml.percent}%`,
  requirement: ml.directsRequired > 0 ? `${ml.directsRequired}+ Direct Referrals` : 'No Minimum',
}));

export default function ReferralsPage() {
  useEffect(() => { document.title = 'Referrals — CYLIX'; }, []);
  const { user, referrals: storeReferrals } = useAppStore();
  const { loading: initLoading } = useInitData();
  const { address } = useAccount();
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  const referrals = user && storeReferrals.length > 0 ? storeReferrals : [];

  const referralCode = user?.referralCode || (address ? 'CXL' + address.slice(2, 6).toUpperCase() : '');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://cylix.io';
  const referralLink = `${origin}/?ref=${referralCode}`;

  const totalEarnings = referrals.reduce((s, r) => s + r.earnings, 0);
  const activeReferrals = referrals.filter((r) => r.earnings > 0).length;

  const stats = [
    { label: 'Total Referrals', value: referrals.length, icon: Users, color: '#00E5FF' },
    { label: 'Active Referrals', value: activeReferrals, icon: UserPlus, color: '#00FFB2' },
    { label: 'Referral Earnings', value: totalEarnings, icon: DollarSign, color: '#7B61FF' },
    { label: 'Conversion Rate', value: referrals.length > 0 ? `${Math.round((activeReferrals / referrals.length) * 100)}%` : '0%', icon: TrendingUp, color: '#FFB800' },
  ];

  const handleCopy = (type: 'code' | 'link') => {
    navigator.clipboard.writeText(type === 'code' ? referralCode : referralLink);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (initLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Referrals</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Invite others and earn commissions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.08)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <Link size={18} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-xs text-[#94A3B8]">Referral Code</p>
                  <p className="text-lg font-mono font-bold text-white tracking-wider">{referralCode}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleCopy('code')}>
                {copied === 'code' ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                {copied === 'code' ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div>
              <p className="text-xs text-[#94A3B8] mb-2">Referral Link</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.08)]">
                <p className="flex-1 text-sm text-[#94A3B8] font-mono truncate">{referralLink}</p>
                <Button variant="ghost" size="sm" onClick={() => handleCopy('link')}>
                  {copied === 'link' ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Commission Structure</h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              40% of all purchases distributed across 11 binary matrix levels
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commissionTiers.map((tier) => {
                const ml = MATRIX_LEVELS.find((m) => `Level ${m.level}` === tier.level)!;
                const hue = ml.level <= 3 ? 187 : ml.level <= 7 ? 260 : 38;
                return (
                  <div key={tier.level} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${hue}, 100%, 60%)` }} />
                      <div>
                        <p className="text-sm font-medium text-white">{tier.level}</p>
                        <p className="text-xs text-[#94A3B8]">{tier.requirement}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold font-mono text-[#00FFB2]">{tier.commission}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)]">
              <p className="text-xs text-[#94A3B8]">
                Funds split: <span className="text-[#00E5FF]">50% Yield Reserve</span> &bull;
                <span className="text-[#7B61FF]"> 40% Matrix Commissions</span> &bull;
                <span className="text-[#FFB800]"> 10% Apex Pool</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
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
                  {typeof stat.value === 'number' && stat.label === 'Referral Earnings' ? formatCurrency(stat.value) : stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Referral Team</h3>
            <Users size={16} className="text-[#94A3B8]" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Level</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader>Earnings</TableHeader>
                <TableHeader>Team Size</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrals.map((ref) => (
                <TableRow key={ref.wallet}>
                  <TableCell>
                    <span className="font-mono text-sm">{shortenAddress(ref.wallet)}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="primary">Lvl {ref.level}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-sm">{formatDate(ref.joinedAt)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-[#00FFB2]">{formatCurrency(ref.earnings)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{ref.teamSize}</span>
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
