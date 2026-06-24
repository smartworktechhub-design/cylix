'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PACKAGES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { getUserByWallet, getUserPackages } from '@/lib/db';
import { Sparkles, ArrowUpRight, Clock, BarChart3, TrendingUp, Shield, Loader2 } from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function PackagesPage() {
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (user) {
          const packages = await getUserPackages(user.id);
          const active = packages.find((p) => p.status === 'active');
          if (active) setActiveLevel(active.level);
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
        <h2 className="text-2xl font-bold font-heading text-white">Orbit Packages</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Choose an investment package to activate your earnings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {PACKAGES.map((pkg) => {
          const isActive = pkg.level === activeLevel;
          const isLocked = pkg.level > 5;

          return (
            <Card
              key={pkg.id}
              hover
              className={`relative flex flex-col ${isActive ? 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]' : ''}`}
            >
              {isActive && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <Badge variant="info" className="px-3 py-0.5 text-xs">
                    Active
                  </Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${pkg.color}15` }}>
                    <Sparkles size={18} style={{ color: pkg.color }} />
                  </div>
                  <Badge variant="default" className="text-xs">
                    Level {pkg.level}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 font-heading">{pkg.name}</h3>
                <p className="text-2xl font-bold font-mono text-white mb-4">
                  {formatCurrency(pkg.price)}
                </p>

                <div className="space-y-2.5 mb-5 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <TrendingUp size={14} /> Daily Return
                    </span>
                    <span className="font-mono font-medium" style={{ color: pkg.color }}>
                      {formatCurrency(pkg.dailyReturn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <BarChart3 size={14} /> Total Return
                    </span>
                    <span className="font-mono font-medium text-white">
                      {formatCurrency(pkg.totalReturn)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Shield size={14} /> Cap
                    </span>
                    <span className="font-mono font-medium text-[#00FFB2]">
                      {formatCurrency(pkg.cap)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Clock size={14} /> Duration
                    </span>
                    <span className="font-mono font-medium text-white">
                      {pkg.duration} days
                    </span>
                  </div>
                </div>

                <Button
                  variant={isActive ? 'outline' : isLocked ? 'ghost' : 'primary'}
                  className="w-full mt-auto"
                  disabled={isLocked}
                >
                  {isActive ? 'Current Package' : isLocked ? 'Locked' : 'Buy Package'}
                  {!isActive && !isLocked && <ArrowUpRight size={14} />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
