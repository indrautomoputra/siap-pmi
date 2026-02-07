import { IsDefined, IsIn, IsObject, IsOptional, IsUUID } from 'class-validator';
import type { AssessmentKind } from '../assessment/assessment.types';

export class CreateAssessmentRequestDto {
  @IsOptional()
  @IsUUID()
  event_id?: string;

  @IsUUID()
  assesseeEnrollmentId: string;

  @IsOptional()
  @IsUUID()
  instrumentId?: string;

  @IsIn(['akademik', 'sikap'])
  type: AssessmentKind;

  @IsDefined()
  @IsObject()
  payload: Record<string, unknown>;
}

export class AssessmentItemDto {
  id: string;
  eventId: string;
  instrumentId: string;
  assesseeEnrollmentId: string;
  assessorUserId: string;
  type: AssessmentKind;
  payload: Record<string, unknown>;
  createdAt: string;
}

export class AssessmentListResponseDto {
  eventId: string;
  items: AssessmentItemDto[];
}

export class AssessmentDetailResponseDto extends AssessmentItemDto {}
