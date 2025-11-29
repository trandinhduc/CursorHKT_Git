# Setup Environment Variables

**Date:** 2024-11-29  
**Issue:** Supabase configuration missing even though values were in `.env.example`

## Problem

The `.env.example` file is just a template file. Expo does not automatically read it. You need to create a `.env.local` file with actual values.

## Solution

### Step 1: Create `.env.local` file

The file has been automatically created from `.env.example`:

```bash
cp .env.example .env.local
```

### Step 2: Restart Expo Development Server

**IMPORTANT:** After creating or updating `.env.local`, you MUST restart your Expo development server:

1. Stop the current server (press `Ctrl+C` in terminal)
2. Clear Metro bundler cache (optional but recommended):
   ```bash
   npx expo start --clear
   ```
3. Or simply restart:
   ```bash
   npm start
   ```

### Step 3: Verify Configuration

The `.env.local` file should contain:

```env
EXPO_PUBLIC_SUPABASE_URL=https://rytgybbqmmbyqcmylcsu.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

1. **File Names:**
   - `.env.example` - Template file (can be committed to git)
   - `.env.local` - Actual values (ignored by git, see `.gitignore`)

2. **Environment Variable Prefix:**
   - Expo only reads variables prefixed with `EXPO_PUBLIC_`
   - These variables are exposed to client-side code

3. **Restart Required:**
   - Environment variables are loaded when the server starts
   - Any changes require a server restart

4. **Security:**
   - `.env.local` is in `.gitignore` and won't be committed
   - Never commit actual API keys to git

## Current Status

✅ File `.env.local` created  
✅ Contains Supabase URL and API key  
✅ File is in `.gitignore`  
⚠️ **You need to restart the Expo server**

## Next Steps

1. Restart your Expo development server
2. The Supabase integration should now work
3. Test by calling `sendOTP()` or other Supabase functions

