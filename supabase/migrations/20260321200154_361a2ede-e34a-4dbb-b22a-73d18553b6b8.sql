CREATE POLICY "Admins can insert all metrics"
ON public.metrics_snapshot
FOR INSERT
TO public
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));