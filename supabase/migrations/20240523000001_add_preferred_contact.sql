-- Add preferred_contact column to visit_requests table
alter table visit_requests
add column if not exists preferred_contact text;
