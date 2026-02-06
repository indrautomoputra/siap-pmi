import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { SupabaseModule } from '../../infrastructure/supabase/supabase.module';
import { DashboardController } from './dashboard.controller';
import { DashboardReadService } from './dashboard.service';

@Module({
  imports: [AuthModule, SupabaseModule],
  controllers: [DashboardController],
  providers: [DashboardReadService],
  exports: [DashboardReadService],
})
export class DashboardModule {}
