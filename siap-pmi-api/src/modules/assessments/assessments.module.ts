import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';

@Module({
  imports: [AuthModule, SupabaseModule, EventContextModule],
  controllers: [AssessmentsController],
  providers: [AssessmentsService],
})
export class AssessmentsModule {}
