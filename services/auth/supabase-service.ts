/**
 * Supabase Service
 * 
 * This service provides a centralized Supabase client instance and
 * helper functions for authentication and database operations.
 * 
 * Usage:
 * ```typescript
 * import { supabaseClient, supabaseService } from '@/services/auth/supabase-service';
 * 
 * // Use the client directly
 * const { data, error } = await supabaseClient.from('users').select('*');
 * 
 * // Use service helpers
 * await supabaseService.signIn(email, password);
 * ```
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/config/supabase.config';

/**
 * Supabase client instance
 * 
 * This is a singleton instance that should be used throughout the app
 * for all Supabase operations.
 */
let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Get or create the Supabase client instance
 * 
 * @returns Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    const config = getSupabaseConfig();
    supabaseClientInstance = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseClientInstance;
}

/**
 * Lazy-initialized Supabase client instance (singleton)
 * 
 * This Proxy ensures the client is only initialized when actually used,
 * preventing errors if environment variables aren't set at module load time.
 * 
 * Use this directly for database queries and operations:
 * ```typescript
 * const { data } = await supabaseClient.from('table').select('*');
 * ```
 */
export const supabaseClient = new Proxy<SupabaseClient>({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = client[prop as keyof SupabaseClient];
    // If it's a function, bind it to the client instance
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

/**
 * Supabase Service
 * 
 * Provides helper methods for common Supabase operations
 */
export const supabaseService = {
  /**
   * Sign in with email and password
   * 
   * @param email User email
   * @param password User password
   * @returns Auth response with user and session
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   * 
   * @param email User email
   * @param password User password
   * @param options Additional sign up options
   * @returns Auth response with user and session
   */
  async signUpWithEmail(
    email: string,
    password: string,
    options?: {
      data?: Record<string, unknown>;
      redirectTo?: string;
    }
  ) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign in with phone number and OTP
   * 
   * @param phone Phone number (with country code)
   * @returns OTP verification response
   */
  async signInWithPhone(phone: string) {
    const { data, error } = await supabaseClient.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Verify OTP for phone number authentication
   * 
   * @param phone Phone number
   * @param token OTP token
   * @param type Verification type (sms, email, etc.)
   * @returns Auth response with user and session
   */
  async verifyOTP(phone: string, token: string, type: 'sms' | 'email' = 'sms') {
    const { data, error } = await supabaseClient.auth.verifyOtp({
      phone,
      token,
      type,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current authenticated user
   * 
   * @returns Current user or null if not authenticated
   */
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabaseClient.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Get the current session
   * 
   * @returns Current session or null if not authenticated
   */
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Subscribe to auth state changes
   * 
   * @param callback Function to call when auth state changes
   * @returns Subscription object with unsubscribe method
   */
  onAuthStateChange(
    callback: (event: string, session: unknown) => void
  ) {
    return supabaseClient.auth.onAuthStateChange(callback);
  },

  /**
   * Reset password for email
   * 
   * @param email User email
   * @param redirectTo URL to redirect to after password reset
   */
  async resetPassword(email: string, redirectTo?: string) {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      }
    );
    if (error) throw error;
    return data;
  },

  /**
   * Update user password
   * 
   * @param newPassword New password
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  },
};

/**
 * Helper type for Supabase client
 */
export type { SupabaseClient };

