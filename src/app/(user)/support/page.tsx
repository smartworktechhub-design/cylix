'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { getUserByWallet } from '@/lib/db';
import {
  MessageSquare, HelpCircle, ChevronDown, ChevronUp,
  Send, Clock, CheckCircle, AlertCircle, Headphones,
  Mail, Phone, LifeBuoy, Ticket, Plus
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

const faqs = [
  { q: 'How do I purchase a package?', a: 'Navigate to the Packages page, select your desired package, and follow the checkout process. You will need a connected wallet with sufficient funds.' },
  { q: 'When are daily earnings distributed?', a: 'Daily earnings are distributed every 24 hours from the time of your package activation. You can track your earnings in the dashboard.' },
  { q: 'How does the referral system work?', a: 'Share your unique referral code or link. When someone signs up using your code and purchases a package, you earn a commission based on the tier structure.' },
  { q: 'What is the Apex Pool?', a: 'The Apex Pool is a competitive prize pool that runs in cycles. Participants compete based on their volume, and top performers share the prize pool at the end of each cycle.' },
  { q: 'How do I withdraw my earnings?', a: 'Go to the Wallet section, click Withdraw, enter the amount, and confirm the transaction. Withdrawals are processed within 24 hours.' },
  { q: 'What happens if my package expires?', a: 'If your package reaches its end date, it will stop generating daily earnings. You can renew or upgrade to a new package at any time.' },
];

const tickets = [
  { id: 'TKT-001', subject: 'Withdrawal not received', status: 'open', priority: 'high', date: '2026-06-20T10:30:00Z', updated: '2026-06-21T08:00:00Z' },
  { id: 'TKT-002', subject: 'Package activation issue', status: 'in-progress', priority: 'medium', date: '2026-06-18T14:00:00Z', updated: '2026-06-19T11:00:00Z' },
  { id: 'TKT-003', subject: 'Referral commission query', status: 'resolved', priority: 'low', date: '2026-06-15T09:00:00Z', updated: '2026-06-16T16:00:00Z' },
  { id: 'TKT-004', subject: 'Account verification', status: 'resolved', priority: 'medium', date: '2026-06-10T12:00:00Z', updated: '2026-06-11T10:00:00Z' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const statusVariant: Record<string, 'warning' | 'info' | 'success'> = {
  open: 'warning',
  'in-progress': 'info',
  resolved: 'success',
};

const priorityColors: Record<string, string> = {
  low: '#94A3B8',
  medium: '#FFB800',
  high: '#FF5C7A',
  urgent: '#FF5C7A',
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<string | null>('0');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => {
    getUserByWallet(DEMO_WALLET).then((user) => {
      // User data available if needed for prefilling support forms
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Support</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Get help and contact our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <Headphones size={18} className="text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Live Chat</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#00FFB2]" />
                  <span className="text-xs text-[#00FFB2]">Online</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8]">Avg response time: 2 min</p>
          </CardContent>
        </Card>
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
                <MessageSquare size={18} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Tickets</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Open: 1</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8]">Avg response time: 6 hrs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[rgba(255,92,122,0.1)] flex items-center justify-center">
                <LifeBuoy size={18} className="text-[#FF5C7A]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Knowledge Base</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Browse articles</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8]">Self-service help</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === String(i);
              return (
                <div key={i} className="border-b border-[rgba(148,163,184,0.05)] last:border-0">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : String(i))}
                    className="w-full flex items-center justify-between py-3 text-left"
                  >
                    <span className="text-sm text-white">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={14} className="text-[#00E5FF] shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-[#94A3B8] shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-[#94A3B8] pb-3 pr-6 leading-relaxed">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Contact Us</h3>
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
              options={priorityOptions}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
            <Button variant="primary" className="w-full" disabled={!subject || !message}>
              <Send size={14} />
              Submit Ticket
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Ticket History</h3>
            </div>
            <Button variant="primary" size="sm">
              <Plus size={14} />
              New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Ticket ID</TableHeader>
                <TableHeader>Subject</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Priority</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Updated</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-[#00E5FF]">{ticket.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{ticket.subject}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[ticket.status] || 'default'}>
                      {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: priorityColors[ticket.priority] }} />
                      <span className="text-sm text-[#94A3B8] capitalize">{ticket.priority}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-sm">{formatDate(ticket.date)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[#94A3B8] text-sm">{formatDate(ticket.updated)}</span>
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
