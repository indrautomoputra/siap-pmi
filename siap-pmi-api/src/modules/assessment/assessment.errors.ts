export class AssessmentInstrumentNotFound extends Error {
  constructor(instrumentId: string) {
    super(`Assessment instrument not found: ${instrumentId}`);
    this.name = 'AssessmentInstrumentNotFound';
  }
}

export class AssessmentAlreadyScored extends Error {
  constructor(instrumentId: string, enrollmentId: string) {
    super(
      `Assessment already scored: ${instrumentId} (${enrollmentId.slice(0, 8)})`,
    );
    this.name = 'AssessmentAlreadyScored';
  }
}

export class AssessmentEnrollmentNotApproved extends Error {
  constructor(enrollmentId: string) {
    super(`Enrollment not approved: ${enrollmentId}`);
    this.name = 'AssessmentEnrollmentNotApproved';
  }
}
