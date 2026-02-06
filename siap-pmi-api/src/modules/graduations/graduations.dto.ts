import { IsIn, IsOptional, IsString } from 'class-validator';
import {
  EnrollmentReviewStatus,
  EnrollmentStatus,
} from '../enrollments/enrollments.types';
import type { GraduationDecisionStatus } from './graduations.types';

export class DecideGraduationDto {
  @IsString()
  enrollmentId: string;

  @IsIn(['lulus', 'tidak_lulus', 'ditunda'])
  decision: GraduationDecisionStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class GraduationDecisionItemDto {
  id: string;
  eventId: string;
  enrollmentId: string;
  decision: GraduationDecisionStatus;
  decidedBy: string;
  decidedAt: string;
  note?: string;
  participantName: string;
  displayName?: string;
  status: EnrollmentStatus;
  reviewStatus: EnrollmentReviewStatus;
}

export class GraduationDecisionsResponseDto {
  eventId: string;
  decisions: GraduationDecisionItemDto[];
}
