/**
 * User Model Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserProfile extends User {
  bio?: string;
  phoneNumber?: string;
  address?: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
  bio?: string;
  phoneNumber?: string;
  address?: string;
}

