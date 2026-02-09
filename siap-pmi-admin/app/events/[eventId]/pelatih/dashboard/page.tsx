'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import SummaryCard from '@/components/SummaryCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import { eventGet, ForbiddenError } from '@/lib/eventApi';

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

type ReportsSummaryResponse = {
  eventId: string;
  totalParticipants: number;
  totalAssessedParticipants: number;
  assessmentCoverageRate: number;
  evaluationSubmissionRate: number;
  totalEvaluationsSubmitted: number;
};

const getStatusMessage = (status: string) => {
  if (status === 'draft') return 'Event belum dimulai. Operasional dinonaktifkan.';
  if (status === 'published')
    return 'Event sudah dipublikasikan. Mode read-only.';
  if (status === 'ongoing') return 'Event berlangsung. Data tampil read-only.';
  if (status === 'completed')
    return 'Event selesai. Menampilkan rekap akhir.';
  return 'Event dibatalkan.';
};

const getDisabledReason = (status: string) => {
  if (status === 'draft') return 'Event belum dimulai.';
  if (status === 'published') return 'Event belum berlangsung.';
  if (status === 'completed') return 'Event sudah selesai.';
  if (status === 'cancelled') return 'Event dibatalkan.';
  return 'Event belum berlangsung.';
};

export default function PelatihDashboardPage() {
  const { eventId, eventStatus } = useEventContext();
  const [participants, setParticipants] = useState<ReportsParticipantItem[]>(
    [],
  );
  const [summary, setSummary] = useState<ReportsSummaryResponse | null>(null);
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
        const [participantsRes, summaryRes] = await Promise.all([
          eventGet<ReportsParticipantsResponse>(
            eventId,
            `/events/${eventId}/reports/participants`,
          ),
          eventGet<ReportsSummaryResponse>(
            eventId,
            `/events/${eventId}/reports/summary`,
          ),
        ]);
        if (!active) return;
        setParticipants(participantsRes.participants);
        setSummary(summaryRes);
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

  const assessedCount = useMemo(
    () => participants.filter((p) => p.hasAssessment).length,
    [participants],
  );
  const assessmentRate = summary
    ? `${Math.round(summary.assessmentCoverageRate * 100)}%`
    : '-';

  return (
    <RequireEventRole allowed={['PELATIH']}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2>Pelatih – Dashboard</h2>
          <div style={{ color: '#666' }}>{getStatusMessage(eventStatus)}</div>
        </div>

        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat data dashboard…</div> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error && !forbidden ? (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <SummaryCard title="Total Peserta" value={participants.length} />
              <SummaryCard title="Peserta Dinilai" value={assessedCount} />
              <SummaryCard title="Cakupan Penilaian" value={assessmentRate} />
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <h3>Status Penilaian Peserta</h3>
              {participants.length === 0 ? (
                <EmptyState
                  title="Belum ada peserta"
                  description="Status penilaian akan muncul saat peserta terdaftar."
                />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>Peserta</th>
                      <th>Status Penilaian</th>
                      <th>Waktu Penilaian Terakhir</th>
                      <th>Status Evaluasi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((item) => (
                      <tr key={item.enrollmentId}>
                        <td>{item.participantName ?? item.enrollmentId}</td>
                        <td>{item.hasAssessment ? 'Sudah dinilai' : 'Belum dinilai'}</td>
                        <td>
                          {item.lastAssessmentAt
                            ? new Date(item.lastAssessmentAt).toLocaleDateString()
                            : '-'}
                        </td>
                        <td>{item.hasEvaluation ? 'Sudah mengisi' : 'Belum mengisi'}</td>
                        <td>
                          {eventStatus === 'ongoing' ? (
                            <Link
                              href={`/events/${eventId}/pelatih/assessments/${item.enrollmentId}`}
                              aria-label={`Nilai / Update Penilaian untuk ${item.participantName ?? item.enrollmentId}`}
                            >
                              Nilai / Update Penilaian
                            </Link>
                          ) : (
                            <div style={{ display: 'grid', gap: 4 }}>
                              <button
                                type="button"
                                disabled
                                aria-label={`Nilai / Update Penilaian untuk ${item.participantName ?? item.enrollmentId}`}
                              >
                                Nilai / Update Penilaian
                              </button>
                              <div style={{ color: '#666', fontSize: 12 }}>
                                {getDisabledReason(eventStatus)}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : null}
      </div>
    </RequireEventRole>
  );
}
