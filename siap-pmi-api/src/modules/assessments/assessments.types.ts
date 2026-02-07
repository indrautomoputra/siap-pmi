import type { AssessmentKind } from '../assessment/assessment.types';

export type AssessmentId = string;

export type AssessmentPayload = Record<string, unknown>;

export interface AssessmentRecord {
  id: AssessmentId;
  eventId: string;
  instrumentId: string;
  assesseeEnrollmentId: string;
  assessorUserId: string;
  type: AssessmentKind;
  payload: AssessmentPayload;
  createdAt: Date;
}
