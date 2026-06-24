'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency, shortenAddress } from '@/lib/utils';
import { getUserByWallet } from '@/lib/db';
import type { User as DbUser } from '@/types';
import {
  User, Copy, Check, Wallet, Shield, Bell,
  Key, Clock, Link, Settings, Mail, Smartphone,
  CreditCard, LogOut, Loader2
} from 'lucide-react';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DbUser | null>(null);
  const [copied, setCopied] = useState<'wallet' | 'code' | null>(null);
  const [displayName, setDisplayName] = useState('User');
  const [emailPrefs, setEmailPrefs] = useState({
    earnings: true,
    promotions: false,
    security: true,
    newsletter: false,
  });

  useEffect(() => {
    getUserByWallet(DEMO_WALLET).then((u) => {
      if (u) {
        setUser(u);
        setDisplayName(`User_${u.wallet.slice(2, 8)}`);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  const walletAddress = user?.wallet || DEMO_WALLET;
  const referralCode = user?.referralCode || 'LOADING...';
  const daysActive = user ? Math.floor((Date.now() - new Date(user.joinedAt).getTime()) / 86400000) : 0;

  const profileStats = [
    { label: 'Total Earnings', value: user?.totalEarned || 0, icon: Wallet, color: '#00FFB2' },
    { label: 'Active Packages', value: user?.totalInvested ? Math.min(Math.floor(user.totalInvested / 5000) + 1, 4) : 0, icon: CreditCard, color: '#00E5FF' },
    { label: 'Team Members', value: user?.teamSize || 0, icon: User, color: '#7B61FF' },
    { label: 'Days Active', value: daysActive || 1, icon: Clock, color: '#FFB800' },
  ];

  const handleCopy = (type: 'wallet' | 'code') => {
    navigator.clipboard.writeText(type === 'wallet' ? walletAddress : referralCode);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleEmailPref = (key: keyof typeof emailPrefs) => {
    setEmailPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-heading text-white">Profile</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Account Overview</h3>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-white">{displayName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-[#94A3B8]">{shortenAddress(walletAddress)}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy('wallet')} className="h-6 px-2">
                    {copied === 'wallet' ? <Check size={12} className="text-[#00FFB2]" /> : <Copy size={12} />}
                  </Button>
                </div>
              </div>
              <Badge variant="success">Verified</Badge>
            </div>

            <div>
              <p className="text-sm text-[#94A3B8] mb-2">Referral Code</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.08)]">
                <Link size={14} className="text-[#00E5FF]" />
                <span className="flex-1 font-mono text-sm text-white tracking-wider">{referralCode}</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopy('code')}>
                  {copied === 'code' ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-white">Quick Stats</h3>
          </CardHeader>
          <CardContent className="space-y-3">
            {profileStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15` }}>
                      <Icon size={14} style={{ color: stat.color }} />
                    </div>
                    <span className="text-sm text-[#94A3B8]">{stat.label}</span>
                  </div>
                  <span className="text-sm font-mono font-medium text-white">
                    {stat.label === 'Total Earnings' ? formatCurrency(stat.value) : stat.value}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Settings</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              icon={<User size={14} />}
            />

            <div>
              <p className="text-sm font-medium text-[#94A3B8] mb-3">Email Notifications</p>
              <div className="space-y-2">
                {([
                  { key: 'earnings' as const, label: 'Earnings & Payments', desc: 'Daily earnings and withdrawal updates' },
                  { key: 'promotions' as const, label: 'Promotions & Offers', desc: 'Special bonuses and limited-time offers' },
                  { key: 'security' as const, label: 'Security Alerts', desc: 'Login attempts and security changes' },
                  { key: 'newsletter' as const, label: 'Newsletter', desc: 'Platform updates and monthly digests' },
                ]).map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-[rgba(11,16,32,0.5)]">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-[#94A3B8]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleEmailPref(item.key)}
                      className={`w-10 h-6 rounded-full transition-all relative ${
                        emailPrefs[item.key] ? 'bg-[#00E5FF]' : 'bg-[rgba(148,163,184,0.2)]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                        emailPrefs[item.key] ? 'left-5' : 'left-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#94A3B8]" />
              <h3 className="text-lg font-semibold text-white">Security</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-[#00E5FF]" />
                  <span className="text-sm text-white">Wallet Connected</span>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
              <p className="font-mono text-xs text-[#94A3B8] mt-2">{shortenAddress(walletAddress, 8)}</p>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-[#94A3B8]" />
                <span className="text-sm text-white">Last Login</span>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">June 22, 2026 09:45 AM (Current Session)</p>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="flex items-center gap-2 mb-1">
                <Smartphone size={14} className="text-[#94A3B8]" />
                <span className="text-sm text-white">Two-Factor Authentication</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-[#94A3B8]">Enhance your account security</span>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="danger" size="sm" className="w-full">
                <LogOut size={14} />
                Disconnect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
