-- Create a new public bucket for patient resources (PDFs, documents, etc.)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('patient-resources', 'patient-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket for downloads
CREATE POLICY "Public Access for Patient Resources" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'patient-resources');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload patient resources" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'patient-resources');

-- Allow authenticated users to update files
CREATE POLICY "Authenticated users can update patient resources" 
ON storage.objects FOR UPDATE
TO authenticated 
USING (bucket_id = 'patient-resources');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete patient resources" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'patient-resources');
