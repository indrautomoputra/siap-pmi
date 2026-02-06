import { Injectable } from '@nestjs/common';
import { Enrollment } from '../enrollments/enrollments.types';
import {
  KapAlreadySubmitted,
  KapInstrumentInactive,
  EnrollmentNotApproved,
} from './kap.errors';
import { KapInstrument } from './kap.types';
import { KapRepository } from './kap.repository';

@Injectable()
export class KapPolicy {
  constructor(private readonly kapRepository: KapRepository) {}

  assertInstrumentActive(instrument: KapInstrument): void {
    if (instrument.isActive) {
      return;
    }
    throw new KapInstrumentInactive(instrument.id);
  }

  assertEnrollmentApproved(enrollment: Enrollment): void {
    if (enrollment.reviewStatus === 'approved') {
      return;
    }
    throw new EnrollmentNotApproved(enrollment.id);
  }

  async assertNotSubmittedYet(
    instrumentId: string,
    enrollmentHash: string,
  ): Promise<void> {
    const existing = await this.kapRepository.findResponseByInstrumentAndHash(
      instrumentId,
      enrollmentHash,
    );
    if (existing) {
      throw new KapAlreadySubmitted(instrumentId, enrollmentHash);
    }
  }
}
