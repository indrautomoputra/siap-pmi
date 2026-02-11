import { Module } from '@nestjs/common';
import { AuthModule } from '../../infrastructure/auth/auth.module';
import { EventContextModule } from '../../core/event-context/event-context.module';
import { EventsModule } from '../events/events.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';

@Module({
  imports: [AuthModule, EventContextModule, EventsModule, DashboardModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
