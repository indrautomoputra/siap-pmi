import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { SupabaseClientType } from '../../infrastructure/supabase/supabase.client';
import { SupabaseProvider } from '../../infrastructure/supabase/supabase.module';
import type { CurrentUser } from '../../infrastructure/auth/auth.service';
import type { CurrentUserContext } from '../../infrastructure/auth/current-user';
import type { CurrentEventContext } from '../../core/event-context/event-context.types';
import {
  EnrollmentAccessDenied,
  EnrollmentNotFound,
} from '../enrollments/enrollments.errors';
import {
  CreateEvaluationRequestDto,
  EvaluationAggregateResponseDto,
  EvaluationItemDto,
  EvaluationMeResponseDto,
} from './evaluations.dto';

type CurrentUserLike = CurrentUser | CurrentUserContext;

type EvaluationRow = {
  id: string;
  event_id: string;
  enrollment_id: string;
  responses: Record<string, unknown>;
  submitted_at: string;
};

type EnrollmentRow = {
  id: string;
  event_id: string;
  user_id: string | null;
};

@Injectable()
export class EvaluationsService {
  constructor(private readonly supabaseProvider: SupabaseProvider) {}

  async create(
    eventId: string,
    currentEvent: CurrentEventContext | undefined,
    currentUser: CurrentUserLike | undefined,
    dto: CreateEvaluationRequestDto,
  ): Promise<{ evaluationId: string }> {
    if (dto.event_id && dto.event_id !== eventId) {
      throw new Error('event_id tidak sesuai dengan event pada path');
    }
    const userId = this.getUserId(currentUser);
    if (
      currentEvent?.enrollmentId &&
      currentEvent.enrollmentId !== dto.enrollmentId
    ) {
      throw new EnrollmentAccessDenied(dto.enrollmentId, userId);
    }
    const client = this.supabaseProvider.getClient();
    const enrollment = await this.fetchEnrollment(client, dto.enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(dto.enrollmentId);
    }
    if (enrollment.event_id !== eventId) {
      throw new Error('Enrollment tidak terdaftar pada event ini');
    }
    if (enrollment.user_id !== userId) {
      throw new EnrollmentAccessDenied(dto.enrollmentId, userId);
    }
    const existing = await this.fetchEvaluationByEnrollment(
      client,
      eventId,
      dto.enrollmentId,
    );
    if (existing) {
      throw new Error('Evaluasi sudah dikirim untuk enrollment ini');
    }
    // Asumsi: tabel evaluations tersedia dan menyimpan satu evaluasi per enrollment per event.
    const payload: EvaluationRow = {
      id: randomUUID(),
      event_id: eventId,
      enrollment_id: dto.enrollmentId,
      responses: dto.responses,
      submitted_at: new Date().toISOString(),
    };
    const { data, error } = await client
      .from('evaluations')
      .insert(payload)
      .select('*')
      .single();
    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to create evaluation');
    }
    return { evaluationId: (data as EvaluationRow).id };
  }

  async getAggregate(eventId: string): Promise<EvaluationAggregateResponseDto> {
    const client = this.supabaseProvider.getClient();
    const { count, error } = await client
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
    if (error) {
      throw new Error(error.message);
    }
    return {
      eventId,
      totalResponses: count ?? 0,
    };
  }

  async getMine(
    eventId: string,
    currentEvent: CurrentEventContext | undefined,
    currentUser: CurrentUserLike | undefined,
  ): Promise<EvaluationMeResponseDto> {
    const enrollmentId = currentEvent?.enrollmentId;
    if (!enrollmentId) {
      throw new Error('Enrollment context is missing');
    }
    const userId = this.getUserId(currentUser);
    const client = this.supabaseProvider.getClient();
    const enrollment = await this.fetchEnrollment(client, enrollmentId);
    if (!enrollment) {
      throw new EnrollmentNotFound(enrollmentId);
    }
    if (enrollment.event_id !== eventId) {
      throw new Error('Enrollment tidak terdaftar pada event ini');
    }
    if (enrollment.user_id !== userId) {
      throw new EnrollmentAccessDenied(enrollmentId, userId);
    }
    const evaluation = await this.fetchEvaluationByEnrollment(
      client,
      eventId,
      enrollmentId,
    );
    if (!evaluation) {
      throw new Error(`Evaluation not found: ${enrollmentId}`);
    }
    return this.toItemDto(evaluation, eventId);
  }

  private toItemDto(
    evaluation: EvaluationRow,
    eventId: string,
  ): EvaluationItemDto {
    return {
      id: evaluation.id,
      eventId,
      enrollmentId: evaluation.enrollment_id,
      responses: evaluation.responses ?? {},
      submittedAt: evaluation.submitted_at,
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

  private async fetchEnrollment(
    client: SupabaseClientType,
    enrollmentId: string,
  ): Promise<EnrollmentRow | null> {
    const { data, error } = await client
      .from('enrollments')
      .select('id,event_id,user_id')
      .eq('id', enrollmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as EnrollmentRow;
  }

  private async fetchEvaluationByEnrollment(
    client: SupabaseClientType,
    eventId: string,
    enrollmentId: string,
  ): Promise<EvaluationRow | null> {
    const { data, error } = await client
      .from('evaluations')
      .select('*')
      .eq('event_id', eventId)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle();
    if (error || !data) {
      return null;
    }
    return data as EvaluationRow;
  }
}
