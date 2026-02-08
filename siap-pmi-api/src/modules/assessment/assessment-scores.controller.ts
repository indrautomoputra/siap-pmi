import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventContextGuard } from '../../core/event-context/event-context.guard';
import { EventRole } from '../../core/event-context/event-role.decorator';
import { CurrentEvent } from '../../core/event-context/current-event.decorator';
import { CurrentUser } from '../../core/auth-context/current-user.decorator';
import type { CurrentEventContext } from '../../core/event-context/event-context.types';
import type { CurrentUser as AuthCurrentUser } from '../../infrastructure/auth/auth.service';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';
import {
  AssessmentScoreDetailResponseDto,
  AssessmentScoreListResponseDto,
  CreateAssessmentScoreRequestDto,
} from './assessment-scores.dto';
import { AssessmentScoresService } from './assessment-scores.service';

type CurrentUserLike = AuthCurrentUser | CurrentUserContext;

@Controller('events/:eventId/assessments')
@UseGuards(AuthGuard, EventContextGuard)
export class AssessmentScoresController {
  constructor(
    private readonly assessmentScoresService: AssessmentScoresService,
  ) {}

  @EventRole('PANITIA', 'PELATIH', 'OBSERVER')
  @Get()
  listByEvent(
    @CurrentEvent() currentEvent?: CurrentEventContext,
  ): Promise<AssessmentScoreListResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentScoresService.listByEvent(eventId);
  }

  @EventRole('PELATIH')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  createAssessment(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @CurrentUser() currentUser: CurrentUserLike | undefined,
    @Body() dto: CreateAssessmentScoreRequestDto,
  ): Promise<{ assessmentId: string }> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentScoresService.create(eventId, currentUser, dto);
  }

  @EventRole('PANITIA', 'PELATIH', 'OBSERVER')
  @Get(':assessmentId')
  getAssessment(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @Param('assessmentId') assessmentId: string,
  ): Promise<AssessmentScoreDetailResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentScoresService.getById(eventId, assessmentId);
  }

  private getEventId(currentEvent?: CurrentEventContext): string {
    if (!currentEvent?.eventId) {
      throw new Error('Event context is missing');
    }
    return currentEvent.eventId;
  }
}
