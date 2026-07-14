'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { SLOTS, SLOT_CONFIG } from '@/lib/constants';
import {
  Settings, Loader2, Save, Database, Globe, Shield, DollarSign,
  Clock, AlertTriangle, CheckCircle2, Wrench
} from 'lucide-react';

export default function PlatformSettingsPage() {
  useEffect(() => { document.title = 'Platform Settings — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ users: 0, slots: 0, revenue: 0, withdrawals: 0 });
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dailyYieldEnabled, setDailyYieldEnabled] = useState(true);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const [usersRes, slotsRes, wdRes] = await Promise.all([
      getSupabase().from('users').select('id', { count: 'exact', head: true }),
      getSupabase().from('user_slots').select('id', { count: 'exact', head: true }),
      getSupabase().from('withdrawals').select('amount'),
    ]);

    const { data: settings } = await getSupabase().from('platform_settings').select('*').single();
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode || false);
      setDailyYieldEnabled(settings.daily_yield_enabled !== false);
      setRegistrationOpen(settings.registration_open !== false);
    }

    setStats({
      users: usersRes.count || 0,
      slots: slotsRes.count || 0,
      revenue: 0,
      withdrawals: (wdRes.data || []).reduce((s: number, w: any) => s + Number(w.amount), 0),
    });
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await getSupabase().from('platform_settings').upsert({
      id: 'main',
      maintenance_mode: maintenanceMode,
      daily_yield_enabled: dailyYieldEnabled,
      registration_open: registrationOpen,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });
    setSaving(false);
    setToast(error ? 'Error saving' : 'Settings saved!');
    setTimeout(() => setToast(''), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Platform Settings</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Configure platform-wide settings</p>
        </div>
        <Button variant="primary" onClick={saveSettings} loading={saving} disabled={saving}>
          <Save size={14} /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <Database size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Total Users</p>
                <p className="text-white text-xl font-bold font-mono">{formatNumber(stats.users)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                <Globe size={20} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Active Slots</p>
                <p className="text-[#00FFB2] text-xl font-bold font-mono">{formatNumber(stats.slots)}</p>
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
                <p className="text-[#94A3B8] text-xs">Withdrawals</p>
                <p className="text-[#FFB800] text-xl font-bold font-mono">{formatCurrency(stats.withdrawals)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                <Clock size={20} className="text-[#7B61FF]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Daily Yield</p>
                <p className="text-[#7B61FF] text-xl font-bold font-mono">{SLOT_CONFIG.dailyYieldPercent}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Wrench size={16} className="text-[#00E5FF]" />
              System Controls
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ToggleSetting
                label="Maintenance Mode"
                description="Show maintenance page to all users"
                enabled={maintenanceMode}
                onToggle={() => setMaintenanceMode(!maintenanceMode)}
                color="#FF5C7A"
              />
              <ToggleSetting
                label="Daily Yield Processing"
                description="Enable/disable 3% daily yield auto-processing"
                enabled={dailyYieldEnabled}
                onToggle={() => setDailyYieldEnabled(!dailyYieldEnabled)}
                color="#00FFB2"
              />
              <ToggleSetting
                label="Open Registration"
                description="Allow new users to register with referral codes"
                enabled={registrationOpen}
                onToggle={() => setRegistrationOpen(!registrationOpen)}
                color="#00E5FF"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <DollarSign size={16} className="text-[#FFB800]" />
              Platform Config
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <ConfigRow label="Daily Yield" value={`${SLOT_CONFIG.dailyYieldPercent}%`} />
              <ConfigRow label="Max Cap Multiplier" value={`${SLOT_CONFIG.maxCapMultiplier}x`} />
              <ConfigRow label="Ascension Split" value={`${SLOT_CONFIG.ascensionSplitPercent}%`} />
              <ConfigRow label="Wallet Split" value={`${SLOT_CONFIG.walletSplitPercent}%`} />
              <ConfigRow label="Yield Allocation" value="50%" />
              <ConfigRow label="Matrix Allocation" value="40%" />
              <ConfigRow label="Pool Allocation" value="10%" />
              <ConfigRow label="Rebuy Max" value="2 per slot" />
              <ConfigRow label="Total Slots" value={`${SLOTS.length} orbits`} />
              <ConfigRow label="Min Price" value={`$${SLOTS[0].price}`} />
              <ConfigRow label="Max Price" value={`$${SLOTS[SLOTS.length - 1].price.toLocaleString()}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-xs font-medium pointer-events-none z-[100]"
          style={{ background: toast.includes('Error') ? 'rgba(255,92,122,0.1)' : 'rgba(0,255,178,0.1)', border: `1px solid ${toast.includes('Error') ? 'rgba(255,92,122,0.2)' : 'rgba(0,255,178,0.2)'}`, color: toast.includes('Error') ? '#FF5C7A' : '#00FFB2' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function ToggleSetting({ label, description, enabled, onToggle, color }: {
  label: string; description: string; enabled: boolean; onToggle: () => void; color: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.06)]">
      <div>
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-[#94A3B8] text-xs mt-0.5">{description}</p>
      </div>
      <button onClick={onToggle} className="relative">
        <div className={`w-12 h-6 rounded-full transition-colors ${enabled ? '' : 'bg-[rgba(148,163,184,0.2)]'}`}
          style={enabled ? { background: `${color}25` } : {}}>
          <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-md ${enabled ? 'left-[26px]' : 'left-0.5'}`}
            style={{ background: enabled ? color : '#94A3B8' }} />
        </div>
      </button>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[rgba(0,229,255,0.04)] last:border-0">
      <span className="text-[#94A3B8] text-xs">{label}</span>
      <span className="text-white text-xs font-mono font-bold">{value}</span>
    </div>
  );
}
