-- Add presale transaction types to check constraint
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check CHECK (type IN (
  'slot_purchase', 'upgrade', 'recycle', 'withdraw', 'withdrawal',
  'daily_earning', 'matrix_earning', 'pool_earning', 'referral', 'ascension_credit',
  'presale_purchase', 'presale_referral'
));
