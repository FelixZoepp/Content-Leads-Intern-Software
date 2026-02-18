
-- Fulfillment tracking per tenant/customer
CREATE TABLE public.fulfillment_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  
  -- Onboarding
  deal_closed_at DATE,
  onboarding_started_at DATE,
  onboarding_completed_at DATE,
  
  -- Project timeline
  project_start_date DATE,
  project_planned_end DATE,
  project_actual_end DATE,
  project_status TEXT NOT NULL DEFAULT 'onboarding' CHECK (project_status IN ('onboarding', 'active', 'paused', 'completed', 'cancelled')),
  
  -- Milestones
  milestones_total INTEGER DEFAULT 0,
  milestones_completed INTEGER DEFAULT 0,
  
  -- Satisfaction & Retention
  csat_score NUMERIC(3,1),
  nps_score INTEGER,
  contract_start DATE,
  contract_end DATE,
  contract_renewed BOOLEAN DEFAULT false,
  churn_reason TEXT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.fulfillment_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all fulfillment" ON public.fulfillment_tracking
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all fulfillment" ON public.fulfillment_tracking
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own fulfillment" ON public.fulfillment_tracking
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = fulfillment_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Clients can update their own fulfillment" ON public.fulfillment_tracking
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = fulfillment_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

CREATE POLICY "Clients can insert their own fulfillment" ON public.fulfillment_tracking
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM tenants WHERE tenants.id = fulfillment_tracking.tenant_id AND tenants.user_id = auth.uid()
  ));

-- Timestamp trigger
CREATE TRIGGER update_fulfillment_updated_at
  BEFORE UPDATE ON public.fulfillment_tracking
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
