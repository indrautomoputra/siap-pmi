import { EventId } from '../events/events.types';

export type EnrollmentId = string;

export type PMIElement = 'PENGURUS' | 'STAF' | 'RELAWAN';

export type EnrollmentStatus =
  | 'registered' // daftar, belum diverifikasi admin
  | 'validated' // administrasi lengkap
  | 'active' // mengikuti pelatihan
  | 'withdrawn'; // mengundurkan diri

export type EnrollmentReviewStatus = 'pending_review' | 'approved' | 'rejected';

export interface Enrollment {
  id: EnrollmentId;
  eventId: EventId;
  userId?: string;
  participantName: string;
  displayName?: string;

  // Unsur PMI (kecuali KSR Dasar nanti di rule)
  pmiElement?: PMIElement;

  status: EnrollmentStatus;
  reviewStatus: EnrollmentReviewStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNote?: string;

  registeredAt: Date;
}

export interface EnrollmentKsrBasicDetail {
  enrollmentId: EnrollmentId;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  education: string;
  occupation: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface EnrollmentGeneralDetail {
  enrollmentId: EnrollmentId;
  unsurPmi: PMIElement;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  phoneNumber: string;
  email: string;
  education: string;
  occupation: string;
  bloodType: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  organizationName?: string;
  organizationRole?: string;
}

export interface EnrollmentDocument {
  id: string;
  enrollmentId: EnrollmentId;
  docType: string;
  filePath: string;
  uploadedBy?: string;
  uploadedAt?: string;
}
