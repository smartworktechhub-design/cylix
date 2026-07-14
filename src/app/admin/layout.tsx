'use client';
import { useState, useEffect } from 'react';
import { useAdminAuth, AdminAuthProvider } from '@/lib/admin-auth';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, Lock } from 'lucide-react';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isLoggedIn && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [loading, isLoggedIn, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (!isLoggedIn && pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-center">
          <Lock size={48} className="text-[#FF5C7A] mx-auto mb-4" />
          <p className="text-white font-heading text-lg">Access Denied</p>
          <p className="text-[#94A3B8] text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn && pathname === '/admin/login') {
    return <>{children}</>;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin } = useAdminAuth();
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={`Admin${admin?.name ? ` — ${admin.name}` : ''}`} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
          <div className="mt-8 pt-6 border-t border-[rgba(123,97,255,0.06)]">
            <PublicFooter />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AdminAuthProvider>
  );
}
