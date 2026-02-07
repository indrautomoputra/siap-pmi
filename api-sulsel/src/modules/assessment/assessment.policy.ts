import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { EventNotActive } from '../events/events.errors';
import { TrainingEvent } from '../events/events.types';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { Enrollment } from '../enrollments/enrollments.types';
import {
  AssessmentAlreadyScored,
  AssessmentEnrollmentNotApproved,
} from './assessment.errors';
import { AssessmentRepository } from './assessment.repository';

@Injectable()
export class AssessmentPolicy {
  constructor(
    private readonly assessmentRepository: AssessmentRepository,
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
  ) {}

  assertEventOngoing(event: TrainingEvent): void {
    if (event.status === 'ongoing') {
      return;
    }
    throw new EventNotActive(event.id, event.status);
  }

  assertEnrollmentApproved(enrollment: Enrollment): void {
    if (enrollment.reviewStatus === 'approved') {
      return;
    }
    throw new AssessmentEnrollmentNotApproved(enrollment.id);
  }

  assertScorerIsPelatih(
    currentUser: CurrentUserContext,
    eventId: string,
  ): void {
    this.eventAuthorizationPolicy.assertHasPermissionFromContext(
      currentUser,
      eventId,
      EventPermission.INPUT_PENILAIAN,
    );
  }

  async assertNotScoredYet(
    instrumentId: string,
    enrollmentId: string,
  ): Promise<void> {
    const existing =
      await this.assessmentRepository.findScoreByInstrumentAndEnrollment(
        instrumentId,
        enrollmentId,
      );
    if (existing) {
      throw new AssessmentAlreadyScored(instrumentId, enrollmentId);
    }
  }
}
