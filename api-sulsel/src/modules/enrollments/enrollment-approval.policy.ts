import { Injectable } from '@nestjs/common';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';
import { EventAuthorizationPolicy } from '../event-roles/event-authorization.policy';
import { EventPermission } from '../event-roles/event-roles.types';
import { EventNotActive } from '../events/events.errors';
import { TrainingEvent } from '../events/events.types';
import { EnrollmentNotPendingReview } from './enrollments.errors';
import { Enrollment } from './enrollments.types';

@Injectable()
export class EnrollmentApprovalPolicy {
  constructor(
    private readonly eventAuthorizationPolicy: EventAuthorizationPolicy,
  ) {}

  assertCanApprove(
    event: TrainingEvent,
    currentUser: CurrentUserContext,
    enrollment?: Enrollment,
  ): void {
    this.assertEventActiveOrPublished(event);
    this.assertPanitiaPermission(event, currentUser);
    if (enrollment) {
      this.assertPendingReview(enrollment);
    }
  }

  assertCanReject(
    event: TrainingEvent,
    currentUser: CurrentUserContext,
    enrollment?: Enrollment,
  ): void {
    this.assertEventActiveOrPublished(event);
    this.assertPanitiaPermission(event, currentUser);
    if (enrollment) {
      this.assertPendingReview(enrollment);
    }
  }

  private assertEventActiveOrPublished(event: TrainingEvent): void {
    if (event.status === 'published' || event.status === 'ongoing') {
      return;
    }
    throw new EventNotActive(event.id, event.status);
  }

  private assertPendingReview(enrollment: Enrollment): void {
    if (enrollment.reviewStatus === 'pending_review') {
      return;
    }
    throw new EnrollmentNotPendingReview(
      enrollment.id,
      enrollment.reviewStatus,
    );
  }

  private assertPanitiaPermission(
    event: TrainingEvent,
    currentUser: CurrentUserContext,
  ): void {
    this.eventAuthorizationPolicy.assertHasPermissionFromContext(
      currentUser,
      event.id,
      EventPermission.MANAGE_ENROLLMENT,
    );
  }
}
