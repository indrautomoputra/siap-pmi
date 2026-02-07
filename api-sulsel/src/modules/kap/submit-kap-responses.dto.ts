import { IsDefined, IsObject, IsString } from 'class-validator';

export class SubmitKapResponsesDto {
  @IsString()
  enrollmentId: string;

  @IsDefined()
  @IsObject()
  answers: Record<string, unknown>;
}
