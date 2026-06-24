export interface Package {
  id: string;
  name: string;
  price: number;
  dailyReturn: number;
  totalReturn: number;
  duration: number;
  cap: number;
  level: number;
  isActive: boolean;
  icon: string;
  color: string;
}

export interface UserPackage {
  id: string;
  packageId: string;
  packageName: string;
  level: number;
  invested: number;
  earned: number;
  dailyEarned: number;
  cap: number;
  capProgress: number;
  status: 'active' | 'completed' | 'pending';
  activatedAt: string;
  expiresAt: string;
}

export interface Earnings {
  daily: number;
  total: number;
  matrix: number;
  pool: number;
  referral: number;
}

export interface MatrixNode {
  id: string;
  userId: string;
  placement: string;
  side: 'left' | 'right';
  level: number;
  children: {
    left: MatrixNode | null;
    right: MatrixNode | null;
  };
  volume: number;
}

export interface Referral {
  id: string;
  wallet: string;
  level: number;
  joinedAt: string;
  earnings: number;
  teamSize: number;
}

export interface Transaction {
  id: string;
  type: 'purchase' | 'withdraw' | 'referral' | 'earnings' | 'upgrade';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  hash?: string;
  description: string;
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
  type: 'system' | 'earnings' | 'announcement' | 'withdrawal';
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
  teamSize: number;
  isActive: boolean;
  activePackage: UserPackage | null;
}

export interface LeaderboardEntry {
  wallet: string;
  earnings: number;
  teamSize: number;
  rank: number;
}

export interface ApexPoolCycle {
  cycle: number;
  prize: number;
  qualified: boolean;
  participants: number;
  status: 'active' | 'completed' | 'upcoming';
  endsAt: string;
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
  type: 'purchase' | 'earnings' | 'referral' | 'upgrade' | 'withdrawal';
  description: string;
  amount: number;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalWithdrawals: number;
  activePackages: number;
  newUsersToday: number;
  pendingWithdrawals: number;
  growthRate: number;
}
