import { IsDefined, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateEvaluationRequestDto {
  @IsOptional()
  @IsUUID()
  event_id?: string;

  @IsUUID()
  enrollmentId: string;

  @IsDefined()
  @IsObject()
  responses: Record<string, unknown>;
}

export class EvaluationItemDto {
  id: string;
  eventId: string;
  enrollmentId: string;
  responses: Record<string, unknown>;
  submittedAt: string;
}

export class EvaluationAggregateResponseDto {
  eventId: string;
  totalResponses: number;
}

export class EvaluationMeResponseDto extends EvaluationItemDto {}
