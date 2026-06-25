'use client';

import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { SLOTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import {
  Vault, Shield, TrendingUp, CheckCircle2, XCircle, ArrowUpDown,
  Clock, ToggleLeft, Target, Orbit, ArrowUpRight, Loader2, Wallet
} from 'lucide-react';
import Link from 'next/link';

export default function UpgradeVaultPage() {
  const { vault, user, slots } = useAppStore();
  const { loading } = useInitData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const activeSlotOrbits = slots
    .filter((s) => s.status === 'active' || s.status === 'completed')
    .map((s) => s.slotOrbit);
  const maxOrbit = activeSlotOrbits.length ? Math.max(...activeSlotOrbits) : 0;
  const nextSlotDef = SLOTS.find((s) => s.orbit === maxOrbit + 1);
  const balance = vault?.balance || user?.ascensionBalance || 0;
  const nextSlotCost = nextSlotDef?.price || SLOTS[SLOTS.length - 1].price;
  const nextSlotName = nextSlotDef?.name || 'Infinity Core';
  const progress = nextSlotDef ? (balance / nextSlotCost) * 100 : 100;
  const autoUpgrade = vault?.autoUpgrade ?? true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Upgrade Vault</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Ascension vault automatically saves 50% of daily earnings for slot upgrades</p>
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
                  <p className="text-xs text-[#94A3B8]">50% of all daily earnings accumulated</p>
                </div>
              </div>
              <Badge variant={autoUpgrade ? 'success' : 'default'} className="text-xs">
                {autoUpgrade ? 'Auto-Upgrade On' : 'Auto-Upgrade Off'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2 mb-5">
              <p className="text-4xl font-bold font-mono text-white">{formatCurrency(balance)}</p>
              <span className="text-sm text-[#94A3B8]">USDT</span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] mb-5">
              <ToggleLeft size={18} className={autoUpgrade ? 'text-[#00FFB2]' : 'text-[#94A3B8]'} />
              <span className="text-sm text-white flex-1">
                Auto-upgrade to next slot when vault reaches target price
              </span>
              <Button variant="outline" size="sm">
                {autoUpgrade ? 'Disable' : 'Enable'}
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">Next Target: {nextSlotName}</span>
                <span className="text-sm font-mono text-white">
                  {formatCurrency(balance)} / {formatCurrency(nextSlotCost)}
                </span>
              </div>
              <Progress value={balance} max={nextSlotCost} size="md" showLabel />
              <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                <span>Remaining: {formatCurrency(Math.max(0, nextSlotCost - balance))}</span>
                <span>{progress.toFixed(1)}% toward next orbit</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-[#7B61FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">Upgrade Chain</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {SLOTS.slice(Math.max(0, maxOrbit - 1), maxOrbit + 3).map((slot) => {
              const owned = activeSlotOrbits.includes(slot.orbit);
              const isNext = slot.orbit === maxOrbit + 1;
              const isCurrent = slot.orbit === maxOrbit && maxOrbit > 0;

              return (
                <div
                  key={slot.id}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    isCurrent
                      ? 'bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)]'
                      : isNext
                      ? 'bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]'
                      : 'bg-[rgba(11,16,32,0.5)]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      owned ? 'bg-[rgba(0,255,178,0.1)]' : 'bg-[rgba(148,163,184,0.05)]'
                    }`}
                  >
                    {owned ? (
                      <CheckCircle2 size={16} className="text-[#00FFB2]" />
                    ) : (
                      <XCircle size={16} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${owned ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {slot.name}
                    </p>
                    <p className="text-xs text-[#94A3B8] font-mono">
                      Orbit #{slot.orbit} &middot; {formatCurrency(slot.price)}
                    </p>
                  </div>
                  {isCurrent && <Badge variant="info" className="text-xs">Active</Badge>}
                  {isNext && <Badge variant="success" className="text-xs">Target</Badge>}
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
              <Orbit size={18} className="text-[#00E5FF]" />
              <h3 className="text-lg font-semibold text-white font-heading">All Slots &mdash; Ascension Path</h3>
            </div>
            <Badge variant="default" className="text-xs">{SLOTS.length} orbits</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Orbit</TableHeader>
                <TableHeader>Slot</TableHeader>
                <TableHeader>Price</TableHeader>
                <TableHeader>Daily Yield</TableHeader>
                <TableHeader>Max Cap</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {SLOTS.map((slot, i) => {
                const owned = activeSlotOrbits.includes(slot.orbit);
                const isNext = slot.orbit === maxOrbit + 1;
                const autoUpgradePath = i < SLOTS.length - 1
                  ? `${slot.name} → ${SLOTS[i + 1].name}`
                  : 'Max orbit (recycles)';

                return (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <span className="text-xs font-mono text-[#94A3B8]">#{slot.orbit}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center"
                          style={{ background: `${slot.color}15` }}
                        >
                          <Orbit size={12} style={{ color: slot.color }} />
                        </div>
                        <span className="text-sm font-medium text-white">{slot.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-white">{formatCurrency(slot.price)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-[#00E5FF]">
                        +{formatCurrency(slot.dailyYield)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-[#00FFB2]">{formatCurrency(slot.maxCap)}</span>
                    </TableCell>
                    <TableCell>
                      {owned ? (
                        <Badge variant="success" className="text-xs">Owned</Badge>
                      ) : isNext ? (
                        <Badge variant="warning" className="text-xs">Next</Badge>
                      ) : (
                        <Badge variant="default" className="text-xs">Locked</Badge>
                      )}
                    </TableCell>
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
