import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventRolesModule } from '../event-roles/event-roles.module';
import { EventsModule } from '../events/events.module';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { AuditModule } from '../audit/audit.module';
import { AssessmentController } from './assessment.controller';
import { EventAssessmentController } from './event-assessment.controller';
import { AssessmentPolicy } from './assessment.policy';
import { AssessmentRepository } from './assessment.repository';
import { AssessmentService } from './assessment.service';

@Module({
  imports: [
    SupabaseModule,
    EventsModule,
    EventRolesModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [AssessmentController, EventAssessmentController],
  providers: [
    AssessmentService,
    AssessmentRepository,
    AssessmentPolicy,
    EnrollmentsRepository,
  ],
})
export class AssessmentModule {}
