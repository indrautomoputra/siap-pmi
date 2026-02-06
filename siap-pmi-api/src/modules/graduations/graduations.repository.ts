import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import { GraduationDecision } from './graduations.types';

type GraduationDecisionRow = {
  id: string;
  event_id: string;
  enrollment_id: string;
  decision: string;
  decided_by: string;
  decided_at: string;
  note: string | null;
};

const toDomainDecision = (row: GraduationDecisionRow): GraduationDecision => ({
  id: row.id,
  eventId: row.event_id,
  enrollmentId: row.enrollment_id,
  decision: row.decision as GraduationDecision['decision'],
  decidedBy: row.decided_by,
  decidedAt: new Date(row.decided_at),
  note: row.note ?? undefined,
});

@Injectable()
export class GraduationsRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createDecision(
    decision: GraduationDecision,
  ): Promise<GraduationDecision> {
    const client = this.supabaseProvider.getClient();
    const payload: GraduationDecisionRow = {
      id: decision.id,
      event_id: decision.eventId,
      enrollment_id: decision.enrollmentId,
      decision: decision.decision,
      decided_by: decision.decidedBy,
      decided_at: decision.decidedAt.toISOString(),
      note: decision.note ?? null,
    };
    const { data, error } = await client
      .from('graduation_decisions')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create graduation decision');
    }
    return toDomainDecision(data as GraduationDecisionRow);
  }

  async findByEventAndEnrollment(
    eventId: string,
    enrollmentId: string,
  ): Promise<GraduationDecision | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('graduation_decisions')
      .select('*')
      .eq('event_id', eventId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return toDomainDecision(data as GraduationDecisionRow);
  }

  async listByEvent(eventId: string): Promise<GraduationDecision[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('graduation_decisions')
      .select('*')
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch graduation decisions');
    }
    return (data as GraduationDecisionRow[]).map(toDomainDecision);
  }
}
