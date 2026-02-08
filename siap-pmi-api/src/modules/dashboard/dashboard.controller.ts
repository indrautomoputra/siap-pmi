import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRole } from '../../core/event-context/event-role.decorator';
import { DashboardReadService } from './dashboard.service';
import {
  DashboardAssessmentRecapResponseDto,
  DashboardKapRecapResponseDto,
  DashboardParticipantsResponseDto,
} from './dashboard.dto';

@Controller('events/:eventId/dashboard')
@UseGuards(AuthGuard, EventContextGuard)
export class DashboardController {
  constructor(private readonly dashboardReadService: DashboardReadService) {}

  @EventRole('PANITIA', 'OBSERVER')
  @Get('participants')
  getParticipants(
    @Param('eventId') eventId: string,
  ): Promise<DashboardParticipantsResponseDto> {
    return this.dashboardReadService.getParticipantsByEvent(eventId);
  }

  @EventRole('PANITIA', 'OBSERVER')
  @Get('assessments/recap')
  getAssessmentRecap(
    @Param('eventId') eventId: string,
  ): Promise<DashboardAssessmentRecapResponseDto> {
    return this.dashboardReadService.getAssessmentRecapByEvent(eventId);
  }

  @EventRole('PANITIA', 'OBSERVER')
  @Get('kap/recap')
  getKapRecap(
    @Param('eventId') eventId: string,
  ): Promise<DashboardKapRecapResponseDto> {
    return this.dashboardReadService.getKapRecapByEvent(eventId);
  }
}
