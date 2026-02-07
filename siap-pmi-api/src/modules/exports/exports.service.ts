import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { getCurrentUser } from '../../infrastructure/auth/current-user';
import {
  PermissionDeniedForEvent,
  UserNotAssignedToEvent,
} from '../event-roles/event-roles.errors';
import {
  EventPermission,
  EventRoleType,
} from '../event-roles/event-roles.types';
import { EventPolicy } from '../events/events.policy';
import { DashboardReadService } from '../dashboard/dashboard.service';

type CsvValue = string | number | null | undefined;

const escapeCsvValue = (value: CsvValue): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const buildCsv = (headers: string[], rows: CsvValue[][]): string => {
  const lines = [headers.map(escapeCsvValue).join(',')];
  rows.forEach((row) => {
    lines.push(row.map(escapeCsvValue).join(','));
  });
  return lines.join('\n');
};

@Injectable({ scope: Scope.REQUEST })
export class ExportsService {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly authService: AuthService,
    private readonly eventPolicy: EventPolicy,
    private readonly dashboardReadService: DashboardReadService,
  ) {}

  private async assertExportAccess(eventId: string): Promise<void> {
    const currentUser = await getCurrentUser(this.request, this.authService);
    const roles = currentUser.enrollments
      .filter((enrollment) => enrollment.eventId === eventId)
      .map((enrollment) => enrollment.role)
      .filter((value): value is EventRoleType => Boolean(value));
    if (roles.length === 0) {
      throw new UserNotAssignedToEvent(currentUser.userId, eventId);
    }
    if (!roles.includes('PANITIA') && !roles.includes('OBSERVER')) {
      throw new PermissionDeniedForEvent(
        currentUser.userId,
        eventId,
        EventPermission.VIEW_REPORT,
      );
    }
  }

  async exportParticipantsCsv(eventId: string): Promise<string> {
    await this.eventPolicy.assertEventExists(eventId);
    await this.assertExportAccess(eventId);
    const { participants } =
      await this.dashboardReadService.getParticipantsByEvent(eventId);
    const rows = participants.map((participant) => [
      participant.enrollmentId,
      participant.participantName,
      participant.displayName,
      participant.status,
      participant.reviewStatus,
      participant.registeredAt,
      participant.pmiElement,
    ]);
    return buildCsv(
      [
        'enrollment_id',
        'participant_name',
        'display_name',
        'status',
        'review_status',
        'registered_at',
        'pmi_element',
      ],
      rows,
    );
  }

  async exportAssessmentsCsv(eventId: string): Promise<string> {
    await this.eventPolicy.assertEventExists(eventId);
    await this.assertExportAccess(eventId);
    const { enrollments } =
      await this.dashboardReadService.getAssessmentRecapByEvent(eventId);
    const rows = enrollments.map((recap) => [
      recap.enrollmentId,
      recap.participantName,
      recap.displayName,
      recap.akademik.averageScore,
      recap.akademik.submissionCount,
      recap.akademik.totalItems,
      recap.sikap.averageScore,
      recap.sikap.submissionCount,
      recap.sikap.totalItems,
    ]);
    return buildCsv(
      [
        'enrollment_id',
        'participant_name',
        'display_name',
        'akademik_average_score',
        'akademik_submission_count',
        'akademik_total_items',
        'sikap_average_score',
        'sikap_submission_count',
        'sikap_total_items',
      ],
      rows,
    );
  }

  async exportGraduationsCsv(eventId: string): Promise<string> {
    await this.eventPolicy.assertEventExists(eventId);
    await this.assertExportAccess(eventId);
    const { decisions } =
      await this.dashboardReadService.getGraduationsByEvent(eventId);
    const rows = decisions.map((decision) => [
      decision.id,
      decision.enrollmentId,
      decision.participantName,
      decision.displayName,
      decision.status,
      decision.reviewStatus,
      decision.decision,
      decision.decidedBy,
      decision.decidedAt,
      decision.note,
    ]);
    return buildCsv(
      [
        'decision_id',
        'enrollment_id',
        'participant_name',
        'display_name',
        'status',
        'review_status',
        'decision',
        'decided_by',
        'decided_at',
        'note',
      ],
      rows,
    );
  }
}
