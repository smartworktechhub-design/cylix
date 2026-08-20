'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { getAdminToken } from '@/lib/admin-auth';
import { Bell, Send, AlertTriangle, CheckCircle, Loader2, Globe, Trash2, CheckSquare, Square, Search, Users } from 'lucide-react';

const typeColors: Record<string, string> = {
  system: '#94A3B8', earnings: '#00E5FF', slot: '#7B61FF',
  pool: '#00FFB2', announcement: '#FFB800', withdrawal: '#FF5C7A',
};

interface UserOption { id: string; wallet: string }

export default function AdminNotifications() {
  useEffect(() => { document.title = 'Notifications — CYLIX Admin'; }, []);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendError, setSendError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [sendTarget, setSendTarget] = useState<'all' | 'custom'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserOption[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [loadingUsers, setLoadingUsers] = useState(false);

  async function load() {
    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { 'x-admin-token': getAdminToken() },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      const { data } = await sb.from('users').select('id, wallet').order('wallet');
      if (data) setAllUsers(data);
    } catch {}
    setLoadingUsers(false);
  }

  useEffect(() => {
    if (sendTarget === 'custom' && allUsers.length === 0) loadUsers();
  }, [sendTarget]);

  const filteredUsers = allUsers.filter(u =>
    u.wallet.toLowerCase().includes(userSearch.toLowerCase())
  );

  function toggleUserSelection(userId: string) {
    setSelectedUserIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function selectAllFiltered() {
    setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
  }

  async function handleDelete(id: string) {
    const res = await fetch('/api/admin/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ ids: [id] }),
    });
    if (res.ok) load();
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return;
    setBulkDeleting(true);
    const res = await fetch('/api/admin/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
      body: JSON.stringify({ ids: Array.from(selectedIds) }),
    });
    if (res.ok) {
      setSelectedIds(new Set());
      load();
    }
    setBulkDeleting(false);
  }

  function toggleSelectAll() {
    const visible = notifications.slice(0, 50);
    if (selectedIds.size === visible.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visible.map((n: any) => n.id)));
    }
  }

  async function handleSend() {
    if (!title || !message) return;
    setSendStatus('sending');
    try {
      const payload: any = { title, message, type };
      if (sendTarget === 'custom' && selectedUserIds.size > 0) {
        payload.userIds = Array.from(selectedUserIds);
      } else {
        payload.userIds = 'all';
      }
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
        body: JSON.stringify(payload),
      });
      let data: any = {};
      try { data = await res.json(); } catch { data = { error: `HTTP ${res.status}` }; }
      if (data.success) {
        setSendStatus('sent');
        setTitle('');
        setMessage('');
        setUserSearch('');
        setSelectedUserIds(new Set());
        setTimeout(() => setSendStatus('idle'), 3000);
        load();
      } else {
        setSendStatus('error');
        setSendError(data.error || 'Unknown error');
        setTimeout(() => setSendStatus('idle'), 5000);
      }
    } catch {
      setSendStatus('error');
      setSendError('Network error');
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
        <p className="text-[#A8B8D0] text-sm mt-1">Send and manage platform notifications</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-white font-semibold font-heading">Send Notification</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#A8B8D0] mb-2">Type</label>
            <div className="flex gap-2 flex-wrap">
              {['announcement', 'system', 'earnings'].map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    type === t
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                      : 'text-[#A8B8D0] hover:text-white bg-[rgba(11,16,32,0.5)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#A8B8D0] mb-2">Send To</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSendTarget('all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sendTarget === 'all'
                    ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                    : 'text-[#A8B8D0] hover:text-white bg-[rgba(11,16,32,0.5)]'
                }`}
              >
                <Globe size={14} /> All Users
              </button>
              <button
                onClick={() => setSendTarget('custom')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sendTarget === 'custom'
                    ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF] border border-[rgba(0,229,255,0.2)]'
                    : 'text-[#A8B8D0] hover:text-white bg-[rgba(11,16,32,0.5)]'
                }`}
              >
                <Users size={14} /> Select Users
              </button>
            </div>
          </div>

          {sendTarget === 'custom' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B8D0]" />
                  <input
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#A8B8D0]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
                    placeholder="Search by wallet address..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="sm" onClick={selectAllFiltered} className="text-xs shrink-0">
                  Select All
                </Button>
              </div>
              {loadingUsers ? (
                <div className="flex items-center justify-center py-4"><Loader2 size={20} className="animate-spin text-[#00E5FF]" /></div>
              ) : (
                <div className="max-h-40 overflow-y-auto rounded-xl border border-[rgba(0,229,255,0.08)] bg-[rgba(11,16,32,0.4)]">
                  {filteredUsers.slice(0, 50).map(u => (
                    <label
                      key={u.id}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-[rgba(0,229,255,0.04)] cursor-pointer border-b border-[rgba(0,229,255,0.04)] last:border-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(u.id)}
                        onChange={() => toggleUserSelection(u.id)}
                        className="sr-only"
                      />
                      {selectedUserIds.has(u.id)
                        ? <CheckSquare size={16} className="text-[#00E5FF] shrink-0" />
                        : <Square size={16} className="text-[#A8B8D0]/40 shrink-0" />}
                      <span className="text-xs font-mono text-[#A8B8D0] truncate">{u.wallet}</span>
                    </label>
                  ))}
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-[#A8B8D0] text-xs py-4">No users found</p>
                  )}
                </div>
              )}
              {selectedUserIds.size > 0 && (
                <p className="text-xs text-[#00E5FF]">{selectedUserIds.size} user(s) selected</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#A8B8D0] mb-2">Title</label>
            <input
              className="w-full px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#A8B8D0]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)]"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A8B8D0] mb-2">Message</label>
            <textarea
              className="w-full h-24 px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#A8B8D0]/50 text-sm focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none"
              placeholder="Notification message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSend}
            disabled={sendStatus === 'sending' || !title || !message || (sendTarget === 'custom' && selectedUserIds.size === 0)}
          >
            {sendStatus === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {sendStatus === 'sending' ? 'Sending...' : sendTarget === 'all' ? 'Send to All Users' : `Send to ${selectedUserIds.size} User(s)`}
          </Button>
          {sendStatus === 'sent' && (
            <div className="flex items-center gap-2 text-[#00FFB2] text-sm">
              <CheckCircle size={14} /> Notification sent successfully!
            </div>
          )}
          {sendStatus === 'error' && (
            <div className="flex items-center gap-2 text-[#FF5C7A] text-sm">
              <AlertTriangle size={14} /> Failed: {sendError}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#A8B8D0]" />
              <h3 className="text-white font-semibold font-heading">All Notifications</h3>
              <Badge variant="default">{notifications.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <Button variant="danger" size="sm" loading={bulkDeleting} onClick={handleBulkDelete}>
                  <Trash2 size={14} />
                  Delete ({selectedIds.size})
                </Button>
              )}
              <button
                onClick={toggleSelectAll}
                className="text-xs text-[#A8B8D0] hover:text-white transition-colors px-2 py-1"
              >
                {selectedIds.size === notifications.slice(0, 50).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader className="w-8">
                  <input
                    type="checkbox"
                    checked={notifications.length > 0 && selectedIds.size === notifications.slice(0, 50).length}
                    onChange={toggleSelectAll}
                    className="accent-[#00E5FF]"
                  />
                </TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Action</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {notifications.slice(0, 50).map((n: any) => (
                <TableRow key={n.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(n.id)}
                      onChange={() => {
                        setSelectedIds(prev => {
                          const next = new Set(prev);
                          if (next.has(n.id)) next.delete(n.id);
                          else next.add(n.id);
                          return next;
                        });
                      }}
                      className="accent-[#00E5FF]"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-white">{n.title}</span>
                    {n.message && <p className="text-xs text-[#A8B8D0] mt-0.5 truncate max-w-[200px]">{n.message}</p>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default" style={{ background: `${typeColors[n.type] || '#94A3B8'}20`, color: typeColors[n.type] || '#94A3B8', border: `1px solid ${typeColors[n.type] || '#94A3B8'}30` }}>
                      {n.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-[#A8B8D0]">{formatDate(n.created_at || n.timestamp)}</span>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => handleDelete(n.id)}
                      className="p-1.5 rounded-lg text-[#FF5C7A]/60 hover:text-[#FF5C7A] hover:bg-[rgba(255,92,122,0.1)] transition-all">
                      <Trash2 size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
              {notifications.length === 0 && (
                <TableRow>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#A8B8D0] text-sm">No notifications yet</td>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
