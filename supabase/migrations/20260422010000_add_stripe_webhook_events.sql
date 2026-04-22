-- ============================================
-- Stripe webhook event idempotency
--
-- Stripe retries webhooks on non-2xx responses or timeouts, so the same
-- event.id can arrive more than once. Without deduplication, a retried
-- `checkout.session.completed` or `invoice.payment_succeeded` can double
-- process a subscription (e.g. reset tokens_used, re-allocate tokens).
--
-- This table records every event id we have acknowledged. The webhook
-- handler inserts the row at the start of processing; the UNIQUE
-- constraint on event_id turns a replay into a harmless conflict.
-- ============================================

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload_created_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type
  ON public.stripe_webhook_events (event_type, processed_at DESC);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- No client access: reads and writes are only for the webhook edge function
-- running with the service role key (which bypasses RLS).
DROP POLICY IF EXISTS "No client access on webhook events" ON public.stripe_webhook_events;
CREATE POLICY "No client access on webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- ============================================
-- Per-user checkout rate limiting
--
-- Without rate limiting a logged-in user can spam `create-checkout` and
-- generate hundreds of abandoned Stripe sessions (noisy metrics, wasted
-- Stripe API budget, and a DoS vector against our function). One row is
-- written per attempt and the edge function counts recent rows to enforce
-- a rolling window.
-- ============================================

CREATE TABLE IF NOT EXISTS public.stripe_checkout_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  price_id TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_checkout_attempts_user_time
  ON public.stripe_checkout_attempts (doctor_id, created_at DESC);

ALTER TABLE public.stripe_checkout_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "No client access on checkout attempts" ON public.stripe_checkout_attempts;
CREATE POLICY "No client access on checkout attempts"
  ON public.stripe_checkout_attempts
  FOR ALL
  USING (false)
  WITH CHECK (false);
