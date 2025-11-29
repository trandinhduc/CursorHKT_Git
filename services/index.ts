/**
 * Services Directory
 * 
 * This directory contains service modules for API calls, business logic, and external integrations.
 * 
 * Structure:
 * - api/          - API service modules (e.g., userApi.ts, productApi.ts)
 * - auth/         - Authentication services
 * - storage/      - Local storage services (AsyncStorage, SecureStore)
 * - analytics/    - Analytics services
 * - notification/ - Push notification services
 * 
 * Example usage:
 * ```typescript
 * import { userService } from '@/services';
 * const user = await userService.getUser(id);
 * ```
 */

// Export all services here
// Example: export * from './api/user-service';

// Export Supabase service
export * from './auth/supabase-service';

// Export Team service
export * from './team/team-service';

// Export Help service
export * from './help/help-service';

// Export Support service
export * from './support/support-service';

// Export Province service
export * from './province/province-service';

