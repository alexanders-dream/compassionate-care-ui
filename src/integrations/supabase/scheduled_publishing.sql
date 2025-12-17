-- Database function to publish scheduled posts
-- This function checks for posts with status 'scheduled' and a scheduled_at time in the past
-- It updates their status to 'published' and sets published_at to the scheduled_at time
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

create or replace function publish_scheduled_posts()
returns void
language plpgsql
security definer
as $$
begin
  update blog_posts
  set 
    status = 'published',
    published_at = scheduled_at
  where 
    status = 'scheduled' 
    and scheduled_at <= now();
end;
$$;

-- Enable the pg_cron extension if not already enabled
-- Note: This requires the pg_cron extension to be enabled in your project settings
create extension if not exists pg_cron;

-- Schedule the job to run every 10 minutes
-- You can adjust the schedule as needed (e.g., '*/1 * * * *' for every minute)
select cron.schedule(
  'publish-scheduled-posts', -- name of the job
  '*/10 * * * *',            -- schedule (every 10 minutes)
  $$select publish_scheduled_posts()$$
);

-- To unschedule:
-- select cron.unschedule('publish-scheduled-posts');

-- To check scheduled jobs:
-- select * from cron.job;
