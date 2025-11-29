-- Seed Data for Provinces and Help Records
-- 
-- This SQL script inserts sample data for provinces and help records.
-- Provinces: Phú Yên, Bình Định, Khánh Hòa, Quảng Nam
-- Help Records: Sample records for each province
--
-- IMPORTANT: Run database-schema-provinces.sql FIRST to create the provinces table
-- and update help_records table with province_id column.
--
-- To use this script:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this script and run it
-- 4. The provinces and help records will be inserted

-- ============================================================================
-- Step 1: Insert Provinces
-- ============================================================================

INSERT INTO public.provinces (name, code, display_order, is_active, created_at, updated_at)
VALUES
  ('Phú Yên', 'PY', 1, true, NOW(), NOW()),
  ('Bình Định', 'BD', 2, true, NOW(), NOW()),
  ('Khánh Hòa', 'KH', 3, true, NOW(), NOW()),
  ('Quảng Nam', 'QN', 4, true, NOW(), NOW())
ON CONFLICT (name) DO UPDATE
SET 
  code = EXCLUDED.code,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- ============================================================================
-- Step 2: Get Province IDs (for reference)
-- ============================================================================

DO $$
DECLARE
  phu_yen_id UUID;
  binh_dinh_id UUID;
  khanh_hoa_id UUID;
  quang_nam_id UUID;
BEGIN
  -- Get province IDs
  SELECT id INTO phu_yen_id FROM public.provinces WHERE name = 'Phú Yên' LIMIT 1;
  SELECT id INTO binh_dinh_id FROM public.provinces WHERE name = 'Bình Định' LIMIT 1;
  SELECT id INTO khanh_hoa_id FROM public.provinces WHERE name = 'Khánh Hòa' LIMIT 1;
  SELECT id INTO quang_nam_id FROM public.provinces WHERE name = 'Quảng Nam' LIMIT 1;

  -- ============================================================================
  -- Step 3: Insert Help Records for Phú Yên
  -- ============================================================================
  
  INSERT INTO public.help_records (
    is_for_self, location_name, adult_count, child_count, phone_number,
    essential_items, latitude, longitude, address, map_link, province_id,
    created_at, updated_at
  ) VALUES
    (true, 'Thôn 12, Phú Yên', 2, 1, '+84901234501', 
     ARRAY['Food', 'Medical'], 13.0883, 109.2942, NULL, NULL, phu_yen_id, NOW(), NOW()),
    (false, 'Xã Hòa Quang, Phú Yên', 1, 1, '+84901234502', 
     ARRAY['Food', 'Medical'], NULL, NULL, 'Xã Hòa Quang, huyện Phú Hòa, tỉnh Phú Yên', NULL, phu_yen_id, NOW(), NOW()),
    (true, 'Thôn 13, Phú Yên', 1, 1, '+84901234503', 
     ARRAY['Food', 'Medical'], 13.1000, 109.3000, NULL, NULL, phu_yen_id, NOW(), NOW());

  -- ============================================================================
  -- Step 4: Insert Help Records for Bình Định
  -- ============================================================================
  
  INSERT INTO public.help_records (
    is_for_self, location_name, adult_count, child_count, phone_number,
    essential_items, latitude, longitude, address, map_link, province_id,
    created_at, updated_at
  ) VALUES
    (true, 'Thôn 5, Bình Định', 3, 2, '+84901234504', 
     ARRAY['Food', 'Clothes', 'Medical'], 13.7758, 109.2233, NULL, NULL, binh_dinh_id, NOW(), NOW()),
    (false, 'Xã Phước Mỹ, Bình Định', 2, 0, '+84901234505', 
     ARRAY['Food', 'Tools'], NULL, NULL, 'Xã Phước Mỹ, huyện Tuy Phước, tỉnh Bình Định', NULL, binh_dinh_id, NOW(), NOW()),
    (true, 'Thôn 7, Bình Định', 1, 1, '+84901234506', 
     ARRAY['Medical', 'Food'], 13.8000, 109.2500, NULL, NULL, binh_dinh_id, NOW(), NOW());

  -- ============================================================================
  -- Step 5: Insert Help Records for Khánh Hòa
  -- ============================================================================
  
  INSERT INTO public.help_records (
    is_for_self, location_name, adult_count, child_count, phone_number,
    essential_items, latitude, longitude, address, map_link, province_id,
    created_at, updated_at
  ) VALUES
    (true, 'Thôn 1, Khánh Hòa', 2, 1, '+84901234507', 
     ARRAY['Food', 'Medical', 'Clothes'], 12.2388, 109.1967, NULL, NULL, khanh_hoa_id, NOW(), NOW()),
    (false, 'Xã Ninh Đông, Khánh Hòa', 4, 2, '+84901234508', 
     ARRAY['Food', 'Medical', 'Tools'], NULL, NULL, 'Xã Ninh Đông, huyện Ninh Hòa, tỉnh Khánh Hòa', NULL, khanh_hoa_id, NOW(), NOW()),
    (true, 'Thôn 3, Khánh Hòa', 1, 0, '+84901234509', 
     ARRAY['Food'], 12.2500, 109.2000, NULL, NULL, khanh_hoa_id, NOW(), NOW());

  -- ============================================================================
  -- Step 6: Insert Help Records for Quảng Nam
  -- ============================================================================
  
  INSERT INTO public.help_records (
    is_for_self, location_name, adult_count, child_count, phone_number,
    essential_items, latitude, longitude, address, map_link, province_id,
    created_at, updated_at
  ) VALUES
    (true, 'Thôn 4, Quảng Nam', 2, 1, '+84901234510', 
     ARRAY['Food', 'Medical'], 15.8801, 108.3380, NULL, NULL, quang_nam_id, NOW(), NOW()),
    (false, 'Xã Đại Hưng, Quảng Nam', 3, 1, '+84901234511', 
     ARRAY['Food', 'Clothes', 'Medical'], NULL, NULL, 'Xã Đại Hưng, huyện Đại Lộc, tỉnh Quảng Nam', NULL, quang_nam_id, NOW(), NOW()),
    (true, 'Thôn 6, Quảng Nam', 1, 1, '+84901234512', 
     ARRAY['Food', 'Medical'], 15.9000, 108.3500, NULL, NULL, quang_nam_id, NOW(), NOW());

END $$;

-- ============================================================================
-- Verify Data
-- ============================================================================

-- Count provinces
SELECT 
  'Provinces' as table_name,
  COUNT(*) as count 
FROM public.provinces;

-- Count help records by province
SELECT 
  p.name as province_name,
  COUNT(hr.id) as help_records_count
FROM public.provinces p
LEFT JOIN public.help_records hr ON p.id = hr.province_id
GROUP BY p.id, p.name
ORDER BY p.display_order;

-- View sample help records with province info
SELECT 
  hr.location_name,
  p.name as province_name,
  hr.adult_count,
  hr.child_count,
  hr.essential_items,
  hr.created_at
FROM public.help_records hr
JOIN public.provinces p ON hr.province_id = p.id
ORDER BY p.display_order, hr.created_at DESC
LIMIT 20;

