import { EventId } from '../events/events.types';

export type EventRoleId = string;

export type EventRoleType = 'PANITIA' | 'PELATIH' | 'OBSERVER';

export enum EventPermission {
  MANAGE_EVENT = 'MANAGE_EVENT',
  MANAGE_ENROLLMENT = 'MANAGE_ENROLLMENT',
  ASSIGN_ROLE = 'ASSIGN_ROLE',
  INPUT_PENILAIAN = 'INPUT_PENILAIAN',
  VIEW_REPORT = 'VIEW_REPORT',
}

export const EventRolePermissions: Record<EventRoleType, EventPermission[]> = {
  PANITIA: [
    EventPermission.MANAGE_EVENT,
    EventPermission.MANAGE_ENROLLMENT,
    EventPermission.ASSIGN_ROLE,
    EventPermission.VIEW_REPORT,
  ],
  PELATIH: [EventPermission.INPUT_PENILAIAN, EventPermission.VIEW_REPORT],
  OBSERVER: [EventPermission.VIEW_REPORT],
};

export interface EventRoleAssignment {
  id: EventRoleId;
  eventId: EventId;
  userId?: string;
  personName: string;
  displayName?: string;
  role: EventRoleType;
  assignedAt: Date;
}
