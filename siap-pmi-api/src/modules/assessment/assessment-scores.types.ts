import type { AssessmentKind } from './assessment.types';

export type AssessmentScoreId = string;

export type AssessmentScorePayload = Record<string, unknown>;

export interface AssessmentScoreRecord {
  id: AssessmentScoreId;
  eventId: string;
  instrumentId: string;
  assesseeEnrollmentId: string;
  assessorUserId: string;
  type: AssessmentKind;
  payload: AssessmentScorePayload;
  createdAt: Date;
}
