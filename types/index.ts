/**
 * Types Directory
 * 
 * This directory contains TypeScript type definitions, interfaces, and enums.
 * 
 * Structure:
 * - api/          - API-related types
 * - models/       - Data models
 * - navigation/   - Navigation types
 * - common/       - Common types used across the app
 * 
 * Example usage:
 * ```typescript
 * import type { User, ApiResponse } from '@/types';
 * const user: User = { id: '1', name: 'John' };
 * ```
 */

// Export all types here
export type { User, UserProfile, CreateUserDto, UpdateUserDto } from './models/user';
export type { Team, CreateTeamDto, UpdateTeamDto, EssentialItem } from './models/team';
export type { HelpRecord, CreateHelpRecordDto, UpdateHelpRecordDto } from './models/help-record';
export type { 
  HelpSupport, 
  CreateHelpSupportDto, 
  UpdateHelpSupportDto,
  SupportStatus,
  HelpSupportWithDetails,
  SupportStatusInfo
} from './models/help-support';
export { SUPPORT_STATUS_INFO } from './models/help-support';
export type { 
  Province, 
  CreateProvinceDto, 
  UpdateProvinceDto 
} from './models/province';
// Example: export type { ApiResponse, ApiError } from './api/api-types';

