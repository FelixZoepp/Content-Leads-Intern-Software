
-- Benchmarks table: stores per-tenant benchmark thresholds for each KPI
-- 3 tiers: tier1_max (rot/schlecht), tier2_max (gelb/okay), above = grün/gut
CREATE TABLE public.benchmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  metric_key text NOT NULL,
  metric_label text NOT NULL,
  tier1_max numeric NOT NULL DEFAULT 0,
  tier2_max numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'number',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, metric_key)
);

ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all benchmarks"
  ON public.benchmarks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view own benchmarks"
  ON public.benchmarks FOR SELECT
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = benchmarks.tenant_id AND tenants.user_id = auth.uid()));

CREATE POLICY "Clients can insert own benchmarks"
  ON public.benchmarks FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = benchmarks.tenant_id AND tenants.user_id = auth.uid()));

CREATE POLICY "Clients can update own benchmarks"
  ON public.benchmarks FOR UPDATE
  USING (EXISTS (SELECT 1 FROM tenants WHERE tenants.id = benchmarks.tenant_id AND tenants.user_id = auth.uid()));

CREATE TRIGGER update_benchmarks_updated_at
  BEFORE UPDATE ON public.benchmarks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
