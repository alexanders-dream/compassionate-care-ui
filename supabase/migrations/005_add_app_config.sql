-- Create a table for application configuration and secrets
create table if not exists public.app_config (
  key text primary key,
  value text,
  is_secret boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.app_config enable row level security;

-- Create policies (assuming authenticated admins can read/write)
-- Adjust 'authenticated' role as needed based on actual auth setup
create policy "Admins can view config"
  on public.app_config
  for select
  to authenticated
  using (true);

create policy "Admins can insert config"
  on public.app_config
  for insert
  to authenticated
  with check (true);

create policy "Admins can update config"
  on public.app_config
  for update
  to authenticated
  using (true);
