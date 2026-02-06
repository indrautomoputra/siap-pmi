import { Injectable } from '@nestjs/common';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import {
  AssessmentCriterion,
  AssessmentInstrument,
  AssessmentKind,
  AssessmentScore,
} from './assessment.types';

type AssessmentInstrumentRow = {
  id: string;
  event_id: string;
  kind: AssessmentKind;
  title: string;
  is_active: boolean;
  created_at: string;
};

type AssessmentCriterionRow = {
  id: string;
  instrument_id: string;
  criterion: string;
  weight: number | null;
  order_no: number;
};

type AssessmentScoreRow = {
  id: string;
  instrument_id: string;
  enrollment_id: string;
  scored_by: string;
  scores: Record<string, unknown>;
  submitted_at: string;
};

const toDomainInstrument = (
  row: AssessmentInstrumentRow,
): AssessmentInstrument => ({
  id: row.id,
  eventId: row.event_id,
  kind: row.kind,
  title: row.title,
  isActive: row.is_active,
  createdAt: new Date(row.created_at),
});

const toDomainCriterion = (
  row: AssessmentCriterionRow,
): AssessmentCriterion => ({
  id: row.id,
  instrumentId: row.instrument_id,
  criterion: row.criterion,
  weight: row.weight ?? undefined,
  orderNo: row.order_no,
});

const toDomainScore = (row: AssessmentScoreRow): AssessmentScore => ({
  id: row.id,
  instrumentId: row.instrument_id,
  enrollmentId: row.enrollment_id,
  scoredBy: row.scored_by,
  scores: row.scores ?? {},
  submittedAt: new Date(row.submitted_at),
});

@Injectable()
export class AssessmentRepository {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async createInstrument(
    instrument: AssessmentInstrument,
  ): Promise<AssessmentInstrument> {
    const client = this.supabaseProvider.getClient();
    const payload: AssessmentInstrumentRow = {
      id: instrument.id,
      event_id: instrument.eventId,
      kind: instrument.kind,
      title: instrument.title,
      is_active: instrument.isActive,
      created_at: instrument.createdAt.toISOString(),
    };
    const { data, error } = await client
      .from('assessment_instruments')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(
        error?.message ?? 'Failed to create assessment instrument',
      );
    }
    return toDomainInstrument(data as AssessmentInstrumentRow);
  }

  async addCriterion(
    criterion: AssessmentCriterion,
  ): Promise<AssessmentCriterion> {
    const client = this.supabaseProvider.getClient();
    const payload: AssessmentCriterionRow = {
      id: criterion.id,
      instrument_id: criterion.instrumentId,
      criterion: criterion.criterion,
      weight: criterion.weight ?? null,
      order_no: criterion.orderNo,
    };
    const { data, error } = await client
      .from('assessment_criteria')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to add assessment criterion');
    }
    return toDomainCriterion(data as AssessmentCriterionRow);
  }

  async createScore(score: AssessmentScore): Promise<AssessmentScore> {
    const client = this.supabaseProvider.getClient();
    const payload: AssessmentScoreRow = {
      id: score.id,
      instrument_id: score.instrumentId,
      enrollment_id: score.enrollmentId,
      scored_by: score.scoredBy,
      scores: score.scores,
      submitted_at: score.submittedAt.toISOString(),
    };
    const { data, error } = await client
      .from('assessment_scores')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create assessment score');
    }
    return toDomainScore(data as AssessmentScoreRow);
  }

  async findInstrumentById(
    instrumentId: string,
  ): Promise<AssessmentInstrument | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('assessment_instruments')
      .select('*')
      .eq('id', instrumentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return toDomainInstrument(data as AssessmentInstrumentRow);
  }

  async findScoreByInstrumentAndEnrollment(
    instrumentId: string,
    enrollmentId: string,
  ): Promise<AssessmentScore | null> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('assessment_scores')
      .select('*')
      .eq('instrument_id', instrumentId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return toDomainScore(data as AssessmentScoreRow);
  }

  async findInstrumentsByEvent(
    eventId: string,
  ): Promise<AssessmentInstrument[]> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('assessment_instruments')
      .select('*')
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(
        error?.message ?? 'Failed to fetch assessment instruments',
      );
    }
    return (data as AssessmentInstrumentRow[]).map(toDomainInstrument);
  }

  async listScoresByEvent(eventId: string): Promise<AssessmentScore[]> {
    const instruments = await this.findInstrumentsByEvent(eventId);
    if (instruments.length === 0) {
      return [];
    }
    const instrumentIds = instruments.map((instrument) => instrument.id);
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('assessment_scores')
      .select('*')
      .in('instrument_id', instrumentIds);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch assessment scores');
    }
    return (data as AssessmentScoreRow[]).map(toDomainScore);
  }
}
