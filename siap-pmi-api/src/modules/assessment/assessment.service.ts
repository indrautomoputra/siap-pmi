import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import { EventNotFound } from '../events/events.errors';
import { EventPolicy } from '../events/events.policy';
import { EventsService } from '../events/events.service';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import {
  EnrollmentAccessDenied,
  EnrollmentNotFound,
} from '../enrollments/enrollments.errors';
import { AssessmentPolicy } from './assessment.policy';
import { AssessmentRepository } from './assessment.repository';
import {
  AssessmentCriterion,
  AssessmentInstrument,
  AssessmentScore,
} from './assessment.types';
import { CreateAssessmentInstrumentDto } from './create-assessment-instrument.dto';
import { AddAssessmentCriterionDto } from './add-assessment-criterion.dto';
import { SubmitAssessmentScoreDto } from './submit-assessment-score.dto';
import { AssessmentInstrumentNotFound } from './assessment.errors';
import { RateLimitService } from '../../infrastructure/traffic/traffic.module';
import { AuditService } from '../audit/audit.service';

type AssessmentRecapItem = {
  enrollmentId: string;
  participantName: string;
  displayName?: string;
  averageScore: number | null;
  submissionCount: number;
  totalItems: number;
};

@Injectable({ scope: Scope.REQUEST })
export class AssessmentService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly assessmentRepository: AssessmentRepository,
    private readonly assessmentPolicy: AssessmentPolicy,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly eventPolicy: EventPolicy,
    private readonly eventsService: EventsService,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async createInstrument(
    eventId: string,
    dto: CreateAssessmentInstrumentDto,
  ): Promise<{ instrumentId: string }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      eventId,
      EventPermission.MANAGE_EVENT,
    );
    const instrument: AssessmentInstrument = {
      id: randomUUID(),
      eventId,
      kind: dto.kind,
      title: dto.title,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
    };
    const created =
      await this.assessmentRepository.createInstrument(instrument);
    return { instrumentId: created.id };
  }

  async addCriterion(
    instrumentId: string,
    dto: AddAssessmentCriterionDto,
  ): Promise<{ criterionId: string }> {
    const instrument =
      await this.assessmentRepository.findInstrumentById(instrumentId);
    if (!instrument) {
      throw new AssessmentInstrumentNotFound(instrumentId);
    }
    await this.eventPolicy.assertEventExists(instrument.eventId);
    const event = await this.eventsService.findEventById(instrument.eventId);
    if (!event) {
      throw new EventNotFound(instrument.eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      instrument.eventId,
      EventPermission.MANAGE_EVENT,
    );
    const criterion: AssessmentCriterion = {
      id: randomUUID(),
      instrumentId,
      criterion: dto.criterion,
      weight: dto.weight,
      orderNo: dto.orderNo,
    };
    const created = await this.assessmentRepository.addCriterion(criterion);
    return { criterionId: created.id };
  }

  async submitScore(
    instrumentId: string,
    dto: SubmitAssessmentScoreDto,
    currentUser?: CurrentUserContext,
  ): Promise<{ scoreId: string }> {
    const instrument =
      await this.assessmentRepository.findInstrumentById(instrumentId);
    if (!instrument) {
      throw new AssessmentInstrumentNotFound(instrumentId);
    }
    await this.eventPolicy.assertEventExists(instrument.eventId);
    const event = await this.eventsService.findEventById(instrument.eventId);
    if (!event) {
      throw new EventNotFound(instrument.eventId);
    }
    this.assessmentPolicy.assertEventOngoing(event);
    const user =
      currentUser ?? (await getCurrentUser(this.request, this.authService));
    this.rateLimitService.consume(
      `assessment.submit:${instrument.eventId}:${user.userId}`,
      30,
      60_000,
    );
    this.assessmentPolicy.assertScorerIsPelatih(user, instrument.eventId);
    const enrollment = await this.enrollmentsRepository.findById(
      dto.enrollmentId,
    );
    if (!enrollment) {
      throw new EnrollmentNotFound(dto.enrollmentId);
    }
    if (enrollment.eventId !== instrument.eventId) {
      throw new EnrollmentAccessDenied(dto.enrollmentId, user.userId);
    }
    this.assessmentPolicy.assertEnrollmentApproved(enrollment);
    await this.assessmentPolicy.assertNotScoredYet(
      instrumentId,
      dto.enrollmentId,
    );
    const score: AssessmentScore = {
      id: randomUUID(),
      instrumentId,
      enrollmentId: dto.enrollmentId,
      scoredBy: user.userId,
      scores: dto.scores,
      submittedAt: new Date(),
    };
    const created = await this.assessmentRepository.createScore(score);
    await this.auditService.log(
      instrument.eventId,
      user.userId,
      'assessment.submitted',
      'assessment_score',
      created.id,
      {
        instrumentId,
        enrollmentId: dto.enrollmentId,
      },
    );
    return { scoreId: created.id };
  }

  async getRecap(eventId: string): Promise<{
    eventId: string;
    enrollments: AssessmentRecapItem[];
  }> {
    await this.eventPolicy.assertEventExists(eventId);
    const event = await this.eventsService.findEventById(eventId);
    if (!event) {
      throw new EventNotFound(eventId);
    }
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      eventId,
      EventPermission.VIEW_REPORT,
    );
    const enrollments = await this.enrollmentsRepository.findByEventId(eventId);
    const scores = await this.assessmentRepository.listScoresByEvent(eventId);
    const recapMap = new Map<string, AssessmentRecapItem>();
    const accumMap = new Map<string, { total: number; count: number }>();

    enrollments.forEach((enrollment) => {
      recapMap.set(enrollment.id, {
        enrollmentId: enrollment.id,
        participantName: enrollment.participantName,
        displayName: enrollment.displayName,
        averageScore: null,
        submissionCount: 0,
        totalItems: 0,
      });
      accumMap.set(enrollment.id, { total: 0, count: 0 });
    });

    scores.forEach((score) => {
      const recap = recapMap.get(score.enrollmentId);
      const accum = accumMap.get(score.enrollmentId);
      if (!recap || !accum) {
        return;
      }
      const values = Object.values(score.scores ?? {}).filter(
        (value): value is number =>
          typeof value === 'number' && Number.isFinite(value),
      );
      const total = values.reduce((sum, value) => sum + value, 0);
      accum.total += total;
      accum.count += values.length;
      recap.submissionCount += 1;
      recap.totalItems += values.length;
    });

    recapMap.forEach((recap, enrollmentId) => {
      const accum = accumMap.get(enrollmentId);
      if (!accum) {
        return;
      }
      recap.averageScore =
        accum.count > 0 ? Number((accum.total / accum.count).toFixed(2)) : null;
    });

    return {
      eventId,
      enrollments: Array.from(recapMap.values()),
    };
  }
}
