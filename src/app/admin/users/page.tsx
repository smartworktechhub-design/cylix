'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, shortenAddress, formatDate, formatNumber } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { Search, Edit2, Ban, CheckCircle, XCircle, Users, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    getSupabase().from('users').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setAllUsers((data || []).map((u: any) => ({
        id: u.id,
        wallet: u.wallet,
        package: u.rank || 'N/A',
        invested: Number(u.total_invested),
        joined: u.created_at,
        status: u.is_active ? 'active' as const : u.is_active === false ? 'inactive' as const : 'active' as const,
        earnings: Number(u.total_earned),
      })));
      setLoading(false);
    });
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
            <div className="flex-1">
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
                <TableHeader>Package</TableHeader>
                <TableHeader>Joined</TableHeader>
                <TableHeader>Invested</TableHeader>
                <TableHeader>Earnings</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.wallet}>
                  <TableCell className="font-mono text-[#00E5FF] text-xs">{shortenAddress(user.wallet, 6)}</TableCell>
                  <TableCell>{user.package}</TableCell>
                  <TableCell className="text-[#94A3B8] text-xs">{formatDate(user.joined)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(user.invested)}</TableCell>
                  <TableCell className="font-mono text-[#00FFB2]">{formatCurrency(user.earnings)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active' ? 'success' :
                        user.status === 'suspended' ? 'danger' : 'default'
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={user.status === 'suspended' ? 'text-[#00FFB2]' : 'text-[#FF5C7A]'}
                      >
                        {user.status === 'suspended' ? <CheckCircle size={14} /> : <Ban size={14} />}
                      </Button>
                    </div>
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
