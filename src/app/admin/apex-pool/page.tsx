'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils';
import { Trophy, RotateCcw, Users, DollarSign, RefreshCw, Award } from 'lucide-react';

const distributionRecords = [
  { id: 1, cycle: 12, totalAmount: 50000, participants: 156, distribution: '2026-06-15T00:00:00', status: 'completed' as const },
  { id: 2, cycle: 13, totalAmount: 55000, participants: 172, distribution: '2026-06-22T00:00:00', status: 'completed' as const },
  { id: 3, cycle: 14, totalAmount: 62000, participants: 195, distribution: '2026-06-29T00:00:00', status: 'pending' as const },
];

export default function AdminApexPool() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Apex Pool</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Premium pool management and distribution</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Trophy size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Current Cycle</p>
              <p className="text-white font-bold font-mono text-lg">#14</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Pool Balance</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(185000)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
              <Users size={20} className="text-[#7B61FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Participants</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(195)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <Award size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Avg Distribution</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(318)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Current Cycle Info</h3>
            <p className="text-[#94A3B8] text-sm">Cycle #14 details</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
              <span className="text-[#94A3B8] text-sm">Pool Amount</span>
              <span className="text-white font-mono font-semibold">{formatCurrency(62000)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
              <span className="text-[#94A3B8] text-sm">Participants</span>
              <span className="text-white font-mono">{formatNumber(195)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
              <span className="text-[#94A3B8] text-sm">Distribution Per User</span>
              <span className="text-[#00E5FF] font-mono font-semibold">{formatCurrency(318)}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[rgba(0,229,255,0.05)]">
              <span className="text-[#94A3B8] text-sm">Next Distribution</span>
              <span className="text-white font-mono">Jun 29, 2026</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-[#94A3B8] text-sm">Progress</span>
              <span className="text-[#FFB800] font-mono">72%</span>
            </div>
            <Progress value={72} size="md" />
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
                <Button variant="primary" size="sm">
                  <RefreshCw size={14} />
                  Distribute Now
                </Button>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.08)]">
                <h4 className="text-white font-medium text-sm mb-2">Reset Cycle</h4>
                <p className="text-[#94A3B8] text-xs mb-3">End current cycle and start a new one</p>
                <Button variant="secondary" size="sm">
                  <RotateCcw size={14} />
                  New Cycle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">Distribution Records</h3>
          <p className="text-[#94A3B8] text-sm">Historical pool distributions</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Cycle</TableHeader>
                <TableHeader>Total Amount</TableHeader>
                <TableHeader>Participants</TableHeader>
                <TableHeader>Distribution Date</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {distributionRecords.map((rec) => (
                <TableRow key={rec.id}>
                  <TableCell className="font-mono text-[#00E5FF]">#{rec.cycle}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(rec.totalAmount)}</TableCell>
                  <TableCell className="font-mono">{formatNumber(rec.participants)}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{formatDate(rec.distribution)}</TableCell>
                  <TableCell>
                    <Badge variant={rec.status === 'completed' ? 'success' : 'warning'}>
                      {rec.status}
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
