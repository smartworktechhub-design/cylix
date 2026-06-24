'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { getUserByWallet, getUserPackages, getTransactions, getWithdrawals, getNotifications, getUserEarnings, getReferrals, getAdminStats } from './db';
import type { User, Earnings, Activity } from '@/types';

const DEMO_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18';

export function useInitData() {
  const { setUser, setPackages, setEarnings, setTransactions, setWithdrawals, setNotifications, setReferrals, setActivities, setAdminStats } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const user = await getUserByWallet(DEMO_WALLET);
        if (!user) {
          setLoading(false);
          return;
        }
        setUser(user as any);
        const [pkgs, txs, wds, notifs, earnings, referrals] = await Promise.all([
          getUserPackages(user.id),
          getTransactions(user.id),
          getWithdrawals(user.id),
          getNotifications(user.id),
          getUserEarnings(user.id),
          getReferrals(user.id),
        ]);
        setPackages(pkgs as any);
        setEarnings(earnings);
        setTransactions(txs as any);
        setWithdrawals(wds as any);
        setNotifications(notifs as any);
        setReferrals(referrals as any);
        setActivities([]);
        const stats = await getAdminStats();
        setAdminStats(stats);
      } catch (err) {
        console.error('Data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { loading };
}
