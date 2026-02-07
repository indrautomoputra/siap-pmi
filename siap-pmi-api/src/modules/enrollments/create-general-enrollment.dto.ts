import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import type { PMIElement } from './enrollments.types';

export class CreateGeneralEnrollmentDto {
  @IsString()
  participantName: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsIn(['PENGURUS', 'STAF', 'RELAWAN'])
  unsurPmi: PMIElement;

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

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  organizationRole?: string;
}
