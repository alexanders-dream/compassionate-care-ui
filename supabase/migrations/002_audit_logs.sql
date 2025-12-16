-- Migration: Create audit_logs table for admin action logging
-- Run this in Supabase Dashboard -> SQL Editor

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL, -- e.g., 'create', 'update', 'delete'
    entity_type TEXT NOT NULL, -- e.g., 'appointment', 'testimonial', 'service'
    entity_id TEXT NOT NULL, -- ID of the entity affected
    entity_name TEXT, -- Human-readable name (optional, for display)
    previous_data JSONB, -- Data before the change (for updates/deletes)
    new_data JSONB, -- Data after the change (for creates/updates)
    metadata JSONB, -- Additional context (IP, user agent, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users to read audit logs
CREATE POLICY "Allow admins to read audit logs" ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Create policy for authenticated users to insert audit logs
CREATE POLICY "Allow authenticated users to insert audit logs" ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
