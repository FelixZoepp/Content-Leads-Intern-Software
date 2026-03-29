-- ============================================
-- Cashflow OS V2: Extended KPI tracking fields
-- and content calendar post types
-- ============================================

-- Add extended tracking columns to kpi_entries
ALTER TABLE public.kpi_entries
  ADD COLUMN IF NOT EXISTS looms_sent INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS looms_viewed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_received INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_from_comments INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS setting_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS closing_calls INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS umsatz NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS training_done BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS training_einwand TEXT;

-- Add post_type to content_posts
ALTER TABLE public.content_posts
  ADD COLUMN IF NOT EXISTS post_type TEXT DEFAULT 'content' CHECK (post_type IN ('content', 'lead'));
