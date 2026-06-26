-- CYLIX DeFi - 11 Slot System Schema
-- Drop old tables
DROP TABLE IF EXISTS apex_pool_blocks CASCADE;
DROP TABLE IF EXISTS apex_pool_distributions CASCADE;
DROP TABLE IF EXISTS ascension_vault CASCADE;
DROP TABLE IF EXISTS matrix_11 CASCADE;
DROP TABLE IF EXISTS user_slots CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT UNIQUE NOT NULL,
  rank TEXT DEFAULT 'Bronze',
  referral_code TEXT UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES users(id),
  directs INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 0,
  total_invested DECIMAL(20,2) DEFAULT 0,
  total_earned DECIMAL(20,2) DEFAULT 0,
  ascension_balance DECIMAL(20,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Slots (active purchases)
CREATE TABLE user_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  slot_id TEXT NOT NULL,
  slot_name TEXT NOT NULL,
  slot_orbit INTEGER NOT NULL,
  invested DECIMAL(20,2) NOT NULL,
  earned DECIMAL(20,2) DEFAULT 0,
  daily_earned DECIMAL(20,2) DEFAULT 0,
  max_cap DECIMAL(20,2) NOT NULL,
  progress DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'pending', 'locked')),
  activated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  last_earning_at TIMESTAMPTZ DEFAULT now()
);

-- 11-Level Unilevel Matrix
CREATE TABLE matrix_11 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  sponsor_id UUID REFERENCES users(id),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 11),
  total_earnings DECIMAL(20,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2x11 Forced Binary Tree (for spillover placement)
CREATE TABLE matrix_tree (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  owner_id UUID REFERENCES users(id) NOT NULL,
  parent_id UUID REFERENCES matrix_tree(id),
  side TEXT CHECK (side IN ('left', 'right')),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 11),
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matrix Level Earnings Breakdown
CREATE TABLE matrix_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_id UUID REFERENCES matrix_11(id) NOT NULL,
  earned_from UUID REFERENCES users(id) NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 11),
  amount DECIMAL(20,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Apex Pool Contributions (unlimited - no blocks/capacity)
CREATE TABLE apex_pool_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_number INTEGER DEFAULT 0,
  value DECIMAL(20,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  distributed BOOLEAN DEFAULT false
);

-- Apex Pool Daily Distributions
CREATE TABLE apex_pool_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_fund DECIMAL(20,2) NOT NULL,
  qualified_count INTEGER DEFAULT 0,
  per_person DECIMAL(20,2) DEFAULT 0,
  safety_reserve DECIMAL(20,2) DEFAULT 0,
  distributed_at TIMESTAMPTZ DEFAULT now()
);

-- Apex Pool Qualifiers
CREATE TABLE apex_pool_qualifiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_id UUID REFERENCES apex_pool_distributions(id),
  user_id UUID REFERENCES users(id),
  amount DECIMAL(20,2) DEFAULT 0,
  claimed BOOLEAN DEFAULT false
);

-- Ascension Vault (50% split savings)
CREATE TABLE ascension_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL UNIQUE,
  balance DECIMAL(20,2) DEFAULT 0,
  auto_upgrade BOOLEAN DEFAULT true,
  next_slot_id TEXT,
  next_slot_cost DECIMAL(20,2) DEFAULT 0
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'slot_purchase', 'withdraw', 'referral', 'daily_earning',
    'matrix_earning', 'pool_earning', 'ascension_credit',
    'upgrade', 'recycle'
  )),
  amount DECIMAL(20,2) NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  description TEXT DEFAULT '',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Withdrawals
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  amount DECIMAL(20,2) NOT NULL,
  wallet TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  tx_hash TEXT
);

-- Earnings Ledger
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'matrix', 'pool', 'referral', 'ascension')),
  amount DECIMAL(20,2) NOT NULL,
  source TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('system', 'earnings', 'slot', 'pool', 'announcement', 'withdrawal')),
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Increment helper function (used by RPC)
CREATE OR REPLACE FUNCTION increment(x DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
  RETURN x;
END;
$$ LANGUAGE plpgsql;

-- Add columns to users (for existing databases)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_daily_process TIMESTAMPTZ DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS ascension_balance DECIMAL(20,2) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;

-- Scheduled daily processing via pg_cron (requires pg_cron extension)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('process-daily-earnings', '0 */6 * * *', $$SELECT process_all_daily_earnings()$$);
-- SELECT cron.schedule('distribute-apex-pool', '0 */24 * * *', $$SELECT distribute_apex_pool()$$);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_slots_user ON user_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_11_user ON matrix_11(user_id);
CREATE INDEX IF NOT EXISTS idx_matrix_11_sponsor ON matrix_11(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_matrix_tree_owner ON matrix_tree(owner_id);
CREATE INDEX IF NOT EXISTS idx_matrix_tree_user ON matrix_tree(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_user ON earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_apex_pool_distributions_date ON apex_pool_distributions(distributed_at);
