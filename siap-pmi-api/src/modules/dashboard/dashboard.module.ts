import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { DashboardController } from './dashboard.controller';
import { DashboardReadService } from './dashboard.service';

@Module({
  imports: [AuthModule, SupabaseModule, EventContextModule],
  controllers: [DashboardController],
  providers: [DashboardReadService],
  exports: [DashboardReadService],
})
export class DashboardModule {}
