/**
 * Province Model Types
 * 
 * Represents provinces (tỉnh/thành phố) where help records are located.
 */

export interface Province {
  id: string;
  name: string;
  code?: string;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProvinceDto {
  name: string;
  code?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateProvinceDto {
  name?: string;
  code?: string;
  displayOrder?: number;
  isActive?: boolean;
}

