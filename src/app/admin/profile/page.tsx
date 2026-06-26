'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { User, Shield, Key, Save, Copy, Check, Globe, Lock, Clock } from 'lucide-react';

export default function AdminProfile() {
  const [adminName, setAdminName] = useState('Admin');
  const [email, setEmail] = useState('admin@cylix.io');
  const [role, setRole] = useState('super_admin');
  const [twoFactor, setTwoFactor] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('CYLIX-ADMIN-001');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white font-heading">Admin Profile</h2>
        <p className="text-[#94A3B8] text-sm mt-1">Manage administrator account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-white font-semibold font-heading">Account Information</h3>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center">
                <User size={24} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-medium text-white">{adminName}</p>
                <p className="text-sm text-[#94A3B8]">Super Administrator</p>
              </div>
              <Badge variant="success" className="ml-auto">Active</Badge>
            </div>

            <Input label="Display Name" value={adminName} onChange={(e) => setAdminName(e.target.value)} icon={<User size={14} />} />
            <Input label="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Globe size={14} />} />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={[
              { value: 'super_admin', label: 'Super Admin' },
              { value: 'admin', label: 'Admin' },
              { value: 'moderator', label: 'Moderator' },
              { value: 'support', label: 'Support Agent' },
            ]} />

            <div>
              <p className="text-sm font-medium text-[#94A3B8] mb-2">Admin ID</p>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(11,16,32,0.5)] border border-[rgba(0,229,255,0.08)]">
                <Lock size={14} className="text-[#00E5FF]" />
                <span className="flex-1 font-mono text-sm text-white tracking-wider">CYLIX-ADMIN-001</span>
                <Button variant="ghost" size="sm" onClick={handleCopy}>
                  {copied ? <Check size={14} className="text-[#00FFB2]" /> : <Copy size={14} />}
                </Button>
              </div>
            </div>

            <Button className="w-full">
              <Save size={14} />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-[#94A3B8]" />
                <h3 className="text-white font-semibold font-heading">Security</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Key size={14} className="text-[#00E5FF]" />
                    <span className="text-sm text-white">Two-Factor Auth</span>
                  </div>
                  <button
                    onClick={() => setTwoFactor(!twoFactor)}
                    className={`w-10 h-6 rounded-full transition-all relative ${twoFactor ? 'bg-[#00E5FF]' : 'bg-[rgba(148,163,184,0.2)]'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${twoFactor ? 'left-5' : 'left-1'}`} />
                  </button>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">Protect your admin account</p>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-[#94A3B8]" />
                  <span className="text-sm text-white">Last Login</span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-1">June 27, 2026 02:45 AM (Current Session)</p>
              </div>

              <div className="p-4 rounded-xl bg-[rgba(11,16,32,0.5)]">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-[#94A3B8]" />
                  <span className="text-sm text-white">Permissions</span>
                </div>
                <div className="space-y-1 mt-2">
                  {['User Management', 'Financial Oversight', 'System Configuration', 'Support Access', 'Announcements'].map((perm) => (
                    <div key={perm} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]" />
                      <span className="text-xs text-[#94A3B8]">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
