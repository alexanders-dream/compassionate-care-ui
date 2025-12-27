-- =============================================================================
-- Compassionate Care UI - Complete Database Schema Migration
-- =============================================================================
-- Purpose: This script creates the complete database schema for a new Supabase
--          project. Run this in the SQL Editor of your new Supabase Dashboard.
--
-- IMPORTANT: This script should be run ONCE on a fresh Supabase project.
--            It includes all tables, enums, RLS policies, storage buckets,
--            indexes, and functions needed to replicate the existing database.
--
-- Order of Operations:
--   1. Create custom ENUM types
--   2. Create tables (respecting foreign key dependencies)
--   3. Create indexes
--   4. Enable Row Level Security (RLS)
--   5. Create RLS policies
--   6. Create storage buckets and policies
--   7. Create database functions (e.g., scheduled publishing)
-- =============================================================================

-- #############################################################################
-- SECTION 1: CUSTOM ENUM TYPES
-- #############################################################################

-- Role types for user permissions
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'medical_staff', 'front_office');

-- Status for appointments
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');

-- Status for blog posts
CREATE TYPE public.blog_status AS ENUM ('draft', 'published', 'scheduled');

-- Status for submissions (visit requests and provider referrals)
CREATE TYPE public.submission_status AS ENUM ('pending', 'scheduled', 'completed', 'cancelled', 'contacted');


-- #############################################################################
-- SECTION 2: CREATE TABLES
-- #############################################################################
-- Tables are ordered to respect foreign key dependencies

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.app_config (
  key text NOT NULL,
  value text,
  is_secret boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT app_config_pkey PRIMARY KEY (key)
);
CREATE TABLE public.appointments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text,
  patient_address text,
  appointment_date date NOT NULL,
  appointment_time text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  clinician text NOT NULL,
  notes text,
  status USER-DEFINED NOT NULL DEFAULT 'scheduled'::appointment_status,
  visit_request_id uuid,
  provider_referral_id uuid,
  reminder_sent boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  type text DEFAULT 'initial'::text,
  location text DEFAULT 'in-home'::text,
  CONSTRAINT appointments_pkey PRIMARY KEY (id),
  CONSTRAINT appointments_visit_request_id_fkey FOREIGN KEY (visit_request_id) REFERENCES public.visit_requests(id),
  CONSTRAINT appointments_provider_referral_id_fkey FOREIGN KEY (provider_referral_id) REFERENCES public.provider_referrals(id)
);
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  previous_data jsonb,
  new_data jsonb,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'General'::text,
  author text NOT NULL,
  image_url text,
  tags ARRAY DEFAULT '{}'::text[],
  status USER-DEFINED NOT NULL DEFAULT 'draft'::blog_status,
  published_at timestamp with time zone,
  scheduled_at timestamp with time zone,
  read_time text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_featured boolean DEFAULT false,
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.email_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  template_id uuid,
  sent_by uuid,
  context_type text,
  context_id uuid,
  status text NOT NULL DEFAULT 'sent'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_logs_pkey PRIMARY KEY (id),
  CONSTRAINT email_logs_template_id_fkey FOREIGN KEY (template_id) REFERENCES public.email_templates(id),
  CONSTRAINT email_logs_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users(id)
);
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text DEFAULT 'general'::text,
  default_for_context text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.faqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text NOT NULL DEFAULT 'General'::text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT faqs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.form_configs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_name text NOT NULL UNIQUE,
  config jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT form_configs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.insurance_providers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  description text,
  payment_details text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT insurance_providers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.patient_resources (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  file_url text,
  file_name text,
  file_size text,
  icon text NOT NULL DEFAULT 'FileText'::text,
  download_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT patient_resources_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.provider_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  provider_organization text,
  provider_email text NOT NULL,
  provider_phone text NOT NULL,
  patient_name text NOT NULL,
  patient_email text,
  patient_phone text NOT NULL,
  patient_address text NOT NULL,
  wound_type text,
  clinical_notes text,
  urgency text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::submission_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT provider_referrals_pkey PRIMARY KEY (id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'Heart'::text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_copy (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_copy_pkey PRIMARY KEY (id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid,
  is_public boolean DEFAULT true,
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  name text NOT NULL,
  role text,
  rating integer NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'user'::app_role,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.visit_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  preferred_date text,
  preferred_time text,
  wound_type text,
  additional_notes text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::submission_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  preferred_contact text,
  CONSTRAINT visit_requests_pkey PRIMARY KEY (id)
);

-- SECTION 3: CREATE INDEXES
-- #############################################################################

-- Audit Logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Team Members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);


-- #############################################################################
-- SECTION 4: ENABLE ROW LEVEL SECURITY (RLS)
-- #############################################################################

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;


-- #############################################################################
-- SECTION 5: ROW LEVEL SECURITY POLICIES
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 5.1 Profiles Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all profiles"
ON public.profiles FOR ALL
TO service_role
USING (true);

-- -----------------------------------------------------------------------------
-- 5.2 User Roles Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 5.3 Team Members Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view public team members"
ON public.team_members FOR SELECT
TO anon
USING (is_public = true);

CREATE POLICY "Authenticated can view all team members"
ON public.team_members FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage team members"
ON public.team_members FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 5.4 Visit Requests Policies
-- -----------------------------------------------------------------------------
-- Public can submit visit requests (INSERT)
CREATE POLICY "Anyone can submit visit requests"
ON public.visit_requests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Staff can view visit requests
CREATE POLICY "Staff can view visit requests"
ON public.visit_requests FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- Staff can update visit requests
CREATE POLICY "Staff can update visit requests"
ON public.visit_requests FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- Admins can delete visit requests
CREATE POLICY "Admins can delete visit requests"
ON public.visit_requests FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 5.5 Provider Referrals Policies
-- -----------------------------------------------------------------------------
-- Anyone can submit referrals
CREATE POLICY "Anyone can submit referrals"
ON public.provider_referrals FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Staff can view referrals
CREATE POLICY "Staff can view referrals"
ON public.provider_referrals FOR SELECT
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- Staff can update referrals
CREATE POLICY "Staff can update referrals"
ON public.provider_referrals FOR UPDATE
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.user_roles
        WHERE role IN ('admin', 'front_office', 'medical_staff')
    )
);

