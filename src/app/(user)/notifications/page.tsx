'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRelativeTime } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import type { Notification } from '@/types';
import {
  Bell, CheckCheck, TrendingUp, DollarSign, Gift, Award,
  AlertTriangle, Info, UserPlus, Zap, Shield, CheckCircle, Loader2
} from 'lucide-react';

const filterTabs = ['All', 'Earnings', 'System', 'Promotions', 'Security'];

const typeConfig: Record<string, { icon: typeof Bell; color: string; label: string }> = {
  earnings: { icon: TrendingUp, color: '#00FFB2', label: 'Earnings' },
  payment: { icon: DollarSign, color: '#00E5FF', label: 'Payment' },
  promotion: { icon: Gift, color: '#7B61FF', label: 'Promotion' },
  achievement: { icon: Award, color: '#FFB800', label: 'Achievement' },
  system: { icon: Info, color: '#94A3B8', label: 'System' },
  referral: { icon: UserPlus, color: '#7B61FF', label: 'Referral' },
  upgrade: { icon: Zap, color: '#00E5FF', label: 'Upgrade' },
  security: { icon: Shield, color: '#FF5C7A', label: 'Security' },
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useAppStore();
  const [activeTab, setActiveTab] = useState('All');
  const [markedRead, setMarkedRead] = useState<Set<string>>(new Set());

  const filtered = activeTab === 'All'
    ? notifications
    : notifications.filter((n) => {
        const catMap: Record<string, string[]> = {
          Earnings: ['earnings', 'payment'],
          System: ['system', 'upgrade'],
          Promotions: ['promotion', 'referral', 'achievement'],
          Security: ['security'],
        };
        return catMap[activeTab]?.includes(n.type);
      });

  const unreadCount = notifications.filter((n) => !n.read && !markedRead.has(n.id)).length;

  const markAsRead = (id: string) => {
    setMarkedRead((prev) => new Set(prev).add(id));
    markNotificationRead(id);
  };

  const markAllAsRead = () => {
    setMarkedRead((prev) => new Set([...prev, ...filtered.map((n) => n.id)]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading text-white">Notifications</h2>
          <p className="text-sm text-[#94A3B8] mt-1">Stay updated with platform activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck size={14} />
            Mark All Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                  {tab === 'All' && unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[#FF5C7A] text-white">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
            <Bell size={16} className="text-[#94A3B8]" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={40} className="mx-auto text-[#00FFB2] mb-3" />
              <p className="text-[#94A3B8]">All caught up</p>
            </div>
          ) : (
            filtered.map((notification) => {
              const notifType = notification.type as string;
              const config = typeConfig[notifType] || typeConfig.system;
              const Icon = config.icon;
              const isRead = notification.read || markedRead.has(notification.id);

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl transition-all ${
                    isRead
                      ? 'bg-[rgba(11,16,32,0.3)]'
                      : 'bg-[rgba(11,16,32,0.6)] border border-[rgba(0,229,255,0.08)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `${config.color}15` }}
                    >
                      <Icon size={18} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${isRead ? 'text-[#94A3B8]' : 'text-white'}`}>
                              {notification.title}
                            </p>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#94A3B8] mt-1">{notification.message}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#94A3B8] whitespace-nowrap">
                            {formatRelativeTime(notification.timestamp)}
                          </span>
                          {!isRead && (
                            <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-7 px-2">
                              <CheckCheck size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
