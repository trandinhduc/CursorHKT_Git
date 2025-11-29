/**
 * Team Model Types
 */

export type EssentialItem = 'Medical' | 'Food' | 'Clothes' | 'Tools';

export interface Team {
  id?: string;
  phoneNumber: string; // Primary key
  teamLeaderName: string;
  email: string;
  memberCount: number;
  essentialItems: EssentialItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamDto {
  phoneNumber: string;
  teamLeaderName: string;
  email: string;
  memberCount: number;
  essentialItems: EssentialItem[];
}

export interface UpdateTeamDto {
  teamLeaderName?: string;
  email?: string;
  memberCount?: number;
  essentialItems?: EssentialItem[];
}

