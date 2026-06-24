'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, shortenAddress, formatDate, formatNumber } from '@/lib/utils';
import { getUserByWallet } from '@/lib/db';
import {
  Trophy, Clock, Users, Target, TrendingUp, Award,
  Zap, Medal, Crown, ChevronRight, Loader2
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const currentCycle = {
  id: 'APEX-12',
  name: 'Apex Cycle XII',
  startDate: '2026-06-15T00:00:00Z',
  endDate: '2026-06-30T00:00:00Z',
  prizePool: 50000,
  participants: 234,
  qualified: 89,
  yourStatus: { qualified: true, earnings: 1250, rank: 7, volume: 8500 },
};

function getTimeRemaining(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

const poolHistory = [
  { id: 'APEX-11', prize: 45000, winner: '0x4f8a2b3c...a2b3', participants: 210, date: '2026-05-31T00:00:00Z' },
  { id: 'APEX-10', prize: 40000, winner: '0x1a2b3c4d...f9a0', participants: 195, date: '2026-04-30T00:00:00Z' },
  { id: 'APEX-9', prize: 38000, winner: '0x9b8c7d6e...a1b0', participants: 178, date: '2026-03-31T00:00:00Z' },
  { id: 'APEX-8', prize: 35000, winner: '0x3c4d5e6f...b1c2', participants: 165, date: '2026-02-28T00:00:00Z' },
];

const leaderboard = [
  { rank: 1, wallet: '0x8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a', volume: 28500, earnings: 4200, badge: 'gold' },
  { rank: 2, wallet: '0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', volume: 22100, earnings: 3100, badge: 'silver' },
  { rank: 3, wallet: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e', volume: 18900, earnings: 2500, badge: 'bronze' },
  { rank: 4, wallet: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a', volume: 15400, earnings: 2100, badge: null },
  { rank: 5, wallet: '0x6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b', volume: 13200, earnings: 1800, badge: null },
  { rank: 6, wallet: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c', volume: 11200, earnings: 1500, badge: null },
  { rank: 7, wallet: '0x4f8a2b3c1d9e7f6a5b0c3d2e1f4a7b9c0d1e2f3', volume: 8500, earnings: 1250, badge: null },
  { rank: 8, wallet: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6', volume: 7200, earnings: 980, badge: null },
];

export default function ApexPoolPage() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(currentCycle.endDate));
  const [userVolume, setUserVolume] = useState(currentCycle.yourStatus.volume);
  const [poolLoading, setPoolLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(currentCycle.endDate));
    }, 1000);

    getUserByWallet(DEMO_WALLET).then((user) => {
      if (user) {
        const vol = user.totalInvested;
        if (vol > 0) {
          setUserVolume(vol);
          currentCycle.yourStatus.volume = vol;
          currentCycle.yourStatus.qualified = vol >= 10000;
        }
      }
      setPoolLoading(false);
    });

    return () => clearInterval(timer);
  }, []);

  if (poolLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Apex Pool</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Compete for the grand prize pool</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" gradient>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{currentCycle.name}</h3>
              <Badge variant="info">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-8 py-4">
              {(['days', 'hours', 'minutes', 'seconds'] as const).map((unit) => (
                <div key={unit} className="text-center">
                  <p className="text-3xl font-bold font-mono text-[#00E5FF]">
                    {timeLeft[unit].toString().padStart(2, '0')}
                  </p>
                  <p className="text-xs text-[#94A3B8] uppercase mt-1">{unit}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] text-center">
                <Trophy size={20} className="mx-auto mb-2 text-[#FFB800]" />
                <p className="text-2xl font-bold font-mono text-white">{formatCurrency(currentCycle.prizePool)}</p>
                <p className="text-xs text-[#94A3B8]">Prize Pool</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] text-center">
                <Users size={20} className="mx-auto mb-2 text-[#7B61FF]" />
                <p className="text-2xl font-bold font-mono text-white">{currentCycle.participants}</p>
                <p className="text-xs text-[#94A3B8]">Participants</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] text-center">
                <Award size={20} className="mx-auto mb-2 text-[#00FFB2]" />
                <p className="text-2xl font-bold font-mono text-white">{currentCycle.qualified}</p>
                <p className="text-xs text-[#94A3B8]">Qualified</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#94A3B8]">Qualification Progress</span>
                <span className="text-xs font-mono text-white">
                  {formatCurrency(currentCycle.yourStatus.volume)} / {formatCurrency(10000)}
                </span>
              </div>
              <Progress value={currentCycle.yourStatus.volume} max={10000} size="md" />
              <div className="flex items-center gap-2 mt-2">
                {currentCycle.yourStatus.qualified ? (
                  <Badge variant="success">Qualified</Badge>
                ) : (
                  <Badge variant="warning">Not Qualified</Badge>
                )}
                <span className="text-xs text-[#94A3B8]">Need {formatCurrency(10000)} volume to qualify</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Your Position</h3>
              <Target size={16} className="text-[#94A3B8]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <p className="text-xs text-[#94A3B8] mb-1">Current Rank</p>
              <p className="text-3xl font-bold font-mono text-[#7B61FF]">#{currentCycle.yourStatus.rank}</p>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <p className="text-xs text-[#94A3B8] mb-1">Your Volume</p>
              <p className="text-xl font-bold font-mono text-white">{formatCurrency(currentCycle.yourStatus.volume)}</p>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <p className="text-xs text-[#94A3B8] mb-1">Pool Earnings</p>
              <p className="text-xl font-bold font-mono text-[#00FFB2]">{formatCurrency(currentCycle.yourStatus.earnings)}</p>
            </div>
            <Button variant="primary" className="w-full">
              <Zap size={16} />
              Boost Volume
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Current Cycle Leaderboard</h3>
            <Medal size={16} className="text-[#94A3B8]" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Rank</TableHeader>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Volume</TableHeader>
                <TableHeader>Earnings</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((entry) => {
                const isYou = entry.wallet === '0x4f8a2b3c1d9e7f6a5b0c3d2e1f4a7b9c0d1e2f3';
                return (
                  <TableRow key={entry.rank} className={isYou ? 'bg-[rgba(0,229,255,0.03)]' : ''}>
                    <TableCell>
                      {entry.badge === 'gold' ? (
                        <Crown size={18} className="text-[#FFB800]" />
                      ) : entry.badge === 'silver' ? (
                        <Medal size={18} className="text-[#94A3B8]" />
                      ) : entry.badge === 'bronze' ? (
                        <Medal size={18} className="text-[#CD7F32]" />
                      ) : (
                        <span className="font-mono text-[#94A3B8]">#{entry.rank}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{shortenAddress(entry.wallet)}</span>
                        {isYou && <Badge variant="info" className="text-[10px]">You</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{formatCurrency(entry.volume)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-[#00FFB2]">{formatCurrency(entry.earnings)}</span>
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Pool History</h3>
            <TrendingUp size={16} className="text-[#94A3B8]" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Cycle</TableHeader>
                <TableHeader>Prize Pool</TableHeader>
                <TableHeader>Winner</TableHeader>
                <TableHeader>Participants</TableHeader>
                <TableHeader>End Date</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {poolHistory.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-[#00E5FF]">{pool.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{formatCurrency(pool.prize)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-[#94A3B8]">{pool.winner}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{pool.participants}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-sm">{formatDate(pool.date)}</span>
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
