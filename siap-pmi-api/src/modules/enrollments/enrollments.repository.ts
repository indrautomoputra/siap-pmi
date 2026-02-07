import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import {
  Enrollment,
  EnrollmentDocument,
  EnrollmentGeneralDetail,
  EnrollmentKsrBasicDetail,
  EnrollmentReviewStatus,
  EnrollmentStatus,
  PMIElement,
} from './enrollments.types';
import { EventId } from '../events/events.types';
import { EnrollmentAccessDenied } from './enrollments.errors';

type EnrollmentRow = {
  id: string;
  event_id: EventId;
  user_id: string | null;
  participant_name: string;
  display_name: string | null;
  pmi_element: PMIElement | null;
  status: EnrollmentStatus;
  review_status: EnrollmentReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  registered_at: string;
};

type EnrollmentDocumentRow = {
  id: string;
  enrollment_id: string;
  doc_type: string;
  file_path: string;
  uploaded_by: string | null;
  uploaded_at: string;
};

type EnrollmentKsrBasicDetailRow = {
  enrollment_id: string;
  nik: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  phone_number: string;
  email: string;
  education: string;
  occupation: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
};

type EnrollmentGeneralDetailRow = {
  enrollment_id: string;
  unsur_pmi: PMIElement;
  nik: string;
  birth_place: string;
  birth_date: string;
  gender: string;
  address: string;
  phone_number: string;
  email: string;
  education: string;
  occupation: string;
  blood_type: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  organization_name: string | null;
  organization_role: string | null;
};

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

const toDomainEnrollment = (row: EnrollmentRow): Enrollment => ({
  id: row.id,
  eventId: row.event_id,
  userId: row.user_id ?? undefined,
  participantName: row.participant_name,
  displayName: row.display_name ?? row.participant_name,
  pmiElement: row.pmi_element ?? undefined,
  status: row.status,
  reviewStatus: row.review_status,
  reviewedBy: row.reviewed_by ?? undefined,
  reviewedAt: row.reviewed_at ? new Date(row.reviewed_at) : undefined,
  reviewNote: row.review_note ?? undefined,
  registeredAt: new Date(row.registered_at),
});

@Injectable()
export class EnrollmentsRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createEnrollment(enrollment: Enrollment): Promise<Enrollment> {
    const client = this.supabaseProvider.getClient();
    if (!enrollment.userId) {
      throw new Error('Missing userId for enrollment');
    }
    const payload: EnrollmentRow = {
      id: enrollment.id,
      event_id: enrollment.eventId,
      user_id: enrollment.userId,
      participant_name: enrollment.participantName,
      display_name: enrollment.displayName ?? null,
      pmi_element: enrollment.pmiElement ?? null,
      status: enrollment.status,
      review_status: enrollment.reviewStatus,
      reviewed_by: enrollment.reviewedBy ?? null,
      reviewed_at: enrollment.reviewedAt
        ? enrollment.reviewedAt.toISOString()
        : null,
      review_note: enrollment.reviewNote ?? null,
      registered_at: toDateString(enrollment.registeredAt),
    };

    const { data, error } = await client
      .from('enrollments')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      if (
        error?.code === '42501' ||
        error?.message?.toLowerCase().includes('permission') ||
        error?.message?.toLowerCase().includes('jwt')
      ) {
        throw new EnrollmentAccessDenied(enrollment.eventId, enrollment.userId);
      }
      throw new Error(error?.message ?? 'Failed to create enrollment');
    }

    return toDomainEnrollment(data as EnrollmentRow);
  }

  async findByEventId(eventId: EventId): Promise<Enrollment[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('enrollments')
      .select('*')
      .eq('event_id', eventId);

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch enrollments');
    }

    return (data as EnrollmentRow[]).map(toDomainEnrollment);
  }

  async findByEventAndUser(
    eventId: EventId,
    userId: string,
  ): Promise<Enrollment[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('enrollments')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch enrollments');
    }

    return (data as EnrollmentRow[]).map(toDomainEnrollment);
  }

  async findById(enrollmentId: string): Promise<Enrollment | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return toDomainEnrollment(data as EnrollmentRow);
  }

  async updateReviewStatus(
    enrollmentId: string,
    reviewStatus: EnrollmentReviewStatus,
    reviewedBy: string,
    reviewNote?: string,
  ): Promise<Enrollment> {
    const client = this.supabaseProvider.getClient();
    const payload = {
      review_status: reviewStatus,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote ?? null,
    };

    const { data, error } = await client
      .from('enrollments')
      .update(payload)
      .eq('id', enrollmentId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update review status');
    }

    return toDomainEnrollment(data as EnrollmentRow);
  }

  async createKsrBasicDetail(detail: EnrollmentKsrBasicDetail): Promise<void> {
    const client = this.supabaseProvider.getClient();
    const payload: EnrollmentKsrBasicDetailRow = {
      enrollment_id: detail.enrollmentId,
      nik: detail.nik,
      birth_place: detail.birthPlace,
      birth_date: detail.birthDate,
      gender: detail.gender,
      address: detail.address,
      phone_number: detail.phoneNumber,
      email: detail.email,
      education: detail.education,
      occupation: detail.occupation,
      blood_type: detail.bloodType,
      emergency_contact_name: detail.emergencyContactName,
      emergency_contact_phone: detail.emergencyContactPhone,
    };

    const { error } = await client
      .from('enrollment_ksr_basic_details')
      .insert(payload);

    if (error) {
      throw new Error(error.message ?? 'Failed to create KSR basic detail');
    }
  }

  async createGeneralDetail(detail: EnrollmentGeneralDetail): Promise<void> {
    const client = this.supabaseProvider.getClient();
    const payload: EnrollmentGeneralDetailRow = {
      enrollment_id: detail.enrollmentId,
      unsur_pmi: detail.unsurPmi,
      nik: detail.nik,
      birth_place: detail.birthPlace,
      birth_date: detail.birthDate,
      gender: detail.gender,
      address: detail.address,
      phone_number: detail.phoneNumber,
      email: detail.email,
      education: detail.education,
      occupation: detail.occupation,
      blood_type: detail.bloodType,
      emergency_contact_name: detail.emergencyContactName,
      emergency_contact_phone: detail.emergencyContactPhone,
      organization_name: detail.organizationName ?? null,
      organization_role: detail.organizationRole ?? null,
    };

    const { error } = await client
      .from('enrollment_general_details')
      .insert(payload);

    if (error) {
      throw new Error(error.message ?? 'Failed to create general detail');
    }
  }

  async attachDocument(document: EnrollmentDocument): Promise<string> {
    const client = this.supabaseProvider.getClient();
    const payload: EnrollmentDocumentRow = {
      id: document.id,
      enrollment_id: document.enrollmentId,
      doc_type: document.docType,
      file_path: document.filePath,
      uploaded_by: document.uploadedBy ?? null,
      uploaded_at: document.uploadedAt ?? new Date().toISOString(),
    };

    const { data, error } = await client
      .from('enrollment_documents')
      .insert(payload)
      .select('id')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to attach document');
    }

    return (data as EnrollmentDocumentRow).id;
  }
}
