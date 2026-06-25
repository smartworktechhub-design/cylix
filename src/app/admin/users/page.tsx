'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatNumber, shortenAddress } from '@/lib/utils';
import { getAllUsers } from '@/lib/db';
import { getSupabase } from '@/lib/supabase';
import { Search, Loader2, ArrowUpRight, Users as TeamIcon } from 'lucide-react';
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
}

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
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
      if (!mounted) return;
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
      })));
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = allUsers.filter((u) =>
    u.wallet.toLowerCase().includes(search.toLowerCase())
  );

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
                placeholder="Search by wallet address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search size={16} />}
              />
            </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
