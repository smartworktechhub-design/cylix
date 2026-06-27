'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { getAllNotifications, deleteNotification } from '@/lib/db';
import { Bell, Send, Info, AlertTriangle, CheckCircle, Loader2, Globe, MessageSquare, Trash2 } from 'lucide-react';

const typeColors: Record<string, string> = {
  system: '#94A3B8', earnings: '#00E5FF', slot: '#7B61FF',
  pool: '#00FFB2', announcement: '#FFB800', withdrawal: '#FF5C7A',
};

export default function AdminNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    if (await deleteNotification(id)) load();
    setDeleting(null);
  }

  async function handleSend() {
    if (!title || !message) return;
    setSendStatus('sending');
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type }),
      });
      let data: any = {};
      try { data = await res.json(); } catch { data = { error: `HTTP ${res.status} - ${res.statusText}` }; }
      if (data.success) {
        setSendStatus('sent');
        setTitle('');
        setMessage('');
        setTimeout(() => setSendStatus('idle'), 3000);
        load();
      } else {
        setSendStatus('error');
        setSendError(data.error || `HTTP ${res.status}`);
        setTimeout(() => setSendStatus('idle'), 5000);
      }
    } catch {
      setSendStatus('error');
      setSendError('Network error - request failed');
      setTimeout(() => setSendStatus('idle'), 5000);
    }
  }

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
        <h2 className="text-2xl font-bold text-white font-heading">Notifications</h2>
        <p className="text-[#94A3B8] text-sm mt-1">View and send platform notifications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Send Notification</h3>
            <p className="text-[#94A3B8] text-sm">Broadcast to all users</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Type</label>
              <div className="flex gap-2">
                {['announcement', 'system', 'earnings'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                      type === t
                        ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                        : 'text-[#94A3B8] hover:text-white bg-[rgba(11,16,32,0.5)]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Title</label>
              <input
                className="w-full px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Message</label>
              <textarea
                className="w-full h-24 px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none"
                placeholder="Notification message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSend} disabled={sendStatus === 'sending' || !title || !message}>
              {sendStatus === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {sendStatus === 'sending' ? 'Sending...' : 'Send to All Users'}
            </Button>
            {sendStatus === 'sent' && (
              <div className="flex items-center gap-2 text-[#00FFB2] text-sm">
                <CheckCircle size={14} /> Notification sent to all users
              </div>
            )}
            {sendStatus === 'error' && (
              <div className="flex flex-col gap-1 text-[#FF5C7A] text-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} /> Failed: {sendError || 'Unknown error'}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#94A3B8]" />
              <h3 className="text-white font-semibold font-heading">Recent Notifications</h3>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.slice(0, 20).map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>
                      <span className="text-sm text-white">{n.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" style={{ background: `${typeColors[n.type] || '#94A3B8'}20`, color: typeColors[n.type] || '#94A3B8', border: `1px solid ${typeColors[n.type] || '#94A3B8'}30` }}>
                        {n.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#94A3B8]">{formatDate(n.timestamp)}</span>
                    </TableCell>
                    <TableCell>
                      <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                        className="p-1.5 rounded-lg text-[#FF5C7A]/60 hover:text-[#FF5C7A] hover:bg-[rgba(255,92,122,0.1)] transition-all disabled:opacity-40">
                        <Loader2 size={14} className={deleting === n.id ? 'animate-spin' : ''} />
                        {deleting !== n.id && <Trash2 size={14} />}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
                {notifications.length === 0 && (
                  <TableRow>
                    <td colSpan={4} className="px-4 py-8 text-center text-[#94A3B8] text-sm">No notifications yet</td>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
