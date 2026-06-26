'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getApexPoolState } from '@/lib/db';
import { ALLOCATION } from '@/lib/constants';
import type { ApexPoolState } from '@/types';
import {
  Trophy, Clock, Users, Loader2, Timer,
  DollarSign, TrendingUp, History, UserCheck
} from 'lucide-react';

export default function ApexPoolPage() {
  const [state, setState] = useState<ApexPoolState>({
    totalPoolFund: 0, lastDistribution: '',
    qualifiedCount: 0, distributePerPerson: 0,
    todayDistribution: 0, lifetimeDistribution: 0,
    nextDistributionTime: '', distributionHistory: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await getApexPoolState();
        setState(s);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const nextDist = state.nextDistributionTime ? new Date(state.nextDistributionTime) : null;
  const now = new Date();
  const diffMs = nextDist ? nextDist.getTime() - now.getTime() : 0;
  const diffH = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffM = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Global Apex Pool</h2>
        <p className="text-sm text-[#94A3B8] mt-1">5% allocation - Unlimited Distribution Network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Pool Balance</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(255,184,0,0.1)]">
                <DollarSign size={16} className="text-[#FFB800]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#FFB800]">{formatCurrency(state.totalPoolFund)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">Unlimited - No Capacity</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Qualified Members</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <UserCheck size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(state.qualifiedCount)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">Active slot holders</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Today's Distribution</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,255,178,0.1)]">
                <TrendingUp size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00FFB2]">{formatCurrency(state.todayDistribution)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Lifetime Distributed</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(123,97,255,0.1)]">
                <History size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#7B61FF]">{formatCurrency(state.lifetimeDistribution)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Distribution Overview</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#94A3B8]">Next Distribution Timer</span>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#00E5FF]" />
                  <span className="text-lg font-mono font-bold text-white">
                    {diffH}h {diffM}m
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#94A3B8]" />
                <span className="text-xs text-[#94A3B8]">
                  {state.qualifiedCount} qualified members will split {formatCurrency(state.totalPoolFund)}
                </span>
              </div>
              {state.qualifiedCount > 0 && state.totalPoolFund > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]">
                  <span className="text-xs text-[#00FFB2]">
                    Estimated per person: <strong>{formatCurrency(state.totalPoolFund / state.qualifiedCount)}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Last Distribution</p>
                {state.lastDistribution ? (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#94A3B8]" />
                    <span className="text-sm font-mono text-white">{formatDate(state.lastDistribution)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#94A3B8]">No distribution yet</span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Pool Allocation</p>
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#FFB800]" />
                  <span className="text-sm font-mono text-white">{ALLOCATION.poolPercent}% of purchases</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-[#FFB800]" />
              <h3 className="text-lg font-semibold text-white font-heading">Distribution History</h3>
            </div>
          </CardHeader>
          <CardContent>
            {state.distributionHistory.length === 0 ? (
              <p className="text-sm text-[#94A3B8] text-center py-6">No distributions yet</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {state.distributionHistory.map((d: any) => (
                  <div key={d.id} className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.03)]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#94A3B8]">{formatDate(d.distributedAt)}</span>
                      <span className="text-xs font-mono text-[#FFB800]">{formatCurrency(d.totalFund)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#4A5568]">{d.qualifiedCount} qualifiers</span>
                      <span className="text-[#00FFB2] font-mono">{formatCurrency(d.perPerson)} each</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
