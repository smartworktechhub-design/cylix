'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getUserByWallet, getUserEarnings, getTransactions } from '@/lib/db';
import {
  TrendingUp, Users, Gift, ArrowUpRight, ArrowDownRight,
  Activity, Clock, DollarSign, ChevronRight, Loader2
} from 'lucide-react';
import Link from 'next/link';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function DashboardPage() {
  const { user, earnings } = useAppStore();
  const { loading } = useInitData();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const userData = await getUserByWallet(DEMO_WALLET);
      if (!userData) return;
      const earnings = await getUserEarnings(userData.id);
      const txs = await getTransactions(userData.id);
      setActivities(txs.slice(0, 5).map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        description: tx.description,
        amount: tx.amount,
        timestamp: tx.created_at,
      })));
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Earnings', value: earnings.total, change: '+12.5%', icon: TrendingUp, color: '#00FFB2', up: true },
    { label: 'Active Package', value: user?.totalInvested || 0, change: 'Orbit Apex', icon: Gift, color: '#00E5FF', up: true },
    { label: 'Team Size', value: user?.teamSize || 0, change: '+3 this week', icon: Users, color: '#7B61FF', up: true },
    { label: 'Referral Earnings', value: earnings.referral, change: '+8.2%', icon: DollarSign, color: '#FF5C7A', up: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Dashboard</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Overview of your investment portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{stat.label}</span>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-white">
                  {typeof stat.value === 'number' ? (stat.label === 'Team Size' ? stat.value : formatCurrency(stat.value)) : stat.value}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  {stat.up ? (
                    <ArrowUpRight size={14} className="text-[#00FFB2]" />
                  ) : (
                    <ArrowDownRight size={14} className="text-[#FF5C7A]" />
                  )}
                  <span className="text-xs" style={{ color: stat.up ? '#00FFB2' : '#FF5C7A' }}>
                    {stat.change}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Earnings Overview</h3>
              <Link href="/earnings" className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1">
                View All <ChevronRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Daily', value: earnings.daily, color: '#00E5FF' },
                { label: 'Matrix', value: earnings.matrix, color: '#7B61FF' },
                { label: 'Pool', value: earnings.pool, color: '#00FFB2' },
                { label: 'Referral', value: earnings.referral, color: '#FF5C7A' },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                  <p className="text-lg font-bold font-mono" style={{ color: item.color }}>
                    {formatCurrency(item.value)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#94A3B8]">Total Earnings</span>
                <span className="text-lg font-bold font-mono text-gradient">{formatCurrency(earnings.total)}</span>
              </div>
              <Progress value={earnings.total} max={50000} showLabel />
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Latest Activity</h3>
              <Activity size={16} className="text-[#94A3B8]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {activities.length === 0 ? (
              <p className="text-sm text-[#94A3B8] py-4 text-center">No recent activity</p>
            ) : activities.map((activity, i) => (
              <div key={activity.id} className={`flex items-start gap-3 py-3 ${i < activities.length - 1 ? 'border-b border-[rgba(148,163,184,0.05)]' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.type === 'earnings' || activity.type === 'daily' ? 'bg-[rgba(0,255,178,0.1)]' :
                  activity.type === 'referral' ? 'bg-[rgba(123,97,255,0.1)]' :
                  activity.type === 'purchase' ? 'bg-[rgba(0,229,255,0.1)]' :
                  'bg-[rgba(255,92,122,0.1)]'
                }`}>
                  {activity.type === 'earnings' || activity.type === 'daily' ? <TrendingUp size={14} className="text-[#00FFB2]" /> :
                   activity.type === 'referral' ? <Users size={14} className="text-[#7B61FF]" /> :
                   activity.type === 'purchase' ? <Gift size={14} className="text-[#00E5FF]" /> :
                   <ArrowUpRight size={14} className="text-[#FF5C7A]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.description || `${activity.type} transaction`}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-[#94A3B8]" />
                    <span className="text-xs text-[#94A3B8]">{formatRelativeTime(activity.timestamp)}</span>
                  </div>
                </div>
                {activity.amount > 0 && (
                  <span className="text-sm font-mono font-medium text-[#00FFB2]">
                    +{formatCurrency(activity.amount)}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
