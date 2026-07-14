'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { getApexPoolState, distributeApexPool } from '@/lib/db';
import type { ApexPoolState, ApexPoolDistribution } from '@/types';
import { Trophy, RotateCcw, Users, DollarSign, RefreshCw, Award, Loader2 } from 'lucide-react';

export default function AdminApexPool() {
  useEffect(() => { document.title = 'Apex Pool — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [poolState, setPoolState] = useState<ApexPoolState | null>(null);
  const [distributing, setDistributing] = useState(false);

  useEffect(() => {
    fetchPoolState();
  }, []);

  async function fetchPoolState() {
    setLoading(true);
    try {
      const state = await getApexPoolState();
      setPoolState(state);
    } catch (err) {
      console.error('Failed to fetch pool state:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDistribute() {
    setDistributing(true);
    try {
      await distributeApexPool();
      await fetchPoolState();
    } catch (err) {
      console.error('Distribution failed:', err);
    } finally {
      setDistributing(false);
    }
  }

  const nextDistTime = poolState?.nextDistributionTime
    ? new Date(poolState.nextDistributionTime)
    : null;
  const now = new Date();
  const progressPct = nextDistTime && nextDistTime > now
    ? Math.min(100, ((24 * 60 * 60 - (nextDistTime.getTime() - now.getTime())) / (24 * 60 * 60)) * 100)
    : poolState?.distributionHistory?.length ? 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Apex Pool</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Premium pool management and distribution</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-[#00E5FF] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading pool data...</span>
        </div>
      ) : poolState ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <Trophy size={20} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Pool Balance</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(poolState.totalPoolFund)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                  <Users size={20} className="text-[#00FFB2]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Qualified Count</p>
                  <p className="text-white font-bold font-mono text-lg">{formatNumber(poolState.qualifiedCount)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                  <DollarSign size={20} className="text-[#7B61FF]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Today&apos;s Distribution</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(poolState.todayDistribution)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                  <Award size={20} className="text-[#FFB800]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Lifetime Distribution</p>
                  <p className="text-white font-bold font-mono text-lg">{formatCurrency(poolState.lifetimeDistribution)}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <h3 className="text-white font-semibold font-heading">Current Cycle Info</h3>
                <p className="text-[#94A3B8] text-sm">Pool distribution details</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
                  <span className="text-[#94A3B8] text-sm">Pool Amount</span>
                  <span className="text-white font-mono font-semibold">{formatCurrency(poolState.totalPoolFund)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
                  <span className="text-[#94A3B8] text-sm">Qualified Members</span>
                  <span className="text-white font-mono">{formatNumber(poolState.qualifiedCount)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
                  <span className="text-[#94A3B8] text-sm">Distribution Per User</span>
                  <span className="text-[#00E5FF] font-mono font-semibold">{formatCurrency(poolState.distributePerPerson)}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
                  <span className="text-[#94A3B8] text-sm">Next Distribution</span>
                  <span className="text-white font-mono">
                    {poolState.nextDistributionTime ? formatDate(poolState.nextDistributionTime) : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-[#94A3B8] text-sm">Cycle Progress</span>
                  <span className="text-[#FFB800] font-mono">{progressPct.toFixed(0)}%</span>
                </div>
                <Progress value={progressPct} size="md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-white font-semibold font-heading">Cycle Management</h3>
                <p className="text-[#94A3B8] text-sm">Distribution controls</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.08)]">
                    <h4 className="text-white font-medium text-sm mb-2">Trigger Distribution</h4>
                    <p className="text-[#94A3B8] text-xs mb-3">Manually trigger pool distribution for current cycle</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleDistribute}
                      loading={distributing}
                      disabled={poolState.totalPoolFund === 0}
                    >
                      <RefreshCw size={14} />
                      Distribute Now
                    </Button>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.08)]">
                    <h4 className="text-white font-medium text-sm mb-2">Reset Cycle</h4>
                    <p className="text-[#94A3B8] text-xs mb-3">End current cycle and start a new one</p>
                    <Button variant="secondary" size="sm" onClick={fetchPoolState}>
                      <RotateCcw size={14} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-white font-semibold font-heading">Distribution History</h3>
              <p className="text-[#94A3B8] text-sm">Historical pool distributions</p>
            </CardHeader>
            <CardContent>
              {poolState.distributionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#94A3B8] text-sm">No distributions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Total Fund</TableHeader>
                      <TableHeader>Qualified</TableHeader>
                      <TableHeader>Per Person</TableHeader>
                      <TableHeader>Safety Reserve</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {poolState.distributionHistory.map((rec: ApexPoolDistribution) => (
                      <TableRow key={rec.id}>
                        <TableCell className="text-[#94A3B8] text-xs">{formatDate(rec.distributedAt)}</TableCell>
                        <TableCell className="font-mono text-[#00E5FF]">{formatCurrency(rec.totalFund)}</TableCell>
                        <TableCell className="font-mono">{formatNumber(rec.qualifiedCount)}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(rec.perPerson)}</TableCell>
                        <TableCell className="font-mono">{formatCurrency(rec.safetyReserve)}</TableCell>
                        <TableCell>
                          <Badge variant="success">completed</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-[#94A3B8]">Failed to load pool data</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchPoolState}>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
