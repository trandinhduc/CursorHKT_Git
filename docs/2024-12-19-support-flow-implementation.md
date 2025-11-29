# Task Documentation: Support Flow Implementation

## Task Overview

**Date**: 2024-12-19  
**Task**: Implement support flow for help records with login check, support status tracking, and database schema

### User Request
```
Tiếp theo add cho tôi luồng nếu coi một điểm hỗ trợ và bấm hỗ trợ mà chưa đăng nhập thì sẽ hiển thị popup hỏi user có muốn đăng nhập không và navigate qua trang đăng nhập. Còn nếu đã đăng nhập rồi thì check là địa điểm đó đang được hỗ trợ. Status bao gồm (chưa hỗ trợ, đang được hỗ trợ, đã hỗ trợ). Đồng thời tạo một bảng trên Supabase lưu các địa điểm hỗ trợ và đơn vị nào đang hỗ trợ cho địa điểm đó. Một địa điểm có thể có nhiều đơn vị hỗ trợ và một đơn vị cũng có thể hỗ trợ nhiều địa điểm.
```

---

## Implementation Summary

Successfully implemented a complete support flow system with:
1. ✅ Database schema for many-to-many relationship (help_records ↔ teams)
2. ✅ Support status tracking (pending, active, completed)
3. ✅ Authentication check with login prompt
4. ✅ Team verification before supporting
5. ✅ Support status display and management in UI

---

## Database Schema

### Table: `help_supports`

Created a junction table to link `help_records` and `teams` with many-to-many relationship:

**Columns:**
- `id` (UUID, Primary Key)
- `help_record_id` (UUID, Foreign Key → help_records)
- `team_id` (TEXT, Foreign Key → teams.phone_number)
- `status` (TEXT, Enum: 'pending', 'active', 'completed')
- `notes` (TEXT, Optional)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Constraints:**
- Unique constraint on (`help_record_id`, `team_id`) - one team can only have one support record per help_record
- Status check constraint (must be one of: pending, active, completed)
- Cascade delete on foreign keys

**Indexes:**
- Index on `help_record_id` for faster lookups
- Index on `team_id` for faster lookups
- Index on `status` for filtering
- Composite indexes for common queries

**SQL File:** `docs/database-schema-help-supports.sql`

---

## Files Created

### 1. Database Schema
- `docs/database-schema-help-supports.sql` - Complete SQL schema with tables, indexes, triggers, RLS policies, and comments

### 2. Types
- `types/models/help-support.ts` - TypeScript types and interfaces:
  - `HelpSupport` interface
  - `CreateHelpSupportDto` interface
  - `UpdateHelpSupportDto` interface
  - `SupportStatus` type ('pending' | 'active' | 'completed')
  - `SUPPORT_STATUS_INFO` constant with display info

### 3. Services
- `services/support/support-service.ts` - Support service with methods:
  - `getSupportByTeam()` - Get support for a help record by team
  - `getSupportsByHelpRecord()` - Get all supports for a help record
  - `getSupportsByTeam()` - Get all supports by a team
  - `getSupportStatus()` - Get status (returns 'none' if not found)
  - `createSupport()` - Create new support relationship
  - `updateSupport()` - Update support status/notes
  - `deleteSupport()` - Delete support relationship
  - `upsertSupport()` - Create or update support

### 4. Updated Files
- `components/help/help-detail-modal.tsx` - Added support flow logic:
  - Authentication check
  - Team verification
  - Support status loading and display
  - Support action handling
- `types/index.ts` - Exported new support types
- `services/index.ts` - Exported support service

---

## Support Flow Logic

### Status Flow:
1. **None** (chưa hỗ trợ) → Click "Hỗ Trợ" → Create support with status "pending"
2. **Pending** (chưa hỗ trợ) → Click "Bắt Đầu Hỗ Trợ" → Update to "active"
3. **Active** (đang được hỗ trợ) → Click "Hoàn Thành Hỗ Trợ" → Confirm → Update to "completed"
4. **Completed** (đã hỗ trợ) → Click "Hỗ Trợ Lại" → Update to "pending"

### User Flow:

#### Case 1: User Not Authenticated
1. User clicks "Hỗ Trợ" button
2. Alert popup appears: "Bạn cần đăng nhập để có thể hỗ trợ. Bạn có muốn đăng nhập ngay bây giờ?"
3. Options: "Hủy" or "Đăng nhập"
4. If "Đăng nhập" → Navigate to `/(auth)/login-phone`

