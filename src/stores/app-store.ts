import { create } from 'zustand';
import type { User, UserPackage, Earnings, Transaction, Withdrawal, Notification, Referral, Activity, AdminStats } from '@/types';

interface AppState {
  user: User | null;
  packages: UserPackage[];
  earnings: Earnings;
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  referrals: Referral[];
  activities: Activity[];
  adminStats: AdminStats | null;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setPackages: (packages: UserPackage[]) => void;
  setEarnings: (earnings: Earnings) => void;
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
  packages: [],
  earnings: { daily: 0, total: 0, matrix: 0, pool: 0, referral: 0 },
  transactions: [],
  withdrawals: [],
  notifications: [],
  referrals: [],
  activities: [],
  adminStats: null,
  sidebarOpen: true,

  setUser: (user) => set({ user }),
  setPackages: (packages) => set({ packages }),
  setEarnings: (earnings) => set({ earnings }),
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
