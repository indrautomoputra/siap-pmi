import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { EventsController } from './events.controller';
import { EventPolicy } from './events.policy';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

@Module({
  imports: [SupabaseModule, EventContextModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository, EventPolicy],
  exports: [EventsService, EventPolicy],
})
export class EventsModule {}
