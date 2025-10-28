-- Create app_role enum for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create tenants table
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text,
  linkedin_url text,
  sheet_url text,
  sheet_mapping jsonb,
  last_sync_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create metrics_snapshot table
CREATE TABLE public.metrics_snapshot (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  period_date date NOT NULL,
  period_type text CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  posts int DEFAULT 0,
  impressions int DEFAULT 0,
  likes int DEFAULT 0,
  comments int DEFAULT 0,
  new_followers int DEFAULT 0,
  leads_total int DEFAULT 0,
  leads_qualified int DEFAULT 0,
  appointments int DEFAULT 0,
  deals int DEFAULT 0,
  revenue numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, period_date, period_type)
);

ALTER TABLE public.metrics_snapshot ENABLE ROW LEVEL SECURITY;

-- Create health_scores table
CREATE TABLE public.health_scores (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  score int NOT NULL CHECK (score BETWEEN 0 AND 100),
  color text CHECK (color IN ('red', 'amber', 'green')),
  rationale_text text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;

-- Create ai_summaries table
CREATE TABLE public.ai_summaries (
  id bigserial PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  scope text CHECK (scope IN ('client_daily', 'client_weekly', 'admin_portfolio')),
  summary_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_summaries ENABLE ROW LEVEL SECURITY;

-- Create csat_responses table
CREATE TABLE public.csat_responses (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  respondent_email text,
  csat_1_5 int CHECK (csat_1_5 BETWEEN 1 AND 5),
  nps_0_10 int CHECK (nps_0_10 BETWEEN 0 AND 10),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.csat_responses ENABLE ROW LEVEL SECURITY;

-- Create alerts table
CREATE TABLE public.alerts (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  type text,
  severity text CHECK (severity IN ('low', 'medium', 'high')),
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for tenants
CREATE POLICY "Clients can view their own tenant"
  ON public.tenants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all tenants"
  ON public.tenants FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can update their own tenant"
  ON public.tenants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all tenants"
  ON public.tenants FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can insert their own tenant"
  ON public.tenants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for metrics_snapshot
CREATE POLICY "Clients can view their own metrics"
  ON public.metrics_snapshot FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = metrics_snapshot.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all metrics"
  ON public.metrics_snapshot FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert metrics"
  ON public.metrics_snapshot FOR INSERT
  WITH CHECK (true);

-- RLS Policies for health_scores
CREATE POLICY "Clients can view their own health scores"
  ON public.health_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = health_scores.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all health scores"
  ON public.health_scores FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert health scores"
  ON public.health_scores FOR INSERT
  WITH CHECK (true);

-- RLS Policies for ai_summaries
CREATE POLICY "Clients can view their own AI summaries"
  ON public.ai_summaries FOR SELECT
  USING (
    tenant_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = ai_summaries.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all AI summaries"
  ON public.ai_summaries FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert AI summaries"
  ON public.ai_summaries FOR INSERT
  WITH CHECK (true);

-- RLS Policies for csat_responses
CREATE POLICY "Clients can insert their own CSAT responses"
  ON public.csat_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = csat_responses.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view their own CSAT responses"
  ON public.csat_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = csat_responses.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all CSAT responses"
  ON public.csat_responses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for alerts
CREATE POLICY "Clients can view their own alerts"
  ON public.alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tenants
      WHERE tenants.id = alerts.tenant_id
      AND tenants.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all alerts"
  ON public.alerts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update alerts"
  ON public.alerts FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alerts"
  ON public.alerts FOR INSERT
  WITH CHECK (true);