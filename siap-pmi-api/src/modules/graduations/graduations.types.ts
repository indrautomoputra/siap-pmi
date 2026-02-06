import { EventId } from '../events/events.types';
import { EnrollmentId } from '../enrollments/enrollments.types';

export type GraduationDecisionId = string;
export type GraduationDecisionStatus = 'lulus' | 'tidak_lulus' | 'ditunda';

export interface GraduationDecision {
  id: GraduationDecisionId;
  eventId: EventId;
  enrollmentId: EnrollmentId;
  decision: GraduationDecisionStatus;
  decidedBy: string;
  decidedAt: Date;
  note?: string;
}
