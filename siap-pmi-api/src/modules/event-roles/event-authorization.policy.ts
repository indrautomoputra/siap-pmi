import { Injectable } from '@nestjs/common';
import {
  CurrentUserContext,
  assertUserHasRole,
} from '../../infrastructure/auth/current-user';
import { EventId } from '../events/events.types';
import {
  PermissionDeniedForEvent,
  UserNotAssignedToEvent,
} from './event-roles.errors';
import { EventRolesRepository } from './event-roles.repository';
import {
  EventPermission,
  EventRolePermissions,
  EventRoleType,
} from './event-roles.types';

@Injectable()
export class EventAuthorizationPolicy {
  constructor(private readonly eventRolesRepository: EventRolesRepository) {}

  async assertHasPermission(
    userId: string,
    eventId: EventId,
    permission: EventPermission,
  ): Promise<void> {
    const assignments = await this.eventRolesRepository.findByEventAndUser(
      eventId,
      userId,
    );
    if (assignments.length === 0) {
      throw new UserNotAssignedToEvent(userId, eventId);
    }
    const role = assignments[0]?.role;
    const allowed = role ? EventRolePermissions[role] : [];
    if (!allowed.includes(permission)) {
      throw new PermissionDeniedForEvent(userId, eventId, permission);
    }
  }

  assertHasRole(
    currentUser: CurrentUserContext,
    eventId: EventId,
    role: EventRoleType,
  ): void {
    assertUserHasRole(eventId, role, currentUser);
  }

  assertHasPermissionFromContext(
    currentUser: CurrentUserContext,
    eventId: EventId,
    permission: EventPermission,
  ): void {
    const roles = currentUser.enrollments
      .filter((enrollment) => enrollment.eventId === eventId)
      .map((enrollment) => enrollment.role)
      .filter((value): value is EventRoleType => Boolean(value));
    if (roles.length === 0) {
      throw new UserNotAssignedToEvent(currentUser.userId, eventId);
    }
    const allowed = new Set<EventPermission>();
    roles.forEach((role) => {
      EventRolePermissions[role].forEach((permissionItem) =>
        allowed.add(permissionItem),
      );
    });
    if (!allowed.has(permission)) {
      throw new PermissionDeniedForEvent(
        currentUser.userId,
        eventId,
        permission,
      );
    }
  }
}
