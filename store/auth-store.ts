/**
 * Auth Store (Zustand)
 *
 * Manages user authentication state using Zustand with Supabase session persistence
 */

import { supabaseService } from "@/services/auth/supabase-service";
import { User } from "@/types/models/user";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOTPSent: boolean;
  isLoading: boolean;
  // Actions
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  setUser: (user: User | null) => void;
  restoreSession: () => Promise<void>;
}

// Helper function to create User from Supabase user
const createUserFromSupabase = (supabaseUser: {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}): User => {
  const metadata = supabaseUser.user_metadata || {};
  const phoneNumber = supabaseUser.phone || (metadata.phone as string) || "";

  return {
    id: supabaseUser.id,
    email:
      supabaseUser.email ||
      (metadata.email as string) ||
      `${phoneNumber}@example.com`,
    name:
      (metadata.full_name as string) ||
      (metadata.name as string) ||
      phoneNumber ||
      "User",
    phoneNumber: phoneNumber,
    createdAt: supabaseUser.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isOTPSent: false,
      isLoading: true, // Start with true to check session

      restoreSession: async () => {
        try {
          set({ isLoading: true });
          const session = await supabaseService.getCurrentSession();

          if (session?.user) {
            const restoredUser = createUserFromSupabase(session.user);
            set({
              user: restoredUser,
              isAuthenticated: true,
              isLoading: false,
            });
            console.log("Session restored for user:", restoredUser.phoneNumber);
          } else {
            // No session, user is not authenticated
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error("Error restoring session:", error);
          // If session is invalid, clear it
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      sendOTP: async (phoneNumber: string) => {
        set({ isLoading: true });
        try {
          // Send OTP using Supabase
          await supabaseService.signInWithPhone(phoneNumber);
          set({ isOTPSent: true, isLoading: false });
          console.log(`OTP sent to ${phoneNumber}`);
        } catch (error) {
          console.error("Failed to send OTP:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      verifyOTP: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true });
        try {
          // Verify OTP using Supabase
          const { user: supabaseUser } = await supabaseService.verifyOTP(
            phoneNumber,
            otp,
            "sms"
          );

          if (!supabaseUser) {
            throw new Error("OTP verification failed");
          }

          // User is now authenticated but profile may not be complete
          // Profile will be completed in create-account screen
          set({ isOTPSent: false, isLoading: false });
        } catch (error) {
          console.error("Failed to verify OTP:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      login: async (phoneNumber: string, otp: string) => {
        set({ isLoading: true });
        try {
          // Verify OTP using Supabase
          const { user: supabaseUser } = await supabaseService.verifyOTP(
            phoneNumber,
            otp,
            "sms"
          );

          if (!supabaseUser) {
            throw new Error("OTP verification failed");
          }

          // Get user metadata
          const metadata = supabaseUser.user_metadata || {};
          const newUser: User = {
            id: supabaseUser.id,
            email:
              supabaseUser.email ||
              metadata.email ||
              `${phoneNumber}@example.com`,
            name: metadata.full_name || metadata.name || phoneNumber,
            phoneNumber: phoneNumber,
            createdAt: supabaseUser.created_at || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({
            user: newUser,
            isAuthenticated: true,
            isOTPSent: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to verify OTP:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabaseService.signOut();
        } catch (error) {
          console.error("Error signing out:", error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isOTPSent: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: "auth-storage", // unique name for AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }), // Only persist user and isAuthenticated, not loading states
    }
  )
);

// Initialize session restoration on store creation
// This will be called when the store is first used
let sessionRestored = false;

export const initializeAuth = async () => {
  if (!sessionRestored) {
    sessionRestored = true;
    await useAuthStore.getState().restoreSession();

    // Listen for auth state changes
    const subscription = supabaseService.onAuthStateChange(async (event) => {
      console.log("Auth state changed:", event);

      try {
        if (event === "SIGNED_IN") {
          // Get current session to restore user
          const currentSession = await supabaseService.getCurrentSession();
          if (currentSession?.user) {
            const restoredUser = createUserFromSupabase(currentSession.user);
            useAuthStore.setState({
              user: restoredUser,
              isAuthenticated: true,
            });
          }
        } else if (event === "SIGNED_OUT") {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
          });
        } else if (event === "TOKEN_REFRESHED") {
          // Update user on token refresh
          const currentSession = await supabaseService.getCurrentSession();
          if (currentSession?.user) {
            const restoredUser = createUserFromSupabase(currentSession.user);
            useAuthStore.setState({
              user: restoredUser,
              isAuthenticated: true,
            });
          }
        }
      } catch (error) {
        console.error("Error handling auth state change:", error);
      }
    });

    // Store subscription for cleanup if needed
    // Note: Supabase subscriptions are typically long-lived
    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }
};
