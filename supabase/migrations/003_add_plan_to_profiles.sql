-- Add plan and next repayment date to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT,
ADD COLUMN IF NOT EXISTS next_billing_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.plan IS 'The active subscription tier (base, pro, vanguard)';
COMMENT ON COLUMN public.profiles.next_billing_at IS 'The date when the next payment is expected or the current period ends';