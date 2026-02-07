import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [SupabaseModule, AuthModule, EventContextModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
