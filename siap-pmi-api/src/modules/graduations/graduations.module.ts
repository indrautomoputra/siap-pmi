import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { EventRolesModule } from '../event-roles/event-roles.module';
import { EventsModule } from '../events/events.module';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { AuditModule } from '../audit/audit.module';
import { GraduationPolicy } from './graduations.policy';
import { GraduationsController } from './graduations.controller';
import { GraduationsRepository } from './graduations.repository';
import { GraduationService } from './graduations.service';

@Module({
  imports: [
    SupabaseModule,
    EventsModule,
    EventRolesModule,
    AuthModule,
    AuditModule,
    EventContextModule,
  ],
  controllers: [GraduationsController],
  providers: [
    GraduationService,
    GraduationsRepository,
    GraduationPolicy,
    EnrollmentsRepository,
  ],
})
export class GraduationsModule {}
