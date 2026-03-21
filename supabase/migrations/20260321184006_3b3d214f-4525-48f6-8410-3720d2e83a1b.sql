
-- Survey responses table for structured multi-step surveys
CREATE TABLE public.survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  survey_id text NOT NULL, -- 'day7', 'day21', 'recurring'
  answers jsonb NOT NULL DEFAULT '{}',
  tags text[] DEFAULT '{}',
  testimonials jsonb DEFAULT '[]',
  nps integer,
  avg_score numeric,
  total_score integer DEFAULT 0,
  review_clicked text, -- 'google', 'trustpilot', 'video', null
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;

-- Clients can insert their own survey responses
CREATE POLICY "Clients can insert own survey responses"
ON public.survey_responses FOR INSERT TO public
WITH CHECK (EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = survey_responses.tenant_id AND tenants.user_id = auth.uid()
));

-- Clients can view their own survey responses
CREATE POLICY "Clients can view own survey responses"
ON public.survey_responses FOR SELECT TO public
USING (EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = survey_responses.tenant_id AND tenants.user_id = auth.uid()
));

-- Admins can view all survey responses
CREATE POLICY "Admins can view all survey responses"
ON public.survey_responses FOR SELECT TO public
USING (has_role(auth.uid(), 'admin'::app_role));

-- Advisors can view assigned survey responses
CREATE POLICY "Advisors can view assigned survey responses"
ON public.survey_responses FOR SELECT TO authenticated
USING (is_advisor(auth.uid()) AND EXISTS (
  SELECT 1 FROM tenants WHERE tenants.id = survey_responses.tenant_id AND tenants.advisor_id = auth.uid()
));
