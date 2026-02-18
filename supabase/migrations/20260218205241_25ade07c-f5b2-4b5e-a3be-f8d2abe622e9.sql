
-- Add comprehensive onboarding fields to tenants
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS team_size text,
ADD COLUMN IF NOT EXISTS target_audience text,
ADD COLUMN IF NOT EXISTS website_url text,
ADD COLUMN IF NOT EXISTS monthly_budget numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS linkedin_followers_current integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS posting_frequency text,
ADD COLUMN IF NOT EXISTS linkedin_experience text,
ADD COLUMN IF NOT EXISTS current_leads_per_month integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_revenue_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_conversion_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_leads_monthly integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_revenue_monthly numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS goal_timeframe text,
ADD COLUMN IF NOT EXISTS primary_goal text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
