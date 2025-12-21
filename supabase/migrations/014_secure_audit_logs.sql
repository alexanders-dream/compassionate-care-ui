-- Migration: RESTRICT audit_logs insert to admins only
-- This prevents regular authenticated users from creating fake logs
-- And forces frontend to either fail gracefully or backend to handle logging

DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON public.audit_logs;

CREATE POLICY "Allow admins to insert audit logs" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
