import { EnrollmentStatus } from './enrollments.types';
import { EventProgramType } from '../events/events.types';

export function isValidEnrollmentStatusTransition(
  from: EnrollmentStatus,
  to: EnrollmentStatus,
): boolean {
  const allowed: Record<EnrollmentStatus, EnrollmentStatus[]> = {
    registered: ['validated', 'withdrawn'],
    validated: ['active', 'withdrawn'],
    active: ['withdrawn'],
    withdrawn: [],
  };

  return allowed[from].includes(to);
}

/**
 * RULE:
 * - KSR_DASAR → pmiElement TIDAK WAJIB
 * - NON_KSR / ORIENTASI → pmiElement WAJIB
 */
export function isPMIElementRequired(programType: EventProgramType): boolean {
  return programType !== 'KSR_DASAR';
}
