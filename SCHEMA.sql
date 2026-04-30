-- ============================================================
-- FinTrack — Complete Database Schema
-- Run this entire file in your Supabase SQL Editor once.
-- It creates all tables, indexes, RLS policies, triggers,
-- and helper functions required by the application.
-- ============================================================


-- ============================================================
-- SECTION 1: CORE TABLES
-- ============================================================

-- profiles
-- Auto-created for every new auth user via trigger (see Section 4).
-- Stores display name, currency preference, and avatar.
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  currency    TEXT NOT NULL DEFAULT 'USD',
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- categories
-- User-defined labels (with optional colour + emoji icon) used to group
-- subscriptions and transactions.
CREATE TABLE IF NOT EXISTS categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  color      TEXT,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- subscriptions
-- Each row is one recurring service the user pays for.
CREATE TABLE IF NOT EXISTS subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  amount            NUMERIC(12, 2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  billing_cycle     TEXT CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  next_payment_date DATE NOT NULL,
  category_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'cancelled', 'paused')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- transactions
-- One-off or manually logged payments; can optionally be linked to a subscription.
CREATE TABLE IF NOT EXISTS transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 2: PAYMENT ALERTS TABLES
-- ============================================================

-- notification_preferences
-- One row per user; controls which email reminders they receive.
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id       UUID PRIMARY KEY NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  alert_7_days  BOOLEAN NOT NULL DEFAULT TRUE,
  alert_3_days  BOOLEAN NOT NULL DEFAULT TRUE,
  alert_1_day   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- payment_alerts
-- In-app notification records created by the daily cron job.
CREATE TABLE IF NOT EXISTS payment_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id     UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  days_until_payment  INTEGER NOT NULL,
  message             TEXT NOT NULL,
  dismissed           BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- SECTION 3: INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id           ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id        ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment   ON subscriptions(next_payment_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status         ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id         ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date            ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_payment_alerts_user_id       ON payment_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_alerts_dismissed     ON payment_alerts(dismissed);


-- ============================================================
-- SECTION 4: TRIGGER — auto-create profile on signup
-- ============================================================

-- Function called by the trigger below
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger: fires after a new row is inserted into auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SECTION 5: RPC FUNCTION — landing page stats
-- ============================================================

-- Called by the public landing page to display aggregate stats
-- (does NOT expose any user-identifiable data).
CREATE OR REPLACE FUNCTION public.get_landing_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_subs    BIGINT;
  total_monthly NUMERIC;
BEGIN
  SELECT
    COUNT(*),
    COALESCE(SUM(
      CASE billing_cycle
        WHEN 'yearly'  THEN amount / 12
        WHEN 'weekly'  THEN amount * 4.33
        ELSE amount
      END
    ), 0)
  INTO total_subs, total_monthly
  FROM subscriptions
  WHERE status = 'active';

  RETURN json_build_object(
    'total_subscriptions',   total_subs,
    'total_monthly_spending', total_monthly
  );
END;
$$;


-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on every table
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories             ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_alerts         ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE USING (auth.uid() = id);

CREATE POLICY "Service can insert profiles"
  ON profiles FOR INSERT WITH CHECK (TRUE);

-- categories
CREATE POLICY "Users can manage own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- subscriptions
CREATE POLICY "Users can manage own subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- transactions
CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- notification_preferences
CREATE POLICY "Users can manage own notification preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- payment_alerts
CREATE POLICY "Users can view own payment alerts"
  ON payment_alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can dismiss own payment alerts"
  ON payment_alerts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service can create payment alerts"
  ON payment_alerts FOR INSERT WITH CHECK (TRUE);
