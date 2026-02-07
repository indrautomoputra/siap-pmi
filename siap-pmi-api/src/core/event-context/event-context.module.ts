import { Module } from '@nestjs/common';
import { AuthContextModule } from '../auth-context/auth-context.module';
import { EventContextGuard } from './event-context.guard';

@Module({
  imports: [AuthContextModule],
  providers: [EventContextGuard],
  exports: [EventContextGuard],
})
export class EventContextModule {}
