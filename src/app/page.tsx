'use client';

import { useEffect } from 'react';

export default function HomePage() {
  useEffect(() => {
    window.location.href = 'https://app.cylixdefi.live';
  }, []);

  return (
    <div className="min-h-screen bg-[#090B14] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#00CFFF] border-t-transparent animate-spin" />
    </div>
  );
}
