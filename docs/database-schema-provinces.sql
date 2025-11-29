-- Database Schema for Provinces Table
-- 
-- This SQL script creates the provinces table in Supabase PostgreSQL database.
-- Provinces represent administrative regions (tỉnh/thành phố) where help records are located.
--
-- Relationship: One-to-Many
-- - One province can have multiple help_records
-- - Each help_record belongs to one province
--
-- To use this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The table will be created with all necessary columns, constraints, and indexes

-- Create provinces table
CREATE TABLE IF NOT EXISTS public.provinces (
  -- Primary key: auto-generated UUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Province name (e.g., "Phú Yên", "Bình Định", "Khánh Hòa", "Quảng Nam")
  name TEXT NOT NULL UNIQUE,
  
  -- Province code (optional, for reference)
  code TEXT,
  
  -- Display order (for sorting in dropdowns)
  display_order INTEGER DEFAULT 0,
  
  -- Active status (to enable/disable provinces)
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_provinces_name ON public.provinces(name);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_provinces_display_order ON public.provinces(display_order);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS idx_provinces_is_active ON public.provinces(is_active);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_provinces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_provinces_updated_at
BEFORE UPDATE ON public.provinces
FOR EACH ROW
EXECUTE FUNCTION update_provinces_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security requirements)
CREATE POLICY "Allow all operations on provinces" ON public.provinces
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON public.provinces TO authenticated;
GRANT ALL ON public.provinces TO anon; -- Remove this if you don't want anonymous access

-- Add comments for documentation
COMMENT ON TABLE public.provinces IS 'Stores province information for help records';
COMMENT ON COLUMN public.provinces.name IS 'Province name (e.g., Phú Yên, Bình Định, Khánh Hòa, Quảng Nam)';
COMMENT ON COLUMN public.provinces.code IS 'Province code (optional, for reference)';
COMMENT ON COLUMN public.provinces.display_order IS 'Display order for sorting in dropdowns';
COMMENT ON COLUMN public.provinces.is_active IS 'Active status (true = active, false = disabled)';
COMMENT ON COLUMN public.provinces.created_at IS 'Timestamp when the province was created';
COMMENT ON COLUMN public.provinces.updated_at IS 'Timestamp when the province was last updated';

-- ============================================================================
-- Update help_records table to add province_id foreign key
-- ============================================================================

-- Add province_id column to help_records table
ALTER TABLE public.help_records
ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES public.provinces(id) ON DELETE SET NULL;

-- Create index on province_id for faster lookups and filtering
CREATE INDEX IF NOT EXISTS idx_help_records_province_id ON public.help_records(province_id);

-- Add comment for the new column
COMMENT ON COLUMN public.help_records.province_id IS 'Foreign key to provinces table - identifies which province this help record belongs to';

