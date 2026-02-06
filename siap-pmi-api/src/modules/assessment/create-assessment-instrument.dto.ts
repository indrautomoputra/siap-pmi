import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentInstrumentDto {
  @IsIn(['akademik', 'sikap'])
  kind: 'akademik' | 'sikap';

  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
