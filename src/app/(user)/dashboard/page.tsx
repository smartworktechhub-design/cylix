'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { getRecentActivity } from '@/lib/db';
import {
  TrendingUp, Users, Gift, ArrowUpRight, Activity, Clock,
  DollarSign, Orbit, Wallet, Vault, Loader2, ChevronRight,
  BarChart3, Layers
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, slots, earnings } = useAppStore();
  const { loading } = useInitData();
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      getRecentActivity(user.id).then(setActivities);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const activeSlots = slots.filter((s) => s.status === 'active');
  const completedSlots = slots.filter((s) => s.status === 'completed');

  const stats = [
    {
      label: 'Total Invested', value: user?.totalInvested || 0,
      change: `${activeSlots.length} active`, icon: DollarSign, color: '#00E5FF', up: true,
    },
    {
      label: 'Total Earned', value: earnings.total,
      change: `+${formatCurrency(earnings.daily)} today`, icon: TrendingUp, color: '#00FFB2', up: true,
    },
    {
      label: 'Active Slots', value: activeSlots.length,
      change: `${completedSlots.length} completed`, icon: Orbit, color: '#7B61FF', up: true,
    },
    {
      label: 'Vault Balance', value: user?.ascensionBalance || 0,
      change: '50% of daily yield', icon: Vault, color: '#FFB800', up: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Dashboard</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Overview of your orbit investment portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} hover>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.color}15` }}
                  >
                    <Icon size={18} style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold font-mono text-white">
                  {stat.label === 'Active Slots'
                    ? stat.value
                    : formatCurrency(stat.value as number)}
                </p>
                <p className="text-xs text-[#94A3B8] mt-1.5">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white">Earnings Breakdown</h3>
              </div>
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
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Ascension</p>
                <p className="text-lg font-bold font-mono text-[#FFB800]">
                  {formatCurrency(earnings.ascension)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Total All Time</p>
                <p className="text-lg font-bold font-mono text-gradient">
                  {formatCurrency(earnings.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card hover>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
              <Activity size={16} className="text-[#94A3B8]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-0">
            {activities.length === 0 ? (
              <p className="text-sm text-[#94A3B8] py-4 text-center">No recent activity</p>
            ) : activities.slice(0, 6).map((activity, i) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 py-3 ${
                  i < Math.min(activities.length, 6) - 1
                    ? 'border-b border-[rgba(148,163,184,0.05)]'
                    : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activity.type.includes('earning') || activity.type === 'daily_earning'
                      ? 'bg-[rgba(0,255,178,0.1)]'
                      : activity.type.includes('referral')
                      ? 'bg-[rgba(123,97,255,0.1)]'
                      : activity.type === 'slot_purchase'
                      ? 'bg-[rgba(0,229,255,0.1)]'
                      : activity.type === 'ascension_credit'
                      ? 'bg-[rgba(255,184,0,0.1)]'
                      : 'bg-[rgba(255,92,122,0.1)]'
                  }`}
                >
                  {activity.type.includes('earning') || activity.type === 'daily_earning' ? (
                    <TrendingUp size={14} className="text-[#00FFB2]" />
                  ) : activity.type.includes('referral') ? (
                    <Users size={14} className="text-[#7B61FF]" />
                  ) : activity.type === 'slot_purchase' ? (
                    <Gift size={14} className="text-[#00E5FF]" />
                  ) : activity.type === 'ascension_credit' ? (
                    <ArrowUpRight size={14} className="text-[#FFB800]" />
                  ) : (
                    <ArrowUpRight size={14} className="text-[#FF5C7A]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {activity.description || `${activity.type} transaction`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={11} className="text-[#94A3B8]" />
                    <span className="text-xs text-[#94A3B8]">
                      {formatRelativeTime(activity.timestamp)}
                    </span>
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

      <Card hover>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#00E5FF]" />
            <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/slots">
              <div className="p-4 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)] hover:bg-[rgba(0,229,255,0.1)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                    <Orbit size={20} className="text-[#00E5FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Buy Slot</p>
                    <p className="text-xs text-[#94A3B8]">Browse available orbit slots</p>
                  </div>
                  <ChevronRight size={16} className="text-[#00E5FF] ml-auto" />
                </div>
              </div>
            </Link>
            <Link href="/upgrade-vault">
              <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.1)] hover:bg-[rgba(123,97,255,0.1)] transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                    <Vault size={20} className="text-[#7B61FF]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Upgrade Vault</p>
                    <p className="text-xs text-[#94A3B8]">Auto-save and ascend slots</p>
                  </div>
                  <ChevronRight size={16} className="text-[#7B61FF] ml-auto" />
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
