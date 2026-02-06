import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateKapInstrumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
