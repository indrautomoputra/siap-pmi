import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import { EventNotFound } from '../events/events.errors';
import { EventPolicy } from '../events/events.policy';
import { EventsService } from '../events/events.service';
import { EventAuthorizationPolicy } from './event-authorization.policy';
import { EventRoleAssignmentPolicy } from './event-roles.policy';
import { EventRolesRepository } from './event-roles.repository';
import { EventRoleAssignment } from './event-roles.types';

@Injectable({ scope: Scope.REQUEST })
export class EventRolesService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly eventPolicy: EventPolicy,
    private readonly eventsService: EventsService,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
    private readonly eventRoleAssignmentPolicy: EventRoleAssignmentPolicy,
    private readonly eventRolesRepository: EventRolesRepository,
    private readonly authService: AuthService,
  ) {}

  async assignRoleToEvent(
    assignment?: EventRoleAssignment,
  ): Promise<EventRoleAssignment> {
    if (!assignment) {
      throw new EventNotFound('unknown');
    }
    await this.eventPolicy.assertEventExists(assignment.eventId);
    const event = await this.eventsService.findEventById(assignment.eventId);
    if (!event) {
      throw new EventNotFound(assignment.eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    this.eventAuthorizationPolicy.assertHasRole(
      user,
      assignment.eventId,
      'PANITIA',
    );
    this.eventRoleAssignmentPolicy.assertEventOpenForRoleAssignment(event);
    await this.eventRoleAssignmentPolicy.assertNotAlreadyAssigned(
      assignment.eventId,
      user.userId,
      assignment.role,
    );
    await this.eventRoleAssignmentPolicy.assertNoOtherRoleInSameEvent(
      assignment.eventId,
      user.userId,
    );
    return this.eventRolesRepository.createAssignment({
      ...assignment,
      userId: user.userId,
      displayName: assignment.displayName,
    });
  }

  revokeRoleFromEvent(): void {}

  listEventRoles(): void {}
}