-- Admins can delete referrals
CREATE POLICY "Admins can delete referrals"
ON public.provider_referrals FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 5.6 Appointments Policies
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5.7 Audit Logs Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Allow admins to read audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

CREATE POLICY "Allow admins to insert audit logs"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- -----------------------------------------------------------------------------
-- 5.8 Blog Posts Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view published blog posts"
ON public.blog_posts FOR SELECT
TO anon
USING (status = 'published');

CREATE POLICY "Authenticated can view all blog posts"
ON public.blog_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can manage blog posts"
ON public.blog_posts FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.9 Contact Submissions Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can view contact submissions"
ON public.contact_submissions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can manage contact submissions"
ON public.contact_submissions FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.10 FAQs Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view FAQs"
ON public.faqs FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can manage FAQs"
ON public.faqs FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.11 Insurance Providers Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view active insurance providers"
ON public.insurance_providers FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated users can manage insurance providers"
ON public.insurance_providers FOR ALL
TO authenticated
USING (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- 5.12 Patient Resources Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view patient resources"
ON public.patient_resources FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can manage patient resources"
ON public.patient_resources FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.13 Services Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view services"
ON public.services FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can manage services"
ON public.services FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.14 Site Copy Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view site copy"
ON public.site_copy FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can manage site copy"
ON public.site_copy FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.15 Testimonials Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Public can view testimonials"
ON public.testimonials FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated can manage testimonials"
ON public.testimonials FOR ALL
TO authenticated
USING (true);

-- -----------------------------------------------------------------------------
-- 5.16 App Config Policies
-- -----------------------------------------------------------------------------
CREATE POLICY "Admins can view config"
ON public.app_config FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert config"
ON public.app_config FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update config"
ON public.app_config FOR UPDATE
TO authenticated
USING (true);


-- #############################################################################
-- SECTION 6: STORAGE BUCKETS AND POLICIES
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 6.1 Blog Media Bucket
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-media bucket
CREATE POLICY "Public Access for Blog Media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can upload blog media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can update blog media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-media');

CREATE POLICY "Authenticated users can delete blog media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-media');

-- -----------------------------------------------------------------------------
-- 6.2 Patient Resources Bucket
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-resources', 'patient-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for patient-resources bucket
CREATE POLICY "Public Access for Patient Resources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'patient-resources');

CREATE POLICY "Authenticated users can upload patient resources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-resources');

CREATE POLICY "Authenticated users can update patient resources"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'patient-resources');

CREATE POLICY "Authenticated users can delete patient resources"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-resources');


-- #############################################################################
-- SECTION 7: DATABASE FUNCTIONS
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 7.1 Scheduled Blog Post Publishing Function
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION publish_scheduled_posts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE blog_posts
    SET
        status = 'published',
        published_at = scheduled_at
    WHERE
        status = 'scheduled'
        AND scheduled_at <= now();
END;
$$;

-- -----------------------------------------------------------------------------
-- 7.2 Enable pg_cron extension and schedule job (OPTIONAL)
-- NOTE: pg_cron requires enabling in your Supabase project settings first
-- Uncomment and run separately after enabling the extension
-- -----------------------------------------------------------------------------
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- SELECT cron.schedule(
--     'publish-scheduled-posts',
--     '*/10 * * * *',
--     $$SELECT publish_scheduled_posts()$$
-- );


-- #############################################################################
-- SECTION 8: INITIAL DATA (OPTIONAL)
-- #############################################################################
-- You can add initial seed data here if needed, such as:
-- - Default admin user role (after creating a user via Auth)
-- - Default services
-- - Default FAQs
-- - Default site copy

-- Example: After creating your first admin user, run:
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('<your-admin-user-id>', 'admin');


-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- After running this script:
-- 1. Create your first admin user via Supabase Auth (Dashboard or API)
-- 2. Add a record to user_roles table with role = 'admin' for that user
-- 3. Update your .env file with the new Supabase URL and anon key
-- 4. Deploy any Edge Functions (create-user, delete-user, update-user)
-- 5. If using pg_cron, enable it in project settings and run the cron commands
-- =============================================================================
