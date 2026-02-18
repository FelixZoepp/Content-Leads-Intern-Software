
-- Financial tracking per tenant
CREATE TABLE public.financial_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  period_month DATE NOT NULL, -- first of month
  
  -- Revenue
  cash_collected NUMERIC DEFAULT 0,
  revenue_recurring NUMERIC DEFAULT 0,
  revenue_onetime NUMERIC DEFAULT 0,
  
  -- Costs
  costs_ads NUMERIC DEFAULT 0,
  costs_tools NUMERIC DEFAULT 0,
  costs_personnel NUMERIC DEFAULT 0,
  costs_other NUMERIC DEFAULT 0,
  
  -- Invoices
  invoices_open_count INTEGER DEFAULT 0,
  invoices_open_amount NUMERIC DEFAULT 0,
  invoices_overdue_count INTEGER DEFAULT 0,
  invoices_overdue_amount NUMERIC DEFAULT 0,
  avg_days_to_payment INTEGER DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id, period_month)
);

ALTER TABLE public.financial_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all financials" ON public.financial_tracking
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view own financials" ON public.financial_tracking
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = financial_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Clients can insert own financials" ON public.financial_tracking
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = financial_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Clients can update own financials" ON public.financial_tracking
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = financial_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

CREATE TRIGGER update_financial_updated_at
  BEFORE UPDATE ON public.financial_tracking
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
