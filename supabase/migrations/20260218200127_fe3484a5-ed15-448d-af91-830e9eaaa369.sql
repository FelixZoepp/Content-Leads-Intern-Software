
-- Add new columns to metrics_snapshot
ALTER TABLE public.metrics_snapshot
  ADD COLUMN IF NOT EXISTS post_url TEXT,
  ADD COLUMN IF NOT EXISTS post_type TEXT,
  ADD COLUMN IF NOT EXISTS link_clicks INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS followers_current INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settings_planned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS settings_held INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS closings INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_collected NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deal_volume NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS monthly_retainer NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS words_spoken INTEGER DEFAULT 0;

-- Add unique constraint for upsert
ALTER TABLE public.metrics_snapshot
  DROP CONSTRAINT IF EXISTS metrics_snapshot_tenant_date_unique;
ALTER TABLE public.metrics_snapshot
  ADD CONSTRAINT metrics_snapshot_tenant_date_unique UNIQUE (tenant_id, period_date);

-- Allow clients to update their own metrics
CREATE POLICY "Clients can update their own metrics"
  ON public.metrics_snapshot
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = metrics_snapshot.tenant_id AND tenants.user_id = auth.uid()
  ));

-- Replace insert policy
DROP POLICY IF EXISTS "System can insert metrics" ON public.metrics_snapshot;
CREATE POLICY "Clients can insert their own metrics"
  ON public.metrics_snapshot
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = metrics_snapshot.tenant_id AND tenants.user_id = auth.uid()
  ));
