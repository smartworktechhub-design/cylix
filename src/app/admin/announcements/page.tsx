'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import { Megaphone, Send, Trash2, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const announcements = [
  { id: 1, title: 'New Premium Package Available', message: 'We are excited to announce the launch of our new Premium package with enhanced benefits.', type: 'update' as const, date: '2026-06-22T10:30:00', sent: true },
  { id: 2, title: 'System Maintenance Scheduled', message: 'Platform will be undergoing maintenance on June 25th from 2:00 AM to 4:00 AM UTC.', type: 'warning' as const, date: '2026-06-21T14:45:00', sent: true },
  { id: 3, title: 'Referral Bonus Increased', message: 'Referral commission has been increased to 15% for all levels this month.', type: 'promo' as const, date: '2026-06-20T09:00:00', sent: false },
];

const typeConfig = {
  update: { icon: Info, color: '#00E5FF', bg: 'rgba(0,229,255,0.1)', label: 'Update' },
  warning: { icon: AlertTriangle, color: '#FFB800', bg: 'rgba(255,184,0,0.1)', label: 'Warning' },
  promo: { icon: Bell, color: '#7B61FF', bg: 'rgba(123,97,255,0.1)', label: 'Promo' },
};

export default function AdminAnnouncements() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('update');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Announcements</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Create and manage platform announcements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Create Announcement</h3>
            <p className="text-[#94A3B8] text-sm">Send notifications to all users</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Title"
                placeholder="Announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">Message</label>
                <textarea
                  className="w-full h-24 px-4 py-3 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm transition-all duration-200 focus:outline-none focus:border-[rgba(0,229,255,0.3)] resize-none"
                  placeholder="Announcement message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                options={[
                  { value: 'update', label: 'Update' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'promo', label: 'Promotion' },
                ]}
              />
              <div className="flex items-center gap-3">
                <Button className="flex-1">
                  <Send size={16} />
                  Publish
                </Button>
                <Button variant="outline" className="flex-1">
                  <Bell size={16} />
                  Push Notification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Previous Announcements</h3>
            <p className="text-[#94A3B8] text-sm">Manage sent announcements</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {announcements.map((ann) => {
                const cfg = typeConfig[ann.type];
                return (
                  <div key={ann.id} className="p-4 rounded-xl bg-[rgba(0,229,255,0.03)] border border-[rgba(0,229,255,0.06)]">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <cfg.icon size={16} style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{ann.title}</h4>
                          <p className="text-xs text-[#94A3B8]">{formatDate(ann.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {ann.sent ? (
                          <Badge variant="success">
                            <CheckCircle size={10} className="mr-1" />
                            Sent
                          </Badge>
                        ) : (
                          <Badge variant="warning">Draft</Badge>
                        )}
                        <Button variant="ghost" size="sm" className="text-[#FF5C7A]">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-[#94A3B8] line-clamp-2">{ann.message}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
