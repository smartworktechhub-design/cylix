'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, shortenAddress } from '@/lib/utils';
import { getAllUsers, purchaseSlot } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import { SLOTS } from '@/lib/constants';
import { Search, Loader2, ArrowUpRight, Users as TeamIcon, Zap } from 'lucide-react';
import type { User } from '@/types';

interface UserRow {
  id: string;
  wallet: string;
  referralCode: string;
  totalInvested: number;
  totalEarned: number;
  directs: number;
  teamSize: number;
  ascensionBalance: number;
  isActive: boolean;
  activeSlots: number;
  ipAddress?: string;
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [activating, setActivating] = useState<string | null>(null);
  const [slotFilter, setSlotFilter] = useState('spark');

  async function load() {
    setLoading(true);
    const { data: slotData } = await getSupabase()
      .from('user_slots')
      .select('user_id')
      .eq('status', 'active');

    const activeSlotsMap: Record<string, number> = {};
    (slotData || []).forEach((s: Record<string, unknown>) => {
      const uid = String(s.user_id || '');
      activeSlotsMap[uid] = (activeSlotsMap[uid] || 0) + 1;
    });

    const users = await getAllUsers();
    setAllUsers(users.map((u: User) => ({
      id: u.id,
      wallet: u.wallet,
      referralCode: u.referralCode,
      totalInvested: u.totalInvested,
      totalEarned: u.totalEarned,
      directs: u.directs,
      teamSize: u.teamSize,
      ascensionBalance: u.ascensionBalance,
      isActive: u.isActive,
      activeSlots: activeSlotsMap[u.id] || 0,
      ipAddress: u.ipAddress,
    })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = allUsers.filter((u) =>
    u.wallet.toLowerCase().includes(search.toLowerCase()) ||
    u.referralCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleActivate = async (userId: string) => {
    setActivating(userId);
    const result = await purchaseSlot(userId, slotFilter);
    if (result) {
      await load();
    }
    setActivating(null);
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
          <h2 className="text-2xl font-bold text-white font-heading">User Management</h2>
          <p className="text-[#94A3B8] text-sm mt-1">{formatNumber(allUsers.length)} registered users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search by wallet or referral code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
            <select value={slotFilter} onChange={(e) => setSlotFilter(e.target.value)}
              className="bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-3 py-2 text-xs text-white font-mono">
              {SLOTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Referral Code</TableHeader>
                <TableHeader>Total Invested</TableHeader>
                <TableHeader>Total Earned</TableHeader>
                <TableHeader>Active Slots</TableHeader>
                <TableHeader>Team Size</TableHeader>
                <TableHeader>Ascension Balance</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-[#00E5FF] text-xs">{shortenAddress(user.wallet, 6)}</TableCell>
                  <TableCell className="font-mono text-xs text-[#7B61FF]">{user.referralCode}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(user.totalInvested)}</TableCell>
                  <TableCell className="font-mono text-[#00FFB2]">{formatCurrency(user.totalEarned)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight size={14} className="text-[#00E5FF]" />
                      <span className="font-mono">{user.activeSlots}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <TeamIcon size={14} className="text-[#94A3B8]" />
                      <span className="font-mono">{formatNumber(user.teamSize)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[#FFB800]">{formatCurrency(user.ascensionBalance)}</TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'default'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="primary" size="sm" onClick={() => handleActivate(user.id)}
                      loading={activating === user.id} disabled={activating === user.id}>
                      <Zap size={12} /> Activate
                    </Button>
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
