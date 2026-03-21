
-- 1. Add 'advisor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'advisor';

-- 2. Add advisor_id column to tenants
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS advisor_id uuid;
