import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SupabaseClientType } from '../../infrastructure/supabase/supabase.client';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import type { CurrentUser } from '../../infrastructure/auth/auth.service';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';
import type { AssessmentKind } from './assessment.types';
import {
  EnrollmentAccessDenied,
  EnrollmentNotFound,
} from '../enrollments/enrollments.errors';
import { PermissionDeniedForEvent } from '../event-roles/event-roles.errors';
import {
  AssessmentScoreDetailResponseDto,
  AssessmentScoreItemDto,
  AssessmentScoreListResponseDto,
  CreateAssessmentScoreRequestDto,
} from './assessment-scores.dto';

type CurrentUserLike = CurrentUser | CurrentUserContext;

type AssessmentInstrumentRow = {
  id: string;
  event_id: string;
  kind: AssessmentKind;
  title: string;
  is_active: boolean;
  created_at: string;
};

type AssessmentScoreRow = {
  id: string;
  instrument_id: string;
  enrollment_id: string;
  scored_by: string;
  scores: Record<string, unknown>;
  submitted_at: string;
};

type EnrollmentRow = {
  id: string;
  event_id: string;
};

@Injectable()
export class AssessmentScoresService {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async listByEvent(eventId: string): Promise<AssessmentScoreListResponseDto> {
    const client = this.supabaseProvider.getClient();
    const instruments = await this.fetchInstrumentsByEvent(client, eventId);
    if (instruments.length === 0) {
      return { eventId, items: [] };
    }
    const instrumentIds = instruments.map((instrument) => instrument.id);
    const instrumentKindMap = new Map(
      instruments.map((instrument) => [instrument.id, instrument.kind]),
    );
    const scores = await this.fetchScoresByInstruments(client, instrumentIds);
    const items = scores
      .map((score) => {
        const kind = instrumentKindMap.get(score.instrument_id);
        if (!kind) {
          return null;
        }
        return this.toItemDto(score, eventId, kind);
      })
      .filter((item): item is AssessmentScoreItemDto => Boolean(item));
    return { eventId, items };
  }

  async getById(
    eventId: string,
    assessmentId: string,
  ): Promise<AssessmentScoreDetailResponseDto> {
    const client = this.supabaseProvider.getClient();
    const score = await this.fetchScoreById(client, assessmentId);
    if (!score) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }
    const instrument = await this.fetchInstrumentById(
      client,
      score.instrument_id,
    );
    if (!instrument || instrument.event_id !== eventId) {
      throw new Error(`Assessment not found: ${assessmentId}`);
    }
    return this.toItemDto(score, eventId, instrument.kind);
  }

  async create(
    eventId: string,
    currentUser: CurrentUserLike | undefined,
    dto: CreateAssessmentScoreRequestDto,
  ): Promise<{ assessmentId: string }> {
    if (dto.event_id && dto.event_id !== eventId) {
      throw new PermissionDeniedForEvent(
        this.getUserId(currentUser),
        eventId,
        'EVENT_CONTEXT_MISMATCH',
      );
    }
    const userId = this.getUserId(currentUser);
    const client = this.supabaseProvider.getClient();
    const enrollment = await this.fetchEnrollment(
      client,
      dto.assesseeEnrollmentId,
    );
    if (!enrollment) {
      throw new EnrollmentNotFound(dto.assesseeEnrollmentId);
    }
    if (enrollment.event_id !== eventId) {
      throw new EnrollmentAccessDenied(dto.assesseeEnrollmentId, userId);
    }
    const instrument = dto.instrumentId
      ? await this.fetchInstrumentById(client, dto.instrumentId)
      : await this.fetchInstrumentByEventAndKind(client, eventId, dto.type);
    if (!instrument || instrument.event_id !== eventId) {
      throw new PermissionDeniedForEvent(
        userId,
        eventId,
        'ASSESSMENT_INSTRUMENT_EVENT_MISMATCH',
      );
    }
    if (dto.instrumentId && instrument.kind !== dto.type) {
      throw new Error('Type penilaian tidak sesuai dengan instrumen');
    }
    const payload: AssessmentScoreRow = {
      id: randomUUID(),
      instrument_id: instrument.id,
      enrollment_id: dto.assesseeEnrollmentId,
      scored_by: userId,
      scores: dto.payload,
      submitted_at: new Date().toISOString(),
    };
    const { data, error } = await client
      .from('assessment_scores')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create assessment');
    }
    return { assessmentId: (data as AssessmentScoreRow).id };
  }

  private toItemDto(
    score: AssessmentScoreRow,
    eventId: string,
    kind: AssessmentKind,
  ): AssessmentScoreItemDto {
    return {
      id: score.id,
      eventId,
      instrumentId: score.instrument_id,
      assesseeEnrollmentId: score.enrollment_id,
      assessorUserId: score.scored_by,
      type: kind,
      payload: score.scores ?? {},
      createdAt: score.submitted_at,
    };
  }

  private getUserId(currentUser?: CurrentUserLike): string {
    if (currentUser && 'userId' in currentUser && currentUser.userId) {
      return currentUser.userId;
    }
    if (currentUser && 'id' in currentUser && currentUser.id) {
      return currentUser.id;
    }
    throw new Error('Missing current user');
  }

  private async fetchInstrumentById(
    client: SupabaseClientType,
    instrumentId: string,
  ): Promise<AssessmentInstrumentRow | null> {
    const { data, error } = await client
      .from('assessment_instruments')
      .select('*')
      .eq('id', instrumentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as AssessmentInstrumentRow;
  }

  private async fetchInstrumentByEventAndKind(
    client: SupabaseClientType,
    eventId: string,
    kind: AssessmentKind,
  ): Promise<AssessmentInstrumentRow | null> {
    const { data, error } = await client
      .from('assessment_instruments')
      .select('*')
      .eq('event_id', eventId)
      .eq('kind', kind)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as AssessmentInstrumentRow;
  }

  private async fetchInstrumentsByEvent(
    client: SupabaseClientType,
    eventId: string,
  ): Promise<AssessmentInstrumentRow[]> {
    const { data, error } = await client
      .from('assessment_instruments')
      .select('*')
      .eq('event_id', eventId);
    if (error || !data) {
      throw new Error(
        error?.message ?? 'Failed to fetch assessment instruments',
      );
    }
    return data as AssessmentInstrumentRow[];
  }

  private async fetchScoresByInstruments(
    client: SupabaseClientType,
    instrumentIds: string[],
  ): Promise<AssessmentScoreRow[]> {
    const { data, error } = await client
      .from('assessment_scores')
      .select('*')
      .in('instrument_id', instrumentIds);
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to fetch assessment scores');
    }
    return data as AssessmentScoreRow[];
  }

  private async fetchScoreById(
    client: SupabaseClientType,
    assessmentId: string,
  ): Promise<AssessmentScoreRow | null> {
    const { data, error } = await client
      .from('assessment_scores')
      .select('*')
      .eq('id', assessmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as AssessmentScoreRow;
  }

  private async fetchEnrollment(
    client: SupabaseClientType,
    enrollmentId: string,
  ): Promise<EnrollmentRow | null> {
    const { data, error } = await client
      .from('enrollments')
      .select('id,event_id')
      .eq('id', enrollmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as EnrollmentRow;
  }
}
