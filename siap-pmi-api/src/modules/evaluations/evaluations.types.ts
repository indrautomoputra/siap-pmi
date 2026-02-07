import { EventId } from '../events/events.types';

export type EvaluationId = string;

export interface Evaluation {
  id: EvaluationId;
  eventId: EventId;
  enrollmentId: string;
  responses: Record<string, unknown>;
  submittedAt: Date;
}
