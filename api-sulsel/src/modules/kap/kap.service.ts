import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import { EventPolicy } from '../events/events.policy';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { EnrollmentsRepository } from '../enrollments/enrollments.repository';
import { EnrollmentNotFound } from '../enrollments/enrollments.errors';
import { KapPolicy } from './kap.policy';
import { KapRepository } from './kap.repository';
import { KapInstrument, KapQuestion, KapResponse } from './kap.types';
import { CreateKapInstrumentDto } from './create-kap-instrument.dto';
import { AddKapQuestionDto } from './add-kap-question.dto';
import { SubmitKapResponsesDto } from './submit-kap-responses.dto';
import { KapInstrumentNotFound } from './kap.errors';
import { randomUUID } from 'crypto';
import { hashEnrollment } from './hash-enrollment';
import { AuditService } from '../audit/audit.service';
import { RateLimitService } from '../../infrastructure/traffic/traffic.module';

@Injectable({ scope: Scope.REQUEST })
export class KapService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly kapRepository: KapRepository,
    private readonly kapPolicy: KapPolicy,
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly eventPolicy: EventPolicy,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
    private readonly authService: AuthService,
    private readonly auditService: AuditService,
    private readonly rateLimitService: RateLimitService,
  ) {}

  async createInstrument(
    eventId: string,
    dto: CreateKapInstrumentDto,
  ): Promise<{ instrumentId: string }> {
    await this.eventPolicy.assertEventIsActiveOrPublished(eventId);
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      eventId,
      EventPermission.MANAGE_EVENT,
    );
    const instrument: KapInstrument = {
      id: randomUUID(),
      eventId,
      title: dto.title,
      isActive: dto.isActive ?? true,
      createdAt: new Date(),
    };
    const created = await this.kapRepository.createInstrument(instrument);
    return { instrumentId: created.id };
  }

  async addQuestion(
    instrumentId: string,
    dto: AddKapQuestionDto,
  ): Promise<{ questionId: string }> {
    const instrument =
      await this.kapRepository.findInstrumentById(instrumentId);
    if (!instrument) {
      throw new KapInstrumentNotFound(instrumentId);
    }
    await this.eventPolicy.assertEventIsActiveOrPublished(instrument.eventId);
    const user = await getCurrentUser(this.request, this.authService);
    await this.eventAuthorizationPolicy.assertHasPermission(
      user.userId,
      instrument.eventId,
      EventPermission.MANAGE_EVENT,
    );
    const question: KapQuestion = {
      id: randomUUID(),
      instrumentId: instrument.id,
      questionText: dto.questionText,
      questionType: dto.questionType,
      scaleMin: dto.scaleMin,
      scaleMax: dto.scaleMax,
      orderNo: dto.orderNo,
    };
    const created = await this.kapRepository.addQuestion(question);
    return { questionId: created.id };
  }

  async submitResponses(
    instrumentId: string,
    dto: SubmitKapResponsesDto,
  ): Promise<{ responseId: string }> {
    const instrument =
      await this.kapRepository.findInstrumentById(instrumentId);
    if (!instrument) {
      throw new KapInstrumentNotFound(instrumentId);
    }
    await this.eventPolicy.assertEventIsActiveOrPublished(instrument.eventId);
    this.kapPolicy.assertInstrumentActive(instrument);
    const enrollment = await this.enrollmentsRepository.findById(
      dto.enrollmentId,
    );
    if (!enrollment) {
      throw new EnrollmentNotFound(dto.enrollmentId);
    }
    this.kapPolicy.assertEnrollmentApproved(enrollment);
    const user = await getCurrentUser(this.request, this.authService);
    this.rateLimitService.consume(
      `kap.submit:${instrument.eventId}:${user.userId}`,
      20,
      60_000,
    );
    const secretSalt = process.env.KAP_HASH_SALT ?? '';
    const enrollmentHash = hashEnrollment(
      dto.enrollmentId,
      instrument.eventId,
      secretSalt,
    );
    await this.kapPolicy.assertNotSubmittedYet(instrument.id, enrollmentHash);
    const response: KapResponse = {
      id: randomUUID(),
      instrumentId: instrument.id,
      enrollmentHash,
      answers: dto.answers,
      submittedAt: new Date(),
    };
    const created = await this.kapRepository.createResponse(response);
    await this.auditService.log(
      instrument.eventId,
      user.userId,
      'kap.submitted',
      'kap_response',
      created.id,
      {
        instrumentId: instrument.id,
        enrollmentId: dto.enrollmentId,
      },
    );
    return { responseId: created.id };
  }
}
