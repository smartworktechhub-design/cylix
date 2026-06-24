'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { PACKAGES } from '@/lib/constants';
import { getUserByWallet, getUserPackages, getUserEarnings, getTransactions } from '@/lib/db';
import {
  Vault, ArrowUpDown, Shield, Clock, TrendingUp, CheckCircle2,
  XCircle, AlertCircle, ToggleLeft, ChevronRight, Wallet, Target, Loader2
} from 'lucide-react';
import Link from 'next/link';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function UpgradeVaultPage() {
  const [vaultBalance, setVaultBalance] = useState(0);
  const [currentPackageLevel, setCurrentPackageLevel] = useState(1);
  const [vaultTransactions, setVaultTransactions] = useState<any[]>([]);
  const [autoUpgradeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const [packages, earnings, transactions] = await Promise.all([
            getUserPackages(user.id),
            getUserEarnings(user.id),
            getTransactions(user.id),
          ]);

          const active = packages.find((p) => p.status === 'active');
          if (active) setCurrentPackageLevel(active.level);

          setVaultBalance(earnings.total);

          setVaultTransactions(transactions.map((t) => ({
            id: t.id,
            type: t.type === 'upgrade' ? 'upgrade' : 'deposit',
            amount: t.type === 'withdraw' ? -t.amount : t.amount,
            date: t.timestamp,
            status: t.status === 'failed' ? 'failed' : 'completed' as const,
            description: t.description,
          })));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const nextPackage = PACKAGES.find((p) => p.level === currentPackageLevel + 1);
  const upgradeCost = nextPackage ? nextPackage.price - vaultBalance : 0;
  const upgradeProgress = nextPackage ? Math.min((vaultBalance / nextPackage.price) * 100, 100) : 100;

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
        <h2 className="text-2xl font-bold font-heading text-white">Upgrade Vault</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Automatically save and upgrade your package</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card gradient className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                  <Vault size={22} className="text-[#00E5FF]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">Vault Balance</h3>
                  <p className="text-xs text-[#94A3B8]">Accumulated upgrade funds</p>
                </div>
              </div>
              <Badge variant={autoUpgradeEnabled ? 'success' : 'default'} className="text-xs">
                {autoUpgradeEnabled ? 'Auto-Upgrade On' : 'Auto-Upgrade Off'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-5">
              <p className="text-4xl font-bold font-mono text-white">{formatCurrency(vaultBalance)}</p>
              <span className="text-sm text-[#94A3B8]">USDT</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] mb-5">
              <ToggleLeft size={18} className={autoUpgradeEnabled ? 'text-[#00FFB2]' : 'text-[#94A3B8]'} />
              <span className="text-sm text-white flex-1">Auto-upgrade when vault reaches next package price</span>
              <Button variant="outline" size="sm">
                {autoUpgradeEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>

            {nextPackage && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#94A3B8]">Upgrade Progress to {nextPackage.name}</span>
                  <span className="text-sm font-mono text-white">
                    {formatCurrency(vaultBalance)} / {formatCurrency(nextPackage.price)}
                  </span>
                </div>
                <Progress value={vaultBalance} max={nextPackage.price} size="md" showLabel />
                <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                  <span>Remaining: {formatCurrency(upgradeCost)}</span>
                  <span>{upgradeProgress.toFixed(1)}% complete</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#7B61FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Next Upgrades</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {PACKAGES.slice(currentPackageLevel - 1, currentPackageLevel + 2).map((pkg, i) => {
              const isCurrent = pkg.level === currentPackageLevel;
              const isNextTarget = pkg.level === currentPackageLevel + 1;
              const unlocked = pkg.level <= currentPackageLevel;
              return (
                <div
                  key={pkg.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isCurrent ? 'bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)]' :
                    isNextTarget ? 'bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]' :
                    'bg-[rgba(11,16,32,0.5)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    unlocked ? 'bg-[rgba(0,255,178,0.1)]' : 'bg-[rgba(148,163,184,0.05)]'
                  }`}>
                    {unlocked ? (
                      <CheckCircle2 size={16} className="text-[#00FFB2]" />
                    ) : (
                      <XCircle size={16} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${unlocked ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {pkg.name}
                    </p>
                    <p className="text-xs text-[#94A3B8] font-mono">{formatCurrency(pkg.price)}</p>
                  </div>
                  {isCurrent && <Badge variant="info" className="text-xs">Active</Badge>}
                  {isNextTarget && <Badge variant="success" className="text-xs">Target</Badge>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Vault Activity</h3>
            </div>
            <Badge variant="default" className="text-xs">{vaultTransactions.length} transactions</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Type</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {vaultTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'deposit' ? 'bg-[rgba(0,229,255,0.1)]' : 'bg-[rgba(255,92,122,0.1)]'
                      }`}>
                        {tx.type === 'deposit' ? (
                          <ArrowUpDown size={12} className="text-[#00E5FF]" />
                        ) : (
                          <TrendingUp size={12} className="text-[#FF5C7A]" />
                        )}
                      </div>
                      <span className="text-xs font-medium capitalize text-white">{tx.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white">{tx.description || `${tx.type === 'deposit' ? 'Deposit to vault' : 'Auto-upgrade'}`}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-[#94A3B8]" />
                      <span className="text-xs text-[#94A3B8]">{formatDate(tx.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-mono font-medium ${
                      tx.amount > 0 ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} className="text-xs">
                      {tx.status}
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
