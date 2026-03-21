
ALTER TABLE public.icp_customers
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS employee_count text,
  ADD COLUMN IF NOT EXISTS annual_revenue text,
  ADD COLUMN IF NOT EXISTS lead_source text,
  ADD COLUMN IF NOT EXISTS close_duration text,
  ADD COLUMN IF NOT EXISTS payment_status text,
  ADD COLUMN IF NOT EXISTS payment_speed text,
  ADD COLUMN IF NOT EXISTS collaboration_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS result_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS problem_awareness text;
