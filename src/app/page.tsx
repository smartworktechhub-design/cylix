'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    const host = window.location.hostname;
    if (host === 'cylixdefi.live' || host === 'www.cylixdefi.live') {
      window.location.href = 'https://app.cylixdefi.live';
    } else {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );
}
