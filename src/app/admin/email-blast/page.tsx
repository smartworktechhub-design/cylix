'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabase } from '@/lib/supabase';
import { formatNumber, formatDate } from '@/lib/utils';
import { Mail, Loader2, Send, Users, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function EmailBlastPage() {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState('');

  async function load() {
    setLoading(true);
    const { data } = await getSupabase().from('launch_emails')
      .select('*').order('created_at', { ascending: false });
    setSubscribers((data || []) as Subscriber[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    // In production, this would call a Brevo API integration
    // For now, we log the intent
    await getSupabase().from('admin_activity_log').insert({
      action: 'email_blast',
      details: `Email blast: "${subject}" to ${subscribers.length} subscribers`,
      admin_email: 'admin',
    });
    setSent(true);
    setSending(false);
    setToast(`Email blast prepared for ${subscribers.length} subscribers!`);
    setTimeout(() => { setToast(''); setSent(false); }, 5000);
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
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Email Blast</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Send emails to launch subscribers</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
                <Users size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Subscribers</p>
                <p className="text-white text-xl font-bold font-mono">{formatNumber(subscribers.length)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,255,178,0.1)] flex items-center justify-center">
                <Send size={20} className="text-[#00FFB2]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Status</p>
                <Badge variant={sent ? 'success' : 'default'}>{sent ? 'Sent!' : 'Ready'}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card hover>
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,184,0,0.1)] flex items-center justify-center">
                <Clock size={20} className="text-[#FFB800]" />
              </div>
              <div>
                <p className="text-[#94A3B8] text-xs">Last Blast</p>
                <p className="text-white text-sm">—</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
              <Mail size={16} className="text-[#00E5FF]" />
              Compose Email
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-[#94A3B8] text-xs mb-1 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
                />
              </div>
              <div>
                <label className="text-[#94A3B8] text-xs mb-1 block">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your email content here..."
                  rows={10}
                  className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none"
                />
              </div>
              <Button
                variant="primary"
                onClick={handleSend}
                loading={sending}
                disabled={sending || !subject.trim() || !body.trim()}
                className="w-full"
              >
                <Send size={14} /> Send to {subscribers.length} Subscribers
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-bold text-white font-heading">Subscriber List</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {subscribers.length === 0 ? (
                <p className="text-[#94A3B8] text-sm text-center py-4">No subscribers yet</p>
              ) : (
                subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 p-2 rounded-lg bg-[rgba(11,16,32,0.3)] border border-[rgba(0,229,255,0.04)]">
                    <div className="w-2 h-2 rounded-full bg-[#00FFB2]" />
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-xs truncate">{sub.email}</p>
                      <p className="text-[#94A3B8] text-[10px]">{formatDate(sub.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-xl text-xs font-medium pointer-events-none z-[100] bg-[rgba(0,255,178,0.1)] border border-[rgba(0,255,178,0.2)] text-[#00FFB2]">
          {toast}
        </div>
      )}
    </div>
  );
}
