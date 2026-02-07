import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventRolesModule } from '../event-roles/event-roles.module';
import { EventsModule } from '../events/events.module';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { AuditModule } from '../audit/audit.module';
import { EventKapController } from './event-kap.controller';
import { KapController } from './kap.controller';
import { KapPolicy } from './kap.policy';
import { KapRepository } from './kap.repository';
import { KapService } from './kap.service';

@Module({
  imports: [
    SupabaseModule,
    EventsModule,
    EventRolesModule,
    AuthModule,
    AuditModule,
  ],
  controllers: [EventKapController, KapController],
  providers: [KapService, KapRepository, KapPolicy, EnrollmentsRepository],
})
export class KapModule {}
