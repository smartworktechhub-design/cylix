'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { useInitData } from '@/lib/use-data';
import { createTicket, getUserTickets } from '@/lib/db';
import { useAppStore } from '@/stores/app-store';
import {
  MessageSquare, ChevronDown, ChevronUp,
  Send, CheckCircle, AlertCircle, Search,
  Mail, Ticket, Plus, Loader2, Clock
} from 'lucide-react';

const statusColors: Record<string, string> = {
  open: '#FF5C7A', in_progress: '#FFB800', resolved: '#00FFB2', closed: '#94A3B8',
};
const priorityColors: Record<string, string> = {
  low: '#94A3B8', medium: '#FFB800', high: '#FF5C7A', urgent: '#FF5C7A',
};

export default function SupportPage() {
  useInitData();
  const { user } = useAppStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  async function load() {
    if (!user?.id) return;
    const data = await getUserTickets(user.id);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => { if (user?.id) load(); }, [user?.id]);

  async function handleSubmit() {
    if (!subject || !message || !user?.id) return;
    setSubmitting(true);
    setSubmitError('');
    const result = await createTicket(user.id, subject, message, priority);
    if (!result.success) {
      setSubmitError(result.error || 'Failed to create ticket');
      setSubmitting(false);
      return;
    }
    setSubject('');
    setMessage('');
    setPriority('medium');
    setSubmitting(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Support</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Get help and contact our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[rgba(123,97,255,0.1)] flex items-center justify-center">
                <Mail size={18} className="text-[#7B61FF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">support@cylix.io</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8]">Avg response time: 4 hrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                <Ticket size={18} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Tickets</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Open: {tickets.filter((t) => t.status === 'open').length}</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8]">Avg response time: 6 hrs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Submit a Ticket</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              icon={<MessageSquare size={14} />}
            />
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Message</label>
              <textarea
                className="w-full h-28 px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm transition-all duration-200 focus:outline-none focus:border-[rgba(0,229,255,0.3)] focus:shadow-[0_0_10px_rgba(0,229,255,0.05)] resize-none"
                placeholder="Describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Select
              label="Priority"
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            {submitError && (
              <div className="flex items-center gap-2 text-[#FF5C7A] text-xs">
                <AlertCircle size={12} /> {submitError}
              </div>
            )}
            <Button variant="primary" className="w-full" disabled={!subject || !message || submitting} onClick={handleSubmit}>
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">My Tickets</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-[#00E5FF]" /></div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket size={32} className="mx-auto text-[#94A3B8] mb-2 opacity-40" />
                <p className="text-[#94A3B8] text-sm">No tickets yet</p>
              </div>
            ) : tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)] border border-transparent hover:border-[rgba(0,229,255,0.08)] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-white font-medium">{t.subject}</p>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="default" style={{
                      background: `${priorityColors[t.priority] || '#94A3B8'}20`,
                      color: priorityColors[t.priority] || '#94A3B8',
                      border: `1px solid ${priorityColors[t.priority] || '#94A3B8'}30`,
                      fontSize: '10px', padding: '2px 6px',
                    }}>{t.priority}</Badge>
                    <Badge variant="default" style={{
                      background: `${statusColors[t.status] || '#94A3B8'}20`,
                      color: statusColors[t.status] || '#94A3B8',
                      border: `1px solid ${statusColors[t.status] || '#94A3B8'}30`,
                      fontSize: '10px', padding: '2px 6px',
                    }}>{t.status === 'in_progress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1)}</Badge>
                  </div>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">{t.message?.slice(0, 80)}{t.message?.length > 80 ? '...' : ''}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock size={10} className="text-[#94A3B8]" />
                  <span className="text-[10px] text-[#94A3B8]">{formatDate(t.createdAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
