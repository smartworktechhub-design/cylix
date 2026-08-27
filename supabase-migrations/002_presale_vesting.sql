-- Presale Vesting Schedule Table
CREATE TABLE IF NOT EXISTS presale_vesting_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  presale_purchase_id UUID REFERENCES presale_purchases(id) ON DELETE SET NULL,
  total_cxl NUMERIC NOT NULL DEFAULT 0,
  staked_cxl NUMERIC NOT NULL DEFAULT 0,
  vested_cxl NUMERIC NOT NULL DEFAULT 0,
  monthly_amount NUMERIC NOT NULL DEFAULT 0,
  current_installment INT NOT NULL DEFAULT 0,
  total_installments INT NOT NULL DEFAULT 11,
  next_unlock_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'locked',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vesting_user ON presale_vesting_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_vesting_status ON presale_vesting_schedule(status);

-- Add vesting columns to user_token_balances
ALTER TABLE user_token_balances ADD COLUMN IF NOT EXISTS presale_vested_locked NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE user_token_balances ADD COLUMN IF NOT EXISTS presale_vested_claimed NUMERIC NOT NULL DEFAULT 0;
