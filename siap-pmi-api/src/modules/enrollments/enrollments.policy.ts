import { Injectable } from '@nestjs/common';
import {
  EnrollmentAccessDenied,
  EnrollmentAlreadyExists,
} from './enrollments.errors';
import { EnrollmentsRepository } from './enrollments.repository';
import {
  EventAlreadyCompleted,
  EventCancelled,
  EventEnrollmentClosed,
  EventNotPublished,
} from '../events/events.errors';
import { EventId, TrainingEvent } from '../events/events.types';
import { EnrollmentId } from './enrollments.types';
import { canAcceptEnrollment } from '../events/events.rules';

@Injectable()
export class EnrollmentPolicy {
  constructor(private readonly enrollmentsRepository: EnrollmentsRepository) {}

  assertEventOpenForEnrollment(event: TrainingEvent): void {
    if (canAcceptEnrollment(event.status)) {
      return;
    }
    if (event.status === 'draft') {
      throw new EventNotPublished(event.id, event.status);
    }
    if (event.status === 'ongoing') {
      throw new EventEnrollmentClosed(event.id, event.status);
    }
    if (event.status === 'completed') {
      throw new EventAlreadyCompleted(event.id);
    }
    throw new EventCancelled(event.id);
  }

  async assertNotAlreadyEnrolled(
    eventId: EventId,
    userId: string,
  ): Promise<void> {
    const enrollments = await this.enrollmentsRepository.findByEventAndUser(
      eventId,
      userId,
    );
    if (enrollments.length > 0) {
      throw new EnrollmentAlreadyExists(eventId, userId);
    }
  }

  assertEnrollmentOwner(
    enrollmentUserId: string | undefined,
    userId: string,
    enrollmentId: EnrollmentId,
  ): void {
    if (!enrollmentUserId || enrollmentUserId !== userId) {
      throw new EnrollmentAccessDenied(enrollmentId, userId);
    }
  }
}
