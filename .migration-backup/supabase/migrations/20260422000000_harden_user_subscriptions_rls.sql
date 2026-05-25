-- ============================================
-- Harden user_subscriptions RLS
--
-- The original policies allowed authenticated users to INSERT and UPDATE
-- rows where doctor_id = auth.uid(). This let a malicious client overwrite
-- their own tokens_remaining, end_date, status, or stripe_subscription_id —
-- effectively granting themselves unlimited tokens or bypassing billing.
--
-- Every legitimate write happens either via edge functions using the
-- service role key (which bypasses RLS) or via SECURITY DEFINER RPCs such
-- as use_token(). Clients only need SELECT on their own rows.
-- ============================================

DROP POLICY IF EXISTS "Doctors can insert own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Doctors can update own subscriptions" ON public.user_subscriptions;

-- Explicitly deny DELETE from clients; server-side cleanup uses service role.
DROP POLICY IF EXISTS "No client deletes on subscriptions" ON public.user_subscriptions;
CREATE POLICY "No client deletes on subscriptions"
  ON public.user_subscriptions
  FOR DELETE
  USING (false);
