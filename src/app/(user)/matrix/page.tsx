'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getUserByWallet, getUserEarnings, getReferrals } from '@/lib/db';
import {
  GitBranch, Users, Wallet, TrendingUp, ArrowLeft, ArrowRight,
  User, ChevronDown, Activity, Loader2
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

interface TreeNode {
  name: string;
  wallet: string;
  volume: number;
  hasChildren: boolean;
  children?: { left: TreeNode; right: TreeNode };
}

function TreeNodeCard({ node, side }: { node: TreeNode; side?: 'left' | 'right' }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`
        p-3 rounded-xl border text-center min-w-[140px] transition-all
        ${node.name === 'You'
          ? 'bg-[rgba(0,229,255,0.08)] border-[rgba(0,229,255,0.25)] shadow-[0_0_15px_rgba(0,229,255,0.08)]'
          : 'bg-[rgba(11,16,32,0.8)] border-[rgba(148,163,184,0.1)] hover:border-[rgba(0,229,255,0.15)]'
        }
      `}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            node.name === 'You' ? 'bg-[rgba(0,229,255,0.15)]' :
            side === 'left' ? 'bg-[rgba(123,97,255,0.1)]' :
            side === 'right' ? 'bg-[rgba(0,255,178,0.1)]' :
            'bg-[rgba(148,163,184,0.08)]'
          }`}>
            <User size={12} className={
              node.name === 'You' ? 'text-[#00E5FF]' :
              side === 'left' ? 'text-[#7B61FF]' :
              side === 'right' ? 'text-[#00FFB2]' :
              'text-[#94A3B8]'
            } />
          </div>
          <span className={`text-sm font-medium ${node.name === 'You' ? 'text-[#00E5FF]' : 'text-white'}`}>
            {node.name}
          </span>
        </div>
        <p className="text-xs text-[#94A3B8] font-mono">{node.wallet}</p>
        <p className="text-xs font-mono mt-1" style={{ color: node.name === 'You' ? '#00E5FF' : '#7B61FF' }}>
          {formatCurrency(node.volume)}
        </p>
      </div>
    </div>
  );
}

function TreeLevel({ node, side }: { node: TreeNode; side?: 'left' | 'right' }) {
  const hasChildren = node.children;
  return (
    <div className="flex flex-col items-center">
      <TreeNodeCard node={node} side={side} />
      {hasChildren && node.children && (
        <div className="flex flex-col items-center mt-3">
          <ChevronDown size={16} className="text-[rgba(148,163,184,0.3)] mb-1" />
          <div className="flex gap-8 relative">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-[rgba(148,163,184,0.15)]" />
            <div className="flex flex-col items-center">
              <TreeNodeCard node={node.children.left} side="left" />
              {node.children.left.children && (
                <div className="mt-3">
                  <ChevronDown size={14} className="text-[rgba(148,163,184,0.2)] mb-1 mx-auto" />
                  <div className="flex gap-4">
                    <TreeNodeCard node={node.children.left.children.left} side="left" />
                    <TreeNodeCard node={node.children.left.children.right} side="right" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-center">
              <TreeNodeCard node={node.children.right} side="right" />
              {node.children.right.children && (
                <div className="mt-3">
                  <ChevronDown size={14} className="text-[rgba(148,163,184,0.2)] mb-1 mx-auto" />
                  <div className="flex gap-4">
                    <TreeNodeCard node={node.children.right.children.left} side="left" />
                    <TreeNodeCard node={node.children.right.children.right} side="right" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function shortenWallet(wallet: string): string {
  return wallet.slice(0, 6) + '...' + wallet.slice(-4);
}

export default function MatrixPage() {
  const [matrixStats, setMatrixStats] = useState({
    leftVolume: 0,
    rightVolume: 0,
    totalVolume: 0,
    teamCount: 0,
    leftTeam: 0,
    rightTeam: 0,
    placementSide: 'left' as 'left' | 'right',
  });
  const [rootNode, setRootNode] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const [earnings, referrals] = await Promise.all([
            getUserEarnings(user.id),
            getReferrals(user.id),
          ]);

          const teamCount = referrals.length;
          const leftTeam = Math.ceil(teamCount / 2);
          const rightTeam = Math.floor(teamCount / 2);
          const leftVolume = teamCount > 0
            ? referrals.slice(0, leftTeam).reduce((s, r) => s + r.earnings, 0)
            : 0;
          const rightVolume = teamCount > 0
            ? referrals.slice(leftTeam).reduce((s, r) => s + r.earnings, 0)
            : 0;

          setMatrixStats({
            leftVolume,
            rightVolume,
            totalVolume: earnings.total,
            teamCount,
            leftTeam,
            rightTeam,
            placementSide: leftVolume >= rightVolume ? 'left' as const : 'right' as const,
          });

          const userWalletDisplay = shortenWallet(user.wallet);
          const leftRefs = referrals.slice(0, leftTeam);
          const rightRefs = referrals.slice(leftTeam);

          const makeLeaf = (r: typeof referrals[0]): TreeNode => ({
            name: shortenWallet(r.wallet),
            wallet: shortenWallet(r.wallet),
            volume: r.earnings,
            hasChildren: false,
          });

          const buildSide = (refs: typeof referrals): TreeNode => {
            if (refs.length === 0) {
              return { name: 'Empty', wallet: '---', volume: 0, hasChildren: false };
            }
            if (refs.length === 1) {
              return makeLeaf(refs[0]);
            }
            return {
              name: shortenWallet(refs[0].wallet),
              wallet: shortenWallet(refs[0].wallet),
              volume: refs[0].earnings,
              hasChildren: true,
              children: {
                left: refs.length > 1 ? makeLeaf(refs[1]) : { name: 'Empty', wallet: '---', volume: 0, hasChildren: false },
                right: refs.length > 2 ? makeLeaf(refs[2]) : { name: 'Empty', wallet: '---', volume: 0, hasChildren: false },
              },
            };
          };

          setRootNode({
            name: 'You',
            wallet: userWalletDisplay,
            volume: earnings.total,
            hasChildren: referrals.length > 0,
            children: {
              left: buildSide(leftRefs),
              right: buildSide(rightRefs),
            },
          });
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Matrix Explorer</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Visualize your binary team structure and volumes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Left Volume</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(123,97,255,0.1)]">
                <ArrowLeft size={16} className="text-[#7B61FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(matrixStats.leftVolume)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{matrixStats.leftTeam} members</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Right Volume</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,255,178,0.1)]">
                <ArrowRight size={16} className="text-[#00FFB2]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(matrixStats.rightVolume)}</p>
            <p className="text-xs text-[#94A3B8] mt-1">{matrixStats.rightTeam} members</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Total Volume</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(0,229,255,0.1)]">
                <Activity size={16} className="text-[#00E5FF]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatCurrency(matrixStats.totalVolume)}</p>
          </CardContent>
        </Card>

        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Team Count</span>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[rgba(255,92,122,0.1)]">
                <Users size={16} className="text-[#FF5C7A]" />
              </div>
            </div>
            <p className="text-2xl font-bold font-mono text-white">{formatNumber(matrixStats.teamCount)}</p>
          </CardContent>
        </Card>
      </div>

      {rootNode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitBranch size={18} className="text-[#00E5FF]" />
                <h3 className="text-lg font-semibold text-white font-heading">Binary Tree Structure</h3>
              </div>
              <Badge variant="info" className="text-xs">
                Placed on {matrixStats.placementSide} side
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6 overflow-x-auto">
              <TreeLevel node={rootNode} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
