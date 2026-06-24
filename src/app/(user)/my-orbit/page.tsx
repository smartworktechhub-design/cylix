'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PACKAGES } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getUserByWallet, getUserPackages, getUserEarnings } from '@/lib/db';
import {
  Orbit, TrendingUp, Shield, Clock, ArrowUpRight, CheckCircle2,
  Circle, Zap, BarChart3, Wallet, Loader2
} from 'lucide-react';
import Link from 'next/link';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function MyOrbitPage() {
  const [currentPackage, setCurrentPackage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const packages = await getUserPackages(user.id);
          const active = packages.find((p) => p.status === 'active');
          if (active) {
            const pkgDef = PACKAGES.find((p) => p.level === active.level);
            setCurrentPackage({
              ...active,
              dailyEarned: pkgDef?.dailyReturn || 0,
              capProgress: active.earned,
            });
          }
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

  if (!currentPackage) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-heading text-white">My Orbit</h2>
        <p className="text-sm text-[#94A3B8] mt-1">No active package found. Purchase one from the Packages page.</p>
      </div>
    );
  }

  const activatedDate = new Date(currentPackage.activatedAt);
  const expiresDate = new Date(currentPackage.expiresAt);
  const totalDuration = expiresDate.getTime() - activatedDate.getTime();
  const elapsed = Date.now() - activatedDate.getTime();
  const totalDays = Math.round(totalDuration / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, Math.round(elapsed / (1000 * 60 * 60 * 24)));
  const remainingDays = Math.max(0, totalDays - daysElapsed);

  const activeIndex = PACKAGES.findIndex((p) => p.level === currentPackage.level);
  const nextPackage = activeIndex < PACKAGES.length - 1 ? PACKAGES[activeIndex + 1] : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">My Orbit</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Track your active package and earnings progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" gradient>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[rgba(255,92,122,0.1)] flex items-center justify-center">
                  <Orbit size={22} className="text-[#FF5C7A]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-heading">{currentPackage.packageName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="success" className="text-xs">Active</Badge>
                    <span className="text-xs text-[#94A3B8]">Level {currentPackage.level}</span>
                  </div>
                </div>
              </div>
              <Link href="/packages">
                <Button variant="outline" size="sm">
                  Upgrade <ArrowUpRight size={12} />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Invested</p>
                <p className="text-lg font-bold font-mono text-white">{formatCurrency(currentPackage.invested)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Total Earned</p>
                <p className="text-lg font-bold font-mono text-[#00FFB2]">{formatCurrency(currentPackage.earned)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Daily Return</p>
                <p className="text-lg font-bold font-mono text-[#00E5FF]">+{formatCurrency(currentPackage.dailyEarned)}</p>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <p className="text-xs text-[#94A3B8] mb-1">Cap</p>
                <p className="text-lg font-bold font-mono text-[#7B61FF]">{formatCurrency(currentPackage.cap)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94A3B8]">Cap Progress</span>
                  <span className="text-sm font-mono text-white">
                    {formatCurrency(currentPackage.capProgress)} / {formatCurrency(currentPackage.cap)}
                  </span>
                </div>
                <Progress value={currentPackage.capProgress} max={currentPackage.cap} size="md" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94A3B8]">Duration</span>
                  <span className="text-sm font-mono text-white">{daysElapsed} / {totalDays} days</span>
                </div>
                <Progress value={daysElapsed} max={totalDays} size="md" barClassName="bg-gradient-to-r from-[#7B61FF] to-[#00FFB2]" />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[rgba(148,163,184,0.08)]">
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Clock size={12} />
                Activated {formatDate(currentPackage.activatedAt)}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Zap size={12} />
                {remainingDays} days remaining
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white font-heading">Upgrade Path</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {PACKAGES.slice(Math.max(0, activeIndex - 1), activeIndex + 3).map((pkg, i) => {
              const isCurrent = pkg.level === currentPackage.level;
              const isUnlocked = pkg.level <= currentPackage.level;
              const isNext = nextPackage?.id === pkg.id;
              return (
                <div
                  key={pkg.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)]'
                      : isNext
                      ? 'bg-[rgba(0,255,178,0.05)] border border-[rgba(0,255,178,0.1)]'
                      : 'bg-[rgba(11,16,32,0.5)]'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCurrent ? 'bg-[rgba(0,229,255,0.15)]' :
                    isUnlocked ? 'bg-[rgba(0,255,178,0.1)]' :
                    'bg-[rgba(148,163,184,0.05)]'
                  }`}>
                    {isCurrent ? (
                      <Orbit size={16} className="text-[#00E5FF]" />
                    ) : isUnlocked ? (
                      <CheckCircle2 size={16} className="text-[#00FFB2]" />
                    ) : (
                      <Circle size={16} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCurrent || isUnlocked ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {pkg.name}
                    </p>
                    <p className="text-xs text-[#94A3B8] font-mono">{formatCurrency(pkg.price)}</p>
                  </div>
                  {isCurrent && (
                    <Badge variant="info" className="text-xs">Active</Badge>
                  )}
                  {isNext && (
                    <Badge variant="success" className="text-xs">Next</Badge>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-[#00E5FF]" />
            <h3 className="text-lg font-semibold text-white font-heading">Package Timeline</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[#00E5FF] via-[#7B61FF] to-[rgba(148,163,184,0.2)]" />
            <div className="space-y-6">
              {[
                { label: 'Package Activated', date: currentPackage.activatedAt, done: true, color: '#00E5FF' },
                { label: 'Cap Milestone 50%', date: null, done: currentPackage.capProgress >= currentPackage.cap * 0.5, color: '#7B61FF' },
                { label: 'Cap Milestone 100%', date: null, done: currentPackage.capProgress >= currentPackage.cap, color: '#00FFB2' },
                { label: 'Package Completion', date: currentPackage.expiresAt, done: false, color: '#94A3B8' },
              ].map((milestone, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    milestone.done ? 'bg-[rgba(0,255,178,0.1)]' : 'bg-[rgba(148,163,184,0.05)]'
                  }`}>
                    {milestone.done ? (
                      <CheckCircle2 size={18} className="text-[#00FFB2]" />
                    ) : (
                      <Circle size={18} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className={`text-sm font-medium ${milestone.done ? 'text-white' : 'text-[#94A3B8]'}`}>
                      {milestone.label}
                    </p>
                    {milestone.date && (
                      <p className="text-xs text-[#94A3B8] mt-0.5">{formatDate(milestone.date)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
