'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import SummaryCard from '@/components/SummaryCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import DashboardCard from '@/components/DashboardCard';
import StatusBanner from '@/components/StatusBanner';
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

export default function PanitiaDashboardPage() {
  const { eventId, eventStatus } = useEventContext();
  const [participants, setParticipants] = useState<DashboardParticipantItem[]>(
    [],
  );
  const [summary, setSummary] = useState<ReportsSummaryResponse | null>(null);
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
        const [participantsRes, summaryRes, decisionsRes] = await Promise.all([
          eventGet<DashboardParticipantsResponse>(
            eventId,
            `/events/${eventId}/dashboard/participants`,
          ),
          eventGet<ReportsSummaryResponse>(
            eventId,
            `/events/${eventId}/reports/summary`,
          ),
          eventGet<GraduationDecisionsResponse>(
            eventId,
            `/events/${eventId}/graduations`,
          ),
        ]);
        if (!active) return;
        setParticipants(participantsRes.participants);
        setSummary(summaryRes);
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

  const reviewStats = useMemo(() => {
    return participants.reduce(
      (acc, item) => {
        if (item.reviewStatus === 'approved') acc.approved += 1;
        if (item.reviewStatus === 'rejected') acc.rejected += 1;
        if (item.reviewStatus === 'pending_review') acc.pending += 1;
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0 },
    );
  }, [participants]);

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

  const assessmentRate = summary
    ? `${Math.round(summary.assessmentCoverageRate * 100)}%`
    : '-';
  const evaluationRate = summary
    ? `${Math.round(summary.evaluationSubmissionRate * 100)}%`
    : '-';

  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <EventHeader />
        <div>
          <h2>Panitia – Dashboard</h2>
          <div style={{ color: '#666' }}>
            Ringkasan operasional event dan keputusan kelulusan.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        <div style={{ display: 'grid', gap: 12 }}>
          <h3>Aksi Cepat</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <DashboardCard
              title="Enrollment"
              description="Lihat daftar peserta dan status enrollment."
              href={`/events/${eventId}/enrollments`}
            />
            <DashboardCard
              title="Kelulusan"
              description="Rekap keputusan rapat kelulusan (read-only)."
              href={`/events/${eventId}/graduations`}
            />
            <DashboardCard
              title="Penutupan"
              description="Checklist penutupan event (read-only)."
              href={`/events/${eventId}/closure`}
            />
          </div>
        </div>

        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat data dashboard…</div> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error && !forbidden ? (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <SummaryCard title="Total Peserta" value={participants.length} />
              <SummaryCard title="Review Pending" value={reviewStats.pending} />
              <SummaryCard title="Review Disetujui" value={reviewStats.approved} />
              <SummaryCard title="Review Ditolak" value={reviewStats.rejected} />
              <SummaryCard title="Cakupan Penilaian" value={assessmentRate} />
              <SummaryCard
                title="Pengumpulan Evaluasi"
                value={evaluationRate}
              />
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <h3>Daftar Peserta</h3>
              {participants.length === 0 ? (
                <EmptyState
                  title="Belum ada peserta"
                  description="Daftar peserta akan muncul setelah pendaftaran masuk."
                />
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>Nama</th>
                      <th>Status</th>
                      <th>Review</th>
                      <th>Terdaftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.slice(0, 10).map((item) => (
                      <tr key={item.enrollmentId}>
                        <td>{item.displayName ?? item.participantName}</td>
                        <td>{item.status}</td>
                        <td>{item.reviewStatus}</td>
                        <td>{new Date(item.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <h3>Status Keputusan Kelulusan</h3>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <SummaryCard title="Lulus" value={decisionStats.lulus} />
                <SummaryCard title="Tidak Lulus" value={decisionStats.tidakLulus} />
                <SummaryCard title="Ditunda" value={decisionStats.ditunda} />
              </div>
              {decisions.length === 0 ? (
                <EmptyState
                  title="Belum ada keputusan"
                  description="Keputusan kelulusan akan tampil setelah ditetapkan."
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
