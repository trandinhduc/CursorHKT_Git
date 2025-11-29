/**
 * Help Record Model Types
 */

import type { EssentialItem } from './team';

export interface HelpRecord {
  id?: string;
  isForSelf: boolean; // true = cho bản thân, false = cho người khác
  locationName: string; // Tên địa điểm
  adultCount: number; // Số lượng người lớn
  childCount: number; // Số lượng trẻ nhỏ
  phoneNumber: string; // Số điện thoại
  essentialItems: EssentialItem[]; // Danh sách nhu yếu phẩm
  // Location info - nếu isForSelf = true thì dùng user location, nếu false thì dùng address hoặc mapLink
  latitude?: number; // Vĩ độ (nếu tạo cho bản thân)
  longitude?: number; // Kinh độ (nếu tạo cho bản thân)
  address?: string; // Địa chỉ (nếu tạo cho người khác)
  mapLink?: string; // Google Maps link (nếu tạo cho người khác)
  provinceId?: string; // ID của tỉnh (foreign key to provinces table)
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHelpRecordDto {
  isForSelf: boolean;
  locationName: string;
  adultCount: number;
  childCount: number;
  phoneNumber: string;
  essentialItems: EssentialItem[];
  latitude?: number;
  longitude?: number;
  address?: string;
  mapLink?: string;
  provinceId?: string;
}

export interface UpdateHelpRecordDto {
  isForSelf?: boolean;
  locationName?: string;
  adultCount?: number;
  childCount?: number;
  phoneNumber?: string;
  essentialItems?: EssentialItem[];
  latitude?: number;
  longitude?: number;
  address?: string;
  mapLink?: string;
}

