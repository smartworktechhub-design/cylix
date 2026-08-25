'use client';

import { useState, useEffect } from 'react';

export function useIsDev() {
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsDev(host === 'dev.cylixdefi.live' || host === 'localhost');
  }, []);

  return isDev;
}
