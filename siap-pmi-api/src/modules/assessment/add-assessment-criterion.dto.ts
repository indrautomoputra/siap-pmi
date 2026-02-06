import { IsInt, IsOptional, IsString } from 'class-validator';

export class AddAssessmentCriterionDto {
  @IsString()
  criterion: string;

  @IsOptional()
  @IsInt()
  weight?: number;

  @IsInt()
  orderNo: number;
}
