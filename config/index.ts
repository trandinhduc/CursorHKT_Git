/**
 * Config Directory
 * 
 * This directory contains configuration files and constants.
 * 
 * Structure:
 * - app.config.ts        - App configuration
 * - api.config.ts        - API endpoints and configuration
 * - env.config.ts        - Environment variables
 * - supabase.config.ts   - Supabase configuration and API keys
 * 
 * Example usage:
 * ```typescript
 * import { API_BASE_URL, API_TIMEOUT } from '@/config';
 * ```
 */

// App Configuration
export const APP_CONFIG = {
  name: 'CursorHKT',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
} as const;

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
} as const;

// Export environment-specific configs
export const ENV_CONFIG = {
  isDevelopment: APP_CONFIG.environment === 'development',
  isProduction: APP_CONFIG.environment === 'production',
  isTest: APP_CONFIG.environment === 'test',
} as const;

// Export Supabase configuration
export * from './supabase.config';

