export type EventId = string;

export type EventProgramType = 'KSR_DASAR' | 'NON_KSR';

export type EventStatus =
  | 'draft'
  | 'published'
  | 'ongoing'
  | 'completed'
  | 'cancelled';

export interface TrainingEvent {
  id: EventId;
  name: string;
  programType: EventProgramType;
  status: EventStatus;
  startDate: Date;
  endDate: Date;
}

export type EventDomainEventType =
  | 'event.created'
  | 'event.updated'
  | 'event.deleted'
  | 'event.status.changed';

export interface EventDomainEvent {
  eventId: EventId;
  type: EventDomainEventType;
  occurredAt: Date;
}
