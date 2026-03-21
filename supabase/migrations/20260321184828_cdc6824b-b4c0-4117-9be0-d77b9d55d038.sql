
-- Allow admins to view all user roles (needed for advisor assignment)
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO public
USING (has_role(auth.uid(), 'admin'::app_role));
