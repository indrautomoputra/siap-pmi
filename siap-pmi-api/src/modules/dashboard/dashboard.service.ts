import { Injectable, Scope } from '@nestjs/common';
import { SupabaseClientType } from '../../infrastructure/supabase/supabase.client';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import { AssessmentKind } from '../assessment/assessment.types';
import {
  EnrollmentReviewStatus,
  EnrollmentStatus,
  PMIElement,
} from '../enrollments/enrollments.types';
import {
  DashboardAssessmentRecapResponseDto,
  DashboardAssessmentRecapSummaryDto,
  DashboardKapRecapResponseDto,
  DashboardParticipantsResponseDto,
} from './dashboard.dto';

type EnrollmentRow = {
  id: string;
  participant_name: string;
  display_name: string | null;
  status: EnrollmentStatus;
  review_status: EnrollmentReviewStatus;
  registered_at: string;
  pmi_element: PMIElement | null;
};

type AssessmentInstrumentRow = {
  id: string;
  kind: AssessmentKind;
};

type AssessmentScoreRow = {
  instrument_id: string;
  enrollment_id: string;
  scores: Record<string, unknown>;
};

type KapInstrumentRow = {
  id: string;
  title: string;
};

type KapResponseRow = {
  instrument_id: string;
};

type GraduationDecisionRow = {
  id: string;
  enrollment_id: string;
  decision: string;
  decided_by: string;
  decided_at: string;
  note: string | null;
};

