# Task Documentation: Province Filter Implementation

## Task Overview

**Date**: 2024-12-19  
**Task**: Add province dropdown filter on Home screen with database schema, services, and seed data

### User Request
```
Ở màn hình Home add cho tôi một dropdown lựa chọn trên list các địa điểm hỗ trợ. Dropdown này là danh sách các điểm cần cứu hộ theo tỉnh, danh sách tỉnh này được load từ api của Supabase, hiện tại các sẽ có các tỉnh sau (Phú yên, Bình Định, Khánh Hòa, Quang Nam) Bên cạnh đó hãy cho tôi script để chạy một lệnh import sample data cho các tỉnh nói trên. Cho tôi câu lệnh SQL để tạo bảng Tỉnh, và tạo data cho bảng tỉnh cũng như data cho bảng trợ giúp. Mỗi trợ giúp sẽ đính kèm vào 1 tỉnh và một tỉnh có thể có nhiều trợ giúp.
```

---

## Implementation Summary

Successfully implemented a complete province filtering system with:
1. ✅ Database schema for provinces table (one-to-many relationship)
2. ✅ Updated help_records table with province_id foreign key
3. ✅ TypeScript types and service for provinces
4. ✅ Dropdown component for province selection
5. ✅ Home screen integration with filter functionality
6. ✅ SQL scripts for creating tables and seeding data
7. ✅ JavaScript script for programmatic data seeding

---

## Database Schema

### Table: `provinces`

Created a new table to store province information:

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique) - Province name
- `code` (TEXT, Optional) - Province code
- `display_order` (INTEGER) - For sorting in dropdowns
- `is_active` (BOOLEAN) - Enable/disable provinces
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**SQL File:** `docs/database-schema-provinces.sql`

### Updated: `help_records` table

Added `province_id` column to link help records to provinces:
- `province_id` (UUID, Foreign Key → provinces.id)
- Added index on `province_id` for faster filtering

**Relationship:** One-to-Many
- One province can have many help records
- Each help record belongs to one province (optional - can be NULL)

---

## Files Created

### 1. Database Schema
- `docs/database-schema-provinces.sql` - Complete SQL schema for provinces table and help_records update
- `docs/database-seed-provinces-and-help-records.sql` - SQL script to seed sample data

### 2. Types
- `types/models/province.ts` - TypeScript types:
  - `Province` interface
  - `CreateProvinceDto` interface
  - `UpdateProvinceDto` interface

### 3. Services
- `services/province/province-service.ts` - Province service with methods:
  - `getAllProvinces()` - Get all provinces (with optional active filter)
  - `getProvinceById()` - Get province by ID
  - `getProvinceByName()` - Get province by name
  - `createProvince()` - Create new province
  - `updateProvince()` - Update province
  - `deleteProvince()` - Delete province

### 4. Components
- `components/ui/province-dropdown.tsx` - Dropdown component for province selection:
  - Modal-based dropdown
  - Shows selected province
  - "Tất cả tỉnh" option to clear filter
  - Visual feedback for selected item

### 5. Scripts
- `scripts/seed-provinces-and-help-records.js` - JavaScript script to seed data programmatically

### 6. Updated Files
- `app/(tabs)/index.tsx` - Added:
  - Province loading on mount
  - Province dropdown in UI
  - Filter functionality for help records
  - State management for selected province
- `types/models/help-record.ts` - Added `provinceId` field
- `services/help/help-service.ts` - Updated:
  - Added `provinceId` parameter to `getHelpRecordsPaginated()`
  - Added `provinceId` to mapping function
  - Added `provinceId` to create function
- `types/index.ts` - Exported province types
- `services/index.ts` - Exported province service
- `package.json` - Added `seed:provinces` script

---

## Database Setup Instructions

### Step 1: Create Provinces Table

Run the SQL script in Supabase SQL Editor:

**File:** `docs/database-schema-provinces.sql`

This script will:
- Create `provinces` table
- Add `province_id` column to `help_records` table
- Create indexes for performance
- Set up triggers and RLS policies

### Step 2: Seed Sample Data

**Option A: Using SQL Script (Recommended)**

Run the SQL script in Supabase SQL Editor:

**File:** `docs/database-seed-provinces-and-help-records.sql`

This script will:
- Insert 4 provinces (Phú Yên, Bình Định, Khánh Hòa, Quảng Nam)
- Insert 12 sample help records (3 records per province)

**Option B: Using JavaScript Script**

Run the Node.js script:

```bash
npm run seed:provinces
```

This script will:
- Create/update provinces
- Create help records for each province
- Show progress and summary

---

## Province List

The following provinces are included:

1. **Phú Yên** (Code: PY, Display Order: 1)
2. **Bình Định** (Code: BD, Display Order: 2)
3. **Khánh Hòa** (Code: KH, Display Order: 3)
4. **Quảng Nam** (Code: QN, Display Order: 4)

Each province will have 3 sample help records.

---

## UI/UX Flow

### Home Screen Layout

1. **Map Section** (top 40% of screen)
   - Map view with user location
   - No changes to map functionality

2. **Filter Section** (below map)
   - Province dropdown button
   - Shows selected province or "Tất cả tỉnh"
   - Opens modal with province list

3. **List Section** (remaining space)
   - Title: "Địa điểm cần hỗ trợ"
   - Filtered list of help records
   - Pagination support

### Dropdown Behavior

- **Default State**: Shows "Tất cả tỉnh" (all provinces)
- **Selected State**: Shows province name
- **Modal**: 
  - "Tất cả tỉnh" option at top (clears filter)
  - List of provinces with checkmark for selected
  - Touch to select/deselect

