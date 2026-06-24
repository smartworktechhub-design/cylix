import { getSupabase } from './supabase';
import type { User, UserPackage, Transaction, Withdrawal, Notification, Referral, Earnings } from '@/types';

function mapUser(u: any): User {
  return {
    id: u.id, wallet: u.wallet, rank: u.rank, referralCode: u.referral_code,
    joinedAt: u.created_at, totalInvested: Number(u.total_invested),
    totalEarned: Number(u.total_earned), teamSize: u.team_size, isActive: u.is_active,
    activePackage: null,
  };
}

function mapPackage(p: any): UserPackage {
  return {
    id: p.id, packageId: p.id, packageName: p.package_name, level: p.level,
    invested: Number(p.invested), earned: Number(p.earned), dailyEarned: 0,
    cap: Number(p.cap), capProgress: p.cap > 0 ? (Number(p.earned) / Number(p.cap)) * 100 : 0,
    status: p.status, activatedAt: p.activated_at, expiresAt: p.expires_at,
  };
}

function mapTransaction(t: any): Transaction {
  return {
    id: t.id, type: t.type, amount: Number(t.amount), status: t.status,
    timestamp: t.created_at, hash: t.tx_hash, description: t.description || '',
  };
}

function mapWithdrawal(w: any): Withdrawal {
  return {
    id: w.id, amount: Number(w.amount), wallet: w.wallet, status: w.status,
    timestamp: w.created_at, processedAt: w.processed_at, txHash: w.tx_hash,
  };
}

function mapNotification(n: any): Notification {
  return {
    id: n.id, type: n.type, title: n.title, message: n.message || '',
    read: n.is_read, timestamp: n.created_at,
  };
}

function sb() { return getSupabase(); }

export async function getUserByWallet(wallet: string): Promise<User | null> {
  const { data } = await sb().from('users').select('*').eq('wallet', wallet).single();
  return data ? mapUser(data) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await sb().from('users').select('*').eq('id', id).single();
  return data ? mapUser(data) : null;
}

export async function getUserPackages(userId: string): Promise<UserPackage[]> {
  const { data } = await sb().from('packages').select('*').eq('user_id', userId).order('activated_at', { ascending: false });
  return (data || []).map(mapPackage);
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const { data } = await sb().from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapTransaction);
}

export async function getWithdrawals(userId: string): Promise<Withdrawal[]> {
  const { data } = await sb().from('withdrawals').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapWithdrawal);
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const { data } = await sb().from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return (data || []).map(mapNotification);
}

export async function getUserEarnings(userId: string): Promise<Earnings> {
  const { data } = await sb().from('earnings').select('type, amount').eq('user_id', userId);
  const result: Earnings = { daily: 0, total: 0, matrix: 0, pool: 0, referral: 0 };
  (data || []).forEach((e: any) => {
    const amt = Number(e.amount);
    result.total += amt;
    if (e.type === 'daily') result.daily += amt;
    else if (e.type === 'matrix') result.matrix += amt;
    else if (e.type === 'pool') result.pool += amt;
    else if (e.type === 'referral') result.referral += amt;
  });
  return result;
}

export async function getReferrals(userId: string): Promise<Referral[]> {
  const { data } = await sb().from('users').select('id, wallet, created_at, total_earned, team_size').eq('referred_by', userId);
  return (data || []).map((u: any) => ({
    id: u.id, wallet: u.wallet, level: 1, joinedAt: u.created_at,
    earnings: Number(u.total_earned), teamSize: u.team_size,
  }));
}

export async function getLeaderboard(limit = 10): Promise<any[]> {
  const { data } = await sb().from('users').select('wallet, total_earned, team_size').order('total_earned', { ascending: false }).limit(limit);
  return (data || []).map((u: any, i: number) => ({
    wallet: u.wallet, earnings: Number(u.total_earned), teamSize: u.team_size, rank: i + 1,
  }));
}

export async function getAdminStats(): Promise<any> {
  const { count: totalUsers } = await sb().from('users').select('*', { count: 'exact', head: true });
  const { data: pkgData } = await sb().from('packages').select('invested').eq('status', 'active');
  const { data: wdData } = await sb().from('withdrawals').select('amount, status');
  const activePackages = pkgData?.length || 0;
  const totalRevenue = pkgData?.reduce((s: number, p: any) => s + Number(p.invested), 0) || 0;
  const pendingWithdrawals = wdData?.filter((w: any) => w.status === 'pending').length || 0;
  const totalWithdrawals = wdData?.reduce((s: number, w: any) => s + Number(w.amount), 0) || 0;
  return { totalUsers: totalUsers || 0, totalRevenue, activePackages, pendingWithdrawals, totalWithdrawals, newUsersToday: 0, growthRate: 12.5 };
}
