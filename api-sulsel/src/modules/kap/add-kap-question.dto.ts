import { IsIn, IsInt, IsOptional, IsString } from 'class-validator';

export class AddKapQuestionDto {
  @IsString()
  questionText: string;

  @IsIn(['likert', 'boolean', 'text'])
  questionType: 'likert' | 'boolean' | 'text';

  @IsOptional()
  @IsInt()
  scaleMin?: number;

  @IsOptional()
  @IsInt()
  scaleMax?: number;

  @IsInt()
  orderNo: number;
}
