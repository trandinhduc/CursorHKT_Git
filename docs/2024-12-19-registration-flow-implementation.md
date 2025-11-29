# Registration Flow Implementation

**Date:** 2024-12-19  
**Task:** Implement registration flow with phone verification and OTP

## Task Overview

User requested to create a registration flow in the Profile screen that includes:

1. Phone number input with verification
2. OTP code input screen
3. Account creation screen with full name, phone number, email, etc.

## Steps Taken

### 1. Created Auth Group Layout

- Created `app/(auth)/_layout.tsx` to handle navigation for registration screens
- Configured Stack navigation with proper headers and back buttons

### 2. Created Registration Screens

#### Phone Number Input Screen (`app/(auth)/register-phone.tsx`)

- Input field for phone number with validation
- Automatic formatting for Vietnamese phone numbers (+84)
- Validates phone number format (10-15 digits)
- Navigates to OTP verification screen after sending OTP

#### OTP Verification Screen (`app/(auth)/verify-otp.tsx`)

- 6-digit OTP input with auto-formatting
- Resend OTP functionality with 60-second cooldown
- Displays phone number being verified
- Navigates to account creation screen after successful verification

#### Account Creation Screen (`app/(auth)/create-account.tsx`)

- Form fields for:
  - Full name (required)
  - Email (required, with validation)
  - Phone number (read-only, pre-filled from verification)
- Updates Supabase user metadata
- Creates user profile in local state
- Navigates back to Profile screen after successful creation

### 3. Updated Auth Context

- Added `verifyOTP` method for OTP verification (separate from login)
- Added `setUser` method to update user state
- Updated `sendOTP` to use Supabase service
- Updated `login` to use Supabase OTP verification
- Both methods now properly integrate with Supabase authentication

### 4. Updated Profile Screen

- Added "Đăng ký tài khoản mới" (Register new account) button
- Updated all text to Vietnamese for consistency
- Improved phone number formatting in login flow
- Button navigates to registration flow

### 5. Updated Root Layout

- Added `(auth)` route group to root Stack navigator
- Allows navigation to auth screens from anywhere in the app

## Files Created

1. `app/(auth)/_layout.tsx` - Auth group layout
2. `app/(auth)/register-phone.tsx` - Phone number input screen
3. `app/(auth)/verify-otp.tsx` - OTP verification screen
4. `app/(auth)/create-account.tsx` - Account creation screen

## Files Modified

1. `context/auth-context.tsx`

   - Added `verifyOTP` method
   - Added `setUser` method
   - Updated `sendOTP` to use Supabase
   - Updated `login` to use Supabase OTP verification

2. `app/(tabs)/profile.tsx`

   - Added registration button
   - Updated all text to Vietnamese
   - Improved phone number formatting

3. `app/_layout.tsx`
   - Added `(auth)` route to Stack navigator

## Technical Details

### Phone Number Formatting

- Automatically formats Vietnamese phone numbers to +84 format
- Handles inputs starting with 0, 84, or direct +84
- Validates 10-15 digit phone numbers

### OTP Flow

1. User enters phone number → `sendOTP` called
2. Supabase sends OTP via SMS
3. User enters OTP → `verifyOTP` called
4. Supabase verifies OTP and authenticates user
5. User completes profile → Updates Supabase metadata

### Navigation Flow

```
Profile Screen
  ↓ (Click "Đăng ký tài khoản mới")
Register Phone Screen
  ↓ (Enter phone, send OTP)
Verify OTP Screen
  ↓ (Enter OTP, verify)
Create Account Screen
  ↓ (Fill form, submit)
Profile Screen (authenticated)
```

## Build Results

- iOS build initiated in background
- No linter errors found
- All TypeScript types properly defined

## Notes/Issues

1. **Supabase Integration**: The implementation uses Supabase for phone authentication. Ensure:

   - `EXPO_PUBLIC_SUPABASE_URL` is set
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` is set
   - Supabase project has phone authentication enabled

2. **Phone Number Format**: The app automatically formats phone numbers to +84 (Vietnam) format. This can be adjusted for other countries if needed.

3. **User Metadata**: After OTP verification, user metadata (full_name, email, phone) is stored in Supabase auth metadata. This can be extended to a separate user profile table if needed.

4. **Error Handling**: All screens include proper error handling with user-friendly Vietnamese error messages.

5. **UI Consistency**: All screens follow the app's design system with:
   - Themed components (ThemedText, ThemedView)
   - Consistent styling
   - Dark mode support
   - Proper keyboard handling

## Future Enhancements

- Add profile picture upload in account creation
- Add additional profile fields (address, date of birth, etc.)
- Implement profile editing functionality
- Add email verification if needed
- Store user profile in separate database table instead of just metadata