### Filter Logic

- **No Selection** (Tất cả tỉnh): Shows all help records
- **Province Selected**: Shows only help records for that province
- **Auto Reload**: Help records reload when province selection changes
- **Pagination Reset**: Page resets to 0 when filter changes

---

## Technical Details

### Province Service Methods

```typescript
// Get all active provinces (sorted by display_order)
const provinces = await provinceService.getAllProvinces(true);

// Get province by name
const province = await provinceService.getProvinceByName("Phú Yên");

// Create new province
const newProvince = await provinceService.createProvince({
  name: "New Province",
  code: "NP",
  displayOrder: 5,
});
```

### Help Service Filtering

```typescript
// Get help records filtered by province
const result = await helpService.getHelpRecordsPaginated(
  0, // page
  10, // limit
  provinceId // optional province filter
);
```

### Dropdown Component Usage

```typescript
<ProvinceDropdown
  provinces={provinces}
  selectedProvince={selectedProvince}
  onSelectProvince={handleProvinceChange}
  placeholder="Tất cả tỉnh"
/>
```

---

## SQL Commands Summary

### 1. Create Provinces Table and Update Help Records

```sql
-- See: docs/database-schema-provinces.sql
-- This creates the provinces table and adds province_id to help_records
```

### 2. Seed Data

```sql
-- See: docs/database-seed-provinces-and-help-records.sql
-- This inserts provinces and sample help records
```

**Or use the simplified version:**

```sql
-- Insert provinces only (from docs/database-seed-provinces.sql)
INSERT INTO public.provinces (name, code, display_order, is_active)
VALUES
  ('Phú Yên', 'PY', 1, true),
  ('Bình Định', 'BD', 2, true),
  ('Khánh Hòa', 'KH', 3, true),
  ('Quảng Nam', 'QN', 4, true)
ON CONFLICT (name) DO NOTHING;
```

---

## Sample Data Structure

### Provinces

- **Phú Yên**: 3 help records
- **Bình Định**: 3 help records  
- **Khánh Hòa**: 3 help records
- **Quảng Nam**: 3 help records

**Total**: 4 provinces, 12 help records

### Help Record Sample Format

Each help record includes:
- Location name (e.g., "Thôn 12, Phú Yên")
- Adult and child counts
- Phone number
- Essential items (Food, Medical, Clothes, Tools)
- Location coordinates (for self) or address (for others)
- Province ID (linked to provinces table)

---

## Testing Checklist

### Database Setup
- [ ] Run `database-schema-provinces.sql` to create table
- [ ] Verify provinces table exists
- [ ] Verify help_records has province_id column
- [ ] Run seed script to insert sample data
- [ ] Verify 4 provinces created
- [ ] Verify 12 help records created

### UI Testing
- [ ] Dropdown appears on Home screen
- [ ] Dropdown shows "Tất cả tỉnh" by default
- [ ] Dropdown opens modal on tap
- [ ] Modal shows list of provinces
- [ ] Can select a province
- [ ] Selected province shows in dropdown
- [ ] Can clear selection (Tất cả tỉnh)
- [ ] Help records filter correctly by province
- [ ] Pagination works with filter

### Filter Testing
- [ ] Select "Phú Yên" → Shows only Phú Yên records
- [ ] Select "Bình Định" → Shows only Bình Định records
- [ ] Select "Tất cả tỉnh" → Shows all records
- [ ] Filter persists during pagination
- [ ] Changing filter resets pagination

---

## Files Modified Summary

### Created
- `docs/database-schema-provinces.sql` - Database schema
- `docs/database-seed-provinces-and-help-records.sql` - Seed data SQL
- `docs/database-seed-provinces.sql` - Simple provinces seed SQL
- `types/models/province.ts` - Province types
- `services/province/province-service.ts` - Province service
- `components/ui/province-dropdown.tsx` - Dropdown component
- `scripts/seed-provinces-and-help-records.js` - Seed script
- `docs/2024-12-19-province-filter-implementation.md` - This documentation

### Modified
- `app/(tabs)/index.tsx` - Added province filter functionality
- `types/models/help-record.ts` - Added provinceId field
- `services/help/help-service.ts` - Added province filtering
- `types/index.ts` - Exported province types
- `services/index.ts` - Exported province service
- `package.json` - Added seed:provinces script

---

## Usage Instructions

### For Developers

1. **Setup Database**:
   ```bash
   # Run SQL scripts in Supabase SQL Editor
   # 1. database-schema-provinces.sql
   # 2. database-seed-provinces-and-help-records.sql
   ```

2. **Or use Node script**:
   ```bash
   npm run seed:provinces
   ```

3. **Test in App**:
   - Open Home screen
   - Tap province dropdown
   - Select a province to filter
   - Verify help records are filtered

### For Users

1. Open Home screen
2. Tap dropdown above help records list
3. Select a province to filter by that province
4. Select "Tất cả tỉnh" to show all records

---

## Summary

Successfully implemented a complete province filtering system:

1. ✅ Database schema for provinces table (one-to-many relationship)
2. ✅ Updated help_records with province_id foreign key
3. ✅ TypeScript types and service layer
4. ✅ Reusable dropdown component
5. ✅ Home screen integration with filter
6. ✅ SQL scripts for setup and seeding
7. ✅ JavaScript script for programmatic seeding

The system allows users to filter help records by province, making it easier to find and respond to help requests in specific regions. The dropdown is intuitive and the filtering is seamless.

