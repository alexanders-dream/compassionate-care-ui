-- Create a table for application configuration
create table if not exists app_config (
  key text primary key,
  value text not null
);

-- Enable RLS
alter table app_config enable row level security;

-- Allow everyone to read config (needed for worker via anon key if not using service role, and for frontend to display current settings)
create policy "Allow public read access"
  on app_config for select
  using (true);

-- Allow admins to insert/update
create policy "Allow admins to insert"
  on app_config for insert
  with check (auth.uid() in (
    select user_id from user_roles where role = 'admin'
  ));

create policy "Allow admins to update"
  on app_config for update
  using (auth.uid() in (
    select user_id from user_roles where role = 'admin'
  ))
  with check (auth.uid() in (
    select user_id from user_roles where role = 'admin'
  ));

-- Insert default admin email (placeholder)
insert into app_config (key, value)
values 
  ('admin_email', 'admin@compassionatecare.com'),
  ('enable_patient_confirmations', 'true'),
  ('enable_admin_alerts', 'true'),
  ('reminder_time', '24'),
  ('reminder_time_of_day', '09:00')
on conflict (key) do nothing;
