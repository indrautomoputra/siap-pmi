'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import MessageBanner from '@/components/MessageBanner';
import Forbidden from '@/components/Forbidden';
import StatusBanner from '@/components/StatusBanner';
import { eventGet, ForbiddenError } from '@/lib/eventApi';

type ReportsSummaryResponse = {
  eventId: string;
  totalEnrollments: number;
  totalParticipants: number;
  totalTrainers: number;
  totalObservers: number;
  totalEvaluationsSubmitted: number;
  totalAssessedParticipants: number;
  evaluationSubmissionRate: number;
  assessmentCoverageRate: number;
};

type ReportsParticipantItem = {
  enrollmentId: string;
  participantName?: string;
  roleInEvent: 'PESERTA';
  hasEvaluation: boolean;
  hasAssessment: boolean;
  lastAssessmentAt?: string;
};

type ReportsParticipantsResponse = {
  eventId: string;
  participants: ReportsParticipantItem[];
};

type GraduationDecisionItem = {
  decision: string;
};

type GraduationDecisionsResponse = {
  eventId: string;
  decisions: GraduationDecisionItem[];
};

const getAssessmentStatus = (item: ReportsParticipantItem) => {
  if (item.hasAssessment) return 'Terkirim';
  if (item.lastAssessmentAt) return 'Draft';
  return 'Belum Dinilai';
};

const getEvaluationStatus = (item: ReportsParticipantItem) =>
  item.hasEvaluation ? 'Sudah Terkumpul' : 'Belum Terkumpul';

export default function PanitiaReportsPage() {
  const { eventId, eventStatus } = useEventContext();
  const [summary, setSummary] = useState<ReportsSummaryResponse | null>(null);
  const [participants, setParticipants] = useState<ReportsParticipantItem[]>(
    [],
  );
  const [decisions, setDecisions] = useState<GraduationDecisionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);
      try {
        const [summaryRes, participantsRes, decisionsRes] = await Promise.all([
          eventGet<ReportsSummaryResponse>(
            eventId,
            `/events/${eventId}/reports/summary`,
          ),
          eventGet<ReportsParticipantsResponse>(
            eventId,
            `/events/${eventId}/reports/participants`,
          ),
          eventGet<GraduationDecisionsResponse>(
            eventId,
            `/events/${eventId}/graduations`,
          ),
        ]);
        if (!active) return;
        setSummary(summaryRes ?? null);
        setParticipants(participantsRes?.participants ?? []);
        setDecisions(decisionsRes?.decisions ?? []);
      } catch (e) {
        if (!active) return;
        if (e instanceof ForbiddenError) {
          setForbidden(true);
        } else {
          setError((e as Error).message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [eventId]);

  const reportHasData = useMemo(() => {
    return summary !== null || participants.length > 0 || decisions.length > 0;
  }, [summary, participants.length, decisions.length]);

  const summaryLabels = useMemo(() => {
    return {
      participants:
        summary && typeof summary.totalParticipants === 'number'
          ? summary.totalParticipants.toString()
          : 'Belum tersedia',
      assessments:
        summary && typeof summary.totalAssessedParticipants === 'number'
          ? summary.totalAssessedParticipants.toString()
          : 'Belum tersedia',
      evaluations:
        summary && typeof summary.totalEvaluationsSubmitted === 'number'
          ? summary.totalEvaluationsSubmitted.toString()
          : 'Belum tersedia',
    };
  }, [summary]);

  const decisionStats = useMemo(() => {
    return decisions.reduce(
      (acc, item) => {
        const normalized = item.decision?.toLowerCase?.() ?? '';
        if (normalized === 'lulus') acc.lulus += 1;
        if (normalized === 'tidak_lulus' || normalized === 'tidak lulus')
          acc.tidakLulus += 1;
        if (normalized === 'ditunda') acc.ditunda += 1;
        return acc;
      },
      { lulus: 0, tidakLulus: 0, ditunda: 0 },
    );
  }, [decisions]);

  const graduationSummaryLabel = useMemo(() => {
    if (!decisions || decisions.length === 0) return 'Belum tersedia';
    return `LULUS ${decisionStats.lulus} · TIDAK_LULUS ${decisionStats.tidakLulus} · DITUNDA ${decisionStats.ditunda}`;
  }, [decisions, decisionStats]);

  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <EventHeader />
        <div>
          <h2>Panitia – Reports</h2>
          <div style={{ color: '#666' }}>
            Rekap operasional event bersifat read-only.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat laporan…</div> : null}
        {error ? <MessageBanner variant="error" message={error} /> : null}

        {!loading && !error && !forbidden ? (
          !reportHasData ? (
            <EmptyState
              title="Data laporan belum tersedia"
              description="Ringkasan dan detail laporan akan muncul saat data operasional tersedia."
            />
          ) : (
            <>
              <div style={{ display: 'grid', gap: 8 }}>
                <h3>Ringkasan Operasional</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 200,
                    }}
                  >
                    <div style={{ color: '#666', fontSize: 12 }}>
                      Jumlah peserta terdaftar
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {summaryLabels.participants}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 200,
                    }}
                  >
                    <div style={{ color: '#666', fontSize: 12 }}>
                      Jumlah assessment masuk
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {summaryLabels.assessments}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 200,
                    }}
                  >
                    <div style={{ color: '#666', fontSize: 12 }}>
                      Jumlah evaluasi peserta
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {summaryLabels.evaluations}
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid #eee',
                      borderRadius: 8,
                      padding: 12,
                      minWidth: 260,
                    }}
                  >
                    <div style={{ color: '#666', fontSize: 12 }}>
                      Ringkasan kelulusan
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {graduationSummaryLabel}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <h3>Detail</h3>
                {participants.length === 0 ? (
                  <EmptyState
                    title="Data laporan belum tersedia"
                    description="Detail laporan akan muncul setelah peserta terdaftar."
                  />
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left' }}>
                        <th>Peserta</th>
                        <th>Status Penilaian</th>
                        <th>Status Evaluasi</th>
                        <th>Penilaian Terakhir</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((item) => (
                        <tr key={item.enrollmentId}>
                          <td>{item.participantName ?? item.enrollmentId}</td>
                          <td>{getAssessmentStatus(item)}</td>
                          <td>{getEvaluationStatus(item)}</td>
                          <td>
                            {item.lastAssessmentAt
                              ? new Date(item.lastAssessmentAt).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )
        ) : null}
      </div>
    </RequireEventRole>
  );
}
