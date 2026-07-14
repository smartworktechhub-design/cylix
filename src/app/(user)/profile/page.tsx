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
import { getUserById, updateDisplayName } from '@/lib/db';
import type { User as DbUser } from '@/types';
import {
  User, Copy, Check, Wallet, Shield, Key, Clock, Link,
  Settings, Smartphone, LogOut, Save, Loader2, X, QrCode
} from 'lucide-react';

export default function ProfilePage() {
  useEffect(() => { document.title = 'Profile — CYLIX'; }, []);
  const { user } = useAppStore();
  const { address } = useAccount();
  useInitData();
  const [copied, setCopied] = useState<'wallet' | 'code' | 'sponsor' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [sponsor, setSponsor] = useState<DbUser | null>(null);
  const [nameSaved, setNameSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [twoFA, setTwoFA] = useState(false);

  // 2FA setup modal state
  const [show2FA, setShow2FA] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpauth, setOtpauth] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyStep, setVerifyStep] = useState<'setup' | 'verify' | 'done'>('setup');
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const walletAddress = user?.wallet || address || '0x...';
  const referralCode = user?.referralCode || '...';

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || `User_${user.wallet.slice(2, 8)}`);
      setTwoFA(user.twoFAEnabled || false);
    }
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

  const handleSaveName = async () => {
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await updateDisplayName(user.id, displayName.trim());
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSetup2FA = async () => {
    if (!user) return;
    setShow2FA(true);
    setVerifyStep('setup');
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      setSecret(data.secret);
      setOtpauth(data.otpauth);
    } catch {
      setVerifyError('Failed to generate 2FA setup');
    }
  };

  const handleVerify2FA = async () => {
    if (!user || !verifyCode || !secret) return;
    setVerifying(true);
    setVerifyError('');
    try {
      const res = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, secret, token: verifyCode }),
      });
      const data = await res.json();
      if (data.success) {
        setTwoFA(true);
        setVerifyStep('done');
      } else {
        setVerifyError(data.error || 'Invalid code');
      }
    } catch {
      setVerifyError('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user) return;
    setDisabling(true);
    try {
      await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setTwoFA(false);
    } finally {
      setDisabling(false);
    }
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
            <Button className="w-full" onClick={handleSaveName} disabled={saving || !displayName.trim()}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : nameSaved ? 'Saved!' : 'Save Name'}
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
                {twoFA ? (
                  <Button variant="ghost" size="sm" className="text-[#FF5C7A]" onClick={handleDisable2FA} disabled={disabling}>
                    {disabling ? <Loader2 size={12} className="animate-spin" /> : null}
                    Disable
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleSetup2FA}>
                    <QrCode size={12} /> Setup
                  </Button>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">{twoFA ? 'Protected via Google Authenticator' : 'Enhance your account security'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Setup Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShow2FA(false)}>
          <div className="w-full max-w-md bg-[#0B1020] rounded-2xl border border-[rgba(0,229,255,0.1)] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white font-heading">Setup 2FA</h3>
              <button onClick={() => setShow2FA(false)} className="text-[#94A3B8] hover:text-white">
                <X size={18} />
              </button>
            </div>

            {verifyStep === 'setup' && otpauth && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8]">Scan this QR code with Google Authenticator:</p>
                <div className="flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`}
                    alt="2FA QR Code"
                    className="rounded-xl"
                  />
                </div>
                <p className="text-xs text-[#94A3B8] text-center">Or enter this key manually: <span className="font-mono text-[#00E5FF]">{secret}</span></p>
                <Button className="w-full" onClick={() => setVerifyStep('verify')}>
                  I've scanned the code
                </Button>
              </div>
            )}

            {verifyStep === 'setup' && !otpauth && !verifyError && (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
              </div>
            )}

            {verifyStep === 'verify' && (
              <div className="space-y-4">
                <p className="text-sm text-[#94A3B8]">Enter the 6-digit code from Google Authenticator:</p>
                <Input
                  label="Verification Code"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                {verifyError && <p className="text-xs text-[#FF5C7A]">{verifyError}</p>}
                <Button className="w-full" onClick={handleVerify2FA} disabled={verifying || verifyCode.length !== 6}>
                  {verifying ? <Loader2 size={14} className="animate-spin" /> : null}
                  {verifying ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </div>
            )}

            {verifyStep === 'done' && (
              <div className="text-center py-6 space-y-3">
                <Check size={40} className="mx-auto text-[#00FFB2]" />
                <p className="text-white font-medium">2FA Enabled Successfully</p>
                <p className="text-sm text-[#94A3B8]">Your account is now protected with Google Authenticator</p>
                <Button className="w-full" onClick={() => setShow2FA(false)}>Done</Button>
              </div>
            )}

            {verifyError && verifyStep === 'setup' && (
              <div className="text-center py-4">
                <p className="text-[#FF5C7A] text-sm mb-3">{verifyError}</p>
                <Button variant="outline" onClick={() => setShow2FA(false)}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
