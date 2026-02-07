import type { EventRoleType } from '../../modules/event-roles/event-roles.types';

export type CurrentEventContext = {
  eventId: string;
  enrollmentId?: string;
  role?: EventRoleType;
};
