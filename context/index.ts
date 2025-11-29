/**
 * Context Directory
 *
 * This directory contains React Context providers for global state.
 *
 * Note: Authentication is now managed via Zustand store (see store/auth-store.ts)
 *
 * Structure:
 * - theme-context.tsx    - Theme context (if needed)
 * - app-context.tsx      - App-wide context (if needed)
 *
 * Example usage:
 * ```typescript
 * import { useAuthStore } from '@/store';
 * const { user, login } = useAuthStore();
 * ```
 */

// No contexts exported - using Zustand stores instead
