'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { getApexPoolState } from '@/lib/db';
import { APEX_POOL } from '@/lib/constants';
import {
  Trophy, Clock, Users, Target, Zap, Shield,
  DollarSign, Layers, Loader2, Info
} from 'lucide-react';

export default function ApexPoolPage() {
  const [poolState, setPoolState] = useState({
    totalBlocks: 0,
    currentBlockValue: 0,
    totalPoolFund: 0,
    lastDistribution: '',
    qualifiedCount: 0,
    distributePerPerson: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const state = await getApexPoolState();
        setPoolState(state);
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

  const blockProgress = (poolState.currentBlockValue / APEX_POOL.blockValue) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Apex Pool</h2>
        <p className="text-sm text-[#94A3B8] mt-1">4% pool distribution system with safety reserve</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total Blocks</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <Layers size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(poolState.totalBlocks)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total Pool Fund</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(123,97,255,0.1)]">
                <DollarSign size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#7B61FF]">{formatCurrency(poolState.totalPoolFund)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Qualified Users</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,255,178,0.1)]">
                <Users size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(poolState.qualifiedCount)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Per Person</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(255,184,0,0.1)]">
                <Target size={16} className="text-[#FFB800]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#FFB800]">{formatCurrency(poolState.distributePerPerson)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Current Block Progress</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[#94A3B8]">Block Value Progress</span>
                <span className="text-lg font-mono font-bold text-white">
                  {formatCurrency(poolState.currentBlockValue)} / {formatCurrency(APEX_POOL.blockValue)}
                </span>
              </div>
              <Progress value={poolState.currentBlockValue} max={APEX_POOL.blockValue} size="lg" showLabel />
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${blockProgress >= 100 ? 'bg-[#00FFB2]' : 'bg-[#FFB800]'}`} />
                <span className={`text-xs ${blockProgress >= 100 ? 'text-[#00FFB2]' : 'text-[#FFB800]'}`}>
                  {blockProgress >= 100 ? 'Block ready for distribution' : `${blockProgress.toFixed(1)}% complete`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Last Distribution</p>
                {poolState.lastDistribution ? (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#94A3B8]" />
                    <span className="text-sm font-mono text-white">{formatDate(poolState.lastDistribution)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#94A3B8]">No distribution yet</span>
                )}
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Distribution Interval</p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#00E5FF]" />
                  <span className="text-sm font-mono text-white">Every {APEX_POOL.distributionInterval}h</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">How It Works</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-[#00E5FF]" />
                <span className="text-sm font-medium text-white">4% Pool Contribution</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Every slot purchase contributes 4% of the investment amount to the Apex Pool,
                funding the block-based distribution system.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-[#7B61FF]" />
                <span className="text-sm font-medium text-white">70% Safety Reserve</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                70% of each completed block is held in safety reserve to ensure
                sustainable payouts and pool longevity.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={16} className="text-[#00FFB2]" />
                <span className="text-sm font-medium text-white">Block Distribution</span>
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                When a block reaches {formatCurrency(APEX_POOL.blockValue)}, it completes and
                distributes 30% (after reserve) equally among all active slot holders.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
