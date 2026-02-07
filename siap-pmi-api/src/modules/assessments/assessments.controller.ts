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
  AssessmentDetailResponseDto,
  AssessmentListResponseDto,
  CreateAssessmentRequestDto,
} from './assessments.dto';
import { AssessmentsService } from './assessments.service';

type CurrentUserLike = AuthCurrentUser | CurrentUserContext;

@Controller('events/:eventId/assessments')
@UseGuards(AuthGuard, EventContextGuard)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @EventRole('PANITIA', 'PELATIH', 'OBSERVER')
  @Get()
  listByEvent(
    @CurrentEvent() currentEvent?: CurrentEventContext,
  ): Promise<AssessmentListResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentsService.listByEvent(eventId);
  }

  @EventRole('PELATIH', 'OBSERVER')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  createAssessment(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @CurrentUser() currentUser: CurrentUserLike | undefined,
    @Body() dto: CreateAssessmentRequestDto,
  ): Promise<{ assessmentId: string }> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentsService.create(eventId, currentUser, dto);
  }

  @EventRole('PANITIA', 'PELATIH', 'OBSERVER')
  @Get(':assessmentId')
  getAssessment(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @Param('assessmentId') assessmentId: string,
  ): Promise<AssessmentDetailResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.assessmentsService.getById(eventId, assessmentId);
  }

  private getEventId(currentEvent?: CurrentEventContext): string {
    if (!currentEvent?.eventId) {
      throw new Error('Event context is missing');
    }
    return currentEvent.eventId;
  }
}
