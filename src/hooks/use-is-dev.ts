'use client';

import { useState, useEffect } from 'react';

export function useIsDev(): boolean | null {
  const [isDev, setIsDev] = useState<boolean | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    setIsDev(host === 'dev.cylixdefi.live' || host === 'localhost');
  }, []);

  return isDev;
}
