import { IsDefined, IsObject, IsString } from 'class-validator';

export class SubmitAssessmentScoreDto {
  @IsString()
  enrollmentId: string;

  @IsDefined()
  @IsObject()
  scores: Record<string, unknown>;
}
