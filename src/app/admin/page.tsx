'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, shortenAddress, formatDate } from '@/lib/utils';
import { getAdminStats } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import { TrendingUp, Users, Wallet, Package, Clock, Database, Box, ArrowUpRight, Loader2 } from 'lucide-react';
import type { AdminStats } from '@/types';

interface RecentUser {
  wallet: string;
  invested: number;
  joined: string;
  status: 'active' | 'inactive';
  referral: string;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  isCurrency?: boolean;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const stats = await getAdminStats();
      if (!mounted) return;
      setAdminStats(stats);

      const { data: users } = await getSupabase().from('users').select('*').order('created_at', { ascending: false }).limit(5);
      if (!mounted) return;
      setRecentUsers((users || []).map((u: Record<string, unknown>) => ({
        wallet: String(u.wallet || ''),
        invested: Number(u.total_invested || 0),
        joined: String(u.created_at || ''),
        status: u.is_active ? 'active' as const : 'inactive' as const,
        referral: String(u.referral_code || ''),
      })));

      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const stats: StatCard[] = [
    { label: 'Total Users', value: adminStats?.totalUsers || 0, icon: Users, color: '#00E5FF' },
    { label: 'Total Revenue', value: adminStats?.totalRevenue || 0, icon: Wallet, color: '#00FFB2', isCurrency: true },
    { label: 'Active Slots', value: adminStats?.activeSlots || 0, icon: Package, color: '#7B61FF' },
    { label: 'Pending Withdrawals', value: adminStats?.pendingWithdrawals || 0, icon: Clock, color: '#FFB800' },
    { label: 'Apex Pool Fund', value: adminStats?.poolFund || 0, icon: Database, color: '#00E5FF', isCurrency: true },
    { label: 'Total Blocks', value: adminStats?.totalBlocks || 0, icon: Box, color: '#FF5C7A' },
  ];

  const revenueData = [34, 45, 38, 52, 48, 55, 62, 58, 65, 70, 68, 75];

  const slotDistribution = [
    { name: 'Orbit 1-4', count: 823, percentage: 44 },
    { name: 'Orbit 5-7', count: 512, percentage: 28 },
    { name: 'Orbit 8-10', count: 356, percentage: 19 },
    { name: 'Orbit 11', count: 156, percentage: 9 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Dashboard</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <Badge variant="success" className="text-xs flex items-center gap-1">
                <TrendingUp size={12} />
                Active
              </Badge>
            </div>
            <p className="text-[#94A3B8] text-xs mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-white font-mono">
              {stat.isCurrency ? formatCurrency(stat.value) : formatNumber(stat.value)}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold font-heading">Revenue Trend</h3>
                <p className="text-[#94A3B8] text-sm">Monthly slot revenue performance</p>
              </div>
              <Badge variant="success" className="flex items-center gap-1">
                <ArrowUpRight size={12} />
                +12.3%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {revenueData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] text-[#94A3B8] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCurrency(val * 10000)}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300 group-hover:opacity-80"
                    style={{
                      height: `${val}%`,
                      background: val > 60
                        ? 'linear-gradient(180deg, #00E5FF 0%, #7B61FF 100%)'
                        : 'linear-gradient(180deg, rgba(0,229,255,0.3) 0%, rgba(123,97,255,0.3) 100%)',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <span key={m} className="text-[10px] text-[#94A3B8]">{m}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Slot Distribution</h3>
            <p className="text-[#94A3B8] text-sm">Active slots by orbit tier</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {slotDistribution.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white">{s.name}</span>
                  <span className="text-xs text-[#94A3B8] font-mono">{formatNumber(s.count)}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(148,163,184,0.1)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] transition-all duration-700"
                    style={{ width: `${s.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[rgba(0,229,255,0.08)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94A3B8]">Total Active</span>
                <span className="text-white font-mono font-semibold">{formatNumber(adminStats?.activeSlots || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">Recent Users</h3>
          <p className="text-[#94A3B8] text-sm">Latest registered users</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Referral Code</TableHeader>
                <TableHeader>Invested</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.wallet}>
                  <TableCell className="font-mono text-[#00E5FF]">{shortenAddress(user.wallet)}</TableCell>
                  <TableCell className="font-mono text-xs text-[#7B61FF]">{user.referral}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(user.invested)}</TableCell>
                  <TableCell className="text-[#94A3B8]">{formatDate(user.joined)}</TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
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
