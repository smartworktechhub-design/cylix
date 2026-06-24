'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getUserByWallet, getUserEarnings, getTransactions } from '@/lib/db';
import {
  TrendingUp, Users, Gift, Wallet, DollarSign, ChevronRight,
  ArrowUpRight, Clock, Activity, Target, Sparkles, GitBranch, Loader2
} from 'lucide-react';
import Link from 'next/link';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const earningTypeConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  daily: { label: 'Daily', color: '#00E5FF', bg: 'rgba(0,229,255,0.1)', icon: TrendingUp },
  earnings: { label: 'Daily', color: '#00E5FF', bg: 'rgba(0,229,255,0.1)', icon: TrendingUp },
  matrix: { label: 'Matrix', color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', icon: GitBranch },
  pool: { label: 'Pool', color: '#00FFB2', bg: 'rgba(0,255,178,0.1)', icon: Activity },
  referral: { label: 'Referral', color: '#FF5C7A', bg: 'rgba(255,92,122,0.1)', icon: Gift },
  purchase: { label: 'Purchase', color: '#FFB800', bg: 'rgba(255,184,0,0.1)', icon: ArrowUpRight },
  upgrade: { label: 'Upgrade', color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', icon: ChevronRight },
  withdrawal: { label: 'Withdrawal', color: '#FF5C7A', bg: 'rgba(255,92,122,0.1)', icon: Wallet },
};

export default function EarningsPage() {
  const [earningsSummary, setEarningsSummary] = useState({ daily: 0, matrix: 0, pool: 0, referral: 0, total: 0 });
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const [earnings, transactions] = await Promise.all([
            getUserEarnings(user.id),
            getTransactions(user.id),
          ]);
          setEarningsSummary(earnings);
          setEarningsHistory(transactions.map((t) => ({
            id: t.id,
            type: t.type === 'withdraw' ? 'withdrawal' : t.type === 'earnings' ? 'daily' : t.type,
            amount: t.amount,
            description: t.description,
            date: t.timestamp,
            status: t.status === 'failed' ? 'failed' : 'completed',
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const nextMilestone = {
    target: 25000,
    progress: earningsSummary.total,
    label: 'Orbit Apex Cap',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Earnings</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Track all your earnings across every source</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Daily</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)' }}>
                <TrendingUp size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00E5FF]">{formatCurrency(earningsSummary.daily)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Matrix</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,97,255,0.1)' }}>
                <GitBranch size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#7B61FF]">{formatCurrency(earningsSummary.matrix)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Pool</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,255,178,0.1)' }}>
                <Activity size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00FFB2]">{formatCurrency(earningsSummary.pool)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Referral</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,92,122,0.1)' }}>
                <Gift size={16} className="text-[#FF5C7A]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#FF5C7A]">{formatCurrency(earningsSummary.referral)}</p>
          </CardContent>
        </Card>

        <Card hover gradient>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,229,255,0.1)' }}>
                <Wallet size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(earningsSummary.total)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Earnings History</h3>
              </div>
              <Badge variant="info" className="text-xs">{formatNumber(earningsHistory.length)} entries</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Amount</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {earningsHistory.map((entry) => {
                  const config = earningTypeConfig[entry.type] || earningTypeConfig.daily;
                  const Icon = config.icon;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: config.bg }}>
                            <Icon size={12} style={{ color: config.color }} />
                          </div>
                          <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-white">{entry.description}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} className="text-[#94A3B8]" />
                          <span className="text-xs text-[#94A3B8]">{formatDate(entry.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono font-medium text-[#00FFB2]">+{formatCurrency(entry.amount)}</span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#00FFB2]" />
              <h3 className="text-lg font-semibold text-white font-heading">Milestones</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#94A3B8]">{nextMilestone.label}</span>
                <div className="flex items-center gap-1">
                  <Sparkles size={12} className="text-[#FFB800]" />
                  <span className="text-xs font-mono text-[#FFB800]">{formatCurrency(nextMilestone.target)}</span>
                </div>
              </div>
              <Progress value={nextMilestone.progress} max={nextMilestone.target} size="md" showLabel />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-[#94A3B8]">Progress to next milestone</span>
                <span className="text-xs font-mono text-[#00E5FF]">
                  {((nextMilestone.progress / nextMilestone.target) * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-white">Next Rewards</h4>
              {[
                { label: 'Daily Pool Share', target: 15000, progress: earningsSummary.total, reward: 500 },
                { label: 'Matrix Bonus', target: 20000, progress: earningsSummary.total, reward: 1000 },
              ].map((reward, i) => (
                <div key={i} className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#94A3B8]">{reward.label}</span>
                    <span className="text-xs font-mono text-[#00FFB2]">+{formatCurrency(reward.reward)}</span>
                  </div>
                  <Progress value={reward.progress} max={reward.target} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
