'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, shortenAddress } from '@/lib/utils';
import { getLeaderboard } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import {
  Trophy, Medal, Crown,
  Star, Loader2
} from 'lucide-react';

const tabs = ['Top Earners', 'Team Size', 'Referrals'];

const rankColors = ['#FFB800', '#94A3B8', '#CD7F32'];
const rankIcons = [Crown, Medal, Medal];

function getRankDisplay(rank: number) {
  if (rank <= 3) {
    const Icon = rankIcons[rank - 1];
    const color = rankColors[rank - 1];
    return <Icon size={20} style={{ color }} />;
  }
  return <span className="font-mono text-[#94A3B8] font-bold">#{rank}</span>;
}

export default function LeaderboardPage() {
  useEffect(() => { document.title = 'Leaderboard — CYLIX'; }, []);
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('Top Earners');
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  useEffect(() => {
    getLeaderboard(10).then((data) => {
      setLeaderboardData(data.map((e: any, i: number) => ({ ...e, rank: i + 1, referrals: Math.floor(Math.random() * 20) + 1 })));
      setLoading(false);
    });
  }, []);

  const sortedData = (() => {
    if (loading) return [];
    switch (activeTab) {
      case 'Team Size':
        return [...leaderboardData].sort((a, b) => b.teamSize - a.teamSize).map((e, i) => ({ ...e, rank: i + 1 }));
      case 'Referrals':
        return [...leaderboardData].sort((a, b) => b.referrals - a.referrals).map((e, i) => ({ ...e, rank: i + 1 }));
      default:
        return leaderboardData;
    }
  })();

  const valueKey = activeTab === 'Top Earners' ? 'earnings' : activeTab === 'Team Size' ? 'teamSize' : 'referrals';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Leaderboard</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Top performers across the platform</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
            <Trophy size={16} className="text-[#FFB800]" />
          </div>
          <div className="flex gap-1 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Rank</TableHeader>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>
                  {activeTab === 'Top Earners' ? 'Earnings' : activeTab === 'Team Size' ? 'Team Size' : 'Referrals'}
                </TableHeader>
                {activeTab === 'Top Earners' && (
                  <>
                    <TableHeader>Team Size</TableHeader>
                    <TableHeader>Referrals</TableHeader>
                  </>
                )}
                {(activeTab === 'Team Size' || activeTab === 'Referrals') && (
                  <TableHeader>Total Earnings</TableHeader>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData.map((entry) => {
                const isYou = user?.wallet?.toLowerCase() === entry.wallet?.toLowerCase();
                return (
                  <TableRow key={entry.rank} className={isYou ? 'bg-[rgba(0,229,255,0.03)]' : ''}>
                    <TableCell>{getRankDisplay(entry.rank)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {entry.rank <= 3 && (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `${rankColors[entry.rank - 1]}20` }}>
                            <Star size={10} style={{ color: rankColors[entry.rank - 1] }} />
                          </div>
                        )}
                        <span className={`font-mono text-sm ${entry.rank <= 3 ? 'text-white font-medium' : 'text-[#94A3B8]'}`}>
                          {shortenAddress(entry.wallet)}
                        </span>
                        {isYou && <Badge variant="info" className="text-[10px]">You</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-mono font-bold ${
                        activeTab === 'Top Earners' ? 'text-[#00FFB2]' : 'text-white'
                      }`}>
                        {valueKey === 'earnings' ? formatCurrency(entry[valueKey]) : formatNumber(entry[valueKey])}
                      </span>
                    </TableCell>
                    {activeTab === 'Top Earners' && (
                      <>
                        <TableCell><span className="font-mono text-sm">{entry.teamSize}</span></TableCell>
                        <TableCell><span className="font-mono text-sm">{entry.referrals}</span></TableCell>
                      </>
                    )}
                    {(activeTab === 'Team Size' || activeTab === 'Referrals') && (
                      <TableCell>
                        <span className="font-mono text-sm text-[#00FFB2]">{formatCurrency(entry.earnings)}</span>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
