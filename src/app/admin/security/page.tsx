'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { Shield, History, Users, Key, AlertTriangle, CheckCircle, XCircle, Globe, Loader2, RefreshCw } from 'lucide-react';

function shortenAddr(addr: string) {
  if (!addr) return '---';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}

export default function AdminSecurity() {
  useEffect(() => { document.title = 'Security — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [adminCount, setAdminCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [bannedUsers, setBannedUsers] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [banAppeals, setBanAppeals] = useState<any[]>([]);

  async function loadData() {
    setLoading(true);
    const sb = getSupabase();
    try {
      const [
        { count: admins },
        { count: users },
        { count: banned },
        { data: rUsers },
        { data: rTx },
        { data: appeals },
      ] = await Promise.all([
        sb.from('admins').select('id', { count: 'exact', head: true }),
        sb.from('users').select('id', { count: 'exact', head: true }),
        sb.from('users').select('id', { count: 'exact', head: true }).eq('is_active', false),
        sb.from('users').select('id, wallet, referral_code, is_active, created_at, last_ip').order('created_at', { ascending: false }).limit(10),
        sb.from('transactions').select('id, user_id, type, amount, description, created_at').order('created_at', { ascending: false }).limit(15),
        sb.from('ban_appeals').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      setAdminCount(admins || 0);
      setTotalUsers(users || 0);
      setBannedUsers(banned || 0);
      setRecentUsers(rUsers || []);
      setRecentTransactions(rTx || []);
      setBanAppeals(appeals || []);
    } catch (e) {
      console.error('Security load error:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-heading">Security</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Platform security overview and admin access</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Users size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Users</p>
              <p className="text-white font-bold font-mono text-lg">{totalUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
              <Shield size={20} className="text-[#7B61FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Admin Accounts</p>
              <p className="text-white font-bold font-mono text-lg">{adminCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,92,122,0.1)] flex items-center justify-center">
              <XCircle size={20} className="text-[#FF5C7A]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Banned Users</p>
              <p className="text-white font-bold font-mono text-lg">{bannedUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <AlertTriangle size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Pending Appeals</p>
              <p className="text-white font-bold font-mono text-lg">{banAppeals.filter((a: any) => a.status === 'pending').length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History size={16} className="text-[#00E5FF]" />
              <h3 className="text-white font-semibold font-heading">Recent Users</h3>
            </div>
            <p className="text-[#94A3B8] text-sm">Latest registered users</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Wallet</TableHeader>
                  <TableHeader>Ref Code</TableHeader>
                  <TableHeader>IP</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Joined</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{shortenAddr(u.wallet)}</TableCell>
                    <TableCell className="font-mono text-xs">{u.referral_code}</TableCell>
                    <TableCell className="font-mono text-xs text-[#94A3B8]">{u.last_ip || '---'}</TableCell>
                    <TableCell>
                      {u.is_active ? (
                        <Badge variant="success"><CheckCircle size={10} className="mr-1" />Active</Badge>
                      ) : (
                        <Badge variant="danger"><XCircle size={10} className="mr-1" />Banned</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{formatDate(u.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-[#7B61FF]" />
              <h3 className="text-white font-semibold font-heading">Recent Transactions</h3>
            </div>
            <p className="text-[#94A3B8] text-sm">Latest platform activity</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Amount</TableHeader>
                  <TableHeader>Description</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.slice(0, 10).map((tx: any) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge variant={tx.type === 'slot_purchase' ? 'info' : tx.type.includes('earning') ? 'success' : 'default'}>
                        {tx.type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">${Number(tx.amount).toFixed(2)}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8] truncate max-w-[150px]">{tx.description || '---'}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{formatDate(tx.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#FF5C7A]" />
            <h3 className="text-white font-semibold font-heading">Ban Appeals</h3>
          </div>
          <p className="text-[#94A3B8] text-sm">Recent user ban appeal requests</p>
        </CardHeader>
        <CardContent>
          {banAppeals.length === 0 ? (
            <p className="text-[#94A3B8] text-sm text-center py-6">No ban appeals yet</p>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>User ID</TableHeader>
                  <TableHeader>Wallet</TableHeader>
                  <TableHeader>Reason</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Date</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {banAppeals.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{a.user_id?.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs">{shortenAddr(a.wallet)}</TableCell>
                    <TableCell className="text-xs text-[#94A3B8] truncate max-w-[200px]">{a.reason}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === 'pending' ? 'warning' : a.status === 'approved' ? 'success' : 'danger'}>
                        {a.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-[#94A3B8]">{formatDate(a.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
