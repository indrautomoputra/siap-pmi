import { Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { AuthContextService } from '../auth-context/auth-context.service';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';
import {
  PermissionDeniedForEvent,
  UserNotAssignedToEvent,
} from '../../modules/event-roles/event-roles.errors';
import type { EventRoleType } from '../../modules/event-roles/event-roles.types';
import { EVENT_ROLE_METADATA_KEY } from './event-role.decorator';
import type { CurrentEventContext } from './event-context.types';

type HeaderValue = string | string[] | undefined;

type RequestWithEventContext = Request & {
  currentEvent?: CurrentEventContext;
  currentUser?: CurrentUserContext;
};

const normalizeHeaderValue = (value: HeaderValue): string | null => {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value;
};

const getEventId = (request: Request): string | null => {
  const headerValue = normalizeHeaderValue(request.headers['x-event-id']);
  if (headerValue) {
    return headerValue.trim();
  }
  if (typeof request.params?.eventId === 'string') {
    return request.params.eventId;
  }
  return null;
};

@Injectable()
export class EventContextGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authContextService: AuthContextService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithEventContext>();
    const eventId = getEventId(request);
    // Asumsi: endpoint tanpa eventId tetap boleh lewat guard.
    if (!eventId) {
      return true;
    }
    const currentUser = await this.authContextService.getCurrentUser();
    const enrollment = currentUser.enrollments.find(
      (item) => item.eventId === eventId,
    );
    if (!enrollment) {
      throw new UserNotAssignedToEvent(currentUser.userId, eventId);
    }
    request.currentUser = currentUser;
    request.currentEvent = {
      eventId,
      enrollmentId: enrollment.enrollmentId,
      role: enrollment.role,
    };
    const roles = this.reflector.getAllAndOverride<EventRoleType[]>(
      EVENT_ROLE_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (roles && roles.length > 0) {
      if (!enrollment.role || !roles.includes(enrollment.role)) {
        throw new PermissionDeniedForEvent(
          currentUser.userId,
          eventId,
          roles.join(','),
        );
      }
    }
    return true;
  }
}
