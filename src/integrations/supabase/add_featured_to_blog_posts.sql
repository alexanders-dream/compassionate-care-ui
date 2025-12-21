-- Add is_featured column to blog_posts table
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Create an index for performance if needed (optional for small tables)
-- CREATE INDEX idx_blog_posts_is_featured ON public.blog_posts(is_featured);
