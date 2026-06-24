'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, shortenAddress, formatDate, cn } from '@/lib/utils';
import { getAdminStats } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, Users, Wallet, Gift, Package, UserPlus, Clock, ArrowUpRight, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const stats = await getAdminStats();
      setAdminStats(stats);

      const { data: users } = await getSupabase().from('users').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentUsers((users || []).map((u: any) => ({
        wallet: u.wallet,
        package: u.rank || 'N/A',
        invested: Number(u.total_invested),
        joined: u.created_at,
        status: u.is_active ? 'active' as const : 'inactive' as const,
      })));

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Users', value: adminStats?.totalUsers || 0, change: `+${adminStats?.growthRate || 0}%`, icon: Users, trend: 'up' },
    { label: 'Revenue', value: adminStats?.totalRevenue || 0, change: '+12.5%', icon: Wallet, trend: 'up', isCurrency: true },
    { label: 'Withdrawals', value: adminStats?.totalWithdrawals || 0, change: '+5.2%', icon: Gift, trend: 'up', isCurrency: true },
    { label: 'Active Packages', value: adminStats?.activePackages || 0, change: '+3.1%', icon: Package, trend: 'up' },
    { label: 'New Users Today', value: adminStats?.newUsersToday || 0, change: '+18.7%', icon: UserPlus, trend: 'up' },
    { label: 'Pending Withdrawals', value: adminStats?.pendingWithdrawals || 0, change: '-2.4%', icon: Clock, trend: 'down' },
  ];

  const revenueData = [34, 45, 38, 52, 48, 55, 62, 58, 65, 70, 68, 75];

  const packageDistribution = [
    { name: 'Basic', count: 823, percentage: 44 },
    { name: 'Starter', count: 512, percentage: 28 },
    { name: 'Premium', count: 356, percentage: 19 },
    { name: 'Elite', count: 156, percentage: 9 },
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
                <stat.icon size={20} className="text-[#00E5FF]" />
              </div>
              <Badge variant={stat.trend === 'up' ? 'success' : 'danger'} className="text-xs">
                {stat.trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {stat.change}
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
                <p className="text-[#94A3B8] text-sm">Monthly revenue performance</p>
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
            <h3 className="text-white font-semibold font-heading">Package Distribution</h3>
            <p className="text-[#94A3B8] text-sm">Active investment packages</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {packageDistribution.map((pkg) => (
              <div key={pkg.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-white">{pkg.name}</span>
                  <span className="text-xs text-[#94A3B8] font-mono">{formatNumber(pkg.count)}</span>
                </div>
                <div className="h-2 rounded-full bg-[rgba(148,163,184,0.1)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] transition-all duration-700"
                    style={{ width: `${pkg.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-[rgba(0,229,255,0.08)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#94A3B8]">Total Active</span>
                <span className="text-white font-mono font-semibold">{formatNumber(1847)}</span>
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
                <TableHeader>Package</TableHeader>
                <TableHeader>Invested</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUsers.map((user) => (
                <TableRow key={user.wallet}>
                  <TableCell className="font-mono text-[#00E5FF]">{shortenAddress(user.wallet)}</TableCell>
                  <TableCell>{user.package}</TableCell>
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
