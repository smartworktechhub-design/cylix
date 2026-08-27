-- Migration: Add signup_commission and signup_bonus to transactions type check constraint
-- Run this in Supabase SQL Editor

-- Drop old constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;

-- Recreate with all types
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN (
    'slot_purchase',
    'withdraw',
    'referral',
    'daily_earning',
    'matrix_earning',
    'pool_earning',
    'ascension_credit',
    'upgrade',
    'recycle',
    'presale_purchase',
    'presale_referral',
    'signup_bonus',
    'signup_commission',
    'vesting_claim_liquid',
    'vesting_claim_compound'
  ));
