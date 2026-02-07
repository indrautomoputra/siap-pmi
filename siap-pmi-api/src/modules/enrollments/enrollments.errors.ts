export class EnrollmentAlreadyExists extends Error {
  constructor(eventId: string, userId: string) {
    super(`Enrollment already exists: ${eventId} (${userId})`);
    this.name = 'EnrollmentAlreadyExists';
  }
}

export class EventNotOpenForEnrollment extends Error {
  constructor(eventId: string, status: string) {
    super(`Event is not open for enrollment: ${eventId} (${status})`);
    this.name = 'EventNotOpenForEnrollment';
  }
}

export class EnrollmentNotFound extends Error {
  constructor(enrollmentId: string) {
    super(`Enrollment not found: ${enrollmentId}`);
    this.name = 'EnrollmentNotFound';
  }
}

export class EnrollmentAccessDenied extends Error {
  constructor(enrollmentId: string, userId: string) {
    super(`Access denied for enrollment: ${enrollmentId} (${userId})`);
    this.name = 'EnrollmentAccessDenied';
  }
}

export class EnrollmentNotPendingReview extends Error {
  constructor(enrollmentId: string, status: string) {
    super(`Enrollment is not pending review: ${enrollmentId} (${status})`);
    this.name = 'EnrollmentNotPendingReview';
  }
}
