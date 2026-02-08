import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRole } from '../../core/event-context/event-role.decorator';
import { ExportsService } from './exports.service';

@Controller('events/:eventId/exports')
@UseGuards(AuthGuard, EventContextGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @EventRole('PANITIA', 'OBSERVER')
  @Get('participants.csv')
  async exportParticipants(
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.exportsService.exportParticipantsCsv(eventId);
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="participants-${eventId}.csv"`,
    );
    return csv;
  }

  @EventRole('PANITIA', 'OBSERVER')
  @Get('assessments.csv')
  async exportAssessments(
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.exportsService.exportAssessmentsCsv(eventId);
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="assessments-${eventId}.csv"`,
    );
    return csv;
  }

  @EventRole('PANITIA', 'OBSERVER')
  @Get('graduations.csv')
  async exportGraduations(
    @Param('eventId') eventId: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<string> {
    const csv = await this.exportsService.exportGraduationsCsv(eventId);
    response.setHeader('Content-Type', 'text/csv');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="graduations-${eventId}.csv"`,
    );
    return csv;
  }
}
