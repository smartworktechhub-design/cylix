-- CYLIX CXL Token Ecosystem - Migration
-- Phase 1: Airdrop + Presale tables
-- Date: 2026-08-25

-- ============================================
-- 1. AIRDROP CONFIG (global settings)
-- ============================================
CREATE TABLE IF NOT EXISTS airdrop_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default config
INSERT INTO airdrop_config (key, value) VALUES
  ('cxl_total_supply', '1100000'),
  ('cxl_sold', '0'),
  ('airdrop_phase', '1'),
  ('phase1_bonus', '10'),
  ('phase2_bonus', '7'),
  ('phase3_bonus', '5'),
  ('l1_rate', '0.50'),
  ('l2_rate', '0.30'),
  ('l3_rate', '0.20'),
  ('l4_rate', '0.10'),
  ('l5_rate', '0.10'),
  ('presale_start_day', '1'),
  ('presale_end_day', '90'),
  ('presale_min_cxl', '10'),
  ('presale_max_cxl', '100'),
  ('presale_start_price', '0.01'),
  ('presale_daily_increment', '0.01'),
  ('presale_current_price', '0.01'),
  ('current_day', '1'),
  ('airdrop_started_at', ''),
  ('total_users_enrolled', '0'),
  ('is_active', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. USER TOKEN BALANCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_token_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
  cxl_balance DECIMAL(20,8) DEFAULT 0,
  cxl_earned_total DECIMAL(20,8) DEFAULT 0,
  cxl_liquid DECIMAL(20,8) DEFAULT 0,
  cxl_staked DECIMAL(20,8) DEFAULT 0,
  signup_bonus_claimed BOOLEAN DEFAULT false,
  signup_bonus_amount DECIMAL(20,8) DEFAULT 0,
  last_claim_date DATE,
  consecutive_claim_days INTEGER DEFAULT 0,
  total_claim_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_token_balances_user ON user_token_balances(user_id);

-- ============================================
-- 3. AIRDROP EARNINGS (daily claim log)
-- ============================================
CREATE TABLE IF NOT EXISTS airdrop_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  day_number INTEGER NOT NULL,
  level_1_cxl DECIMAL(20,8) DEFAULT 0,
  level_2_cxl DECIMAL(20,8) DEFAULT 0,
  level_3_cxl DECIMAL(20,8) DEFAULT 0,
  level_4_cxl DECIMAL(20,8) DEFAULT 0,
  level_5_cxl DECIMAL(20,8) DEFAULT 0,
  total_cxl DECIMAL(20,8) DEFAULT 0,
  claimed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_airdrop_earnings_user ON airdrop_earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_airdrop_earnings_day ON airdrop_earnings(day_number);

-- ============================================
-- 4. PRESALE PURCHASES
-- ============================================
CREATE TABLE IF NOT EXISTS presale_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  cxl_amount DECIMAL(20,8) NOT NULL,
  price_per_cxl DECIMAL(20,4) NOT NULL,
  total_usdt DECIMAL(20,4) NOT NULL,
  day_number INTEGER NOT NULL,
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'refunded')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presale_purchases_user ON presale_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_presale_purchases_day ON presale_purchases(day_number);

-- ============================================
-- 5. ADD CXL FIELDS TO users TABLE
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS l2_directs INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS l2_unlocked BOOLEAN DEFAULT false;

-- ============================================
-- 6. USER NOTIFICATIONS TABLE (extend if needed)
-- ============================================
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';
