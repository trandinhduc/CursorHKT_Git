-- Database Schema for Help Records Table
-- 
-- This SQL script creates the help_records table in Supabase PostgreSQL database.
--
-- To use this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The table will be created with all necessary columns and constraints

-- Create help_records table
CREATE TABLE IF NOT EXISTS public.help_records (
  -- Primary key: auto-generated UUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Help type: true = cho bản thân, false = cho người khác
  is_for_self BOOLEAN NOT NULL DEFAULT true,
  
  -- Location information
  location_name TEXT NOT NULL,
  
  -- People count
  adult_count INTEGER NOT NULL DEFAULT 0 CHECK (adult_count >= 0),
  child_count INTEGER NOT NULL DEFAULT 0 CHECK (child_count >= 0),
  
  -- Contact information
  phone_number TEXT NOT NULL,
  
  -- Essential items needed
  essential_items TEXT[] NOT NULL DEFAULT '{}',
  
  -- Location coordinates (if is_for_self = true)
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Address or map link (if is_for_self = false)
  address TEXT,
  map_link TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure essential_items contains valid values
-- Valid values: 'Medical', 'Food', 'Clothes', 'Tools'
ALTER TABLE public.help_records
ADD CONSTRAINT check_essential_items 
CHECK (
  essential_items <@ ARRAY['Medical', 'Food', 'Clothes', 'Tools']::TEXT[]
);

-- Add constraint: if is_for_self = true, latitude and longitude must be provided
-- If is_for_self = false, address or map_link must be provided
ALTER TABLE public.help_records
ADD CONSTRAINT check_location_requirements
CHECK (
  (is_for_self = true AND latitude IS NOT NULL AND longitude IS NOT NULL) OR
  (is_for_self = false AND (address IS NOT NULL OR map_link IS NOT NULL))
);

-- Create index on phone_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_help_records_phone_number ON public.help_records(phone_number);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_help_records_created_at ON public.help_records(created_at DESC);

-- Create index on is_for_self for filtering
CREATE INDEX IF NOT EXISTS idx_help_records_is_for_self ON public.help_records(is_for_self);

-- Create index on location coordinates for geospatial queries (if needed)
CREATE INDEX IF NOT EXISTS idx_help_records_location ON public.help_records(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_help_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_help_records_updated_at
BEFORE UPDATE ON public.help_records
FOR EACH ROW
EXECUTE FUNCTION update_help_records_updated_at();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE public.help_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security requirements)
-- For public access (adjust as needed for your use case):
CREATE POLICY "Allow all operations on help_records" ON public.help_records
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternative: More restrictive policy (only authenticated users can read/write)
-- Uncomment if you want to restrict access to authenticated users only
/*
CREATE POLICY "Authenticated users can read help_records" ON public.help_records
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert help_records" ON public.help_records
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update help_records" ON public.help_records
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete help_records" ON public.help_records
FOR DELETE
USING (auth.role() = 'authenticated');
*/

-- Grant necessary permissions (adjust based on your setup)
-- These are typically handled by Supabase automatically, but included for reference
GRANT ALL ON public.help_records TO authenticated;
GRANT ALL ON public.help_records TO anon; -- Remove this if you don't want anonymous access

-- Add comments for documentation
COMMENT ON TABLE public.help_records IS 'Stores help requests from users';
COMMENT ON COLUMN public.help_records.is_for_self IS 'true = help for self (uses location), false = help for others (uses address/map link)';
COMMENT ON COLUMN public.help_records.location_name IS 'Name of the location';
COMMENT ON COLUMN public.help_records.adult_count IS 'Number of adults needing help';
COMMENT ON COLUMN public.help_records.child_count IS 'Number of children needing help';
COMMENT ON COLUMN public.help_records.phone_number IS 'Contact phone number';
COMMENT ON COLUMN public.help_records.essential_items IS 'Array of essential items needed: Medical, Food, Clothes, Tools';
COMMENT ON COLUMN public.help_records.latitude IS 'Latitude coordinate (required if is_for_self = true)';
COMMENT ON COLUMN public.help_records.longitude IS 'Longitude coordinate (required if is_for_self = true)';
COMMENT ON COLUMN public.help_records.address IS 'Address text (required if is_for_self = false and map_link is null)';
COMMENT ON COLUMN public.help_records.map_link IS 'Google Maps link (required if is_for_self = false and address is null)';
COMMENT ON COLUMN public.help_records.created_at IS 'Timestamp when the help record was created';
COMMENT ON COLUMN public.help_records.updated_at IS 'Timestamp when the help record was last updated';

