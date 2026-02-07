import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { AuthGuard } from '../../infrastructure/auth/auth.guard';
import { EventsService } from './events.service';
import { TrainingEvent } from './events.types';

class EventsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Get()
  listEvents(
    @Query() query: EventsQueryDto,
  ): Promise<{ items: TrainingEvent[]; limit: number; offset: number }> {
    return this.eventsService.listEvents(query.limit, query.offset);
  }

  createEvent(event: TrainingEvent): Promise<TrainingEvent> {
    return this.eventsService.createEvent(event);
  }

  findAllEvents(): Promise<TrainingEvent[]> {
    return this.eventsService.findAllEvents();
  }

  updateEvent(): void {
    this.eventsService.updateEvent();
  }

  removeEvent(): void {
    this.eventsService.removeEvent();
  }

  changeEventStatus(): void {
    this.eventsService.changeEventStatus();
  }
}