#### Case 2: User Authenticated but No Team
1. User clicks "Hỗ Trợ" button
2. Check if user has a team (by phone number)
3. If no team → Alert: "Bạn cần đăng ký đội trước khi có thể hỗ trợ. Bạn có muốn đăng ký đội ngay bây giờ?"
4. Options: "Hủy" or "Đăng ký đội"
5. If "Đăng ký đội" → Navigate to `/(auth)/team-registration`

#### Case 3: User Authenticated with Team
1. Check current support status
2. Display current status badge if exists
3. Handle support action based on current status:
   - None → Create support (pending)
   - Pending → Update to active
   - Active → Confirm completion → Update to completed
   - Completed → Offer to restart (update to pending)

---

## Support Status Display

### Status Badge in Modal
- Shows current support status when user is authenticated
- Color-coded badges:
  - **Pending** (Chưa hỗ trợ): Orange (#FF9500)
  - **Active** (Đang được hỗ trợ): Blue (#007AFF)
  - **Completed** (Đã hỗ trợ): Green (#34C759)

### Button Text Changes
- Based on current status:
  - None: "Hỗ Trợ"
  - Pending: "Bắt Đầu Hỗ Trợ"
  - Active: "Hoàn Thành Hỗ Trợ"
  - Completed: "Hỗ Trợ Lại"

### Button Colors
- Default: Uses theme tint color
- Active status: Blue (#007AFF)
- Completed status: Green (#34C759)

---

## Technical Details

### Phone Number Formatting
Teams use phone number as primary key with format `+84901234567`. Support service handles formatting:
- Input: Various formats (0XXX, 84XXX, +84XXX)
- Output: Consistent format (+84XXX)

### Database Relationships
- **help_records** (1) ↔ (many) **help_supports** (many) ↔ (1) **teams**
- One help_record can have multiple teams supporting it
- One team can support multiple help_records
- Junction table `help_supports` tracks the relationship and status

### Error Handling
- Try-catch blocks around all async operations
- User-friendly error messages via Alert
- Console error logging for debugging
- Graceful fallbacks (e.g., status = 'none' if not found)

---

## Database Setup Instructions

To set up the database schema in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Open file: `docs/database-schema-help-supports.sql`
4. Copy and paste the entire SQL script
5. Run the script
6. Verify table creation in Table Editor

The script includes:
- Table creation with all constraints
- Indexes for performance
- Triggers for automatic timestamp updates
- Row Level Security (RLS) policies
- View for detailed queries
- Comments for documentation

---

## Testing Checklist

### Authentication Flow
- [ ] Click support when not logged in → Shows login prompt
- [ ] Login prompt → Navigate to login screen
- [ ] Cancel login prompt → Modal stays open

### Team Verification
- [ ] Click support when logged in but no team → Shows team registration prompt
- [ ] Team registration prompt → Navigate to team registration
- [ ] Cancel team registration prompt → Modal stays open

### Support Status Flow
- [ ] Create support (none → pending) → Status badge appears
- [ ] Start support (pending → active) → Status updates
- [ ] Complete support (active → completed) → Status updates with confirmation
- [ ] Restart support (completed → pending) → Status resets

### UI Updates
- [ ] Support status badge displays correctly
- [ ] Button text changes based on status
- [ ] Button colors change based on status
- [ ] Loading states show during API calls

### Database
- [ ] Support records created in database
- [ ] Support status updates correctly
- [ ] Multiple teams can support same help_record
- [ ] One team can support multiple help_records

---

## Future Enhancements

Potential improvements for future iterations:
1. Support cancellation (remove support relationship)
2. Support notes/comments field usage
3. Support history tracking
4. Support statistics (how many teams supporting, completion rate)
5. Support notifications when status changes
6. Support chat/messaging between teams and help requesters
7. Support progress tracking (percentage complete, milestones)

---

## Files Modified Summary

### Created
- `docs/database-schema-help-supports.sql` - Database schema
- `types/models/help-support.ts` - TypeScript types
- `services/support/support-service.ts` - Support service
- `docs/2024-12-19-support-flow-implementation.md` - This documentation

### Modified
- `components/help/help-detail-modal.tsx` - Added support flow logic
- `types/index.ts` - Exported support types
- `services/index.ts` - Exported support service

---

## Summary

Successfully implemented a complete support flow system with:
1. ✅ Database schema for many-to-many relationship
2. ✅ Support status tracking (pending/active/completed)
3. ✅ Authentication check with login prompt
4. ✅ Team verification before supporting
5. ✅ Support status display in UI
6. ✅ Support action handling with status transitions
7. ✅ Error handling and user feedback
8. ✅ Loading states during API calls

The system allows teams to support help records with proper status tracking and ensures users are authenticated and have registered teams before they can provide support.

