import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { AuthService } from '../../infrastructure/auth/auth.service';
import {
  CurrentUserContext,
  getCurrentUser,
} from '../../infrastructure/auth/current-user';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { EnrollmentNotFound } from '../enrollments/enrollments.errors';
import { EventAlreadyCompleted, EventNotFound } from '../events/events.errors';
import { EventPolicy } from '../events/events.policy';
import { EventsService } from '../events/events.service';
import { GraduationPolicy } from './graduations.policy';
import { GraduationsRepository } from './graduations.repository';
import {
  GraduationDecision,
  GraduationDecisionStatus,
} from './graduations.types';
import { GraduationDecisionsResponseDto } from './graduations.dto';
import { AuditService } from '../audit/audit.service';
import {
  IdempotencyService,
  RateLimitService,
} from '../../infrastructure/traffic/traffic.module';

@Injectable({ scope: Scope.REQUEST })
export class GraduationService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly graduationsRepository: GraduationsRepository,
    private readonly graduationPolicy: GraduationPolicy,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly eventPolicy: EventPolicy,
    private readonly eventsService: EventsService,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async decide(
    eventId: string,
    enrollmentId: string,
    decision: GraduationDecisionStatus,
    note?: string,
    currentUser?: CurrentUserContext,
  ): Promise<{ decisionId: string }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    this.graduationPolicy.assertEventOngoingOrCompleted(event);
    if (event.status === 'completed') {
      throw new EventAlreadyCompleted(eventId);
    }
    if (!currentUser) {
      currentUser = await getCurrentUser(this.request, this.authService);
    }
    const idempotencyKey = this.getIdempotencyKey();
    if (idempotencyKey) {
      const cacheKey = `graduation.decide:${eventId}:${currentUser.userId}:${idempotencyKey}`;
      const cached = this.idempotencyService.get<{ decisionId: string }>(
        cacheKey,
      );
      if (cached) {
        return cached;
      }
    }
    this.rateLimitService.consume(
      `graduation.decide:${eventId}:${currentUser.userId}`,
      10,
      60_000,
    );
    const enrollment = await this.enrollmentsRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(enrollmentId);
    }
    this.graduationPolicy.assertEnrollmentApproved(enrollment);
    this.graduationPolicy.assertDeciderIsPanitiaOrPelatih(currentUser, eventId);
    await this.graduationPolicy.assertNotDecidedYet(eventId, enrollmentId);
    const payload: GraduationDecision = {
      id: randomUUID(),
      eventId,
      enrollmentId,
      decision,
      decidedBy: currentUser.userId,
      decidedAt: new Date(),
      note,
    };
    const created = await this.graduationsRepository.createDecision(payload);
    await this.auditService.log(
      eventId,
      currentUser.userId,
      'graduation.decided',
      'graduation_decision',
      created.id,
      {
        enrollmentId,
        decision,
        note: note ?? null,
      },
    );
    const response = { decisionId: created.id };
    if (idempotencyKey) {
      const cacheKey = `graduation.decide:${eventId}:${currentUser.userId}:${idempotencyKey}`;
      this.idempotencyService.set(cacheKey, response, 86_400_000);
    }
    return response;
  }

  async listByEvent(eventId: string): Promise<GraduationDecisionsResponseDto> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    this.graduationPolicy.assertEventOngoingOrCompleted(event);
    const currentUser = await getCurrentUser(this.request, this.authService);
    this.eventAuthorizationPolicy.assertHasPermissionFromContext(
      currentUser,
      eventId,
      EventPermission.VIEW_REPORT,
    );
    const decisions = await this.graduationsRepository.listByEvent(eventId);
    const enrollments = await this.enrollmentsRepository.findByEventId(eventId);
    const enrollmentMap = new Map(
      enrollments.map((enrollment) => [enrollment.id, enrollment]),
    );
    return {
      eventId,
      decisions: decisions.map((decisionItem) => {
        const enrollment = enrollmentMap.get(decisionItem.enrollmentId);
        return {
          id: decisionItem.id,
          eventId: decisionItem.eventId,
          enrollmentId: decisionItem.enrollmentId,
          decision: decisionItem.decision,
          decidedBy: decisionItem.decidedBy,
          decidedAt: decisionItem.decidedAt.toISOString(),
          note: decisionItem.note,
          participantName: enrollment?.participantName ?? '',
          displayName: enrollment?.displayName,
          status: enrollment?.status ?? 'registered',
          reviewStatus: enrollment?.reviewStatus ?? 'pending_review',
        };
      }),
    };
  }

  private getIdempotencyKey(): string | null {
    const key =
      this.request.headers['idempotency-key'] ??
      this.request.headers['x-idempotency-key'];
    return this.idempotencyService.normalizeKey(key);
  }
}
