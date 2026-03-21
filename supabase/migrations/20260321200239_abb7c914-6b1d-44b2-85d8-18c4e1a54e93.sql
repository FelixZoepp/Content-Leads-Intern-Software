CREATE TABLE public.icp_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  industry text,
  has_paid boolean DEFAULT false,
  days_to_payment integer,
  deal_value numeric,
  notes text,
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.icp_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all icp_customers"
ON public.icp_customers FOR ALL TO public
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Advisors can view assigned icp_customers"
ON public.icp_customers FOR SELECT TO authenticated
USING (is_advisor(auth.uid()) AND EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = icp_customers.tenant_id AND tenants.advisor_id = auth.uid()
));

CREATE POLICY "Clients can view own icp_customers"
ON public.icp_customers FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = icp_customers.tenant_id AND tenants.user_id = auth.uid()
));

CREATE POLICY "Clients can insert own icp_customers"
ON public.icp_customers FOR INSERT TO public
WITH CHECK (EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = icp_customers.tenant_id AND tenants.user_id = auth.uid()
));