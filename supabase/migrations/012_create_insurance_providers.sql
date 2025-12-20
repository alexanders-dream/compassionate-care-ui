CREATE TABLE IF NOT EXISTS insurance_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  payment_details TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE insurance_providers ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Public can view active insurance providers" ON insurance_providers;
DROP POLICY IF EXISTS "Authenticated users can manage insurance providers" ON insurance_providers;

-- Allow public read for active providers
CREATE POLICY "Public can view active insurance providers" 
  ON insurance_providers FOR SELECT 
  USING (is_active = true);

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage insurance providers" 
  ON insurance_providers FOR ALL 
  USING (auth.role() = 'authenticated');
