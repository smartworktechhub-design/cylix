'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, shortenAddress, formatDate } from '@/lib/utils';
import { getSupabase } from '@/lib/supabase';
import { Activity, Loader2, UserPlus, Zap, DollarSign, Shield, Ban, Settings, ArrowUpRight } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  target_user: string;
  details: string;
  admin_email: string;
  created_at: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  user_register: <UserPlus size={14} className="text-[#00FFB2]" />,
  slot_activate: <Zap size={14} className="text-[#00E5FF]" />,
  withdrawal: <DollarSign size={14} className="text-[#FFB800]" />,
  ban: <Ban size={14} className="text-[#FF5C7A]" />,
  unban: <Shield size={14} className="text-[#00FFB2]" />,
  roi_toggle: <Settings size={14} className="text-[#7B61FF]" />,
  login: <Shield size={14} className="text-[#94A3B8]" />,
  default: <Activity size={14} className="text-[#94A3B8]" />,
};

const actionColors: Record<string, string> = {
  user_register: 'success',
  slot_activate: 'info',
  withdrawal: 'warning',
  ban: 'danger',
  unban: 'success',
  roi_toggle: 'primary',
  login: 'default',
};

export default function ActivityLogPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  async function load() {
    setLoading(true);
    const { data } = await getSupabase().from('admin_activity_log')
      .select('*').order('created_at', { ascending: false }).limit(100);
    setLogs((data || []) as LogEntry[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
        <h2 className="text-2xl font-bold text-white font-heading">Activity Log</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Recent admin actions and system events</p>
      </div>

      <Card>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity size={48} className="text-[#94A3B8]/20 mx-auto mb-4" />
              <p className="text-[#94A3B8] text-sm">No activity logged yet</p>
              <p className="text-[#94A3B8]/60 text-xs mt-1">Actions will appear here as you manage users</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-[rgba(11,16,32,0.3)] border border-[rgba(0,229,255,0.04)] hover:border-[rgba(0,229,255,0.1)] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(0,229,255,0.05)] flex items-center justify-center">
                    {actionIcons[log.action] || actionIcons.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={(actionColors[log.action] as any) || 'default'}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                      {log.target_user && (
                        <span className="text-[#00E5FF] text-xs font-mono">{shortenAddress(log.target_user, 8)}</span>
                      )}
                    </div>
                    <p className="text-[#94A3B8] text-xs mt-1 truncate">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[#94A3B8] text-xs">{formatDate(log.created_at)}</p>
                    <p className="text-[#94A3B8]/60 text-[10px]">{log.admin_email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
