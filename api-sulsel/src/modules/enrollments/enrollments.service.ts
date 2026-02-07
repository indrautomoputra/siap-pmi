import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import { EventNotFound } from '../events/events.errors';
import { EventPolicy } from '../events/events.policy';
import { EventsService } from '../events/events.service';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { EnrollmentPolicy } from './enrollments.policy';
import { EnrollmentApprovalPolicy } from './enrollment-approval.policy';
import { EnrollmentsRepository } from './enrollments.repository';
import {
  Enrollment,
  EnrollmentGeneralDetail,
  EnrollmentKsrBasicDetail,
} from './enrollments.types';
import { EventId } from '../events/events.types';
import { CreateKsrBasicEnrollmentDto } from './create-ksr-basic-enrollment.dto';
import { CreateGeneralEnrollmentDto } from './create-general-enrollment.dto';
import { randomUUID } from 'crypto';
import { EnrollmentNotFound } from './enrollments.errors';
import { AuditService } from '../audit/audit.service';
import {
  IdempotencyService,
  RateLimitService,
} from '../../infrastructure/traffic/traffic.module';

@Injectable({ scope: Scope.REQUEST })
export class EnrollmentsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly eventPolicy: EventPolicy,
    private readonly enrollmentPolicy: EnrollmentPolicy,
    private readonly enrollmentApprovalPolicy: EnrollmentApprovalPolicy,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
    private readonly eventsService: EventsService,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  async registerParticipant(enrollment: Enrollment): Promise<Enrollment> {
    await this.eventPolicy.assertEventExists(enrollment.eventId);
    const event = await this.eventsService.findEventById(enrollment.eventId);
    if (!event) {
      throw new EventNotFound(enrollment.eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      enrollment.eventId,
      EventPermission.MANAGE_ENROLLMENT,
    );
    this.enrollmentPolicy.assertEventOpenForEnrollment(event);
    await this.enrollmentPolicy.assertNotAlreadyEnrolled(
      enrollment.eventId,
      user.userId,
    );
    return this.enrollmentsRepository.createEnrollment({
      ...enrollment,
      reviewStatus: 'pending_review',
      userId: user.userId,
      displayName: enrollment.displayName,
    });
  }

  async createKsrBasic(
    eventId: EventId,
    dto: CreateKsrBasicEnrollmentDto,
  ): Promise<{ enrollmentId: string }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    const idempotencyKey = this.getIdempotencyKey();
    if (idempotencyKey) {
      const cacheKey = `enrollment.create.ksr_basic:${eventId}:${user.userId}:${idempotencyKey}`;
      const cached = this.idempotencyService.get<{ enrollmentId: string }>(
        cacheKey,
      );
      if (cached) {
        return cached;
      }
    }
    this.rateLimitService.consume(
      `enrollment.create.ksr_basic:${eventId}:${user.userId}`,
      10,
      60_000,
    );
    this.enrollmentPolicy.assertEventOpenForEnrollment(event);
    await this.enrollmentPolicy.assertNotAlreadyEnrolled(eventId, user.userId);
    const enrollment = await this.enrollmentsRepository.createEnrollment({
      id: randomUUID(),
      eventId,
      userId: user.userId,
      participantName: dto.participantName,
      displayName: dto.displayName,
      status: 'registered',
      reviewStatus: 'pending_review',
      registeredAt: new Date(),
    });
    const detail: EnrollmentKsrBasicDetail = {
      enrollmentId: enrollment.id,
      nik: dto.nik,
      birthPlace: dto.birthPlace,
      birthDate: dto.birthDate,
      gender: dto.gender,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      education: dto.education,
      occupation: dto.occupation,
      bloodType: dto.bloodType,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
    };
    await this.enrollmentsRepository.createKsrBasicDetail(detail);
    if (idempotencyKey) {
      const cacheKey = `enrollment.create.ksr_basic:${eventId}:${user.userId}:${idempotencyKey}`;
      this.idempotencyService.set(
        cacheKey,
        { enrollmentId: enrollment.id },
        86_400_000,
      );
    }
    return { enrollmentId: enrollment.id };
  }

  async createGeneral(
    eventId: EventId,
    dto: CreateGeneralEnrollmentDto,
  ): Promise<{ enrollmentId: string }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    const idempotencyKey = this.getIdempotencyKey();
    if (idempotencyKey) {
      const cacheKey = `enrollment.create.general:${eventId}:${user.userId}:${idempotencyKey}`;
      const cached = this.idempotencyService.get<{ enrollmentId: string }>(
        cacheKey,
      );
      if (cached) {
        return cached;
      }
    }
    this.rateLimitService.consume(
      `enrollment.create.general:${eventId}:${user.userId}`,
      10,
      60_000,
    );
    this.enrollmentPolicy.assertEventOpenForEnrollment(event);
    await this.enrollmentPolicy.assertNotAlreadyEnrolled(eventId, user.userId);
    const enrollment = await this.enrollmentsRepository.createEnrollment({
      id: randomUUID(),
      eventId,
      userId: user.userId,
      participantName: dto.participantName,
      displayName: dto.displayName,
      pmiElement: dto.unsurPmi,
      status: 'registered',
      reviewStatus: 'pending_review',
      registeredAt: new Date(),
    });
    const detail: EnrollmentGeneralDetail = {
      enrollmentId: enrollment.id,
      unsurPmi: dto.unsurPmi,
      nik: dto.nik,
      birthPlace: dto.birthPlace,
      birthDate: dto.birthDate,
      gender: dto.gender,
      address: dto.address,
      phoneNumber: dto.phoneNumber,
      email: dto.email,
      education: dto.education,
      occupation: dto.occupation,
      bloodType: dto.bloodType,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      organizationName: dto.organizationName,
      organizationRole: dto.organizationRole,
    };
    await this.enrollmentsRepository.createGeneralDetail(detail);
    if (idempotencyKey) {
      const cacheKey = `enrollment.create.general:${eventId}:${user.userId}:${idempotencyKey}`;
      this.idempotencyService.set(
        cacheKey,
        { enrollmentId: enrollment.id },
        86_400_000,
      );
    }
    return { enrollmentId: enrollment.id };
  }

  async createEnrollmentForUser(
    eventId: EventId,
    userId: string,
  ): Promise<{ enrollmentId: string }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    const enrollment = await this.enrollmentsRepository.createEnrollment({
      id: randomUUID(),
      eventId,
      userId,
      participantName: userId,
      status: 'registered',
      reviewStatus: 'pending_review',
      registeredAt: new Date(),
    });
    return { enrollmentId: enrollment.id };
  }

  findByEventId(eventId: EventId): Promise<Enrollment[]> {
    return this.enrollmentsRepository.findByEventId(eventId);
  }

  async updateEnrollmentStatus(eventId?: EventId): Promise<void> {
    if (!eventId) {
      return;
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      eventId,
      EventPermission.MANAGE_ENROLLMENT,
    );
  }

  async cancelEnrollment(eventId?: EventId): Promise<void> {
    if (!eventId) {
      return;
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      eventId,
      EventPermission.MANAGE_ENROLLMENT,
    );
  }

  async approveEnrollment(
    enrollmentId: string,
    note?: string,
    currentUser?: CurrentUserContext,
  ): Promise<{ enrollmentId: string; reviewStatus: string }> {
    if (!currentUser) {
      currentUser = await getCurrentUser(this.request, this.authService);
    }
    const enrollment = await this.enrollmentsRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(enrollmentId);
    }
    this.rateLimitService.consume(
      `enrollment.approve:${enrollment.eventId}:${currentUser.userId}`,
      20,
      60_000,
    );
    await this.eventPolicy.assertEventExists(enrollment.eventId);
    const event = await this.eventsService.findEventById(enrollment.eventId);
    if (!event) {
      throw new EventNotFound(enrollment.eventId);
    }
    this.enrollmentApprovalPolicy.assertCanApprove(
      event,
      currentUser,
      enrollment,
    );
    const updated = await this.enrollmentsRepository.updateReviewStatus(
      enrollmentId,
      'approved',
      currentUser.userId,
      note,
    );
    await this.auditService.log(
      enrollment.eventId,
      currentUser.userId,
      'enrollment.approved',
      'enrollment',
      enrollmentId,
      {
        reviewStatus: 'approved',
        note: note ?? null,
      },
    );
    return { enrollmentId: updated.id, reviewStatus: updated.reviewStatus };
  }

  async rejectEnrollment(
    enrollmentId: string,
    note?: string,
    currentUser?: CurrentUserContext,
  ): Promise<{ enrollmentId: string; reviewStatus: string }> {
    if (!currentUser) {
      currentUser = await getCurrentUser(this.request, this.authService);
    }
    const enrollment = await this.enrollmentsRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(enrollmentId);
    }
    this.rateLimitService.consume(
      `enrollment.reject:${enrollment.eventId}:${currentUser.userId}`,
      20,
      60_000,
    );
    await this.eventPolicy.assertEventExists(enrollment.eventId);
    const event = await this.eventsService.findEventById(enrollment.eventId);
    if (!event) {
      throw new EventNotFound(enrollment.eventId);
    }
    this.enrollmentApprovalPolicy.assertCanReject(
      event,
      currentUser,
      enrollment,
    );
    const updated = await this.enrollmentsRepository.updateReviewStatus(
      enrollmentId,
      'rejected',
      currentUser.userId,
      note,
    );
    await this.auditService.log(
      enrollment.eventId,
      currentUser.userId,
      'enrollment.rejected',
      'enrollment',
      enrollmentId,
      {
        reviewStatus: 'rejected',
        note: note ?? null,
      },
    );
    return { enrollmentId: updated.id, reviewStatus: updated.reviewStatus };
  }

  private getIdempotencyKey(): string | null {
    const key =
      this.request.headers['idempotency-key'] ??
      this.request.headers['x-idempotency-key'];
    return this.idempotencyService.normalizeKey(key);
  }
}
