'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatNumber, shortenAddress } from '@/lib/utils';
import { getUserByWallet, getMatrixTree, getUserMatrixLevel } from '@/lib/db';
import { MATRIX_LEVELS } from '@/lib/constants';
import {
  GitBranch, Users, Wallet, ChevronRight, ChevronDown,
  User, Loader2, Network, ArrowUp, ArrowDown
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function MatrixPage() {
  const [matrixLevels, setMatrixLevels] = useState<any[]>([]);
  const [downlineTree, setDownlineTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const [upline, downline] = await Promise.all([
            getUserMatrixLevel(user.id),
            getMatrixTree(user.id),
          ]);
          setMatrixLevels(upline);
          setDownlineTree(downline);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const totalEarnings = matrixLevels.reduce((s, m) => s + m.totalEarnings, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Matrix Explorer</h2>
        <p className="text-sm text-[#94A3B8] mt-1">11-level unilevel commission structure</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Active Levels</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <Network size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{matrixLevels.length} / 11</p>
            <p className="text-xs text-[#94A3B8] mt-1">Levels in your upline</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Downline Members</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(123,97,255,0.1)]">
                <Users size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(downlineTree.length)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">Total referred in tree</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total Matrix Earnings</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,255,178,0.1)]">
                <Wallet size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00FFB2]">{formatCurrency(totalEarnings)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-[#00E5FF]" />
            <h3 className="text-lg font-semibold text-white font-heading">11-Level Unilevel Matrix</h3>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Level</TableHeader>
                <TableHeader>Distribution %</TableHeader>
                <TableHeader>Directs Required</TableHeader>
                <TableHeader>Your Upline Sponsor</TableHeader>
                <TableHeader>Your Downline Count</TableHeader>
                <TableHeader>Level Earnings</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {MATRIX_LEVELS.map((config) => {
                const uplineEntry = matrixLevels.find((m) => m.level === config.level);
                const downlineCount = downlineTree.filter((d) => d.level === config.level).length;
                const isFree = config.directsRequired === 0;
                return (
                  <TableRow key={config.level}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          config.level <= 2
                            ? 'bg-[rgba(0,229,255,0.1)]'
                            : 'bg-[rgba(123,97,255,0.1)]'
                        }`}>
                          <span className={`text-xs font-bold font-mono ${
                            config.level <= 2 ? 'text-[#00E5FF]' : 'text-[#7B61FF]'
                          }`}>{config.level}</span>
                        </div>
                        {config.level <= 2 && (
                          <Badge variant="info" className="text-[10px]">Free</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-white">{config.percent}%</span>
                    </TableCell>
                    <TableCell>
                      {isFree ? (
                        <span className="text-xs text-[#00FFB2]">No directs needed</span>
                      ) : (
                        <span className="font-mono text-sm text-[#94A3B8]">{config.directsRequired}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {uplineEntry ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                            <User size={10} className="text-[#00E5FF]" />
                          </div>
                          <span className="font-mono text-sm text-[#94A3B8]">
                            {shortenAddress(uplineEntry.sponsorWallet)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#94A3B8]">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-white">{formatNumber(downlineCount)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-[#00FFB2]">
                        {formatCurrency(uplineEntry?.totalEarnings || 0)}
                      </span>
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
            <Users size={18} className="text-[#7B61FF]" />
            <h3 className="text-lg font-semibold text-white font-heading">Your Downline Tree</h3>
          </div>
        </CardHeader>
        <CardContent>
          {downlineTree.length === 0 ? (
            <p className="text-sm text-[#94A3B8] text-center py-6">No downline members yet</p>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 11 }, (_, i) => i + 1).map((level) => {
                const members = downlineTree.filter((d) => d.level === level);
                if (members.length === 0) return null;
                return (
                  <div key={level} className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        level <= 2 ? 'bg-[rgba(0,229,255,0.1)]' : 'bg-[rgba(123,97,255,0.1)]'
                      }`}>
                        <span className={`text-xs font-bold font-mono ${
                          level <= 2 ? 'text-[#00E5FF]' : 'text-[#7B61FF]'
                        }`}>{level}</span>
                      </div>
                      <span className="text-sm text-white font-medium">Level {level}</span>
                      <span className="text-xs text-[#94A3B8]">({members.length} member{members.length > 1 ? 's' : ''})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                      {members.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center gap-2 p-2 rounded-lg bg-[rgba(11,16,32,0.3)] border border-[rgba(148,163,184,0.05)]"
                        >
                          <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[rgba(0,229,255,0.08)]">
                            <User size={10} className="text-[#00E5FF]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-mono text-white truncate">{shortenAddress(member.wallet)}</p>
                            <p className="text-[10px] text-[#94A3B8]">Earned: {formatCurrency(member.totalEarnings)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
