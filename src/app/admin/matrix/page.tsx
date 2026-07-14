'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { formatNumber, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { Search, RefreshCw, Users, GitBranch, TrendingUp, Network, UserCheck, Loader2 } from 'lucide-react';

interface MatrixStats {
  totalUsers: number;
  activeUsers: number;
  maxDepth: number;
  totalNodes: number;
}

interface LevelDistribution {
  level: number;
  count: number;
}

interface UserTreeNode {
  id: string;
  user_id: string;
  wallet: string;
  level: number;
  side: string | null;
  parent_id: string | null;
}

export default function AdminMatrix() {
  useEffect(() => { document.title = 'Matrix View — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MatrixStats>({ totalUsers: 0, activeUsers: 0, maxDepth: 0, totalNodes: 0 });
  const [levelDistribution, setLevelDistribution] = useState<LevelDistribution[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [userTreeNodes, setUserTreeNodes] = useState<UserTreeNode[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchMatrixData();
  }, []);

  async function fetchMatrixData() {
    setLoading(true);
    try {
      const supabase = getSupabase();

      const [{ count: totalUsers }, { count: activeUsers }] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const { data: treeNodes } = await supabase
        .from('matrix_tree')
        .select('level, side');

      const totalNodes = treeNodes?.length || 0;
      const maxDepth = treeNodes?.length
        ? Math.max(...treeNodes.map((n: any) => n.level || 0), 0)
        : 0;

      const levelCounts: Record<number, number> = {};
      for (let i = 1; i <= 11; i++) levelCounts[i] = 0;
      (treeNodes || []).forEach((n: any) => {
        if (n.level && n.level >= 1 && n.level <= 11) {
          levelCounts[n.level] = (levelCounts[n.level] || 0) + 1;
        }
      });

      const distribution: LevelDistribution[] = Object.entries(levelCounts).map(
        ([level, count]) => ({ level: Number(level), count })
      );

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        maxDepth,
        totalNodes,
      });
      setLevelDistribution(distribution);
    } catch (err) {
      console.error('Failed to fetch matrix data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    const q = userSearch.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchResult(null);
    setUserTreeNodes([]);
    try {
      const supabase = getSupabase();
      const { data: users } = await supabase
        .from('users')
        .select('id, wallet, is_active, created_at, directs, team_size')
        .ilike('wallet', `%${q}%`)
        .limit(5);

      if (!users || users.length === 0) {
        setSearchLoading(false);
        return;
      }

      const user = users[0];
      setSearchResult(user);

      const { data: nodes } = await supabase
        .from('matrix_tree')
        .select('id, user_id, level, side, parent_id')
        .eq('owner_id', user.id)
        .order('level')
        .order('position');

      setUserTreeNodes((nodes || []).map((n: any) => ({
        id: n.id,
        user_id: n.user_id,
        wallet: n.user_id === user.id ? 'ROOT' : shortenAddress(n.user_id),
        level: n.level,
        side: n.side,
        parent_id: n.parent_id,
      })));
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  }

  const maxCount = levelDistribution.length > 0
    ? Math.max(...levelDistribution.map(d => d.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Matrix Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Binary tree structure and placement</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-[#00E5FF] animate-spin" />
          <span className="ml-3 text-[#94A3B8]">Loading matrix data...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <Users size={20} className="text-[#00E5FF]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Total Users</p>
                  <p className="text-white font-bold font-mono text-lg">{formatNumber(stats.totalUsers)}</p>
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
                  <p className="text-white font-bold font-mono text-lg">{formatNumber(stats.activeUsers)}</p>
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
                  <p className="text-white font-bold font-mono text-lg">{stats.maxDepth}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                  <Network size={20} className="text-[#FFB800]" />
                </div>
                <div>
                  <p className="text-[#94A3B8] text-xs">Total Matrix Nodes</p>
                  <p className="text-white font-bold font-mono text-lg">{formatNumber(stats.totalNodes)}</p>
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
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      icon={<Search size={16} />}
                    />
                  </div>
                  <Button variant="primary" size="md" onClick={handleSearch} loading={searchLoading}>
                    Search
                  </Button>
                </div>

                {searchResult && (
                  <div className="mb-4 p-3 rounded-xl bg-[rgba(0,229,255,0.05)] border border-[rgba(0,229,255,0.08)]">
                    <p className="text-white text-sm font-mono">{shortenAddress(searchResult.wallet)}</p>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-[#94A3B8]">Directs: <span className="text-white">{searchResult.directs || 0}</span></span>
                      <span className="text-xs text-[#94A3B8]">Team: <span className="text-white">{searchResult.team_size || 0}</span></span>
                      <Badge variant={searchResult.is_active ? 'success' : 'danger'} className="text-xs">
                        {searchResult.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                )}

                {userTreeNodes.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userTreeNodes.map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(0,229,255,0.03)]"
                        style={{ paddingLeft: `${(node.level - 1) * 16 + 8}px` }}
                      >
                        <div className={`w-2 h-2 rounded-full ${node.level === 1 ? 'bg-[#FFB800]' : 'bg-[#00E5FF]'}`} />
                        <div>
                          <span className="text-xs font-mono text-[#94A3B8]">L{node.level}</span>
                          <span className="text-xs text-white ml-2">
                            {node.side ? `(${node.side})` : 'root'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchResult && !searchLoading ? (
                  <div className="text-center py-8">
                    <p className="text-[#94A3B8] text-sm">No matrix nodes found for this user</p>
                  </div>
                ) : !searchResult ? (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                        <Users size={28} className="text-[#050816]" />
                      </div>
                      <p className="text-[#94A3B8] text-sm">Enter a wallet address to view</p>
                      <p className="text-[#94A3B8] text-xs mt-1">the user binary tree placement</p>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-white font-semibold font-heading">Volume Distribution</h3>
                <p className="text-[#94A3B8] text-sm">Nodes per matrix level</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {levelDistribution.map((v) => (
                    <div key={v.level}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge variant="info" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                            {v.level}
                          </Badge>
                          <span className="text-sm text-white">Level {v.level}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white font-mono">{formatNumber(v.count)} nodes</p>
                        </div>
                      </div>
                      <Progress
                        value={v.count}
                        max={maxCount}
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
        </>
      )}
    </div>
  );
}
