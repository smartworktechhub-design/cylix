import { create } from 'zustand';
import type { User, UserSlot, Earnings, Transaction, Withdrawal, Notification, Referral, Activity, AdminStats, AscensionVault } from '@/types';

interface AppState {
  user: User | null;
  slots: UserSlot[];
  earnings: Earnings;
  vault: AscensionVault | null;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  referrals: Referral[];
  activities: Activity[];
  adminStats: AdminStats | null;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setSlots: (slots: UserSlot[]) => void;
  setEarnings: (earnings: Earnings) => void;
  setVault: (vault: AscensionVault | null) => void;
  addTransaction: (tx: Transaction) => void;
  setTransactions: (txs: Transaction[]) => void;
  setWithdrawals: (wds: Withdrawal[]) => void;
  setNotifications: (notifications: Notification[]) => void;
  markNotificationRead: (id: string) => void;
  setReferrals: (referrals: Referral[]) => void;
  setActivities: (activities: Activity[]) => void;
  setAdminStats: (stats: AdminStats | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  slots: [],
  earnings: { daily: 0, total: 0, matrix: 0, pool: 0, referral: 0, ascension: 0 },
  vault: null,
  transactions: [],
  withdrawals: [],
  notifications: [],
  referrals: [],
  activities: [],
  adminStats: null,
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setSlots: (slots) => set({ slots }),
  setEarnings: (earnings) => set({ earnings }),
  setVault: (vault) => set({ vault }),
  addTransaction: (tx) => set((s) => ({ transactions: [tx, ...s.transactions] })),
  setTransactions: (transactions) => set({ transactions }),
  setWithdrawals: (withdrawals) => set({ withdrawals }),
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  setReferrals: (referrals) => set({ referrals }),
  setActivities: (activities) => set({ activities }),
  setAdminStats: (adminStats) => set({ adminStats }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
