'use client';

import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { SLOTS, SLOT_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Orbit, TrendingUp, Shield, ArrowUpRight, Sparkles } from 'lucide-react';

const SLOT_ICONS: Record<string, React.ReactNode> = {
  spark: <Sparkles size={20} />,
  vortex: <Orbit size={20} />,
  comet: <Sparkles size={20} />,
  nova: <Sparkles size={20} />,
  cyber: <Sparkles size={20} />,
  pulse: <Orbit size={20} />,
  master: <Sparkles size={20} />,
  alpha: <Sparkles size={20} />,
  titan: <Sparkles size={20} />,
  whale: <Sparkles size={20} />,
  infinity: <Sparkles size={20} />,
};

export default function SlotsPage() {
  const { slots } = useAppStore();
  const { loading } = useInitData();
  const activeSlotIds = new Set(slots.filter((s) => s.status === 'active').map((s) => s.slotId));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Orbit Slots</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Choose your orbit slot and start earning daily returns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {SLOTS.map((slot) => {
          const isOwned = activeSlotIds.has(slot.id);
          const ascensionChain = SLOTS.filter((s) => s.orbit > slot.orbit).slice(0, 3);
          const dailyYield = slot.price * (SLOT_CONFIG.dailyYieldPercent / 100);
          const maxCap = slot.price * SLOT_CONFIG.maxCapMultiplier;
          const matrixPoolValue = slot.price * 0.26;

          return (
            <Card
              key={slot.id}
              hover
              className={`relative flex flex-col ${isOwned ? 'border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.1)]' : ''}`}
            >
              {isOwned && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="info" className="px-3 py-0.5 text-xs">Active</Badge>
                </div>
              )}
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${slot.color}15` }}
                  >
                    <div style={{ color: slot.color }}>{SLOT_ICONS[slot.icon] || <Sparkles size={20} />}</div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Orbit #{slot.orbit}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 font-heading">{slot.name}</h3>
                <p className="text-2xl font-bold font-mono text-white mb-4">
                  {formatCurrency(slot.price)}
                </p>

                <div className="space-y-2.5 mb-5 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <TrendingUp size={14} /> Daily Yield (3%)
                    </span>
                    <span className="font-mono font-medium text-[#00FFB2]">
                      {formatCurrency(dailyYield)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Shield size={14} /> Max Cap (200%)
                    </span>
                    <span className="font-mono font-medium text-white">
                      {formatCurrency(maxCap)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#94A3B8] flex items-center gap-1.5">
                      <Orbit size={14} /> Matrix Pool (26%)
                    </span>
                    <span className="font-mono font-medium text-[#7B61FF]">
                      {formatCurrency(matrixPoolValue)}
                    </span>
                  </div>
                  {ascensionChain.length > 0 && (
                    <div className="pt-2 border-t border-[rgba(148,163,184,0.08)]">
                      <p className="text-xs text-[#94A3B8] mb-1.5">Ascension Chain</p>
                      <div className="flex items-center gap-1">
                        {ascensionChain.map((a, i) => (
                          <div key={a.id} className="flex items-center gap-1">
                            <span className="text-xs font-mono" style={{ color: a.color }}>
                              {a.name}
                            </span>
                            {i < ascensionChain.length - 1 && (
                              <ArrowUpRight size={10} className="text-[#94A3B8]" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant={isOwned ? 'outline' : 'primary'}
                  className="w-full mt-auto"
                  disabled={isOwned}
                >
                  {isOwned ? 'Active Slot' : 'Purchase'}
                  {!isOwned && <ArrowUpRight size={14} />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
