import { EventRoleAssignment, EventRoleType } from './event-roles.types';

export function canAssignRole(
  existingRoles: EventRoleAssignment[],
  newRole: EventRoleType,
): boolean {
  // Satu orang tidak boleh punya role ganda dalam satu event
  return !existingRoles.some((r) => r.role === newRole);
}
