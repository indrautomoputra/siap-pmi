import { IsString } from 'class-validator';

export class AttachEnrollmentDocumentDto {
  @IsString()
  docType: string;

  @IsString()
  filePath: string;
}
