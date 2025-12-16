-- Create a new public bucket for blog media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-media', 'blog-media', true);

-- Allow public access to the bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'blog-media');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'blog-media');

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update own" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (bucket_id = 'blog-media');

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete own" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'blog-media');
