'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatNumber } from '@/lib/utils';
import { Search, RefreshCw, Users, GitBranch, TrendingUp, Network, UserCheck } from 'lucide-react';

const placementStats = {
  totalUsers: 2483,
  activeUsers: 1892,
  maxDepth: 12,
  totalNodes: 3712,
  filledPercentage: 67,
};

const volumeDistribution = [
  { level: 1, users: 1, volume: 50000 },
  { level: 2, users: 3, volume: 95000 },
  { level: 3, users: 9, volume: 180000 },
  { level: 4, users: 27, volume: 340000 },
  { level: 5, users: 81, volume: 620000 },
  { level: 6, users: 243, volume: 1150000 },
];

export default function AdminMatrix() {
  const [userSearch, setUserSearch] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Matrix Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Binary tree structure and placement</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Users size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Users</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(placementStats.totalUsers)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <UserCheck size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Active Users</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(placementStats.activeUsers)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
              <GitBranch size={20} className="text-[#7B61FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Max Depth</p>
              <p className="text-white font-bold font-mono text-lg">{placementStats.maxDepth}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <Network size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Nodes</p>
              <p className="text-white font-bold font-mono text-lg">{formatNumber(placementStats.totalNodes)}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">User Placement</h3>
            <p className="text-[#94A3B8] text-sm">Search user to view tree placement</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search wallet address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>
              <Button variant="primary" size="md">
                Search
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                  <Users size={28} className="text-[#050816]" />
                </div>
                <p className="text-[#94A3B8] text-sm">Enter a wallet address to view</p>
                <p className="text-[#94A3B8] text-xs mt-1">the user binary tree placement</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Volume Distribution</h3>
            <p className="text-[#94A3B8] text-sm">Volume per matrix level</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volumeDistribution.map((v) => (
                <div key={v.level}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="info" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {v.level}
                      </Badge>
                      <span className="text-sm text-white">Level {v.level}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white font-mono">${(v.volume / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-[#94A3B8] font-mono">{formatNumber(v.users)} users</p>
                    </div>
                  </div>
                  <Progress
                    value={v.volume}
                    max={volumeDistribution[volumeDistribution.length - 1].volume}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">Rebuild Tools</h3>
          <p className="text-[#94A3B8] text-sm">Matrix maintenance utilities</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.08)]">
              <h4 className="text-white font-medium text-sm mb-2">Rebuild Matrix</h4>
              <p className="text-[#94A3B8] text-xs mb-4">Recalculate all tree placements and levels</p>
              <Button variant="outline" size="sm">
                <RefreshCw size={14} />
                Rebuild
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.08)]">
              <h4 className="text-white font-medium text-sm mb-2">Fix Orphans</h4>
              <p className="text-[#94A3B8] text-xs mb-4">Reassign users without proper placement</p>
              <Button variant="outline" size="sm">
                <GitBranch size={14} />
                Fix
              </Button>
            </div>
            <div className="p-4 rounded-xl bg-[rgba(123,97,255,0.05)] border border-[rgba(123,97,255,0.08)]">
              <h4 className="text-white font-medium text-sm mb-2">Validate Tree</h4>
              <p className="text-[#94A3B8] text-xs mb-4">Check matrix integrity and detect issues</p>
              <Button variant="outline" size="sm">
                <Search size={14} />
                Validate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
