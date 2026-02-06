import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventsModule } from '../events/events.module';
import { EventRolesModule } from '../event-roles/event-roles.module';
import { AuditModule } from '../audit/audit.module';
import { EnrollmentsController } from './enrollments.controller';
import { EventEnrollmentsController } from './event-enrollments.controller';
import { EnrollmentPolicy } from './enrollments.policy';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentDocumentsService } from './enrollment-documents.service';
import { EnrollmentApprovalPolicy } from './enrollment-approval.policy';

@Module({
  imports: [
    SupabaseModule,
    EventsModule,
    EventRolesModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [EnrollmentsController, EventEnrollmentsController],
  providers: [
    EnrollmentsService,
    EnrollmentsRepository,
    EnrollmentPolicy,
    EnrollmentDocumentsService,
    EnrollmentApprovalPolicy,
  ],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
