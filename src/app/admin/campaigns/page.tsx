'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getAllCampaigns, createCampaign, toggleCampaign } from '@/lib/db';
import { Megaphone, Plus, ToggleLeft, ToggleRight, Clock, DollarSign, Users, Loader2 } from 'lucide-react';

interface CampaignRow {
  id: string;
  name: string;
  description: string;
  rewardPerReferral: number;
  minReferralsRequired: number;
  durationHours: number;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
}

export default function AdminCampaigns() {
  useEffect(() => { document.title = 'Campaign Management — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [form, setForm] = useState({
    name: '', description: '', durationHours: '24',
    rewardPerReferral: '10', minReferrals: '5',
  });

  async function loadCampaigns() {
    const data = await getAllCampaigns();
    setCampaigns(data.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      rewardPerReferral: Number(c.reward_per_referral),
      minReferralsRequired: Number(c.min_referrals_required),
      durationHours: Number(c.duration_hours),
      startTime: c.start_time,
      endTime: c.end_time,
      isEnabled: c.is_enabled,
    })));
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadCampaigns();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function handleCreate() {
    if (!form.name.trim()) return;
    setCreating(true);
    await createCampaign(
      form.name.trim(),
      form.description.trim(),
      Number(form.durationHours),
      Number(form.rewardPerReferral),
      Number(form.minReferrals),
    );
    setForm({ name: '', description: '', durationHours: '24', rewardPerReferral: '10', minReferrals: '5' });
    await loadCampaigns();
    setCreating(false);
  }

  async function handleToggle(id: string, enabled: boolean) {
    await toggleCampaign(id, enabled);
    await loadCampaigns();
  }

  const activeCampaign = campaigns.find(c => c.isEnabled && new Date(c.endTime) > new Date());
  const totalRewards = campaigns.reduce((s, c) => s + c.rewardPerReferral, 0);

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
        <h2 className="text-2xl font-bold text-white font-heading">Campaign Management</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Create and manage referral reward campaigns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Megaphone size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Campaigns</p>
              <p className="text-white font-bold font-mono text-lg">{campaigns.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <ToggleRight size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Active Campaign</p>
              <p className="text-white font-bold font-mono text-lg">{activeCampaign ? activeCampaign.name : 'None'}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Reward Rate Range</p>
              <p className="text-white font-bold font-mono text-lg">${Math.min(...campaigns.map(c => c.rewardPerReferral))} - ${Math.max(...campaigns.map(c => c.rewardPerReferral))}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-[#00E5FF]" />
            <h3 className="text-white font-semibold font-heading">Create New Campaign</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              label="Campaign Name"
              placeholder="Summer Referral Boost"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Description"
              placeholder="Earn extra for referring friends"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Input
              label="Duration (hours)"
              type="number"
              placeholder="24"
              value={form.durationHours}
              onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
            />
            <Input
              label="Reward per Referral ($)"
              type="number"
              placeholder="10"
              value={form.rewardPerReferral}
              onChange={(e) => setForm({ ...form, rewardPerReferral: e.target.value })}
            />
            <Input
              label="Min Referrals Required"
              type="number"
              placeholder="5"
              value={form.minReferrals}
              onChange={(e) => setForm({ ...form, minReferrals: e.target.value })}
            />
          </div>
          <Button
            onClick={handleCreate}
            loading={creating}
            disabled={!form.name.trim()}
            className="mt-4"
          >
            <Plus size={16} />
            Create Campaign
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-[#7B61FF]" />
            <h3 className="text-white font-semibold font-heading">All Campaigns</h3>
          </div>
          <span className="text-[#94A3B8] text-sm">{campaigns.length} campaigns</span>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Reward/Ref</TableHeader>
                <TableHeader>Min Refs</TableHeader>
                <TableHeader>Start</TableHeader>
                <TableHeader>End</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Toggle</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((c) => {
                const isActive = c.isEnabled && new Date(c.endTime) > new Date();
                const isExpired = new Date(c.endTime) <= new Date();
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-white">{c.name}</TableCell>
                    <TableCell className="text-[#94A3B8] text-xs max-w-[200px] truncate">{c.description || '---'}</TableCell>
                    <TableCell className="font-mono text-[#00FFB2]">{formatCurrency(c.rewardPerReferral)}</TableCell>
                    <TableCell className="font-mono text-white">{c.minReferralsRequired}</TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(c.startTime)}</TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(c.endTime)}</TableCell>
                    <TableCell>
                      <Badge variant={isActive ? 'success' : isExpired ? 'danger' : c.isEnabled ? 'warning' : 'default'}>
                        {isActive ? 'Active' : isExpired ? 'Expired' : c.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggle(c.id, !c.isEnabled)}
                        className="text-[#94A3B8] hover:text-white transition-colors"
                      >
                        {c.isEnabled ? (
                          <ToggleRight size={24} className="text-[#00FFB2]" />
                        ) : (
                          <ToggleLeft size={24} />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {campaigns.length === 0 && (
                <TableRow>
                  <td colSpan={8} className="text-center text-[#94A3B8] py-8">
                    No campaigns created yet
                  </td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
