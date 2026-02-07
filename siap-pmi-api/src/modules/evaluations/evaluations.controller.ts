import {
  Body,
  Controller,
  Get,
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
  CreateEvaluationRequestDto,
  EvaluationAggregateResponseDto,
  EvaluationMeResponseDto,
} from './evaluations.dto';
import { EvaluationsService } from './evaluations.service';

type CurrentUserLike = AuthCurrentUser | CurrentUserContext;

@Controller('events/:eventId/evaluations')
@UseGuards(AuthGuard, EventContextGuard)
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @EventRole('PESERTA')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Post()
  createEvaluation(
    @CurrentEvent() currentEvent: CurrentEventContext | undefined,
    @CurrentUser() currentUser: CurrentUserLike | undefined,
    @Body() dto: CreateEvaluationRequestDto,
  ): Promise<{ evaluationId: string }> {
    const eventId = this.getEventId(currentEvent);
    return this.evaluationsService.create(
      eventId,
      currentEvent,
      currentUser,
      dto,
    );
  }

  @EventRole('PANITIA')
  @Get()
  getAggregate(
    @CurrentEvent() currentEvent?: CurrentEventContext,
  ): Promise<EvaluationAggregateResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.evaluationsService.getAggregate(eventId);
  }

  @Get('me')
  getMine(
    @CurrentEvent() currentEvent?: CurrentEventContext,
    @CurrentUser() currentUser?: CurrentUserLike,
  ): Promise<EvaluationMeResponseDto> {
    const eventId = this.getEventId(currentEvent);
    return this.evaluationsService.getMine(eventId, currentEvent, currentUser);
  }

  private getEventId(currentEvent?: CurrentEventContext): string {
    if (!currentEvent?.eventId) {
      throw new Error('Event context is missing');
    }
    return currentEvent.eventId;
  }
}
