import { EventId } from '../events/events.types';

export type AssessmentInstrumentId = string;
export type AssessmentCriterionId = string;
export type AssessmentScoreId = string;

export type AssessmentKind = 'akademik' | 'sikap';

export interface AssessmentInstrument {
  id: AssessmentInstrumentId;
  eventId: EventId;
  kind: AssessmentKind;
  title: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AssessmentCriterion {
  id: AssessmentCriterionId;
  instrumentId: AssessmentInstrumentId;
  criterion: string;
  weight?: number;
  orderNo: number;
}

export interface AssessmentScore {
  id: AssessmentScoreId;
  instrumentId: AssessmentInstrumentId;
  enrollmentId: string;
  scoredBy: string;
  scores: Record<string, unknown>;
  submittedAt: Date;
}
