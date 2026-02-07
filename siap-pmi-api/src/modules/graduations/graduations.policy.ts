import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { EventRoleType } from '../event-roles/event-roles.types';
import { Enrollment } from '../enrollments/enrollments.types';
import { TrainingEvent } from '../events/events.types';
import {
  GraduationDecisionAlreadyExists,
  GraduationDecisionNotAllowed,
  GraduationEnrollmentNotApproved,
  GraduationEventNotOngoingOrCompleted,
} from './graduations.errors';
import { GraduationsRepository } from './graduations.repository';

@Injectable()
export class GraduationPolicy {
  constructor(private readonly graduationsRepository: GraduationsRepository) {}

  assertEventOngoingOrCompleted(event: TrainingEvent): void {
    if (event.status === 'ongoing' || event.status === 'completed') {
      return;
    }
    throw new GraduationEventNotOngoingOrCompleted(event.id, event.status);
  }

  assertEnrollmentApproved(enrollment: Enrollment): void {
    if (enrollment.reviewStatus === 'approved') {
      return;
    }
    throw new GraduationEnrollmentNotApproved(enrollment.id);
  }

  assertDeciderIsPanitiaOrPelatih(
    currentUser: CurrentUserContext,
    eventId: string,
  ): void {
    const roles = currentUser.enrollments
      .filter((enrollment) => enrollment.eventId === eventId)
      .map((enrollment) => enrollment.role)
      .filter((value): value is EventRoleType => Boolean(value));
    if (roles.includes('PANITIA') || roles.includes('PELATIH')) {
      return;
    }
    throw new GraduationDecisionNotAllowed(currentUser.userId, eventId);
  }

  async assertNotDecidedYet(
    eventId: string,
    enrollmentId: string,
  ): Promise<void> {
    const existing = await this.graduationsRepository.findByEventAndEnrollment(
      eventId,
      enrollmentId,
    );
    if (existing) {
      throw new GraduationDecisionAlreadyExists(eventId, enrollmentId);
    }
  }
}
