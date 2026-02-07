import { Injectable } from '@nestjs/common';
import type { SupabaseClientType } from '../../infrastructure/supabase/supabase.client';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import type {
  ReportsParticipantsResponse,
  ReportsSummaryResponse,
} from './reports.types';

type EnrollmentRow = {
  id: string;
  participant_name: string;
  display_name: string | null;
};

type AssessmentInstrumentRow = {
  id: string;
  event_id: string;
};

type AssessmentScoreRow = {
  enrollment_id: string;
  submitted_at: string;
};

type EvaluationRow = {
  enrollment_id: string;
};

@Injectable()
export class ReportsService {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async getSummary(eventId: string): Promise<ReportsSummaryResponse> {
    const client = this.supabaseProvider.getClient();
    const totalEnrollments = await this.countRows(client, 'enrollments', [
      { column: 'event_id', value: eventId },
    ]);
    const totalParticipants = totalEnrollments;
    const totalTrainers = await this.countRows(
      client,
      'event_role_assignments',
      [
        { column: 'event_id', value: eventId },
        { column: 'role', value: 'PELATIH' },
      ],
    );
    const totalObservers = await this.countRows(
      client,
      'event_role_assignments',
      [
        { column: 'event_id', value: eventId },
        { column: 'role', value: 'OBSERVER' },
      ],
    );
    const totalEvaluationsSubmitted = await this.countRows(
      client,
      'evaluations',
      [{ column: 'event_id', value: eventId }],
    );
    const assessmentScores = await this.fetchAssessmentScoresByEvent(
      client,
      eventId,
    );
    const assessedEnrollmentIds = new Set(
      assessmentScores.map((score) => score.enrollment_id),
    );
    const totalAssessedParticipants = assessedEnrollmentIds.size;
    const evaluationSubmissionRate =
      totalParticipants > 0 ? totalEvaluationsSubmitted / totalParticipants : 0;
    const assessmentCoverageRate =
      totalParticipants > 0 ? totalAssessedParticipants / totalParticipants : 0;
    return {
      eventId,
      totalEnrollments,
      totalParticipants,
      totalTrainers,
      totalObservers,
      totalEvaluationsSubmitted,
      totalAssessedParticipants,
      evaluationSubmissionRate,
      assessmentCoverageRate,
    };
  }

  async listParticipants(
    eventId: string,
  ): Promise<ReportsParticipantsResponse> {
    const client = this.supabaseProvider.getClient();
    const enrollments = await this.fetchEnrollmentsByEvent(client, eventId);
    const evaluations = await this.fetchEvaluationsByEvent(client, eventId);
    const evaluationSet = new Set(
      evaluations.map((evaluation) => evaluation.enrollment_id),
    );
    const assessmentScores = await this.fetchAssessmentScoresByEvent(
      client,
      eventId,
    );
    const assessmentSet = new Set(
      assessmentScores.map((score) => score.enrollment_id),
    );
    const lastAssessmentMap = new Map<string, string>();
    assessmentScores.forEach((score) => {
      const existing = lastAssessmentMap.get(score.enrollment_id);
      if (!existing || score.submitted_at > existing) {
        lastAssessmentMap.set(score.enrollment_id, score.submitted_at);
      }
    });
    return {
      eventId,
      participants: enrollments.map((enrollment) => ({
        enrollmentId: enrollment.id,
        participantName: enrollment.participant_name ?? undefined,
        roleInEvent: 'PESERTA',
        hasEvaluation: evaluationSet.has(enrollment.id),
        hasAssessment: assessmentSet.has(enrollment.id),
        lastAssessmentAt: lastAssessmentMap.get(enrollment.id),
      })),
    };
  }

  private async countRows(
    client: SupabaseClientType,
    table: string,
    filters: { column: string; value: string }[],
  ): Promise<number> {
    let query = client.from(table).select('*', { count: 'exact', head: true });
    filters.forEach((filter) => {
      query = query.eq(filter.column, filter.value);
    });
    const { count, error } = await query;
    if (error) {
      throw new Error(error.message);
    }
    return count ?? 0;
  }

  private async fetchEnrollmentsByEvent(
    client: SupabaseClientType,
    eventId: string,
  ): Promise<EnrollmentRow[]> {
    const { data, error } = await client
      .from('enrollments')
      .select('id, participant_name, display_name')
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch enrollments');
    }
    return data as EnrollmentRow[];
  }

  private async fetchEvaluationsByEvent(
    client: SupabaseClientType,
    eventId: string,
  ): Promise<EvaluationRow[]> {
    const { data, error } = await client
      .from('evaluations')
      .select('enrollment_id')
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch evaluations');
    }
    return data as EvaluationRow[];
  }

  private async fetchAssessmentScoresByEvent(
    client: SupabaseClientType,
    eventId: string,
  ): Promise<AssessmentScoreRow[]> {
    const { data: instruments, error: instrumentError } = await client
      .from('assessment_instruments')
      .select('id, event_id')
      .eq('event_id', eventId);
    if (instrumentError) {
      throw new Error(
        instrumentError?.message ?? 'Failed to fetch assessment instruments',
      );
    }
    if (!instruments || instruments.length === 0) {
      return [];
    }
    const instrumentIds = (instruments as AssessmentInstrumentRow[]).map(
      (instrument) => instrument.id,
    );
    const { data, error } = await client
      .from('assessment_scores')
      .select('enrollment_id, submitted_at')
      .in('instrument_id', instrumentIds);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch assessment scores');
    }
    return data as AssessmentScoreRow[];
  }
}
