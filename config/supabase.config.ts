/**
 * Supabase Configuration
 * 
 * This file contains configuration for Supabase integration.
 * API keys should be stored in environment variables with EXPO_PUBLIC_ prefix.
 * 
 * Environment Variables Required:
 * - EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 * 
 * Usage:
 * ```typescript
 * import { SUPABASE_CONFIG } from '@/config/supabase.config';
 * ```
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Supabase configuration object
 * 
 * Reads from environment variables:
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
export const SUPABASE_CONFIG: SupabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

/**
 * Validates that required Supabase configuration is present
 * 
 * @returns true if all required config values are set
 */
export function validateSupabaseConfig(): boolean {
  const hasUrl = !!SUPABASE_CONFIG.url && SUPABASE_CONFIG.url.length > 0;
  const hasKey = !!SUPABASE_CONFIG.anonKey && SUPABASE_CONFIG.anonKey.length > 0;

  if (!hasUrl || !hasKey) {
    if (__DEV__) {
      console.warn(
        'Supabase configuration is incomplete. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file.'
      );
    }
    return false;
  }

  return true;
}

/**
 * Get Supabase configuration with validation
 * 
 * @throws Error if configuration is invalid
 * @returns Supabase configuration object
 */
export function getSupabaseConfig(): SupabaseConfig {
  if (!validateSupabaseConfig()) {
    throw new Error(
      'Supabase configuration is missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your environment variables.'
    );
  }
  return SUPABASE_CONFIG;
}

