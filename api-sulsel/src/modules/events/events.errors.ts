export class EventNotFound extends Error {
  constructor(eventId: string) {
    super(`Event not found: ${eventId}`);
    this.name = 'EventNotFound';
  }
}

export class EventNotActive extends Error {
  constructor(eventId: string, status: string) {
    super(`Event is not active or published: ${eventId} (${status})`);
    this.name = 'EventNotActive';
  }
}

export class EventNotPublished extends Error {
  readonly code = 'EVENT_NOT_PUBLISHED';

  constructor(eventId: string, status: string) {
    super(`Event is not published: ${eventId} (${status})`);
    this.name = 'EventNotPublished';
  }
}

export class EventEnrollmentClosed extends Error {
  readonly code = 'EVENT_ENROLLMENT_CLOSED';

  constructor(eventId: string, status: string) {
    super(`Event enrollment is closed: ${eventId} (${status})`);
    this.name = 'EventEnrollmentClosed';
  }
}

export class EventAlreadyCompleted extends Error {
  readonly code = 'EVENT_ALREADY_COMPLETED';

  constructor(eventId: string) {
    super(`Event already completed: ${eventId}`);
    this.name = 'EventAlreadyCompleted';
  }
}

export class EventCancelled extends Error {
  readonly code = 'EVENT_CANCELLED';

  constructor(eventId: string) {
    super(`Event cancelled: ${eventId}`);
    this.name = 'EventCancelled';
  }
}
