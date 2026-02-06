import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import {
  EventId,
  EventProgramType,
  EventStatus,
  TrainingEvent,
} from './events.types';

type EventRow = {
  id: string;
  name: string;
  program_type: EventProgramType;
  status: EventStatus;
  start_date: string;
  end_date: string;
};

const toDateString = (date: Date): string => date.toISOString().slice(0, 10);

const toDomainEvent = (row: EventRow): TrainingEvent => ({
  id: row.id,
  name: row.name,
  programType: row.program_type,
  status: row.status,
  startDate: new Date(row.start_date),
  endDate: new Date(row.end_date),
});

@Injectable()
export class EventsRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createEvent(event: TrainingEvent): Promise<TrainingEvent> {
    const client = this.supabaseProvider.getClient();
    const payload: EventRow = {
      id: event.id,
      name: event.name,
      program_type: event.programType,
      status: event.status,
      start_date: toDateString(event.startDate),
      end_date: toDateString(event.endDate),
    };

    const { data, error } = await client
      .from('events')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create event');
    }

    return toDomainEvent(data as EventRow);
  }

  async findAllEvents(): Promise<TrainingEvent[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client.from('events').select('*');

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch events');
    }

    return (data as EventRow[]).map(toDomainEvent);
  }

  async listEvents(
    limit: number,
    offset: number,
  ): Promise<{ items: TrainingEvent[]; limit: number; offset: number }> {
    const client = this.supabaseProvider.getClient();
    const start = Math.max(0, offset);
    const boundedLimit = Math.min(Math.max(1, limit), 100);
    const end = start + boundedLimit - 1;
    const { data, error } = await client
      .from('events')
      .select('*')
      .range(start, end);

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch events');
    }

    return {
      items: (data as EventRow[]).map(toDomainEvent),
      limit: boundedLimit,
      offset: start,
    };
  }

  async findEventById(eventId: EventId): Promise<TrainingEvent | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('events')
      .select('*')
      .eq('id', eventId)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    return toDomainEvent(data[0] as EventRow);
  }

  async findEventStatus(eventId: EventId): Promise<EventStatus | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('events')
      .select('id, status')
      .eq('id', eventId)
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return null;
    }

    const row = data[0] as { status: EventStatus };
    return row.status;
  }

  async pingEvents(): Promise<number> {
    const client = this.supabaseProvider.getClient();
    const { count, error } = await client
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }
}
