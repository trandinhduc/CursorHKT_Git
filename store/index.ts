/**
 * Store Directory
 *
 * This directory contains state management setup.
 *
 * For simple state management, use React Context.
 * For complex state, consider using Zustand, Redux, or Jotai.
 *
 * Structure:
 * - contexts/     - React Context providers
 * - slices/       - State slices (if using Redux/Zustand)
 * - hooks/        - Custom hooks for state access
 *
 * Example usage:
 * ```typescript
 * import { useAuthStore } from '@/store';
 * const { user, login } = useAuthStore();
 * ```
 */

// Export store setup here
export { initializeAuth, useAuthStore } from "./auth-store";
export { useProfileStore } from "./profile-store";
