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
  { level: 1, percent: 4.0, directsRequired: 0 },
  { level: 2, percent: 4.0, directsRequired: 0 },
  { level: 3, percent: 5.0, directsRequired: 2 },
  { level: 4, percent: 5.0, directsRequired: 2 },
  { level: 5, percent: 4.0, directsRequired: 2 },
  { level: 6, percent: 4.0, directsRequired: 2 },
  { level: 7, percent: 4.0, directsRequired: 2 },
  { level: 8, percent: 4.0, directsRequired: 2 },
  { level: 9, percent: 2.0, directsRequired: 2 },
  { level: 10, percent: 2.0, directsRequired: 2 },
  { level: 11, percent: 2.0, directsRequired: 2 },
];

export const MATRIX_TOTAL_PERCENT = MATRIX_LEVELS.reduce((s, l) => s + l.percent, 0);

export const ALLOCATION = {
  yieldPercent: 50,
  matrixPercent: 40,
  poolPercent: 10,
};

export const APEX_POOL = {
  poolPercent: 10,
  distributionInterval: 24,
};

export const POOL_SPLIT = {
  championsPercent: 50,
  communityPercent: 50,
};

export const CHAMPIONS_POOL = {
  scoreWeights: { referral: 10, purchase: 5, volume: 0.001 },
};

export const ACTIVE_POOL = {};

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
  { href: '/airdrop', label: 'CXL Airdrop', icon: 'Coins' },
  { href: '/presale', label: 'CXL Presale', icon: 'ShoppingCart' },
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
  { href: '/admin/register-user', label: 'Register User', icon: 'UserPlus' },
  { href: '/admin/user-lookup', label: 'User Lookup', icon: 'Search' },
  { href: '/admin/users', label: 'Users', icon: 'Users' },
  { href: '/admin/slots', label: 'Slots', icon: 'Package' },
  { href: '/admin/matrix', label: 'Matrix', icon: 'GitBranch' },
  { href: '/admin/earnings', label: 'Earnings', icon: 'TrendingUp' },
  { href: '/admin/campaigns', label: 'Campaigns', icon: 'Megaphone' },
  { href: '/admin/campaign-requests', label: 'Reward Requests', icon: 'Gift' },
  { href: '/admin/deposit-wallet', label: 'Deposit Wallet', icon: 'Banknote' },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: 'Wallet' },
  { href: '/admin/apex-pool', label: 'Apex Pool', icon: 'Trophy' },
  { href: '/admin/emails', label: 'Email Export', icon: 'Mail' },
  { href: '/admin/email-blast', label: 'Email Blast', icon: 'Mail' },
  { href: '/admin/activity-log', label: 'Activity Log', icon: 'Activity' },
  { href: '/admin/ban-appeals', label: 'Ban Appeals', icon: 'ShieldOff' },
  { href: '/admin/platform-settings', label: 'Settings', icon: 'Settings' },
  { href: '/admin/announcements', label: 'Announcements', icon: 'Megaphone' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'Bell' },
  { href: '/admin/cxl-airdrop', label: 'CXL Airdrop', icon: 'Coins' },
  { href: '/admin/cxl-presale', label: 'CXL Presale', icon: 'ShoppingCart' },
  { href: '/admin/support', label: 'Support', icon: 'LifeBuoy' },
  { href: '/admin/security', label: 'Security', icon: 'Shield' },
];

export const REBUY_MAX = 2;

export const APP_VERSION = '1.0.0';

export const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
export const TREASURY_WALLET = '0xb0bf2a92b33caa2de9c4a24836eadb137fe77373';
export const PRESALE_WALLET = '0x1496A6bdD616DA866661cEF70E84B1115C654c72';
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';
export const BSC_CHAIN_ID = 56;
export const USDT_DECIMALS = 18;

// ============================================
// CXL TOKEN ECOSYSTEM
// ============================================

export const CXL_SUPPLY = 1_100_000;

export const CXL_PHASES = {
  1: { name: 'Phase 1 (Early Access)', bonus: 10, startDay: 1, endDay: 30 },
  2: { name: 'Phase 2 (Growth)', bonus: 7, startDay: 31, endDay: 60 },
  3: { name: 'Phase 3 (Public)', bonus: 5, startDay: 61, endDay: 90 },
} as const;

export const AIRDROP_DAILY_RATES = {
  L1: 0.50,
  L2: 0.30,
  L3: 0.20,
  L4: 0.10,
  L5: 0.10,
} as const;

export const AIRDROP_MAX_DAILY = Object.values(AIRDROP_DAILY_RATES).reduce((s, v) => s + v, 0);

export const AIRDROP_DURATION_DAYS = 90;

export const PRESALE_PRICES: readonly number[] = [
  0.0100, 0.0110, 0.0121, 0.0131, 0.0142, 0.0153, 0.0163, 0.0174, 0.0184, 0.0195,
  0.0206, 0.0216, 0.0227, 0.0237, 0.0248, 0.0258, 0.0269, 0.0279, 0.0290, 0.0301,
  0.0311, 0.0322, 0.0332, 0.0343, 0.0353, 0.0364, 0.0375, 0.0385, 0.0396, 0.0406,
  0.0437, 0.0448, 0.0458, 0.0468, 0.0479, 0.0489, 0.0500, 0.0510, 0.0521, 0.0531,
  0.0542, 0.0553, 0.0563, 0.0574, 0.0584, 0.0595, 0.0606, 0.0616, 0.0627, 0.0637,
  0.0648, 0.0658, 0.0669, 0.0680, 0.0690, 0.0701, 0.0711, 0.0722, 0.0732, 0.0743,
  0.0774, 0.0784, 0.0795, 0.0806, 0.0816, 0.0827, 0.0837, 0.0848, 0.0858, 0.0869,
  0.0879, 0.0890, 0.0901, 0.0911, 0.0922, 0.0932, 0.0943, 0.0953, 0.0964, 0.0974,
  0.0985, 0.0996, 0.1006, 0.1017, 0.1027, 0.1038, 0.1048, 0.1059, 0.1069, 0.1080,
] as const;

export function getPresalePriceForDay(day: number): number {
  if (day < 1) return PRESALE_PRICES[0];
  if (day > 90) return PRESALE_PRICES[89];
  return PRESALE_PRICES[day - 1];
}

export const DEX_LAUNCH_PRICE = 0.15;

export const PRESALE_SUPPLY_LIMIT = 110000; // 10% of 1.1M total supply

export const PRESALE = {
  minUSDT: 1,
  maxUSDT: 100,
  startPrice: 0.01,
  dailyIncrement: 0.01,
  durationDays: 90,
} as const;

export const SETTLEMENT = {
  airdropLiquidPercent: 10,
  airdropStakedPercent: 90,
  presaleLiquidPercent: 50,
  presaleStakedPercent: 50,
} as const;

export const PRESALE_VESTING = {
  stakedPercent: 50,
  streamedPercent: 50,
  totalInstallments: 11,
  installmentIntervalDays: 30,
} as const;

export const PRESALE_REFERRAL = {
  totalPercent: 12,
  levels: [
    { level: 1, percent: 5, requiresDirects: 0 },
    { level: 2, percent: 3, requiresDirects: 2 },
    { level: 3, percent: 2, requiresDirects: 2 },
    { level: 4, percent: 1, requiresDirects: 2 },
    { level: 5, percent: 1, requiresDirects: 2 },
  ],
} as const;

export const L2_DIRECTS_REQUIRED = 2;
