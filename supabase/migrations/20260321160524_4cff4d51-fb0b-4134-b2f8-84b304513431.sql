
-- Helper functions for advisor role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin') $$;

CREATE OR REPLACE FUNCTION public.is_advisor(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'advisor') $$;

-- RLS policies for advisors
CREATE POLICY "Advisors can view assigned tenants" ON public.tenants FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND advisor_id = auth.uid());

CREATE POLICY "Advisors can update assigned tenants" ON public.tenants FOR UPDATE TO authenticated
USING (public.is_advisor(auth.uid()) AND advisor_id = auth.uid());

CREATE POLICY "Advisors can view assigned metrics" ON public.metrics_snapshot FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = metrics_snapshot.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned csat" ON public.csat_responses FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = csat_responses.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned health scores" ON public.health_scores FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = health_scores.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned alerts" ON public.alerts FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = alerts.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned financials" ON public.financial_tracking FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = financial_tracking.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned fulfillment" ON public.fulfillment_tracking FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = fulfillment_tracking.tenant_id AND tenants.advisor_id = auth.uid()));

CREATE POLICY "Advisors can view assigned ai summaries" ON public.ai_summaries FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND (tenant_id IS NULL OR EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = ai_summaries.tenant_id AND tenants.advisor_id = auth.uid())));

CREATE POLICY "Advisors can view assigned benchmarks" ON public.benchmarks FOR SELECT TO authenticated
USING (public.is_advisor(auth.uid()) AND EXISTS (SELECT 1 FROM public.tenants WHERE tenants.id = benchmarks.tenant_id AND tenants.advisor_id = auth.uid()));

-- Allow admins to manage advisor_id (already covered by existing admin policies)
-- Allow admins to view profiles (needed for advisor names in reports)
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));
