import {
  EnrollmentReviewStatus,
  EnrollmentStatus,
  PMIElement,
} from '../enrollments/enrollments.types';

export class DashboardParticipantsResponseDto {
  eventId: string;
  participants: DashboardParticipantItemDto[];
}

export class DashboardParticipantItemDto {
  enrollmentId: string;
  participantName: string;
  displayName?: string;
  status: EnrollmentStatus;
  reviewStatus: EnrollmentReviewStatus;
  registeredAt: string;
  pmiElement?: PMIElement;
}

export class DashboardAssessmentRecapResponseDto {
  eventId: string;
  enrollments: DashboardAssessmentRecapItemDto[];
}

export class DashboardAssessmentRecapItemDto {
  enrollmentId: string;
  participantName: string;
  displayName?: string;
  akademik: DashboardAssessmentRecapSummaryDto;
  sikap: DashboardAssessmentRecapSummaryDto;
}

export class DashboardAssessmentRecapSummaryDto {
  averageScore: number | null;
  submissionCount: number;
  totalItems: number;
}

export class DashboardKapRecapResponseDto {
  eventId: string;
  totalResponses: number;
  instruments: DashboardKapRecapInstrumentDto[];
}

export class DashboardKapRecapInstrumentDto {
  instrumentId: string;
  title: string;
  responseCount: number;
}
