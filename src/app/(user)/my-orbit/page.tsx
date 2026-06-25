'use client';

import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { SLOTS } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Orbit, TrendingUp, Clock, CheckCircle2, Circle, Loader2,
  ArrowUpRight, Zap, BarChart3
} from 'lucide-react';
import Link from 'next/link';

const SLOT_ICONS: Record<string, React.ReactNode> = {
  spark: <Orbit size={20} />,
  vortex: <Orbit size={20} />,
  comet: <Orbit size={20} />,
  nova: <Orbit size={20} />,
  cyber: <Orbit size={20} />,
  pulse: <Orbit size={20} />,
  master: <Orbit size={20} />,
  alpha: <Orbit size={20} />,
  titan: <Orbit size={20} />,
  whale: <Orbit size={20} />,
  infinity: <Orbit size={20} />,
};

export default function MyOrbitPage() {
  const { slots } = useAppStore();
  const { loading } = useInitData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const activeSlots = slots.filter((s) => s.status === 'active');
  const completedSlots = slots.filter((s) => s.status === 'completed');

  if (activeSlots.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">My Orbit</h2>
          <p className="text-sm text-[#94A3B8] mt-1">Track your active slots and earnings progress</p>
        </div>
        <Card>
          <CardContent className="p-10 text-center">
            <Orbit size={48} className="text-[#94A3B8] mx-auto mb-4" />
            <p className="text-lg text-white font-semibold mb-2">No Active Slots</p>
            <p className="text-sm text-[#94A3B8] mb-6">Purchase your first orbit slot to start earning.</p>
            <Link href="/slots">
              <Button variant="primary" size="lg">
                Browse Slots <ArrowUpRight size={16} />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">My Orbit</h2>
        <p className="text-sm text-[#94A3B8] mt-1">
          {activeSlots.length} active slot{activeSlots.length !== 1 ? 's' : ''} &middot;{' '}
          {completedSlots.length} completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {activeSlots.map((slot) => {
          const slotDef = SLOTS.find((s) => s.id === slot.slotId);
          const remaining = slot.maxCap - slot.earned;
          const color = slotDef?.color || '#00E5FF';

          return (
            <Card key={slot.id} gradient className="relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${color}, transparent)`,
                  transform: 'translate(30%, -30%)',
                }}
              />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}15` }}
                    >
                      <div style={{ color }}>
                        {slotDef?.icon ? (SLOT_ICONS[slotDef.icon] || <Orbit size={22} />) : <Orbit size={22} />}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading">{slot.slotName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="success" className="text-xs">Active</Badge>
                        <span className="text-xs text-[#94A3B8]">Orbit #{slot.slotOrbit}</span>
                      </div>
                    </div>
                  </div>
                  <Link href="/slots">
                    <Button variant="outline" size="sm">
                      Upgrade <ArrowUpRight size={12} />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <p className="text-xs text-[#94A3B8] mb-1">Daily Yield</p>
                    <p className="text-base font-bold font-mono text-[#00E5FF]">
                      +{formatCurrency(slot.dailyEarned)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <p className="text-xs text-[#94A3B8] mb-1">Earned So Far</p>
                    <p className="text-base font-bold font-mono text-[#00FFB2]">
                      {formatCurrency(slot.earned)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <p className="text-xs text-[#94A3B8] mb-1">Remaining</p>
                    <p className="text-base font-bold font-mono text-[#FFB800]">
                      {formatCurrency(Math.max(0, remaining))}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#94A3B8]">Cap Progress (200%)</span>
                    <span className="text-sm font-mono text-white">
                      {formatCurrency(slot.earned)} / {formatCurrency(slot.maxCap)}
                    </span>
                  </div>
                  <Progress value={slot.earned} max={slot.maxCap} size="md" />
                  <div className="flex items-center gap-1 mt-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: slot.progress >= 100 ? '#00FFB2' : color }}
                    />
                    <span className="text-xs text-[#94A3B8]">
                      {slot.progress >= 100 ? 'Max cap reached - ready for ascension' : `${slot.progress.toFixed(1)}% toward 200% cap`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[rgba(148,163,184,0.08)]">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Clock size={12} />
                    Activated {new Date(slot.activatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Zap size={12} />
                    {slot.dailyEarned}/day
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {completedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#00FFB2]" />
              <h3 className="text-lg font-semibold text-white font-heading">Completed Slots</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(11,16,32,0.5)]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-[#00FFB2]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{slot.slotName}</p>
                    <p className="text-xs text-[#94A3B8] font-mono">
                      Earned {formatCurrency(slot.earned)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
