'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useAppStore } from '@/stores/app-store';
import { getUserByWallet, createUser, getUserSlots, getTransactions, getWithdrawals, getNotifications, getUserEarnings, getReferrals, getAdminStats, getAscensionVault, processSlotEarnings } from './db';


export function useInitData() {
  const { setUser, setSlots, setEarnings, setVault, setTransactions, setWithdrawals, setNotifications, setReferrals, setActivities, setAdminStats } = useAppStore();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }
      try {
        const refCode = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null;
        let user = await getUserByWallet(address);
        if (!user) {
          user = await createUser(address, refCode || undefined);
        }
        if (!user) {
          setLoading(false);
          return;
        }
        setUser(user as any);
        await processSlotEarnings(user.id);
        const [slots, txs, wds, notifs, earnings, referrals, vault] = await Promise.all([
          getUserSlots(user.id),
          getTransactions(user.id),
          getWithdrawals(user.id),
          getNotifications(user.id),
          getUserEarnings(user.id),
          getReferrals(user.id),
          getAscensionVault(user.id),
        ]);
        setSlots(slots as any);
        setEarnings(earnings);
        setVault(vault);
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
  }, [address, isConnected]);

  return { loading };
}
