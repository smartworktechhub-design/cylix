'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatNumber, shortenAddress } from '@/lib/utils';
import { getMatrixTree } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { MATRIX_LEVELS } from '@/lib/constants';
import {
  GitBranch, Users, Wallet, User, Loader2,
  Network, ChevronRight, X
} from 'lucide-react';

const PLACEMENT_LABELS: Record<string, string> = {
  root: 'Self', left: 'Direct', right: 'Spillover',
};

export default function MatrixPage() {
  useEffect(() => { document.title = 'Matrix — CYLIX'; }, []);
  const { user } = useAppStore();
  const { loading } = useInitData();
  const [treeNodes, setTreeNodes] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loadingTree, setLoadingTree] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingTree(true);
    getMatrixTree(user.id).then(tree => {
      if (!tree) { setLoadingTree(false); return; }
      const lvls: any[] = [];
      for (let i = 1; i <= 11; i++) lvls.push({ level: i, nodes: [] });
      const flat: any[] = [];
      function traverse(node: any, level: number) {
        if (!node) return;
        const lvlIdx = Math.min(level, 11) - 1;
        const entry = {
          id: node.userId, wallet: node.wallet || '',
          type: node.side || 'root', level,
          position: flat.length,
        };
        flat.push(entry);
        if (lvls[lvlIdx]) lvls[lvlIdx].nodes.push(entry);
        traverse(node.left, level + 1);
        traverse(node.right, level + 1);
      }
      traverse(tree, 1);
      setTreeNodes(flat);
      setLevels(lvls);
      setLoadingTree(false);
    });
  }, [user]);

  if (loading || loadingTree) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const typeCounts = { root: 0, left: 0, right: 0 };
  treeNodes.forEach(n => { typeCounts[n.type as keyof typeof typeCounts]++; });
  const crosslineCount = Math.max(0, treeNodes.length - typeCounts.root - typeCounts.left - typeCounts.right);
  const globalCount = Math.max(0, treeNodes.length - typeCounts.root - typeCounts.left - typeCounts.right - crosslineCount);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Matrix Explorer</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Complete 11-Level Auto-Flow Matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total Members</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <Network size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(treeNodes.length)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">Across 11 levels</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Team / Direct</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(123,97,255,0.1)]">
                <Users size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{treeNodes.length}<span className="text-sm text-[#4A5568]">/{typeCounts.left}</span></p>
            <p className="text-xs text-[#94A3B8] mt-1">Total / Direct referrals</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Active Levels</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,255,178,0.1)]">
                <Wallet size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-[#00FFB2]">{levels.filter(l => l.nodes.length > 0).length} / 11</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch size={18} className="text-[#00E5FF]" />
            <h3 className="text-lg font-semibold text-white font-heading">Live Matrix</h3>
          </div>
        </CardHeader>
        <CardContent>
          {treeNodes.length === 0 ? (
            <div className="text-center py-6">
              <GitBranch size={24} className="mx-auto mb-2 text-[#4A5568]" />
              <p className="text-sm text-[#94A3B8]">No matrix members yet</p>
              <p className="text-xs text-[#4A5568] mt-1">Invite referrals to build your team</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 mb-3 text-xs">
                <span className="text-[#00E5FF]">● Self</span>
                <span className="text-[#00E5FF]">● Direct</span>
                <span className="text-[#7B61FF]">● Spillover</span>
                <span className="text-[#00FFB2]">● Crossline</span>
                <span className="text-[#FFB800]">● Global</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-3">
                <Badge variant="info" className="text-[10px]">
                  <User size={10} className="mr-1" />{typeCounts.left} Direct
                </Badge>
                <Badge variant="warning" className="text-[10px]">
                  <ChevronRight size={10} className="mr-1" />{typeCounts.right} Spillover
                </Badge>
                <Badge variant="success" className="text-[10px]">{crosslineCount} Crossline</Badge>
                <Badge className="text-[10px]">{globalCount} Global</Badge>
              </div>
              <div className="space-y-1 max-h-[600px] overflow-y-auto">
                {levels.filter(l => l.nodes.length > 0).map((level: any) => (
                  <div key={level.level} className="p-2 rounded-lg bg-[rgba(11,16,32,0.3)]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold font-mono ${level.level <= 2 ? 'text-[#00E5FF]' : 'text-[#7B61FF]'}`}>L{level.level}</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-[rgba(0,229,255,0.05)] to-transparent" />
                      <span className="text-[9px] text-[#4A5568] font-mono">{level.nodes.length} members</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {level.nodes.map((node: any, i: number) => {
                        const isSelf = level.level === 1 && i === 0;
                        const isDirect = node.type === 'left';
                        const isSpillover = node.type === 'right';
                        const typeColor = isSelf ? '#00E5FF' : isDirect ? '#00E5FF' : isSpillover ? '#7B61FF' : '#7B61FF';
                        const glow = isSelf ? '0 0 10px rgba(0,229,255,0.3)' : 'none';
                        return (
                          <button key={i} onClick={() => setSelectedNode(node)}
                            className="transition-all duration-200 hover:scale-110">
                            <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer relative"
                              style={{
                                borderColor: typeColor,
                                background: isSelf ? 'linear-gradient(135deg, #00E5FF, #7B61FF)' : `${typeColor}15`,
                                boxShadow: glow,
                              }}>
                              {isSelf ? <User size={10} className="text-[#050816]" /> : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedNode && (
            <div className="mt-4 p-4 rounded-xl border border-[rgba(0,229,255,0.1)] relative" style={{ background: 'rgba(11,16,32,0.9)' }}>
              <button onClick={() => setSelectedNode(null)} className="absolute top-2 right-2 text-[#4A5568] hover:text-white">
                <X size={14} />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                  <User size={12} className="text-[#050816]" />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-white">{shortenAddress(selectedNode.wallet || selectedNode.id)}</p>
                  <p className="text-[10px] text-[#4A5568]">User ID: {selectedNode.id?.slice(0, 12)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.03)]">
                  <p className="text-[#4A5568] text-[10px]">Placement Level</p>
                  <p className="text-white font-mono font-semibold">Level {selectedNode.level}</p>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.03)]">
                  <p className="text-[#4A5568] text-[10px]">Source</p>
                  <p className="font-semibold" style={{ color: selectedNode.type === 'root' ? '#00E5FF' : selectedNode.type === 'left' ? '#00E5FF' : '#7B61FF' }}>
                    {PLACEMENT_LABELS[selectedNode.type] || selectedNode.type}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.03)]">
                  <p className="text-[#4A5568] text-[10px]">Joined From</p>
                  <p className="text-white font-mono">{selectedNode.type === 'left' ? 'Direct Referral' : 'Upline Spillover'}</p>
                </div>
                <div className="p-2 rounded-lg bg-[rgba(0,229,255,0.03)]">
                  <p className="text-[#4A5568] text-[10px]">Position</p>
                  <p className="text-white font-mono">#{selectedNode.position + 1}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network size={18} className="text-[#7B61FF]" />
            <h3 className="text-lg font-semibold text-white font-heading">11-Level Matrix Structure</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MATRIX_LEVELS.map((config) => {
              const levelNodes = levels[config.level - 1]?.nodes || [];
              const dirCount = levelNodes.filter((n: any) => n.type === 'left').length;
              const spCount = levelNodes.filter((n: any) => n.type === 'right').length;
              return (
                <div key={config.level} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.level <= 2 ? 'bg-[rgba(0,229,255,0.1)]' : 'bg-[rgba(123,97,255,0.1)]'}`}>
                      <span className={`text-sm font-bold font-mono ${config.level <= 2 ? 'text-[#00E5FF]' : 'text-[#7B61FF]'}`}>{config.level}</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Level {config.level}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="text-[#00E5FF]">{config.percent}% commission</span>
                        {config.directsRequired > 0 && (
                          <span className="text-[#4A5568]">{config.directsRequired} directs req</span>
                        )}
                        {config.directsRequired === 0 && (
                          <Badge variant="info" className="text-[8px] h-4">Free</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-white">{formatNumber(levelNodes.length)}</p>
                    <div className="flex items-center gap-2 text-[10px] justify-end">
                      <span className="text-[#00E5FF]">{dirCount}D</span>
                      <span className="text-[#7B61FF]">{spCount}S</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
