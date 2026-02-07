import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventsModule } from '../events/events.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { EventAuthorizationPolicy } from './event-authorization.policy';
import { EventRoleAssignmentPolicy } from './event-roles.policy';
import { EventRolesRepository } from './event-roles.repository';
import { EventRolesService } from './event-roles.service';

@Module({
  imports: [SupabaseModule, EventsModule, AuthModule, EventContextModule],
  providers: [
    EventRolesService,
    EventRolesRepository,
    EventAuthorizationPolicy,
    EventRoleAssignmentPolicy,
  ],
  exports: [EventRolesService, EventAuthorizationPolicy],
})
export class EventRolesModule {}
