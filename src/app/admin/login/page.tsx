'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Mail, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[rgba(0,229,255,0.03)] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[rgba(123,97,255,0.03)] blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10" gradient>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00E5FF] to-[#7B61FF] flex items-center justify-center mb-4">
              <Lock size={28} className="text-[#050816]" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Admin Panel</h1>
            <p className="text-[#94A3B8] text-sm mt-2">Sign in to your admin account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Email address"
                className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-colors"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Password"
                className="w-full bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.12)] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-[rgba(0,229,255,0.3)] transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(255,92,122,0.08)] border border-[rgba(255,92,122,0.15)]">
                <AlertTriangle size={14} className="text-[#FF5C7A]" />
                <span className="text-[#FF5C7A] text-xs">{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={loading} disabled={loading || !email || !password}>
              <Lock size={14} /> Sign In
            </Button>
          </form>

          <p className="text-center text-[#94A3B8]/50 text-xs mt-6">CYLIX Admin — Authorized Personnel Only</p>
        </CardContent>
      </Card>
    </div>
  );
}
