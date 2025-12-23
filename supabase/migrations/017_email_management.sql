-- =============================================================================
-- Email Management System - Database Migration
-- =============================================================================
-- Creates tables for email templates and email logs

-- -----------------------------------------------------------------------------
-- 1. Email Templates Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    default_for_context TEXT, -- 'appointment', 'visit_request', 'referral' (only one template per context)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);

-- Add unique constraint on default_for_context (only one default per context type)
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_default_context 
ON public.email_templates(default_for_context) 
WHERE default_for_context IS NOT NULL AND is_active = true;

-- -----------------------------------------------------------------------------
-- 2. Email Logs Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
    sent_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    context_type TEXT, -- 'visit_request', 'referral', 'appointment', 'custom'
    context_id UUID,
    status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT email_logs_pkey PRIMARY KEY (id)
);

-- -----------------------------------------------------------------------------
-- 3. Enable Row Level Security
-- -----------------------------------------------------------------------------
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4. RLS Policies for Email Templates
-- -----------------------------------------------------------------------------
-- Authenticated users can view active templates
CREATE POLICY "Authenticated users can view templates"
ON public.email_templates FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can manage templates
CREATE POLICY "Authenticated users can manage templates"
ON public.email_templates FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5. RLS Policies for Email Logs
-- -----------------------------------------------------------------------------
-- Staff can view email logs
CREATE POLICY "Staff can view email logs"
ON public.email_logs FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- Staff can insert email logs
CREATE POLICY "Staff can insert email logs"
ON public.email_logs FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- -----------------------------------------------------------------------------
-- 6. Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_email_logs_context ON public.email_logs(context_type, context_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_by ON public.email_logs(sent_by);
CREATE INDEX IF NOT EXISTS idx_email_logs_created ON public.email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON public.email_templates(is_active);

-- -----------------------------------------------------------------------------
-- 7. Seed Default Templates
-- -----------------------------------------------------------------------------
INSERT INTO public.email_templates (name, subject, body, category, default_for_context) VALUES
('Appointment Reminder', 'Reminder: Your appointment is coming up', 
'Hi {{patient_name}},

This is a friendly reminder that you have an appointment scheduled for {{appointment_date}} at {{appointment_time}} with {{clinician}}.

If you need to reschedule, please contact us as soon as possible.

Best,
Compassionate Care Team', 'reminder', 'appointment'),

('Patient Outreach', 'Regarding Your Visit Request', 
'Hi {{patient_name}},

Thank you for reaching out about your {{wound_type}} concern. We would like to schedule a visit to assess your needs.

Please call us at your earliest convenience to confirm an appointment.

Best,
Compassionate Care Team', 'general', 'visit_request'),

('Provider Follow-Up', 'Regarding Your Patient Referral', 
'Dear {{provider_name}},

Thank you for referring {{patient_name}} to our care. We have received the referral for {{wound_type}} and will be reaching out to schedule an appointment.

We will keep you updated on the patient''s progress.

Best regards,
Compassionate Care Team', 'general', 'referral'),

('Request Review', 'How was your visit with Compassionate Care?', 
'Hi {{patient_name}},

We hope your recent visit went well. We would love to hear your feedback to help us improve.

Please take a moment to leave us a review.

Best,
Compassionate Care Team', 'follow-up', NULL),

('Follow Up', 'Checking in on your progress', 
'Hi {{patient_name}},

Just checking in to see how your wound is healing. Do you have any questions or concerns?

Best,
Compassionate Care Team', 'follow-up', NULL),

('Visit Preparation', 'Preparing for your upcoming visit', 
'Hi {{patient_name}},

For our upcoming visit on {{appointment_date}} at {{appointment_time}}, please ensure the wound area is accessible and you have a clean space prepared.

See you soon!

Compassionate Care Team', 'reminder', NULL)
ON CONFLICT (default_for_context) WHERE default_for_context IS NOT NULL DO NOTHING;

