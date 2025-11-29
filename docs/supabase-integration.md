# Supabase Integration Guide

This document explains how to set up and use Supabase in the CursorHKT application.

## Setup

### 1. Install Dependencies

The Supabase client library is already installed:
```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your Supabase credentials:
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project or select an existing one
   - Navigate to **Settings > API**
   - Copy the **Project URL** and **anon/public key**

3. Add your credentials to `.env.local`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

**Important**: The `.env.local` file is already in `.gitignore` and will not be committed to version control.

### 3. Restart Development Server

After adding environment variables, restart your Expo development server:
```bash
npm start
```

## Usage

### Importing the Supabase Client

The Supabase client uses lazy initialization, which means:
- ✅ You can safely import the module even if environment variables aren't set
- ✅ The client only initializes when you actually use it
- ✅ Errors will only occur when trying to use Supabase (not on import)

```typescript
// Import the client directly
import { supabaseClient } from '@/services';

// Or import the service with helper methods
import { supabaseService } from '@/services';

// Or import configuration
import { SUPABASE_CONFIG, validateSupabaseConfig } from '@/config';
```

**Note:** If Supabase configuration is missing, you'll get an error when you try to use `supabaseClient` or `supabaseService`, but the app won't crash on import.

### Authentication Examples

#### Sign Up with Email

```typescript
import { supabaseService } from '@/services';

try {
  const { user, session } = await supabaseService.signUpWithEmail(
    'user@example.com',
    'password123',
    {
      data: {
        name: 'John Doe',
      },
    }
  );
  console.log('User signed up:', user);
} catch (error) {
  console.error('Sign up error:', error);
}
```

#### Sign In with Email

```typescript
import { supabaseService } from '@/services';

try {
  const { user, session } = await supabaseService.signInWithEmail(
    'user@example.com',
    'password123'
  );
  console.log('User signed in:', user);
} catch (error) {
  console.error('Sign in error:', error);
}
```

#### Phone Number Authentication (OTP)

```typescript
import { supabaseService } from '@/services';

// Step 1: Send OTP
try {
  await supabaseService.signInWithPhone('+1234567890');
  console.log('OTP sent successfully');
} catch (error) {
  console.error('Failed to send OTP:', error);
}

// Step 2: Verify OTP
try {
  const { user, session } = await supabaseService.verifyOTP(
    '+1234567890',
    '123456',
    'sms'
  );
  console.log('User authenticated:', user);
} catch (error) {
  console.error('OTP verification failed:', error);
}
```

#### Sign Out

```typescript
import { supabaseService } from '@/services';

try {
  await supabaseService.signOut();
  console.log('User signed out');
} catch (error) {
  console.error('Sign out error:', error);
}
```

#### Get Current User

```typescript
import { supabaseService } from '@/services';

try {
  const user = await supabaseService.getCurrentUser();
  if (user) {
    console.log('Current user:', user);
  } else {
    console.log('No user signed in');
  }
} catch (error) {
  console.error('Error getting user:', error);
}
```

#### Listen to Auth State Changes

```typescript
import { supabaseService } from '@/services';
import { useEffect } from 'react';

function MyComponent() {
  useEffect(() => {
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        // Handle auth state changes
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
```

### Database Queries

```typescript
import { supabaseClient } from '@/services';

// Select data
const { data, error } = await supabaseClient
  .from('users')
  .select('*')
  .eq('email', 'user@example.com');

// Insert data
const { data, error } = await supabaseClient
  .from('users')
  .insert([
    { name: 'John Doe', email: 'john@example.com' },
  ]);

// Update data
const { data, error } = await supabaseClient
  .from('users')
  .update({ name: 'Jane Doe' })
  .eq('id', 'user-id');

// Delete data
const { data, error } = await supabaseClient
  .from('users')
  .delete()
  .eq('id', 'user-id');
```

### Real-time Subscriptions

```typescript
import { supabaseClient } from '@/services';

const channel = supabaseClient
  .channel('users')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'users',
    },
    (payload) => {
      console.log('New user inserted:', payload.new);
    }
  )
  .subscribe();

// Unsubscribe when done
channel.unsubscribe();
```

## File Structure

```
config/
  ├── supabase.config.ts    # Supabase configuration and API keys
  └── index.ts              # Exports all config

services/
  ├── auth/
  │   └── supabase-service.ts  # Supabase client and service helpers
  └── index.ts                 # Exports all services
```

## Configuration

The Supabase configuration is managed in `config/supabase.config.ts`. It includes:

- `SUPABASE_CONFIG`: Configuration object with URL and anon key
- `validateSupabaseConfig()`: Validates that configuration is complete
- `getSupabaseConfig()`: Gets configuration with validation

## Service Helpers

The `supabaseService` object provides helper methods for common operations:

- `signInWithEmail()`: Sign in with email/password
- `signUpWithEmail()`: Sign up with email/password
- `signInWithPhone()`: Send OTP to phone number
- `verifyOTP()`: Verify OTP code
- `signOut()`: Sign out current user
- `getCurrentUser()`: Get current authenticated user
- `getCurrentSession()`: Get current session
- `onAuthStateChange()`: Subscribe to auth state changes
- `resetPassword()`: Send password reset email
- `updatePassword()`: Update user password

## Integration with Auth Context

You can integrate Supabase with the existing `AuthContext` by updating the auth methods to use Supabase:

```typescript
import { supabaseService } from '@/services';
import { useAuth } from '@/context/auth-context';

// Update AuthContext to use Supabase
const login = useCallback(async (phoneNumber: string, otp: string) => {
  setIsLoading(true);
  try {
    const { user } = await supabaseService.verifyOTP(phoneNumber, otp, 'sms');
    // Map Supabase user to your User type
    setUser(mapSupabaseUserToUser(user));
    setIsOTPSent(false);
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
}, []);
```

## Troubleshooting

### Configuration Not Found

If you see an error about missing Supabase configuration:

1. Verify that `.env.local` file exists
2. Check that environment variables are prefixed with `EXPO_PUBLIC_`
3. Restart your Expo development server after adding environment variables
4. Ensure the variables are set correctly in `.env.local`

### Session Not Persisting

Supabase automatically persists sessions using AsyncStorage. If sessions are not persisting:

1. Check that AsyncStorage is properly installed (it's included with React Native)
2. Verify that your Supabase project allows the redirect URLs you're using
3. Check Supabase dashboard for any auth configuration issues

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth)

