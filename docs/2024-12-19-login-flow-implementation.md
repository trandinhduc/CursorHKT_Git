# Login Flow Implementation

**Date:** 2024-12-19  
**Task:** Tạo luồng login với màn hình nhập số điện thoại, OTP (default 111111), và lưu thông tin vào Zustand store

## Task Overview

User requested to create a login flow with:
1. Screen to input phone number
2. Navigate to OTP input screen
3. Default OTP is 111111 (will be accepted as correct)
4. Call API to verify and get user information from Supabase
5. Save to Zustand store with name "profile"
6. Display Profile screen with logged-in user information

## Steps Taken

### 1. Installed Zustand

- Installed `zustand` package via npm
- Zustand is a lightweight state management library perfect for React Native

### 2. Created Profile Store (Zustand)

- Created `store/profile-store.ts` with:
  - `profile`: Team | null - Stores user profile data
  - `isAuthenticated`: boolean - Authentication status
  - `setProfile()`: Function to set profile data
  - `clearProfile()`: Function to clear profile and logout
- Updated `store/index.ts` to export the profile store

### 3. Created Login Phone Screen

- Created `app/(auth)/login-phone.tsx` with:
  - Phone number input field
  - Automatic formatting for Vietnamese phone numbers (+84)
  - Validates phone number format (10-15 digits)
  - Navigates to OTP verification screen after validation

### 4. Created Login OTP Screen

- Created `app/(auth)/login-otp.tsx` with:
  - 6-digit OTP input field
  - Special logic: Default OTP `111111` is accepted as correct
  - Calls `teamService.getTeamByPhone()` to get user info from Supabase
  - Saves profile to Zustand store using `setProfile()`
  - Navigates to Profile screen after successful login
  - Shows hint about default OTP

### 5. Updated Profile Screen

- Completely refactored `app/(tabs)/profile.tsx` to:
  - Use Zustand store (`useProfileStore`) instead of Auth context
  - Display profile information when authenticated:
    - Tên trưởng đoàn (Team leader name)
    - Số điện thoại (Phone number)
    - Email
    - Số lượng thành viên (Member count)
    - Nhu yếu phẩm (Essential items)
  - Show login button when not authenticated
  - Show logout button when authenticated
  - Navigate to login screen when clicking "Đăng nhập"
  - Clear profile store when logging out

### 6. Updated Auth Layout

- Added routes for `login-phone` and `login-otp` screens in `app/(auth)/_layout.tsx`

## Files Created

1. `store/profile-store.ts` - Zustand store for profile state management
2. `app/(auth)/login-phone.tsx` - Login screen with phone number input
3. `app/(auth)/login-otp.tsx` - OTP verification screen with special logic for 111111
4. `docs/2024-12-19-login-flow-implementation.md` - This documentation

## Files Modified

1. `store/index.ts` - Added profile store export
2. `app/(auth)/_layout.tsx` - Added login-phone and login-otp routes
3. `app/(tabs)/profile.tsx` - Completely refactored to use Zustand store
4. `package.json` - Added zustand dependency

## Key Features

### Default OTP Logic

- OTP `111111` is hardcoded as the default/development OTP
- When user enters `111111`, the system:
  1. Accepts it as valid (no actual OTP verification needed)
  2. Formats the phone number
  3. Calls `teamService.getTeamByPhone()` to fetch user data from Supabase
  4. Saves the profile to Zustand store
  5. Navigates to Profile screen

### Zustand Store Structure

```typescript
interface ProfileState {
  profile: Team | null;
  isAuthenticated: boolean;
  setProfile: (profile: Team | null) => void;
  clearProfile: () => void;
}
```

### Profile Display

When authenticated, Profile screen displays:
- Team leader name
- Phone number
- Email
- Member count
- Essential items (comma-separated list)

## Usage Flow

1. User opens Profile screen (not authenticated)
2. User clicks "Đăng nhập" button
3. User is navigated to Login Phone screen
4. User enters phone number and clicks "Tiếp tục"
5. User is navigated to Login OTP screen
6. User enters OTP `111111` (default OTP)
7. System verifies OTP (accepts 111111)
8. System fetches user data from Supabase using phone number
9. System saves profile to Zustand store
10. User is navigated back to Profile screen
11. Profile screen displays user information from Zustand store

## Notes

- The default OTP `111111` is for development/testing purposes
- In production, you may want to implement actual OTP verification
- Profile data is stored in Zustand store, which persists during app session
- Logout clears the profile from Zustand store
- The login flow uses the existing `teamService.getTeamByPhone()` method
- Phone number formatting is consistent with registration flow (+84 format)

## Build Results

Pending - Will run iOS build after documentation completion.

