-- Migration to add 'contacted' status to the submission_status enum
-- This is necessary for the email confirmation flow in the admin dashboard

ALTER TYPE submission_status ADD VALUE IF NOT EXISTS 'contacted';
