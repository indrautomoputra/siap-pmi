export class GraduationDecisionAlreadyExists extends Error {
  constructor(eventId: string, enrollmentId: string) {
    super(`Graduation decision already exists: ${eventId} (${enrollmentId})`);
    this.name = 'GraduationDecisionAlreadyExists';
  }
}

export class GraduationEnrollmentNotApproved extends Error {
  constructor(enrollmentId: string) {
    super(`Graduation enrollment not approved: ${enrollmentId}`);
    this.name = 'GraduationEnrollmentNotApproved';
  }
}

export class GraduationDecisionNotAllowed extends Error {
  constructor(userId: string, eventId: string) {
    super(`Graduation decision not allowed: ${userId} (${eventId})`);
    this.name = 'GraduationDecisionNotAllowed';
  }
}

export class GraduationEventNotOngoingOrCompleted extends Error {
  constructor(eventId: string, status: string) {
    super(`Event is not ongoing or completed: ${eventId} (${status})`);
    this.name = 'GraduationEventNotOngoingOrCompleted';
  }
}
