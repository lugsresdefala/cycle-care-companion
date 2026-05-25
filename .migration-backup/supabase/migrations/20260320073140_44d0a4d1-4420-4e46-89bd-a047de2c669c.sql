
-- Enum for subscription plan types
CREATE TYPE public.plan_tier AS ENUM ('free_trial', 'basic', 'professional', 'premium');

-- Enum for calculation types
CREATE TYPE public.calculation_type AS ENUM ('biometry', 'bpd', 'crl', 'efw', 'doppler', 'growth_curve', 'gestational', 'fertility');

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  specialty TEXT DEFAULT 'Obstetrícia',
  crm_number TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  medical_record_id TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own patients" ON public.patients FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert own patients" ON public.patients FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update own patients" ON public.patients FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete own patients" ON public.patients FOR DELETE USING (auth.uid() = doctor_id);

-- ============================================
-- 3. EXAM HISTORY TABLE
-- ============================================
CREATE TABLE public.exam_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  calc_type public.calculation_type NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}',
  result_data JSONB NOT NULL DEFAULT '{}',
  gestational_age_weeks INTEGER,
  gestational_age_days INTEGER,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exam_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own exams" ON public.exam_history FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert own exams" ON public.exam_history FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update own exams" ON public.exam_history FOR UPDATE USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can delete own exams" ON public.exam_history FOR DELETE USING (auth.uid() = doctor_id);

-- ============================================
-- 4. SUBSCRIPTION PLANS TABLE (public read)
-- ============================================
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier public.plan_tier NOT NULL,
  description TEXT DEFAULT '',
  price_cents INTEGER NOT NULL DEFAULT 0,
  duration_months INTEGER NOT NULL DEFAULT 1,
  tokens_per_period INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  stripe_price_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);

-- ============================================
-- 5. USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ NOT NULL,
  trial_ends_at TIMESTAMPTZ,
  tokens_remaining INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT DEFAULT '',
  stripe_subscription_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Doctors can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Doctors can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = doctor_id);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE doctor_id = _user_id
      AND status = 'active'
      AND end_date > now()
  )
$$;

-- Check if user is in trial period
CREATE OR REPLACE FUNCTION public.is_in_trial(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE doctor_id = _user_id
      AND status = 'trial'
      AND (trial_ends_at > now() OR tokens_remaining > 0)
  )
$$;

-- Get remaining tokens
CREATE OR REPLACE FUNCTION public.get_remaining_tokens(_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tokens_remaining FROM public.user_subscriptions
     WHERE doctor_id = _user_id
       AND (status = 'active' OR status = 'trial')
       AND end_date > now()
     ORDER BY created_at DESC
     LIMIT 1),
    0
  )
$$;

-- Decrement token (returns true if successful)
CREATE OR REPLACE FUNCTION public.use_token(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sub_id UUID;
BEGIN
  SELECT id INTO sub_id FROM public.user_subscriptions
  WHERE doctor_id = _user_id
    AND (status = 'active' OR status = 'trial')
    AND end_date > now()
    AND tokens_remaining > 0
  ORDER BY created_at DESC
  LIMIT 1;

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

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  
  -- Create free trial subscription (3 calculations)
  INSERT INTO public.user_subscriptions (doctor_id, plan_id, status, start_date, end_date, trial_ends_at, tokens_remaining)
  SELECT NEW.id, sp.id, 'trial', now(), now() + INTERVAL '3 days', now() + INTERVAL '3 days', 3
  FROM public.subscription_plans sp
  WHERE sp.tier = 'free_trial'
  LIMIT 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. INDEXES
-- ============================================
CREATE INDEX idx_patients_doctor ON public.patients(doctor_id);
CREATE INDEX idx_exam_history_doctor ON public.exam_history(doctor_id);
CREATE INDEX idx_exam_history_patient ON public.exam_history(patient_id);
CREATE INDEX idx_user_subscriptions_doctor ON public.user_subscriptions(doctor_id);
CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions(status, end_date);
