import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import { EventId } from '../events/events.types';
import { EventRoleAssignment, EventRoleType } from './event-roles.types';

type EventRoleAssignmentRow = {
  id: string;
  event_id: EventId;
  user_id: string | null;
  role: EventRoleType;
  person_name: string;
  display_name: string | null;
  assigned_at: string;
};

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

const toDomainAssignment = (
  row: EventRoleAssignmentRow,
): EventRoleAssignment => ({
  id: row.id,
  eventId: row.event_id,
  userId: row.user_id ?? undefined,
  personName: row.person_name,
  displayName: row.display_name ?? row.person_name,
  role: row.role,
  assignedAt: new Date(row.assigned_at),
});

@Injectable()
export class EventRolesRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createAssignment(
    assignment: EventRoleAssignment,
  ): Promise<EventRoleAssignment> {
    const client = this.supabaseProvider.getClient();
    if (!assignment.userId) {
      throw new Error('Missing userId for role assignment');
    }
    // TODO(phase-2): drop person_name setelah data migrasi penuh.
    const payload: EventRoleAssignmentRow = {
      id: assignment.id,
      event_id: assignment.eventId,
      user_id: assignment.userId,
      role: assignment.role,
      person_name: assignment.personName,
      display_name: assignment.displayName ?? null,
      assigned_at: toDateString(assignment.assignedAt),
    };

    const { data, error } = await client
      .from('event_role_assignments')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create role assignment');
    }

    return toDomainAssignment(data as EventRoleAssignmentRow);
  }

  async findByEventAndUser(
    eventId: EventId,
    userId: string,
  ): Promise<EventRoleAssignment[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('event_role_assignments')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch role assignments');
    }

    return (data as EventRoleAssignmentRow[]).map(toDomainAssignment);
  }
}
