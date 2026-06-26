import type { SlotDef, MatrixLevelConfig } from '@/types';

export const SLOTS: SlotDef[] = [
  { id: 'orbit-1', name: 'Spark', orbit: 1, price: 5, dailyYield: 0.15, maxCap: 10, icon: 'spark', color: '#00E5FF' },
  { id: 'orbit-2', name: 'Vortex', orbit: 2, price: 10, dailyYield: 0.30, maxCap: 20, icon: 'vortex', color: '#7B61FF' },
  { id: 'orbit-3', name: 'Comet Pulse', orbit: 3, price: 50, dailyYield: 1.50, maxCap: 100, icon: 'comet', color: '#00FFB2' },
  { id: 'orbit-4', name: 'Nova Crux', orbit: 4, price: 100, dailyYield: 3.00, maxCap: 200, icon: 'nova', color: '#FFB800' },
  { id: 'orbit-5', name: 'Cyber Node', orbit: 5, price: 500, dailyYield: 15.00, maxCap: 1000, icon: 'cyber', color: '#FF5C7A' },
  { id: 'orbit-6', name: 'Pulse Matrix', orbit: 6, price: 1000, dailyYield: 30.00, maxCap: 2000, icon: 'pulse', color: '#00E5FF' },
  { id: 'orbit-7', name: 'Orbit Master', orbit: 7, price: 5000, dailyYield: 150.00, maxCap: 10000, icon: 'master', color: '#7B61FF' },
  { id: 'orbit-8', name: 'Alpha Ledger', orbit: 8, price: 10000, dailyYield: 300.00, maxCap: 20000, icon: 'alpha', color: '#00FFB2' },
  { id: 'orbit-9', name: 'Cosmic Titan', orbit: 9, price: 25000, dailyYield: 750.00, maxCap: 50000, icon: 'titan', color: '#FFB800' },
  { id: 'orbit-10', name: 'Apex Whale', orbit: 10, price: 50000, dailyYield: 1500.00, maxCap: 100000, icon: 'whale', color: '#FF5C7A' },
  { id: 'orbit-11', name: 'Infinity Core', orbit: 11, price: 100000, dailyYield: 3000.00, maxCap: 200000, icon: 'infinity', color: '#00E5FF' },
];

export const MATRIX_LEVELS: MatrixLevelConfig[] = [
  { level: 1, percent: 6.0, directsRequired: 0 },
  { level: 2, percent: 5.0, directsRequired: 0 },
  { level: 3, percent: 4.0, directsRequired: 2 },
  { level: 4, percent: 3.0, directsRequired: 2 },
  { level: 5, percent: 3.0, directsRequired: 2 },
  { level: 6, percent: 2.0, directsRequired: 2 },
  { level: 7, percent: 2.0, directsRequired: 2 },
  { level: 8, percent: 2.0, directsRequired: 2 },
  { level: 9, percent: 1.0, directsRequired: 2 },
  { level: 10, percent: 1.0, directsRequired: 2 },
  { level: 11, percent: 1.0, directsRequired: 2 },
];

export const MATRIX_TOTAL_PERCENT = MATRIX_LEVELS.reduce((s, l) => s + l.percent, 0);

export const ALLOCATION = {
  yieldPercent: 65,
  matrixPercent: 30,
  poolPercent: 5,
};

export const APEX_POOL = {
  poolPercent: 5,
  distributionInterval: 24,
};

export const SLOT_CONFIG = {
  dailyYieldPercent: 3,
  maxCapMultiplier: 2,
  ascensionSplitPercent: 50,
  walletSplitPercent: 50,
};

export const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/slots', label: 'Slots', icon: 'Orbit' },
  { href: '/my-orbit', label: 'My Orbit', icon: 'Orbit' },
  { href: '/matrix', label: 'Matrix', icon: 'GitBranch' },
  { href: '/earnings', label: 'Earnings', icon: 'TrendingUp' },
  { href: '/upgrade-vault', label: 'Upgrade Vault', icon: 'Vault' },
  { href: '/withdrawals', label: 'Withdrawals', icon: 'Wallet' },
  { href: '/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { href: '/referrals', label: 'Referrals', icon: 'Users' },
  { href: '/apex-pool', label: 'Apex Pool', icon: 'Trophy' },
  { href: '/leaderboard', label: 'Leaderboard', icon: 'BarChart3' },
  { href: '/notifications', label: 'Notifications', icon: 'Bell' },
  { href: '/profile', label: 'Profile', icon: 'UserCircle' },
  { href: '/support', label: 'Support Center', icon: 'LifeBuoy' },
];

export const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/slots', label: 'Slots', icon: 'Package' },
  { href: '/admin/matrix', label: 'Matrix', icon: 'GitBranch' },
  { href: '/admin/earnings', label: 'Earnings', icon: 'TrendingUp' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: 'Wallet' },
  { href: '/admin/apex-pool', label: 'Apex Pool', icon: 'Trophy' },
  { href: '/admin/referrals', label: 'Referrals', icon: 'Users' },
  { href: '/admin/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/admin/transactions', label: 'Transactions', icon: 'ArrowLeftRight' },
  { href: '/admin/settings', label: 'Settings', icon: 'Settings' },
  { href: '/admin/security', label: 'Security', icon: 'Shield' },
];

export const REBUY_MAX = 5;

export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const TREASURY_WALLET = '0x3739af171cd5288e44c5C43eEeEe04d523d4b872';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const BSC_CHAIN_ID = 56;
export const USDT_DECIMALS = 18;
