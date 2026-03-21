ALTER TABLE public.icp_customers
  ADD COLUMN IF NOT EXISTS close_date date,
  ADD COLUMN IF NOT EXISTS onboarding_date date,
  ADD COLUMN IF NOT EXISTS project_start_date date;