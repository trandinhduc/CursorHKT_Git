/**
 * Profile Store (Zustand)
 * 
 * Manages user profile state using Zustand
 */

import { create } from 'zustand';
import type { Team } from '@/types';

interface ProfileState {
  profile: Team | null;
  setProfile: (profile: Team | null) => void;
  clearProfile: () => void;
  isAuthenticated: boolean;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isAuthenticated: false,
  setProfile: (profile) => set({ profile, isAuthenticated: !!profile }),
  clearProfile: () => set({ profile: null, isAuthenticated: false }),
}));

