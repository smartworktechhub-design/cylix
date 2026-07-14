'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatCurrency, formatDate, shortenAddress } from '@/lib/utils';
import { getCampaignRequests, updateCampaignRequest } from '@/lib/db';
import { CheckCircle, XCircle, DollarSign, Clock, Loader2, Send } from 'lucide-react';

type TabType = 'all' | 'pending' | 'approved' | 'rejected' | 'paid';

interface RequestRow {
  id: string;
  campaignId: string;
  userId: string;
  userWallet: string;
  verifiedRefs: number;
  rewardAmount: number;
  status: string;
  adminNote: string;
  createdAt: string;
  reviewedAt: string;
  paidAt: string;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'paid', label: 'Paid' },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending: { color: '#FFB800', bg: 'rgba(255, 184, 0, 0.1)' },
  approved: { color: '#00FFB2', bg: 'rgba(0, 255, 178, 0.1)' },
  rejected: { color: '#FF5C7A', bg: 'rgba(255, 92, 122, 0.1)' },
  paid: { color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.1)' },
};

export default function AdminCampaignRequests() {
  useEffect(() => { document.title = 'Campaign Requests — CYLIX'; }, []);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [requests, setRequests] = useState<RequestRow[]>([]);

  async function loadRequests() {
    const data = await getCampaignRequests();
    setRequests(data.map((r: any) => ({
      id: r.id,
      campaignId: r.campaign_id,
      userId: r.user_id,
      userWallet: r.users?.wallet || '',
      verifiedRefs: Number(r.verified_refs),
      rewardAmount: Number(r.reward_amount),
      status: r.status,
      adminNote: r.admin_note || '',
      createdAt: r.created_at,
      reviewedAt: r.reviewed_at || '',
      paidAt: r.paid_at || '',
    })));
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadRequests();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function handleAction(id: string, status: string) {
    setActionLoading(id);
    await updateCampaignRequest(id, status);
    await loadRequests();
    setActionLoading(null);
  }

  const filtered = activeTab === 'all' ? requests : requests.filter(r => r.status === activeTab);
  const pendingTotal = requests.filter(r => r.status === 'pending').reduce((s, r) => s + r.rewardAmount, 0);
  const approvedTotal = requests.filter(r => r.status === 'approved').reduce((s, r) => s + r.rewardAmount, 0);
  const paidTotal = requests.filter(r => r.status === 'paid').reduce((s, r) => s + r.rewardAmount, 0);

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
        <h2 className="text-2xl font-bold text-white font-heading">Campaign Requests</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Review and process reward requests</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
              <Clock size={20} className="text-[#FFB800]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Pending Rewards</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(pendingTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
              <CheckCircle size={20} className="text-[#00FFB2]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Approved Total</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(approvedTotal)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <DollarSign size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Paid</p>
              <p className="text-white font-bold font-mono text-lg">{formatCurrency(paidTotal)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[rgba(11,16,32,0.8)] w-fit">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[#94A3B8] text-sm">{filtered.length} requests</span>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>User</TableHeader>
                <TableHeader>Wallet</TableHeader>
                <TableHeader>Verified Refs</TableHeader>
                <TableHeader>Reward</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Requested</TableHeader>
                {(activeTab === 'all' || activeTab === 'pending') && <TableHeader>Actions</TableHeader>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((r) => {
                const cfg = statusConfig[r.status] || statusConfig.pending;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-[#00E5FF]">{r.userId.slice(0, 8)}...</TableCell>
                    <TableCell className="font-mono text-xs text-[#94A3B8]">{shortenAddress(r.userWallet, 6)}</TableCell>
                    <TableCell className="font-mono text-white">{r.verifiedRefs}</TableCell>
                    <TableCell className="font-mono font-bold">{formatCurrency(r.rewardAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={r.status === 'approved' || r.status === 'paid' ? 'success' : r.status === 'rejected' ? 'danger' : 'warning'}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#94A3B8] text-xs">{formatDate(r.createdAt)}</TableCell>
                    {(activeTab === 'all' || activeTab === 'pending') && (
                      <TableCell>
                        {r.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              loading={actionLoading === r.id}
                              onClick={() => handleAction(r.id, 'approved')}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={actionLoading === r.id}
                              onClick={() => handleAction(r.id, 'rejected')}
                            >
                              <XCircle size={14} />
                              Reject
                            </Button>
                          </div>
                        ) : r.status === 'approved' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={actionLoading === r.id}
                            onClick={() => handleAction(r.id, 'paid')}
                          >
                            <Send size={14} />
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[#94A3B8] text-xs">---</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <td colSpan={7} className="text-center text-[#94A3B8] py-8">
                    No {activeTab === 'all' ? '' : activeTab} requests found
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
