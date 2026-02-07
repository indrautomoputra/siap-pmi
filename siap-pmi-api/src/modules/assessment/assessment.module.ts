import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { EventRolesModule } from '../event-roles/event-roles.module';
import { EventsModule } from '../events/events.module';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { AuditModule } from '../audit/audit.module';
import { AssessmentController } from './assessment.controller';
import { AssessmentScoresController } from './assessment-scores.controller';
import { EventAssessmentController } from './event-assessment.controller';
import { AssessmentPolicy } from './assessment.policy';
import { AssessmentRepository } from './assessment.repository';
import { AssessmentService } from './assessment.service';
import { AssessmentScoresService } from './assessment-scores.service';

@Module({
  imports: [
    SupabaseModule,
    EventsModule,
    EventRolesModule,
    AuthModule,
    AuditModule,
    EventContextModule,
  ],
  controllers: [
    AssessmentController,
    EventAssessmentController,
    AssessmentScoresController,
  ],
  providers: [
    AssessmentService,
    AssessmentRepository,
    AssessmentPolicy,
    EnrollmentsRepository,
    AssessmentScoresService,
  ],
})
export class AssessmentModule {}
