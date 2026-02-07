import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateKsrBasicEnrollmentDto {
  @IsString()
  participantName: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsString()
  nik: string;

  @IsString()
  birthPlace: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  gender: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsEmail()
  email: string;

  @IsString()
  education: string;

  @IsString()
  occupation: string;

  @IsString()
  bloodType: string;

  @IsString()
  emergencyContactName: string;

  @IsString()
  emergencyContactPhone: string;
}
