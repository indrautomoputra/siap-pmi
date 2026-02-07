import { Injectable } from '@nestjs/common';
import {
  MultiRoleInSameEventNotAllowed,
  RoleAssignmentAlreadyExists,
} from './event-roles.errors';
import { EventRolesRepository } from './event-roles.repository';
import {
  EventAlreadyCompleted,
  EventCancelled,
  EventNotPublished,
} from '../events/events.errors';
import { EventId, TrainingEvent } from '../events/events.types';
import { canAssignRole } from '../events/events.rules';
import { EventRoleType } from './event-roles.types';

@Injectable()
export class EventRoleAssignmentPolicy {
  constructor(private readonly eventRolesRepository: EventRolesRepository) {}

  assertEventOpenForRoleAssignment(event: TrainingEvent): void {
    if (canAssignRole(event.status)) {
      return;
    }
    if (event.status === 'draft') {
      throw new EventNotPublished(event.id, event.status);
    }
    if (event.status === 'completed') {
      throw new EventAlreadyCompleted(event.id);
    }
    throw new EventCancelled(event.id);
  }

  async assertNotAlreadyAssigned(
    eventId: EventId,
    userId: string,
    role: EventRoleType,
  ): Promise<void> {
    const assignments = await this.eventRolesRepository.findByEventAndUser(
      eventId,
      userId,
    );
    const exists = assignments.some((assignment) => assignment.role === role);
    if (exists) {
      throw new RoleAssignmentAlreadyExists(eventId, userId, role);
    }
  }

  async assertNoOtherRoleInSameEvent(
    eventId: EventId,
    userId: string,
  ): Promise<void> {
    const assignments = await this.eventRolesRepository.findByEventAndUser(
      eventId,
      userId,
    );
    const exists = assignments.length > 0;
    if (exists) {
      throw new MultiRoleInSameEventNotAllowed(eventId, userId);
    }
  }
}
