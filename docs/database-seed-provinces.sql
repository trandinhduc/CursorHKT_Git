-- Seed Data for Provinces Table
-- 
-- This SQL script inserts sample provinces data into the provinces table.
-- Provinces: Phú Yên, Bình Định, Khánh Hòa, Quảng Nam
--
-- To use this script:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The provinces will be inserted into the database

-- Insert provinces data
INSERT INTO public.provinces (name, code, display_order, is_active, created_at, updated_at)
VALUES
  ('Phú Yên', 'PY', 1, true, NOW(), NOW()),
  ('Bình Định', 'BD', 2, true, NOW(), NOW()),
  ('Khánh Hòa', 'KH', 3, true, NOW(), NOW()),
  ('Quảng Nam', 'QN', 4, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Verify insertion
SELECT * FROM public.provinces ORDER BY display_order;

