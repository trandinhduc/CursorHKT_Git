-- Database Schema for Help Supports Table
-- 
-- This SQL script creates the help_supports table in Supabase PostgreSQL database.
-- This is a junction table that links help_records and teams, representing
-- which teams are supporting which help locations.
--
-- Relationship: Many-to-Many
-- - One help_record can have multiple teams supporting it
-- - One team can support multiple help_records
--
-- Status values:
-- - 'pending': Chưa hỗ trợ (requested but not started)
-- - 'active': Đang được hỗ trợ (currently being supported)
-- - 'completed': Đã hỗ trợ (support completed)
--
-- To use this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The table will be created with all necessary columns, constraints, and indexes

-- Create help_supports table (junction table)
CREATE TABLE IF NOT EXISTS public.help_supports (
  -- Primary key: auto-generated UUID
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to help_records table
  help_record_id UUID NOT NULL REFERENCES public.help_records(id) ON DELETE CASCADE,
  
  -- Foreign key to teams table (using phone_number as PK)
  team_id TEXT NOT NULL REFERENCES public.teams(phone_number) ON DELETE CASCADE,
  
  -- Support status: pending (chưa hỗ trợ), active (đang được hỗ trợ), completed (đã hỗ trợ)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  
  -- Optional notes or comments about the support
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique combination of help_record_id and team_id
  -- A team can only have one support record per help_record
  UNIQUE(help_record_id, team_id)
);

-- Create index on help_record_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_help_supports_help_record_id ON public.help_supports(help_record_id);

-- Create index on team_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_help_supports_team_id ON public.help_supports(team_id);

-- Create index on status for filtering and queries
CREATE INDEX IF NOT EXISTS idx_help_supports_status ON public.help_supports(status);

-- Create composite index for common queries (get supports for a help_record)
CREATE INDEX IF NOT EXISTS idx_help_supports_help_record_status ON public.help_supports(help_record_id, status);

-- Create composite index for common queries (get supports by a team)
CREATE INDEX IF NOT EXISTS idx_help_supports_team_status ON public.help_supports(team_id, status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_help_supports_created_at ON public.help_supports(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_help_supports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_help_supports_updated_at
BEFORE UPDATE ON public.help_supports
FOR EACH ROW
EXECUTE FUNCTION update_help_supports_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE public.help_supports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security requirements)
-- For public access (adjust as needed for your use case):
CREATE POLICY "Allow all operations on help_supports" ON public.help_supports
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternative: More restrictive policy (only authenticated users can read/write)
-- Uncomment if you want to restrict access to authenticated users only
/*
CREATE POLICY "Authenticated users can read help_supports" ON public.help_supports
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert help_supports" ON public.help_supports
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update help_supports" ON public.help_supports
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete help_supports" ON public.help_supports
FOR DELETE
USING (auth.role() = 'authenticated');
*/

-- Grant necessary permissions
GRANT ALL ON public.help_supports TO authenticated;
GRANT ALL ON public.help_supports TO anon; -- Remove this if you don't want anonymous access

-- Add comments for documentation
COMMENT ON TABLE public.help_supports IS 'Junction table linking help_records and teams, tracking which teams support which help locations';
COMMENT ON COLUMN public.help_supports.help_record_id IS 'Foreign key to help_records table';
COMMENT ON COLUMN public.help_supports.team_id IS 'Foreign key to teams table (phone_number)';
COMMENT ON COLUMN public.help_supports.status IS 'Support status: pending (chưa hỗ trợ), active (đang được hỗ trợ), completed (đã hỗ trợ)';
COMMENT ON COLUMN public.help_supports.notes IS 'Optional notes or comments about the support provided';
COMMENT ON COLUMN public.help_supports.created_at IS 'Timestamp when the support record was created';
COMMENT ON COLUMN public.help_supports.updated_at IS 'Timestamp when the support record was last updated';

-- Create a view to easily query support information with related data
CREATE OR REPLACE VIEW public.help_supports_detail AS
SELECT 
  hs.id,
  hs.help_record_id,
  hs.team_id,
  hs.status,
  hs.notes,
  hs.created_at,
  hs.updated_at,
  hr.location_name,
  hr.phone_number as help_record_phone,
  hr.adult_count,
  hr.child_count,
  t.team_leader_name,
  t.email as team_email,
  t.member_count
FROM public.help_supports hs
JOIN public.help_records hr ON hs.help_record_id = hr.id
JOIN public.teams t ON hs.team_id = t.phone_number;

-- Add comment for the view
COMMENT ON VIEW public.help_supports_detail IS 'Detailed view of help supports with related help_record and team information';

