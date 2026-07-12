'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber, shortenAddress } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { SLOTS } from '@/lib/constants';
import { Package, Loader2, Zap, Users, DollarSign, TrendingUp, BarChart3, ArrowUpRight } from 'lucide-react';

interface SlotStats {
  slotId: string;
  slotName: string;
  orbit: number;
  price: number;
  dailyYield: number;
  color: string;
  totalHolders: number;
  activeHolders: number;
  totalInvested: number;
  totalEarned: number;
  cappedCount: number;
}

export default function AdminSlotsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SlotStats[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  async function load() {
    setLoading(true);
    const { data: allSlots } = await getSupabase().from('user_slots').select('*');

    const slotMap: Record<string, SlotStats> = {};
    SLOTS.forEach(s => {
      slotMap[s.id] = {
        slotId: s.id, slotName: s.name, orbit: s.orbit, price: s.price,
        dailyYield: s.dailyYield, color: s.color,
        totalHolders: 0, activeHolders: 0, totalInvested: 0,
        totalEarned: 0, cappedCount: 0,
      };
    });

    (allSlots || []).forEach((row: any) => {
      const s = slotMap[row.slot_id];
      if (!s) return;
      s.totalHolders++;
      if (row.status === 'active') s.activeHolders++;
      s.totalInvested += Number(row.invested) || 0;
      s.totalEarned += Number(row.earned) || 0;
      if (row.status === 'completed') s.cappedCount++;
    });

    const arr = Object.values(slotMap);
    setStats(arr);
    setTotalActive(arr.reduce((sum, s) => sum + s.activeHolders, 0));
    setTotalRevenue(arr.reduce((sum, s) => sum + s.totalInvested, 0));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Slot Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">All 11 orbit slots overview and stats</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <Package size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Total Slots</p>
                <p className="text-white text-xl font-bold font-mono">{formatNumber(allSlotsCount(stats))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                <Zap size={20} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Active Slots</p>
                <p className="text-[#00FFB2] text-xl font-bold font-mono">{formatNumber(totalActive)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                <DollarSign size={20} className="text-[#FFB800]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Total Revenue</p>
                <p className="text-[#FFB800] text-xl font-bold font-mono">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {stats.map((s) => (
          <Card key={s.slotId} hover>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}20` }}
                  >
                    <span className="text-sm font-bold font-mono" style={{ color: s.color }}>O{s.orbit}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-heading font-bold">{s.slotName}</h3>
                      <span className="text-[#94A3B8] text-xs">Orbit {s.orbit}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[#94A3B8]">
                      <span>Price: <span className="text-white font-mono">{formatCurrency(s.price)}</span></span>
                      <span>Daily: <span className="text-[#00FFB2] font-mono">{formatCurrency(s.dailyYield)}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider">Holders</p>
                    <p className="text-white font-mono text-sm font-bold">{s.totalHolders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider">Active</p>
                    <p className="text-[#00FFB2] font-mono text-sm font-bold">{s.activeHolders}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider">Revenue</p>
                    <p className="text-[#FFB800] font-mono text-sm font-bold">{formatCurrency(s.totalInvested)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider">Earned</p>
                    <p className="text-[#7B61FF] font-mono text-sm font-bold">{formatCurrency(s.totalEarned)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#94A3B8] text-[10px] uppercase tracking-wider">Capped</p>
                    <p className="text-[#FF5C7A] font-mono text-sm font-bold">{s.cappedCount}</p>
                  </div>
                </div>
              </div>

              {s.totalHolders > 0 && (
                <div className="mt-3 w-full bg-[rgba(11,16,32,0.5)] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((s.totalEarned / (s.totalInvested || 1)) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${s.color}, ${s.color}88)`,
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function allSlotsCount(stats: SlotStats[]): number {
  return stats.reduce((sum, s) => sum + s.totalHolders, 0);
}
