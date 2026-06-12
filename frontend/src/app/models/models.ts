// Shared types mirroring the backend DTOs / enums.

export type Gender = 'MALE' | 'FEMALE';
export type IdType = 'EMPLOYEE' | 'CANDIDATE';
export type Role = 'USER' | 'SUPER_ADMIN';
export type SharingType = 'DOUBLE' | 'TRIPLE';
export type TenantPreference = 'MALE_ONLY' | 'FEMALE_ONLY' | 'ANYONE';
export type PostingStatus = 'AVAILABLE' | 'PENDING' | 'EXPIRED';
export type DoubtCategory = 'CITIES' | 'TRANSPORT' | 'PG' | 'GENERAL';

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  gender: Gender;
  role: Role;
  idType: IdType | null;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  cognizantId: string;
  idType: IdType | null;
}

export interface DirectoryEntry {
  id: number;
  cognizantId: string;
  idType: IdType;
  registered: boolean;
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  cognizantId: string;
  idType: IdType | null;
  role: Role;
}

export interface VerifyIdResponse {
  valid: boolean;
  idType: IdType;
  message: string;
}

export interface SignupRequest {
  cognizantId: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  password: string;
}

export interface Posting {
  id: number;
  pgName: string;
  localityAndLandmark: string;
  officeCampus: string;
  sharingType: SharingType;
  tenantPreference: TenantPreference;
  totalBeds: number;
  availableBeds: number;
  rentAmount: number;
  foodRating: number | null;
  foodReview: string | null;
  serviceRating: number | null;
  serviceReview: string | null;
  imageUrls: string[];
  status: PostingStatus;
  createdAt: string;
  expiresAt: string;
  needsReconfirmation: boolean;
  providerName: string;
  providerPhone: string;
}

export interface CreatePostingRequest {
  pgName: string;
  localityAndLandmark: string;
  officeCampus: string;
  sharingType: SharingType;
  tenantPreference: TenantPreference;
  availableBeds: number;
  rentAmount: number;
  foodRating: number | null;
  foodReview: string | null;
  serviceRating: number | null;
  serviceReview: string | null;
  imageUrls: string[];
}

export interface Answer {
  id: number;
  content: string;
  answeredByName: string;
  createdAt: string;
}

export interface Doubt {
  id: number;
  title: string;
  content: string;
  category: DoubtCategory;
  askedByName: string;
  createdAt: string;
  answerCount: number;
  answers: Answer[] | null;
}

export interface CreateDoubtRequest {
  title: string;
  content: string;
  category: DoubtCategory;
}
