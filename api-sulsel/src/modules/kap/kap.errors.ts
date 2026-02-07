export class KapInstrumentNotFound extends Error {
  constructor(instrumentId: string) {
    super(`KAP instrument not found: ${instrumentId}`);
    this.name = 'KapInstrumentNotFound';
  }
}

export class KapInstrumentInactive extends Error {
  constructor(instrumentId: string) {
    super(`KAP instrument inactive: ${instrumentId}`);
    this.name = 'KapInstrumentInactive';
  }
}

export class KapAlreadySubmitted extends Error {
  constructor(instrumentId: string, enrollmentHash: string) {
    super(
      `KAP already submitted: ${instrumentId} (${enrollmentHash.slice(0, 8)})`,
    );
    this.name = 'KapAlreadySubmitted';
  }
}

export class EnrollmentNotApproved extends Error {
  constructor(enrollmentId: string) {
    super(`Enrollment not approved: ${enrollmentId}`);
    this.name = 'EnrollmentNotApproved';
  }
}
