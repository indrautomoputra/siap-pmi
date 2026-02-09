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

type DashboardParticipantItem = {
  enrollmentId: string;
  participantName: string;
  displayName?: string;
  status: string;
  reviewStatus: string;
  registeredAt: string;
  pmiElement?: string;
};

type DashboardParticipantsResponse = {
  eventId: string;
  participants: DashboardParticipantItem[];
};

type DashboardAssessmentRecapItem = {
  enrollmentId: string;
  participantName: string;
  displayName?: string;
  akademik: {
    averageScore: number | null;
    submissionCount: number;
    totalItems: number;
  };
  sikap: {
    averageScore: number | null;
    submissionCount: number;
    totalItems: number;
  };
};

type DashboardAssessmentRecapResponse = {
  eventId: string;
  enrollments: DashboardAssessmentRecapItem[];
};

type DashboardKapRecapResponse = {
  eventId: string;
  totalResponses: number;
  instruments: {
    instrumentId: string;
    title: string;
    responseCount: number;
  }[];
};

type GraduationDecisionItem = {
  id: string;
  eventId: string;
  enrollmentId: string;
  decision: string;
  decidedBy: string;
  decidedAt: string;
  note?: string;
  participantName: string;
  displayName?: string;
  status: string;
  reviewStatus: string;
};

type GraduationDecisionsResponse = {
  eventId: string;
  decisions: GraduationDecisionItem[];
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

export default function ObserverDashboardPage() {
  const { eventId, eventStatus } = useEventContext();
  const [participants, setParticipants] = useState<DashboardParticipantItem[]>(
    [],
  );
  const [recap, setRecap] = useState<DashboardAssessmentRecapItem[]>([]);
  const [kap, setKap] = useState<DashboardKapRecapResponse | null>(null);
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
        const [participantsRes, recapRes, kapRes, decisionsRes] =
          await Promise.all([
            eventGet<DashboardParticipantsResponse>(
              eventId,
              `/events/${eventId}/dashboard/participants`,
            ),
            eventGet<DashboardAssessmentRecapResponse>(
              eventId,
              `/events/${eventId}/dashboard/assessments/recap`,
            ),
            eventGet<DashboardKapRecapResponse>(
              eventId,
              `/events/${eventId}/dashboard/kap/recap`,
            ),
            eventGet<GraduationDecisionsResponse>(
              eventId,
              `/events/${eventId}/graduations`,
            ),
          ]);
        if (!active) return;
        setParticipants(participantsRes.participants);
        setRecap(recapRes.enrollments);
        setKap(kapRes);
        setDecisions(decisionsRes.decisions);
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

  const assessmentStats = useMemo(() => {
    return recap.reduce(
      (acc, item) => {
        const hasAcademic = item.akademik.submissionCount > 0;
        const hasAttitude = item.sikap.submissionCount > 0;
        if (hasAcademic || hasAttitude) acc.assessed += 1;
        acc.totalAcademic += item.akademik.submissionCount;
        acc.totalAttitude += item.sikap.submissionCount;
        return acc;
      },
      { assessed: 0, totalAcademic: 0, totalAttitude: 0 },
    );
  }, [recap]);

  const decisionStats = useMemo(() => {
    return decisions.reduce(
      (acc, item) => {
        if (item.decision === 'lulus') acc.lulus += 1;
        if (item.decision === 'tidak_lulus') acc.tidakLulus += 1;
        if (item.decision === 'ditunda') acc.ditunda += 1;
        return acc;
      },
      { lulus: 0, tidakLulus: 0, ditunda: 0 },
    );
  }, [decisions]);

  return (
    <RequireEventRole allowed={['OBSERVER']}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2>Observer – Dashboard</h2>
          <div style={{ color: '#666' }}>{getStatusMessage(eventStatus)}</div>
        </div>

        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat data dashboard…</div> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error && !forbidden ? (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <SummaryCard title="Total Peserta" value={participants.length} />
              <SummaryCard title="Peserta Dinilai" value={assessmentStats.assessed} />
              <SummaryCard
                title="Submisi Akademik"
                value={assessmentStats.totalAcademic}
              />
              <SummaryCard
                title="Submisi Sikap"
                value={assessmentStats.totalAttitude}
              />
              <SummaryCard
                title="Respons KAP"
                value={kap ? kap.totalResponses : 0}
              />
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <h3>Monitoring Penilaian</h3>
              {recap.length === 0 ? (
                <EmptyState
                  title="Belum ada data penilaian"
                  description="Rekap penilaian akan muncul setelah pelatih mengisi."
                />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>Peserta</th>
                      <th>Akademik</th>
                      <th>Sikap</th>
                      <th>Submisi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recap.slice(0, 10).map((item) => (
                      <tr key={item.enrollmentId}>
                        <td>{item.displayName ?? item.participantName}</td>
                        <td>{item.akademik.averageScore ?? '-'}</td>
                        <td>{item.sikap.averageScore ?? '-'}</td>
                        <td>
                          {item.akademik.submissionCount +
                            item.sikap.submissionCount}
                        </td>
                        <td>
                          {eventStatus === 'ongoing' ? (
                            <Link
                              href={`/events/${eventId}/observer/assessments/${item.enrollmentId}`}
                              aria-label={`Nilai / Update Penilaian untuk ${item.displayName ?? item.participantName}`}
                            >
                              Nilai / Update Penilaian
                            </Link>
                          ) : (
                            <div style={{ display: 'grid', gap: 4 }}>
                              <button
                                type="button"
                                disabled
                                aria-label={`Nilai / Update Penilaian untuk ${item.displayName ?? item.participantName}`}
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

            <div style={{ display: 'grid', gap: 12 }}>
              <h3>Ringkasan Keputusan Kelulusan</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <SummaryCard title="Lulus" value={decisionStats.lulus} />
                <SummaryCard title="Tidak Lulus" value={decisionStats.tidakLulus} />
                <SummaryCard title="Ditunda" value={decisionStats.ditunda} />
              </div>
              {decisions.length === 0 ? (
                <EmptyState
                  title="Belum ada keputusan"
                  description="Keputusan kelulusan akan muncul setelah ditetapkan."
                />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>Peserta</th>
                      <th>Keputusan</th>
                      <th>Waktu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {decisions.slice(0, 8).map((item) => (
                      <tr key={item.id}>
                        <td>{item.displayName ?? item.participantName}</td>
                        <td>{item.decision}</td>
                        <td>{new Date(item.decidedAt).toLocaleDateString()}</td>
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
