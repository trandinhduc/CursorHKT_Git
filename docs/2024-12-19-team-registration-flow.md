# Team Registration Flow Implementation

**Date:** 2024-12-19  
**Task:** Tạo luồng đăng ký đội mới với màn hình nhập thông tin và schema database

## Task Overview

User requested to create a new registration flow after clicking "Đăng ký" that navigates to a screen to input:
- Tên trưởng đoàn (Team leader name)
- Số điện thoại (Phone number)
- Email
- Số lượng thành viên (Number of members)
- Danh sách nhu yếu phẩm (Essential items: Medical, Food, Clothes, Tools)

After entering, create account with phone number as key and push to Supabase database. Also provide database schema.

## Steps Taken

### 1. Created Team Types

- Created `types/models/team.ts` with:
  - `EssentialItem` type: 'Medical' | 'Food' | 'Clothes' | 'Tools'
  - `Team` interface with all required fields
  - `CreateTeamDto` and `UpdateTeamDto` interfaces
- Updated `types/index.ts` to export team types

### 2. Created Team Registration Screen

- Created `app/(auth)/team-registration.tsx` with:
  - Form fields for all required information
  - Phone number formatting (Vietnam format: +84)
  - Email validation
  - Number input for member count
  - Multi-select chips for essential items
  - Form validation
  - Direct Supabase integration to insert/update team data
  - Error handling with user-friendly alerts
  - Navigation to profile screen after successful registration

### 3. Created Team Service

- Created `services/team/team-service.ts` with methods:
  - `createTeam()` - Create new team
  - `getTeamByPhone()` - Get team by phone number
  - `updateTeam()` - Update team information
  - `deleteTeam()` - Delete team
  - `getAllTeams()` - Get all teams
  - `mapTeamFromDb()` - Map database row to Team type
- Updated `services/index.ts` to export team service

### 4. Created Database Schema

- Created `docs/database-schema-teams.sql` with:
  - `teams` table with phone_number as PRIMARY KEY
  - All required columns with proper types
  - Constraints for data validation:
    - Email format validation
    - Member count must be > 0
    - Essential items must be from valid list
  - Indexes for performance
  - Automatic updated_at timestamp trigger
  - Row Level Security (RLS) policies
  - Comments for documentation

### 5. Updated Navigation Flow

- Updated `app/(auth)/_layout.tsx` to include team-registration screen
- Updated `app/(tabs)/profile.tsx` to navigate to team-registration instead of register-phone

## Database Schema

The database schema is provided in `docs/database-schema-teams.sql`. Key features:

- **Primary Key**: `phone_number` (TEXT) - Used as unique identifier
- **Columns**:
  - `team_leader_name` (TEXT, NOT NULL)
  - `email` (TEXT, NOT NULL) with format validation
  - `member_count` (INTEGER, NOT NULL) with CHECK constraint (> 0)
  - `essential_items` (TEXT[]) - Array of essential items
  - `created_at` (TIMESTAMPTZ) - Auto-set on insert
  - `updated_at` (TIMESTAMPTZ) - Auto-updated on row update

- **Constraints**:
  - Email format validation
  - Member count must be positive
  - Essential items must be from: 'Medical', 'Food', 'Clothes', 'Tools'

- **Features**:
  - Automatic timestamp updates
  - Row Level Security enabled
  - Indexes for performance

## Files Created

1. `types/models/team.ts` - Team type definitions
2. `app/(auth)/team-registration.tsx` - Team registration screen
3. `services/team/team-service.ts` - Team service methods
4. `docs/database-schema-teams.sql` - Database schema SQL script
5. `docs/2024-12-19-team-registration-flow.md` - This documentation

## Files Modified

1. `types/index.ts` - Added team type exports
2. `services/index.ts` - Added team service export
3. `app/(auth)/_layout.tsx` - Added team-registration screen route
4. `app/(tabs)/profile.tsx` - Updated register button to navigate to team-registration

## Usage Instructions

### Setting Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open and run `docs/database-schema-teams.sql`
4. Verify the table is created in Table Editor

### Using the Registration Flow

1. User clicks "Đăng ký tài khoản mới" button in Profile screen
2. User is navigated to Team Registration screen
3. User fills in all required fields:
   - Team leader name
   - Phone number (auto-formatted to +84 format)
   - Email (validated)
   - Member count (must be > 0)
   - Essential items (select one or more)
4. User clicks "Đăng ký" button
5. Data is saved to Supabase `teams` table with phone_number as key
6. If team with same phone number exists, it will be updated instead
7. User is navigated back to Profile screen

## Notes

- Phone number is used as the primary key (unique identifier)
- If a team with the same phone number already exists, the registration will update the existing record
- Essential items are stored as an array in PostgreSQL
- All timestamps are automatically managed by the database
- The service layer provides reusable methods for team operations

## Build Results

Pending - Will run iOS build after documentation completion.

