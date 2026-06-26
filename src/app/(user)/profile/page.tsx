'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { shortenAddress } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { useInitData } from '@/lib/use-data';
import { useAccount } from 'wagmi';
import { getUserById } from '@/lib/db';
import type { User as DbUser } from '@/types';
import {
  User, Copy, Check, Wallet, Shield, Key, Clock, Link,
  Settings, Smartphone, LogOut, Save, Loader2
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAppStore();
  const { address } = useAccount();
  useInitData();
  const [copied, setCopied] = useState<'wallet' | 'code' | 'sponsor' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [sponsor, setSponsor] = useState<DbUser | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  const walletAddress = user?.wallet || address || '0x...';
  const referralCode = user?.referralCode || '...';

  useEffect(() => {
    const saved = localStorage.getItem('cylix_display_name');
    if (saved) setDisplayName(saved);
    else if (user) setDisplayName(`User_${user.wallet.slice(2, 8)}`);
    const saved2fa = localStorage.getItem('cylix_2fa') === 'true';
    setTwoFA(saved2fa);
  }, [user]);

  useEffect(() => {
    if (user?.sponsorId) {
      getUserById(user.sponsorId).then(setSponsor);
    }
  }, [user?.sponsorId]);

  const handleCopy = (type: 'wallet' | 'code' | 'sponsor') => {
    const val = type === 'wallet' ? walletAddress : type === 'code' ? referralCode : sponsor?.referralCode || '';
    navigator.clipboard.writeText(val);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveName = () => {
    localStorage.setItem('cylix_display_name', displayName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const toggle2FA = () => {
    const next = !twoFA;
    setTwoFA(next);
    localStorage.setItem('cylix_2fa', String(next));
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
              <p className="text-sm text-[#94A3B8] mb-2">Your Referral Code</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.08)]">
                <Link size={14} className="text-[#00E5FF]" />
                <span className="flex-1 font-mono text-sm text-white tracking-wider">{referralCode}</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopy('code')}>
                  {copied === 'code' ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            {sponsor && (
              <div>
                <p className="text-sm text-[#94A3B8] mb-2">Sponsor ID</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(123,97,255,0.08)]">
                  <User size={14} className="text-[#7B61FF]" />
                  <span className="flex-1 font-mono text-sm text-white tracking-wider">{sponsor.referralCode}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy('sponsor')}>
                    {copied === 'sponsor' ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

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
            <Button className="w-full" onClick={handleSaveName}>
              {nameSaved ? <Check size={14} /> : <Save size={14} />}
              {nameSaved ? 'Saved!' : 'Save Name'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone size={14} className="text-[#94A3B8]" />
                  <span className="text-sm text-white">Two-Factor Authentication</span>
                </div>
                <button
                  onClick={toggle2FA}
                  className={`w-10 h-6 rounded-full transition-all relative ${twoFA ? 'bg-[#00E5FF]' : 'bg-[rgba(148,163,184,0.2)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${twoFA ? 'left-5' : 'left-1'}`} />
                </button>
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">{twoFA ? 'Protected' : 'Enhance your account security'}</p>
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
