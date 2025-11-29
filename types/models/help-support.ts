/**
 * Help Support Model Types
 * 
 * Represents the relationship between help_records and teams,
 * tracking which teams are supporting which help locations.
 */

export type SupportStatus = 'pending' | 'active' | 'completed';

export interface HelpSupport {
  id: string;
  helpRecordId: string;
  teamId: string; // team phone_number
  status: SupportStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHelpSupportDto {
  helpRecordId: string;
  teamId: string;
  status?: SupportStatus;
  notes?: string;
}

export interface UpdateHelpSupportDto {
  status?: SupportStatus;
  notes?: string;
}

/**
 * Help support status with related data
 */
export interface HelpSupportWithDetails extends HelpSupport {
  locationName?: string;
  teamLeaderName?: string;
  helpRecordPhone?: string;
}

/**
 * Support status display information
 */
export interface SupportStatusInfo {
  status: SupportStatus;
  label: string;
  description: string;
  color: string;
}

export const SUPPORT_STATUS_INFO: Record<SupportStatus, SupportStatusInfo> = {
  pending: {
    status: 'pending',
    label: 'Chưa hỗ trợ',
    description: 'Yêu cầu đã được gửi nhưng chưa bắt đầu hỗ trợ',
    color: '#FF9500', // Orange
  },
  active: {
    status: 'active',
    label: 'Đang được hỗ trợ',
    description: 'Đang trong quá trình hỗ trợ',
    color: '#007AFF', // Blue
  },
  completed: {
    status: 'completed',
    label: 'Đã hỗ trợ',
    description: 'Đã hoàn thành hỗ trợ',
    color: '#34C759', // Green
  },
};

