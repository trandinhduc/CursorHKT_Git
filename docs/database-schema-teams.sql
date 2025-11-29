-- Database Schema for Teams Table
-- 
-- This SQL script creates the teams table in Supabase PostgreSQL database.
-- The phone_number is used as the primary key (unique identifier).
--
-- To use this schema:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The table will be created with all necessary columns and constraints

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
  -- Primary key: phone number (unique identifier)
  phone_number TEXT PRIMARY KEY,
  
  -- Team leader information
  team_leader_name TEXT NOT NULL,
  
  -- Contact information
  email TEXT NOT NULL,
  
  -- Team size
  member_count INTEGER NOT NULL CHECK (member_count > 0),
  
  -- Essential items (stored as array of text)
  essential_items TEXT[] NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups (optional)
CREATE INDEX IF NOT EXISTS idx_teams_email ON public.teams(email);

-- Create index on created_at for sorting (optional)
CREATE INDEX IF NOT EXISTS idx_teams_created_at ON public.teams(created_at DESC);

-- Add constraint to ensure essential_items contains valid values
-- Valid values: 'Medical', 'Food', 'Clothes', 'Tools'
ALTER TABLE public.teams
ADD CONSTRAINT check_essential_items 
CHECK (
  essential_items <@ ARRAY['Medical', 'Food', 'Clothes', 'Tools']::TEXT[]
);

-- Add email validation constraint (basic check)
ALTER TABLE public.teams
ADD CONSTRAINT check_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust based on your security requirements)
-- For public access (adjust as needed for your use case):
CREATE POLICY "Allow all operations on teams" ON public.teams
FOR ALL
USING (true)
WITH CHECK (true);

-- Alternative: More restrictive policy (only authenticated users can read/write)
-- Uncomment if you want to restrict access to authenticated users only
/*
CREATE POLICY "Authenticated users can read teams" ON public.teams
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert teams" ON public.teams
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update teams" ON public.teams
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete teams" ON public.teams
FOR DELETE
USING (auth.role() = 'authenticated');
*/

-- Grant necessary permissions (adjust based on your setup)
-- These are typically handled by Supabase automatically, but included for reference
GRANT ALL ON public.teams TO authenticated;
GRANT ALL ON public.teams TO anon; -- Remove this if you don't want anonymous access

-- Add comments for documentation
COMMENT ON TABLE public.teams IS 'Stores team registration information with phone number as primary key';
COMMENT ON COLUMN public.teams.phone_number IS 'Primary key: Phone number in international format (e.g., +84901234567)';
COMMENT ON COLUMN public.teams.team_leader_name IS 'Name of the team leader';
COMMENT ON COLUMN public.teams.email IS 'Contact email address';
COMMENT ON COLUMN public.teams.member_count IS 'Number of team members (must be > 0)';
COMMENT ON COLUMN public.teams.essential_items IS 'Array of essential items: Medical, Food, Clothes, Tools';
COMMENT ON COLUMN public.teams.created_at IS 'Timestamp when the team record was created';
COMMENT ON COLUMN public.teams.updated_at IS 'Timestamp when the team record was last updated';

