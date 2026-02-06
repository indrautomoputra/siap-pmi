import { Injectable } from '@nestjs/common';
import { EventNotActive, EventNotFound } from './events.errors';
import { EventsRepository } from './events.repository';
import { EventId } from './events.types';

@Injectable()
export class EventPolicy {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async assertEventExists(eventId: EventId): Promise<void> {
    const status = await this.eventsRepository.findEventStatus(eventId);
    if (!status) {
      throw new EventNotFound(eventId);
    }
  }

  async assertEventIsActiveOrPublished(eventId: EventId): Promise<void> {
    const status = await this.eventsRepository.findEventStatus(eventId);
    if (!status) {
      throw new EventNotFound(eventId);
    }
    if (status !== 'published' && status !== 'ongoing') {
      throw new EventNotActive(eventId, status);
    }
  }
}
