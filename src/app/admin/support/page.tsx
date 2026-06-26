'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { Select } from '@/components/ui/select';
import { formatDate, shortenAddress } from '@/lib/utils';
import { getAllTickets, updateTicketStatus } from '@/lib/db';
import { MessageSquare, CheckCircle, Clock, AlertCircle, Loader2, RefreshCw, Search } from 'lucide-react';

const statusColors: Record<string, string> = {
  open: '#FF5C7A', in_progress: '#FFB800', resolved: '#00FFB2', closed: '#94A3B8',
};
const priorityColors: Record<string, string> = {
  low: '#94A3B8', medium: '#FFB800', high: '#FF5C7A', urgent: '#FF5C7A',
};

export default function AdminSupport() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const data = await getAllTickets();
      if (data.length > 0) {
        setTickets(data);
      }
    } catch {
      // table may not exist
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateTicketStatus(id, status);
      setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
      if (selectedTicket?.id === id) setSelectedTicket((prev: any) => ({ ...prev, status }));
    } catch {}
  }

  const filtered = tickets.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (search && !t.subject?.toLowerCase().includes(search.toLowerCase()) && !t.wallet?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          <h2 className="text-2xl font-bold text-white font-heading">Support Tickets</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Manage user support requests</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw size={14} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <input
              className="w-full px-4 py-3 pl-10 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  statusFilter === s
                    ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                    : 'text-[#94A3B8] hover:text-white bg-[rgba(11,16,32,0.5)]'
                }`}
              >
                {s === 'in_progress' ? 'In Progress' : s}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filtered.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-[rgba(0,229,255,0.08)] border border-[rgba(0,229,255,0.15)]'
                    : 'bg-[rgba(11,16,32,0.5)] border border-transparent hover:border-[rgba(0,229,255,0.08)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-[#00E5FF]">{ticket.id?.toString().slice(0, 8)}...</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: priorityColors[ticket.priority] || '#94A3B8' }} />
                    <span className="w-2 h-2 rounded-full" style={{ background: statusColors[ticket.status] || '#94A3B8' }} />
                  </div>
                </div>
                <p className="text-sm text-white truncate">{ticket.subject}</p>
                <p className="text-xs text-[#94A3B8] mt-1">{shortenAddress(ticket.wallet)}</p>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-[#94A3B8] text-sm py-8">No tickets found</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold font-heading">{selectedTicket.subject}</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {shortenAddress(selectedTicket.wallet)} &middot; {formatDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default" style={{
                      background: `${statusColors[selectedTicket.status] || '#94A3B8'}20`,
                      color: statusColors[selectedTicket.status] || '#94A3B8',
                      border: `1px solid ${statusColors[selectedTicket.status] || '#94A3B8'}30`,
                    }}>
                      {selectedTicket.status === 'in_progress' ? 'In Progress' : selectedTicket.status}
                    </Badge>
                    <Badge variant="default" style={{
                      background: `${priorityColors[selectedTicket.priority] || '#94A3B8'}20`,
                      color: priorityColors[selectedTicket.priority] || '#94A3B8',
                      border: `1px solid ${priorityColors[selectedTicket.priority] || '#94A3B8'}30`,
                    }}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{selectedTicket.message || 'No message'}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-[#94A3B8] mb-2">Status</p>
                  <Select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    options={[
                      { value: 'open', label: 'Open' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'resolved', label: 'Resolved' },
                      { value: 'closed', label: 'Closed' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94A3B8] mb-2">Reply</label>
                  <textarea
                    className="w-full h-24 px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button disabled={!replyText}>
                    <MessageSquare size={14} />
                    Send Reply
                  </Button>
                  <Button variant="outline" onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}>
                    <CheckCircle size={14} />
                    Mark Resolved
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageSquare size={48} className="text-[#94A3B8] mb-4 opacity-30" />
                <p className="text-[#94A3B8] text-sm">Select a ticket to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
