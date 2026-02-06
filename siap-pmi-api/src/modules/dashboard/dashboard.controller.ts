import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { DashboardReadService } from './dashboard.service';
import {
  DashboardAssessmentRecapResponseDto,
  DashboardKapRecapResponseDto,
  DashboardParticipantsResponseDto,
} from './dashboard.dto';

@Controller('events/:eventId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardReadService: DashboardReadService) {}

  @UseGuards(AuthGuard)
  @Get('participants')
  getParticipants(
    @Param('eventId') eventId: string,
  ): Promise<DashboardParticipantsResponseDto> {
    return this.dashboardReadService.getParticipantsByEvent(eventId);
  }

  @UseGuards(AuthGuard)
  @Get('assessments/recap')
  getAssessmentRecap(
    @Param('eventId') eventId: string,
  ): Promise<DashboardAssessmentRecapResponseDto> {
    return this.dashboardReadService.getAssessmentRecapByEvent(eventId);
  }

  @UseGuards(AuthGuard)
  @Get('kap/recap')
  getKapRecap(
    @Param('eventId') eventId: string,
  ): Promise<DashboardKapRecapResponseDto> {
    return this.dashboardReadService.getKapRecapByEvent(eventId);
  }
}
