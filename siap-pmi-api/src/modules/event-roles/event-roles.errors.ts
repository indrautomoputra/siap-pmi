export class RoleAssignmentAlreadyExists extends Error {
  constructor(eventId: string, userId: string, role: string) {
    super(`Role assignment already exists: ${eventId} (${userId}, ${role})`);
    this.name = 'RoleAssignmentAlreadyExists';
  }
}

export class EventNotOpenForRoleAssignment extends Error {
  constructor(eventId: string, status: string) {
    super(`Event is not open for role assignment: ${eventId} (${status})`);
    this.name = 'EventNotOpenForRoleAssignment';
  }
}

export class MultiRoleInSameEventNotAllowed extends Error {
  constructor(eventId: string, userId: string) {
    super(`Multiple roles in same event not allowed: ${eventId} (${userId})`);
    this.name = 'MultiRoleInSameEventNotAllowed';
  }
}

export class UserNotAssignedToEvent extends Error {
  constructor(userId: string, eventId: string) {
    super(`User not assigned to event: ${userId} (${eventId})`);
    this.name = 'UserNotAssignedToEvent';
  }
}

export class PermissionDeniedForEvent extends Error {
  constructor(userId: string, eventId: string, permission: string) {
    super(`Permission denied for event: ${userId} (${eventId}, ${permission})`);
    this.name = 'PermissionDeniedForEvent';
  }
}
