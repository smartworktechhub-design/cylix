'use client';

import { UserSidebar } from '@/components/layout/user-sidebar';
import { UserHeader } from '@/components/layout/user-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <UserSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <UserHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
          <div className="mt-8 pt-6 border-t border-[rgba(0,229,255,0.06)]">
            <PublicFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
