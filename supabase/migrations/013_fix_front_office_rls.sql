
-- 1. Visit Requests: Grant Access to Front Office & Medical Staff
DROP POLICY IF EXISTS "Staff can view visit requests" ON public.visit_requests;
DROP POLICY IF EXISTS "Staff can update visit requests" ON public.visit_requests;

CREATE POLICY "Staff can view visit requests" 
ON public.visit_requests FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);

CREATE POLICY "Staff can update visit requests" 
ON public.visit_requests FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);


-- 2. Provider Referrals: Grant Access to Front Office & Medical Staff
DROP POLICY IF EXISTS "Staff can view referrals" ON public.provider_referrals;
DROP POLICY IF EXISTS "Staff can update referrals" ON public.provider_referrals;

CREATE POLICY "Staff can view referrals" 
ON public.provider_referrals FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);

CREATE POLICY "Staff can update referrals" 
ON public.provider_referrals FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);


-- 3. Appointments: Grant Full Management to Front Office & Medical Staff
DROP POLICY IF EXISTS "Staff can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Staff can delete appointments" ON public.appointments;

CREATE POLICY "Staff can view appointments" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);

CREATE POLICY "Staff can insert appointments" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);

CREATE POLICY "Staff can update appointments" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);

CREATE POLICY "Staff can delete appointments" 
ON public.appointments FOR DELETE 
TO authenticated 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.user_roles 
    WHERE role IN ('admin', 'front_office', 'medical_staff')
  )
);
