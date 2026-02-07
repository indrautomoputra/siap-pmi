import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRole } from '../../core/event-context/event-role.decorator';
import { CurrentEvent } from '../../core/event-context/current-event.decorator';
import type { CurrentEventContext } from '../../core/event-context/event-context.types';
import type {
  ReportsParticipantsResponse,
  ReportsSummaryResponse,
} from './reports.types';
import { ReportsService } from './reports.service';

@Controller('events/:eventId/reports')
@UseGuards(AuthGuard, EventContextGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @EventRole('PANITIA', 'PELATIH')
  @Get('summary')
  getSummary(
    @CurrentEvent() currentEvent?: CurrentEventContext,
  ): Promise<ReportsSummaryResponse> {
    const eventId = this.getEventId(currentEvent);
    return this.reportsService.getSummary(eventId);
  }

  @EventRole('PANITIA', 'PELATIH')
  @Get('participants')
  getParticipants(
    @CurrentEvent() currentEvent?: CurrentEventContext,
  ): Promise<ReportsParticipantsResponse> {
    const eventId = this.getEventId(currentEvent);
    return this.reportsService.listParticipants(eventId);
  }

  private getEventId(currentEvent?: CurrentEventContext): string {
    if (!currentEvent?.eventId) {
      throw new Error('Event context is missing');
    }
    return currentEvent.eventId;
  }
}