@Injectable({ scope: Scope.REQUEST })
export class DashboardReadService {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async getParticipantsByEvent(
    eventId: string,
  ): Promise<DashboardParticipantsResponseDto> {
    const client = this.supabaseProvider.getClient();
    const { data, error } = await client
      .from('enrollments')
      .select(
        'id, participant_name, display_name, status, review_status, registered_at, pmi_element',
      )
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch participants');
    }
    return {
      eventId,
      participants: (data as EnrollmentRow[]).map((row) => ({
        enrollmentId: row.id,
        participantName: row.participant_name,
        displayName: row.display_name ?? undefined,
        status: row.status,
        reviewStatus: row.review_status,
        registeredAt: row.registered_at,
        pmiElement: row.pmi_element ?? undefined,
      })),
    };
  }

  async getAssessmentRecapByEvent(
    eventId: string,
  ): Promise<DashboardAssessmentRecapResponseDto> {
    const client = this.supabaseProvider.getClient();
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select('id, participant_name, display_name')
      .eq('event_id', eventId);
    if (enrollmentError || !enrollments) {
      throw new Error(
        enrollmentError?.message ?? 'Failed to fetch enrollments',
      );
    }
    const { data: instruments, error: instrumentError } = await client
      .from('assessment_instruments')
      .select('id, kind')
      .eq('event_id', eventId);
    if (instrumentError || !instruments) {
      throw new Error(
        instrumentError?.message ?? 'Failed to fetch assessment instruments',
      );
    }
    const instrumentKindMap = new Map<string, AssessmentKind>();
    const instrumentIds = (instruments as AssessmentInstrumentRow[]).map(
      (instrument) => {
        instrumentKindMap.set(instrument.id, instrument.kind);
        return instrument.id;
      },
    );
    const scores: AssessmentScoreRow[] = instrumentIds.length
      ? await this.fetchAssessmentScores(client, instrumentIds)
      : [];
    const recapMap = new Map<
      string,
      {
        enrollmentId: string;
        participantName: string;
        displayName?: string;
        akademik: DashboardAssessmentRecapSummaryDto;
        sikap: DashboardAssessmentRecapSummaryDto;
      }
    >();
    const accumMap = new Map<
      string,
      {
        akademik: { total: number; count: number; submissions: number };
        sikap: { total: number; count: number; submissions: number };
        akademikItems: number;
        sikapItems: number;
      }
    >();

    (enrollments as EnrollmentRow[]).forEach((enrollment) => {
      recapMap.set(enrollment.id, {
        enrollmentId: enrollment.id,
        participantName: enrollment.participant_name,
        displayName: enrollment.display_name ?? undefined,
        akademik: { averageScore: null, submissionCount: 0, totalItems: 0 },
        sikap: { averageScore: null, submissionCount: 0, totalItems: 0 },
      });
      accumMap.set(enrollment.id, {
        akademik: { total: 0, count: 0, submissions: 0 },
        sikap: { total: 0, count: 0, submissions: 0 },
        akademikItems: 0,
        sikapItems: 0,
      });
    });

    scores.forEach((score) => {
      const recap = recapMap.get(score.enrollment_id);
      const accum = accumMap.get(score.enrollment_id);
      const kind = instrumentKindMap.get(score.instrument_id);
      if (!recap || !accum || !kind) {
        return;
      }
      const values = Object.values(score.scores ?? {}).filter(
        (value): value is number =>
          typeof value === 'number' && Number.isFinite(value),
      );
      const total = values.reduce((sum, value) => sum + value, 0);
      if (kind === 'akademik') {
        accum.akademik.total += total;
        accum.akademik.count += values.length;
        accum.akademik.submissions += 1;
        accum.akademikItems += values.length;
      } else {
        accum.sikap.total += total;
        accum.sikap.count += values.length;
        accum.sikap.submissions += 1;
        accum.sikapItems += values.length;
      }
    });

    recapMap.forEach((recap, enrollmentId) => {
      const accum = accumMap.get(enrollmentId);
      if (!accum) {
        return;
      }
      recap.akademik.averageScore =
        accum.akademik.count > 0
          ? Number((accum.akademik.total / accum.akademik.count).toFixed(2))
          : null;
      recap.akademik.submissionCount = accum.akademik.submissions;
      recap.akademik.totalItems = accum.akademikItems;

      recap.sikap.averageScore =
        accum.sikap.count > 0
          ? Number((accum.sikap.total / accum.sikap.count).toFixed(2))
          : null;
      recap.sikap.submissionCount = accum.sikap.submissions;
      recap.sikap.totalItems = accum.sikapItems;
    });

    return {
      eventId,
      enrollments: Array.from(recapMap.values()),
    };
  }

  async getKapRecapByEvent(
    eventId: string,
  ): Promise<DashboardKapRecapResponseDto> {
    const client = this.supabaseProvider.getClient();
    const { data: instruments, error: instrumentError } = await client
      .from('kap_instruments')
      .select('id, title')
      .eq('event_id', eventId);
    if (instrumentError || !instruments) {
      throw new Error(
        instrumentError?.message ?? 'Failed to fetch KAP instruments',
      );
    }
    const instrumentIds = (instruments as KapInstrumentRow[]).map(
      (instrument) => instrument.id,
    );
    const responses = instrumentIds.length
      ? await this.fetchKapResponses(client, instrumentIds)
      : [];
    const responseCountMap = new Map<string, number>();
    responses.forEach((response) => {
      responseCountMap.set(
        response.instrument_id,
        (responseCountMap.get(response.instrument_id) ?? 0) + 1,
      );
    });
    const totalResponses = responses.length;
    return {
      eventId,
      totalResponses,
      instruments: (instruments as KapInstrumentRow[]).map((instrument) => ({
        instrumentId: instrument.id,
        title: instrument.title,
        responseCount: responseCountMap.get(instrument.id) ?? 0,
      })),
    };
  }

  async getGraduationsByEvent(eventId: string): Promise<{
    eventId: string;
    decisions: {
      id: string;
      eventId: string;
      enrollmentId: string;
      decision: string;
      decidedBy: string;
      decidedAt: string;
      note?: string;
      participantName: string;
      displayName?: string;
      status: EnrollmentStatus;
      reviewStatus: EnrollmentReviewStatus;
    }[];
  }> {
    const client = this.supabaseProvider.getClient();
    const { data: enrollments, error: enrollmentError } = await client
      .from('enrollments')
      .select(
        'id, participant_name, display_name, status, review_status, registered_at, pmi_element',
      )
      .eq('event_id', eventId);
    if (enrollmentError || !enrollments) {
      throw new Error(
        enrollmentError?.message ?? 'Failed to fetch enrollments',
      );
    }
    const { data: decisions, error: decisionError } = await client
      .from('graduation_decisions')
      .select('id, enrollment_id, decision, decided_by, decided_at, note')
      .eq('event_id', eventId);
    if (decisionError || !decisions) {
      throw new Error(
        decisionError?.message ?? 'Failed to fetch graduation decisions',
      );
    }
    const enrollmentMap = new Map(
      (enrollments as EnrollmentRow[]).map((row) => [row.id, row]),
    );
    return {
      eventId,
      decisions: (decisions as GraduationDecisionRow[]).map((row) => {
        const enrollment = enrollmentMap.get(row.enrollment_id);
        return {
          id: row.id,
          eventId,
          enrollmentId: row.enrollment_id,
          decision: row.decision,
          decidedBy: row.decided_by,
          decidedAt: row.decided_at,
          note: row.note ?? undefined,
          participantName: enrollment?.participant_name ?? '',
          displayName: enrollment?.display_name ?? undefined,
          status: enrollment?.status ?? 'registered',
          reviewStatus: enrollment?.review_status ?? 'pending_review',
        };
      }),
    };
  }

  private async fetchAssessmentScores(
    client: SupabaseClientType,
    instrumentIds: string[],
  ) {
    const { data, error } = await client
      .from('assessment_scores')
      .select('instrument_id, enrollment_id, scores')
      .in('instrument_id', instrumentIds);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch assessment scores');
    }
    return data as AssessmentScoreRow[];
  }

  private async fetchKapResponses(
    client: SupabaseClientType,
    instrumentIds: string[],
  ) {
    const { data, error } = await client
      .from('kap_responses')
      .select('instrument_id')
      .in('instrument_id', instrumentIds);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch KAP responses');
    }
    return data as KapResponseRow[];
  }
}
