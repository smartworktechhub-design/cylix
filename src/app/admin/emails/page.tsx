'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import { Mail, Download, Copy, CheckCheck, Loader2, Trash2, RefreshCw } from 'lucide-react';

export default function AdminEmailsPage() {
  useEffect(() => { document.title = 'Email Export — CYLIX'; }, []);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadEmails() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/emails');
      const json = await res.json();
      setEmails(json.emails || []);
    } catch (e) {
      console.error('Failed to load emails:', e);
    }
    setLoading(false);
  }

  useEffect(() => { loadEmails(); }, []);

  function copyAll() {
    const list = emails.map(e => e.email).join('\n');
    navigator.clipboard.writeText(list);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadCSV() {
    const header = 'Email,Created At\n';
    const rows = emails.map(e => `${e.email},${e.created_at}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cylix-emails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function deleteEmail(id: string) {
    setDeleting(id);
    await fetch(`/api/admin/emails?id=${id}`, { method: 'DELETE' });
    setEmails(emails.filter(e => e.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Email Export</h2>
        <p className="text-sm text-[#94A3B8] mt-1">View and export all collected subscriber emails</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(0,229,255,0.1)] flex items-center justify-center">
              <Mail size={20} className="text-[#00E5FF]" />
            </div>
            <div>
              <p className="text-[#94A3B8] text-xs">Total Emails</p>
              <p className="text-white font-bold font-mono text-lg">{emails.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={downloadCSV} variant="primary" size="sm">
          <Download size={14} />
          Download CSV
        </Button>
        <Button onClick={copyAll} variant="outline" size="sm">
          {copied ? <><CheckCheck size={14} /> Copied!</> : <><Copy size={14} /> Copy All Emails</>}
        </Button>
        <Button onClick={loadEmails} variant="ghost" size="sm">
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail size={16} className="text-[#00E5FF]" />
            <h3 className="text-white font-semibold font-heading">All Subscribers</h3>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
            </div>
          ) : emails.length === 0 ? (
            <p className="text-[#94A3B8] text-sm text-center py-8">No emails collected yet</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>#</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader>Subscribed</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emails.map((e, i) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-[#4A5568] text-xs">{i + 1}</TableCell>
                      <TableCell className="text-white font-mono text-xs">{e.email}</TableCell>
                      <TableCell className="text-[#94A3B8] text-xs">{formatDate(e.created_at)}</TableCell>
                      <TableCell>
                        <button onClick={() => deleteEmail(e.id)} disabled={deleting === e.id}
                          className="text-[#FF5C7A] hover:text-[#FF5C7A]/80 transition-all disabled:opacity-40">
                          {deleting === e.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
