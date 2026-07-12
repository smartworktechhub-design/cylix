export interface SlotDef {
  id: string;
  name: string;
  orbit: number;
  price: number;
  dailyYield: number;
  maxCap: number;
  icon: string;
  color: string;
}

export interface UserSlot {
  id: string;
  userId: string;
  slotId: string;
  slotName: string;
  slotOrbit: number;
  invested: number;
  earned: number;
  dailyEarned: number;
  maxCap: number;
  progress: number;
  status: 'active' | 'completed' | 'pending' | 'locked';
  activatedAt: string;
  completedAt?: string;
}

export interface MatrixLevelConfig {
  level: number;
  percent: number;
  directsRequired: number;
}

export interface MatrixNode11 {
  userId: string;
  wallet: string;
  sponsorId?: string;
  level: number;
  totalEarnings: number;
  levelEarnings: { [level: number]: number };
  directs: number;
  children: MatrixNode11[];
}

export interface Referral {
  id: string;
  wallet: string;
  level: number;
  joinedAt: string;
  earnings: number;
  teamSize: number;
}

export interface Earnings {
  daily: number;
  total: number;
  matrix: number;
  pool: number;
  referral: number;
  ascension: number;
}

export interface Transaction {
  id: string;
  type: 'slot_purchase' | 'withdraw' | 'referral' | 'daily_earning' | 'matrix_earning' | 'pool_earning' | 'ascension_credit' | 'upgrade' | 'recycle';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  description: string;
  hash?: string;
}

export interface Withdrawal {
  id: string;
  amount: number;
  wallet: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  timestamp: string;
  processedAt?: string;
  txHash?: string;
}

export interface Notification {
  id: string;
  type: 'system' | 'earnings' | 'slot' | 'pool' | 'announcement' | 'withdrawal';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

export interface User {
  id: string;
  wallet: string;
  rank: string;
  joinedAt: string;
  totalInvested: number;
  totalEarned: number;
  referralCode: string;
  sponsorId?: string;
  directs: number;
  teamSize: number;
  isActive: boolean;
  ascensionBalance: number;
  displayName?: string;
  twoFAEnabled?: boolean;
  ipAddress?: string;
  roiEnabled?: boolean;
}

export interface LeaderboardEntry {
  wallet: string;
  earnings: number;
  teamSize: number;
  rank: number;
}

export interface ApexPoolState {
  totalPoolFund: number;
  lastDistribution: string;
  qualifiedCount: number;
  distributePerPerson: number;
  todayDistribution: number;
  lifetimeDistribution: number;
  nextDistributionTime: string;
  distributionHistory: ApexPoolDistribution[];
}

export interface ApexPoolDistribution {
  id: string;
  totalFund: number;
  qualifiedCount: number;
  perPerson: number;
  distributedAt: string;
  safetyReserve: number;
}

export interface ChampionsEntry {
  userId: string;
  wallet: string;
  score: number;
  rank: number;
  reward: number;
  referrals24h: number;
  purchases24h: number;
  volume24h: number;
}

export interface ChampionsPoolState {
  totalFund: number;
  lastDistribution: string;
  nextDistributionTime: string;
  todayDistribution: number;
  lifetimeDistribution: number;
  leaderboard: ChampionsEntry[];
  topCount: number;
}

export interface CommunityPoolState {
  totalFund: number;
  lastDistribution: string;
  nextDistributionTime: string;
  todayDistribution: number;
  lifetimeDistribution: number;
  qualifiedCount: number;
  perPerson: number;
  history: CommunityDistRecord[];
}

export interface CommunityDistRecord {
  id: string;
  totalFund: number;
  qualifiedCount: number;
  perPerson: number;
  distributedAt: string;
}

export interface AscensionVault {
  balance: number;
  autoUpgrade: boolean;
  nextSlot: string;
  nextSlotCost: number;
  progress: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: 'open' | 'closed' | 'pending';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
}

export interface Activity {
  id: string;
  type: 'slot_purchase' | 'daily_earning' | 'matrix_earning' | 'pool_earning' | 'referral' | 'upgrade' | 'recycle' | 'withdrawal' | 'ascension_credit';
  description: string;
  amount: number;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalWithdrawals: number;
  activeSlots: number;
  newUsersToday: number;
  pendingWithdrawals: number;
  growthRate: number;
  poolFund: number;
  totalBlocks: number;
}
