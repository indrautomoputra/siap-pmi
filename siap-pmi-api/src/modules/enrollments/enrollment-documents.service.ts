import { Injectable, Scope } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentPolicy } from './enrollments.policy';
import { EnrollmentNotFound } from './enrollments.errors';
import { randomUUID } from 'crypto';
import { CurrentUserContext } from '../../infrastructure/auth/current-user';

@Injectable({ scope: Scope.REQUEST })
export class EnrollmentDocumentsService {
  constructor(
    private readonly enrollmentsRepository: EnrollmentsRepository,
    private readonly enrollmentPolicy: EnrollmentPolicy,
  ) {}

  async attachDocument(
    enrollmentId: string,
    docType: string,
    filePath: string,
    currentUser: CurrentUserContext,
  ): Promise<{ documentId: string }> {
    const enrollment = await this.enrollmentsRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(enrollmentId);
    }
    this.enrollmentPolicy.assertEnrollmentOwner(
      enrollment.userId,
      currentUser.userId,
      enrollment.id,
    );
    const documentId = await this.enrollmentsRepository.attachDocument({
      id: randomUUID(),
      enrollmentId,
      docType,
      filePath,
      uploadedBy: currentUser.userId,
      uploadedAt: new Date().toISOString(),
    });
    return { documentId };
  }
}
