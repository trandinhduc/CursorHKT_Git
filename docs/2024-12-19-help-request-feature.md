# Help Request Feature Implementation

**Date:** 2024-12-19  
**Task:** Tạo tính năng tạo yêu cầu trợ giúp với FAB button và form đầy đủ

## Task Overview

User requested to create a help request feature with:
1. Floating Action Button (FAB) ở góc phải bên dưới màn hình Home (phía trên tab bar)
2. Màn hình tạo trợ giúp với checkbox để chọn tạo cho bản thân hoặc người khác
3. Form với các trường:
   - Tên địa điểm
   - Số lượng người (Người lớn và trẻ nhỏ)
   - Số điện thoại
   - Lựa chọn nhu yếu phẩm cần
   - Location (nếu tạo cho bản thân) hoặc địa chỉ/Google Maps link (nếu tạo cho người khác)
4. Push dữ liệu lên Supabase với table HelpRecord
5. SQL schema cho bảng HelpRecord
6. Sau khi tạo xong thì back về màn hình chính

## Steps Taken

### 1. Created Help Record Types

- Created `types/models/help-record.ts` with:
  - `HelpRecord` interface
  - `CreateHelpRecordDto` interface
  - `UpdateHelpRecordDto` interface
- Updated `types/index.ts` to export help record types

### 2. Created Database Schema

- Created `docs/database-schema-help-records.sql` with:
  - `help_records` table with all required columns
  - Constraints for data validation:
    - Essential items must be from valid list
    - Location requirements: if `is_for_self = true`, latitude/longitude required; if `false`, address or map_link required
    - Adult and child count must be >= 0
  - Indexes for performance
  - Automatic updated_at timestamp trigger
  - Row Level Security (RLS) policies
  - Comments for documentation

### 3. Created Help Service

- Created `services/help/help-service.ts` with methods:
  - `createHelpRecord()` - Create new help record
  - `getHelpRecordById()` - Get help record by ID
  - `getAllHelpRecords()` - Get all help records
  - `getHelpRecordsByPhone()` - Get help records by phone number
  - `updateHelpRecord()` - Update help record
  - `deleteHelpRecord()` - Delete help record
  - `mapHelpRecordFromDb()` - Map database row to HelpRecord type
- Updated `services/index.ts` to export help service

### 4. Created Create Help Screen

- Created `app/(tabs)/create-help.tsx` with:
  - Checkbox to select "Tạo cho bản thân" or "Tạo cho người khác"
  - Form fields:
    - Location name (required)
    - Adult count and child count (required, >= 0)
    - Phone number (required, validated)
    - Essential items selection (chips, at least one required)
    - Location handling:
      - If "cho bản thân": Auto-get current location using expo-location
      - If "cho người khác": Address text input or Google Maps link input
  - Form validation
  - Loading states
  - Error handling
  - Success alert and navigation back to home

### 5. Added FAB Button to Home Screen

- Updated `app/(tabs)/index.tsx` to:
  - Add Floating Action Button (FAB) in bottom right corner
  - Positioned above tab bar (bottom: 100)
  - Styled with shadow and elevation
  - Navigates to create-help screen when pressed
  - Uses IconSymbol component for plus icon

### 6. Updated Navigation

- Updated `app/(tabs)/_layout.tsx` to:
  - Add `create-help` route
  - Hide it from tab bar using `href: null`

## Database Schema

The database schema is provided in `docs/database-schema-help-records.sql`. Key features:

- **Primary Key**: `id` (UUID, auto-generated)
- **Columns**:
  - `is_for_self` (BOOLEAN) - true = cho bản thân, false = cho người khác
  - `location_name` (TEXT, NOT NULL) - Tên địa điểm
  - `adult_count` (INTEGER, NOT NULL, >= 0) - Số lượng người lớn
  - `child_count` (INTEGER, NOT NULL, >= 0) - Số lượng trẻ nhỏ
  - `phone_number` (TEXT, NOT NULL) - Số điện thoại
  - `essential_items` (TEXT[]) - Mảng các nhu yếu phẩm
  - `latitude` (DOUBLE PRECISION) - Vĩ độ (nếu is_for_self = true)
  - `longitude` (DOUBLE PRECISION) - Kinh độ (nếu is_for_self = true)
  - `address` (TEXT) - Địa chỉ (nếu is_for_self = false)
  - `map_link` (TEXT) - Google Maps link (nếu is_for_self = false)
  - `created_at` (TIMESTAMPTZ) - Auto-set on insert
  - `updated_at` (TIMESTAMPTZ) - Auto-updated on row update

- **Constraints**:
  - Essential items must be from: 'Medical', 'Food', 'Clothes', 'Tools'
  - Location requirements: if `is_for_self = true`, latitude and longitude must be provided; if `false`, address or map_link must be provided
  - Adult and child count must be >= 0

- **Features**:
  - Automatic timestamp updates
  - Row Level Security enabled
  - Indexes for performance (phone_number, created_at, is_for_self, location coordinates)

## Files Created

1. `types/models/help-record.ts` - Help record type definitions
2. `docs/database-schema-help-records.sql` - Database schema SQL script
3. `services/help/help-service.ts` - Help service methods
4. `app/(tabs)/create-help.tsx` - Create help request screen
5. `docs/2024-12-19-help-request-feature.md` - This documentation

## Files Modified

1. `types/index.ts` - Added help record type exports
2. `services/index.ts` - Added help service export
3. `app/(tabs)/index.tsx` - Added FAB button
4. `app/(tabs)/_layout.tsx` - Added create-help route (hidden from tab bar)

## Usage Flow

1. User opens Home screen
2. User sees FAB button in bottom right corner (above tab bar)
3. User clicks FAB button
4. User is navigated to Create Help screen
5. User selects "Tạo cho bản thân" or "Tạo cho người khác"
6. User fills in form:
   - Location name
   - Adult count and child count
   - Phone number
   - Essential items (select at least one)
   - Location (auto-get if for self, or enter address/map link if for others)
7. User clicks "Tạo yêu cầu trợ giúp"
8. System validates form
9. System saves to Supabase `help_records` table
10. Success alert shown
11. User clicks OK
12. User is navigated back to Home screen

## Key Features

### Location Handling

- **For Self (`isForSelf = true`)**:
  - Automatically requests location permission
  - Gets current location using `expo-location`
  - Stores latitude and longitude
  - Shows location coordinates in form

- **For Others (`isForSelf = false`)**:
  - User must enter address OR Google Maps link
  - At least one of address or map_link must be provided
  - Both fields are optional individually, but one must be filled

### Form Validation

- Location name: Required
- Adult/Child count: Must be >= 0, at least one must be > 0
- Phone number: Required, validated format (10-15 digits)
- Essential items: At least one must be selected
- Location: 
  - If for self: latitude and longitude must be available
  - If for others: address or map_link must be provided

### FAB Button

- Positioned at bottom right (above tab bar)
- Uses theme color (tint)
- Has shadow/elevation for depth
- Plus icon from IconSymbol component
- Navigates to create-help screen

## Notes

- Phone number is automatically formatted with +84 country code
- Location permission is requested when creating help for self
- Form validates all required fields before submission
- Success message shows after successful creation
- User is automatically navigated back to home after creation
- The create-help screen is hidden from tab bar navigation

## Build Results

Pending - Will run iOS build after documentation completion.

