-- ============================================
-- Seed subscription_plans
--
-- Without these rows the Pricing page renders empty and create-checkout has
-- no price IDs to map — effectively disabling billing. A UNIQUE constraint
-- on tier makes the inserts idempotent so the migration re-runs safely in
-- any environment. Existing rows are reconciled via ON CONFLICT so a local
-- DB that already has partial data converges on the canonical values.
-- ============================================

-- Deduplicate any pre-existing rows per tier before adding the constraint.
-- Keeps the most recently created row per tier; drops the rest.
DELETE FROM public.subscription_plans a
USING public.subscription_plans b
WHERE a.tier = b.tier
  AND a.ctid <> b.ctid
  AND a.created_at < b.created_at;

ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_tier_unique;
ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_tier_unique UNIQUE (tier);

INSERT INTO public.subscription_plans
  (name, tier, description, price_cents, duration_months, tokens_per_period, features, is_active, stripe_price_id)
VALUES
  (
    'Teste Gratuito',
    'free_trial',
    'Acesso temporário para novos usuários experimentarem a plataforma.',
    0,
    1,
    3,
    '["biometry", "gestational", "fertility", "efw"]'::jsonb,
    true,
    ''
  ),
  (
    'Pessoal',
    'basic',
    'Ideal para uso individual com as calculadoras essenciais.',
    1990,
    1,
    50,
    '["biometry", "gestational", "fertility", "efw"]'::jsonb,
    true,
    'price_1TD5nyFRyKUci3hFbzlg1Bf9'
  ),
  (
    'Clínico',
    'professional',
    'Para profissionais que atendem múltiplas pacientes e precisam de gestão completa.',
    4990,
    1,
    200,
    '["biometry", "gestational", "fertility", "efw", "doppler", "trisomy_risk"]'::jsonb,
    true,
    'price_1TDAobFRyKUci3hFRWAewvDh'
  ),
  (
    'Clínico Premium',
    'premium',
    'Acesso completo a todas as calculadoras e recursos avançados.',
    9990,
    1,
    9999,
    '["biometry", "gestational", "fertility", "efw", "doppler", "growth_curve", "trisomy_risk", "preeclampsia_risk"]'::jsonb,
    true,
    'price_1TDApBFRyKUci3hFyLZCVYxE'
  )
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  duration_months = EXCLUDED.duration_months,
  tokens_per_period = EXCLUDED.tokens_per_period,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  stripe_price_id = CASE
    WHEN EXCLUDED.stripe_price_id <> '' THEN EXCLUDED.stripe_price_id
    ELSE public.subscription_plans.stripe_price_id
  END;

-- Helpful index for create-checkout's allowlist lookup on stripe_price_id.
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_id
  ON public.subscription_plans (stripe_price_id)
  WHERE stripe_price_id <> '';
