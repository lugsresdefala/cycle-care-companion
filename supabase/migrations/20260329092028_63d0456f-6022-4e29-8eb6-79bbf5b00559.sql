-- Add new calculation types for risk calculators
ALTER TYPE public.calculation_type ADD VALUE IF NOT EXISTS 'preeclampsia_risk';
ALTER TYPE public.calculation_type ADD VALUE IF NOT EXISTS 'trisomy_risk';

-- Update plan features: remove standalone bpd/crl (now part of biometry), add risk calculators
-- Pessoal (basic): biometry covers CRL+DBP, keep basics
UPDATE public.subscription_plans 
SET features = '["biometry", "gestational", "fertility", "efw"]'::jsonb
WHERE tier = 'basic';

-- Clínico (professional): add trisomy_risk
UPDATE public.subscription_plans 
SET features = '["biometry", "gestational", "fertility", "efw", "doppler", "trisomy_risk"]'::jsonb
WHERE tier = 'professional';

-- Clínico Premium: all calculators including both risk calculators
UPDATE public.subscription_plans 
SET features = '["biometry", "gestational", "fertility", "efw", "doppler", "growth_curve", "trisomy_risk", "preeclampsia_risk"]'::jsonb
WHERE tier = 'premium';

-- Free trial: basic features only
UPDATE public.subscription_plans 
SET features = '["biometry", "gestational", "fertility", "efw"]'::jsonb
WHERE tier = 'free_trial';