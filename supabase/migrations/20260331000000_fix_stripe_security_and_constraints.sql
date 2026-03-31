-- ============================================
-- Fix use_token: use auth.uid() instead of parameter to prevent
-- one user draining another user's tokens
-- ============================================

CREATE OR REPLACE FUNCTION public.use_token()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_id UUID;
  calling_user UUID := auth.uid();
BEGIN
  IF calling_user IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO sub_id FROM public.user_subscriptions
  WHERE doctor_id = calling_user
    AND (status = 'active' OR status = 'trial')
    AND end_date > now()
    AND tokens_remaining > 0
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF sub_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.user_subscriptions
  SET tokens_remaining = tokens_remaining - 1,
      tokens_used = tokens_used + 1,
      updated_at = now()
  WHERE id = sub_id;

  RETURN TRUE;
END;
$$;

-- Drop the old version that accepts a parameter
DROP FUNCTION IF EXISTS public.use_token(UUID);

-- ============================================
-- Add unique constraint to prevent duplicate subscription records
-- from race conditions between webhook events
-- ============================================

-- First clean up any existing duplicates (keep the most recent)
DELETE FROM public.user_subscriptions a
USING public.user_subscriptions b
WHERE a.doctor_id = b.doctor_id
  AND a.stripe_subscription_id = b.stripe_subscription_id
  AND a.stripe_subscription_id IS NOT NULL
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_stripe_subscription
  ON public.user_subscriptions (doctor_id, stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- ============================================
-- Fix get_remaining_tokens to also use auth.uid()
-- ============================================

CREATE OR REPLACE FUNCTION public.get_remaining_tokens()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tokens_remaining FROM public.user_subscriptions
     WHERE doctor_id = auth.uid()
       AND (status = 'active' OR status = 'trial')
       AND end_date > now()
     ORDER BY created_at DESC
     LIMIT 1),
    0
  )
$$;

-- Drop the old version that accepts a parameter
DROP FUNCTION IF EXISTS public.get_remaining_tokens(UUID);
