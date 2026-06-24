'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, shortenAddress, formatDate } from '@/lib/utils';
import { getUserByWallet, getReferrals } from '@/lib/db';
import {
  Users, Copy, Check, Link, DollarSign, TrendingUp,
  Layers, ChevronRight, UserPlus, Loader2
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const commissionTiers = [
  { level: 'Level 1', commission: '5%', requirement: 'Direct Referrals' },
  { level: 'Level 2', commission: '3%', requirement: 'Team Members' },
  { level: 'Level 3', commission: '2%', requirement: 'Downline' },
  { level: 'Level 4', commission: '1%', requirement: 'Extended Network' },
];

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ referralCode: string } | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    async function load() {
      const user = await getUserByWallet(DEMO_WALLET);
      if (user) {
        setUserData({ referralCode: user.referralCode });
        const refs = await getReferrals(user.id);
        setReferrals(refs);
      }
      setLoading(false);
    }
    load();
  }, []);

  const referralCode = userData?.referralCode || 'LOADING...';
  const referralLink = `https://cylix.io/ref/${referralCode}`;

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

  if (loading) {
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {commissionTiers.map((tier) => (
                <div key={tier.level} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                      <Layers size={14} className="text-[#7B61FF]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tier.level}</p>
                      <p className="text-xs text-[#94A3B8]">{tier.requirement}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold font-mono text-[#00FFB2]">{tier.commission}</span>
                </div>
              ))}
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
                    <span className="text-[#94A3B8] text-sm">{formatDate(ref.joined)}</span>
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
