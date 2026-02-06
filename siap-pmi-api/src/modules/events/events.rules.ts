import { EventProgramType, EventStatus } from './events.types';

export function canChangeEventStatus(
  fromStatus: EventStatus,
  toStatus: EventStatus,
): boolean {
  const allowed: Record<EventStatus, EventStatus[]> = {
    draft: ['published', 'cancelled'],
    published: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  return allowed[fromStatus].includes(toStatus);
}

export function isProgramTypeSeparated(programType: EventProgramType): boolean {
  return programType === 'KSR_DASAR' || programType === 'NON_KSR';
}

export function canAcceptEnrollment(status: EventStatus): boolean {
  return status === 'published';
}

export function canAssignRole(status: EventStatus): boolean {
  return status === 'published' || status === 'ongoing';
}
