import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventsRepository } from './events.repository';
import { EventId, TrainingEvent } from './events.types';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async onModuleInit(): Promise<void> {
    const count = await this.eventsRepository.pingEvents();
    console.log('TODO_REMOVE_EVENTS_PING:', { count });
  }

  createEvent(event: TrainingEvent): Promise<TrainingEvent> {
    return this.eventsRepository.createEvent(event);
  }

  findAllEvents(): Promise<TrainingEvent[]> {
    return this.eventsRepository.findAllEvents();
  }

  listEvents(
    limit = 20,
    offset = 0,
  ): Promise<{ items: TrainingEvent[]; limit: number; offset: number }> {
    return this.eventsRepository.listEvents(limit, offset);
  }

  findEventById(eventId: EventId): Promise<TrainingEvent | null> {
    return this.eventsRepository.findEventById(eventId);
  }

  updateEvent(): void {}

  removeEvent(): void {}

  changeEventStatus(): void {}
}
