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
