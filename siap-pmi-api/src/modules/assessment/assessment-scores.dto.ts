import { IsDefined, IsIn, IsObject, IsOptional, IsUUID } from 'class-validator';
import type { AssessmentKind } from './assessment.types';

export class CreateAssessmentScoreRequestDto {
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

export class AssessmentScoreItemDto {
  id: string;
  eventId: string;
  instrumentId: string;
  assesseeEnrollmentId: string;
  assessorUserId: string;
  type: AssessmentKind;
  payload: Record<string, unknown>;
  createdAt: string;
}

export class AssessmentScoreListResponseDto {
  eventId: string;
  items: AssessmentScoreItemDto[];
}

export class AssessmentScoreDetailResponseDto extends AssessmentScoreItemDto {}
