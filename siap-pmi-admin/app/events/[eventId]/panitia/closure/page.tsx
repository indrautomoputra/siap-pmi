'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import MessageBanner from '@/components/MessageBanner';
import ErrorState from '@/components/ErrorState';
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

type GraduationDecision = {
  id?: string;
  enrollmentId?: string;
  enrollment_id?: string;
  participantName?: string;
  displayName?: string;
  decision: string;
  note?: string | null;
  decidedAt?: string | null;
  decided_at?: string | null;
};

export default function PanitiaClosurePage() {
  const { eventId, eventStatus } = useEventContext();
  const [summary, setSummary] = useState<ReportsSummaryResponse | null>(null);
  const [decisions, setDecisions] = useState<GraduationDecision[]>([]);
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
        const [summaryRes, decisionsRes] = await Promise.all([
          eventGet<ReportsSummaryResponse>(
            eventId,
            `/events/${eventId}/reports/summary`,
          ),
          eventGet<GraduationDecision[]>(
            eventId,
            `/events/${eventId}/graduations`,
          ),
        ]);
        if (!active) return;
        setSummary(summaryRes ?? null);
        setDecisions(decisionsRes ?? []);
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

  const participantCountLabel = useMemo(() => {
    if (!summary || typeof summary.totalParticipants !== 'number') {
      return 'Belum tersedia';
    }
    return summary.totalParticipants.toString();
  }, [summary]);

  const assessmentLabel = useMemo(() => {
    if (
      !summary ||
      typeof summary.totalAssessedParticipants !== 'number' ||
      typeof summary.totalParticipants !== 'number'
    ) {
      return 'Belum tersedia';
    }
    return `${summary.totalAssessedParticipants}/${summary.totalParticipants} peserta`;
  }, [summary]);

  const evaluationLabel = useMemo(() => {
    if (
      !summary ||
      typeof summary.totalEvaluationsSubmitted !== 'number' ||
      typeof summary.totalParticipants !== 'number'
    ) {
      return 'Belum tersedia';
    }
    return `${summary.totalEvaluationsSubmitted}/${summary.totalParticipants} peserta`;
  }, [summary]);

  const enrollmentLabel = useMemo(() => {
    if (!summary || typeof summary.totalEnrollments !== 'number') {
      return 'Belum tersedia';
    }
    return `${summary.totalEnrollments} enrollment`;
  }, [summary]);

  const decisionLabel = useMemo(() => {
    if (!decisions || decisions.length === 0) {
      return 'Belum tersedia';
    }
    return `${decisions.length} keputusan`;
  }, [decisions]);

  const checklistHasData = useMemo(() => {
    return summary !== null || decisions.length > 0;
  }, [summary, decisions]);

  const checklistItems = useMemo(
    () => [
      { key: 'enrollment', label: 'Enrollment finalisasi', value: enrollmentLabel },
      { key: 'assessment', label: 'Assessment terkumpul', value: assessmentLabel },
      { key: 'evaluation', label: 'Evaluasi peserta terkumpul', value: evaluationLabel },
      { key: 'graduation', label: 'Keputusan kelulusan dicatat', value: decisionLabel },
      { key: 'archive', label: 'Arsip laporan tersedia', value: 'Belum tersedia' },
    ],
    [assessmentLabel, decisionLabel, enrollmentLabel, evaluationLabel],
  );

  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <EventHeader />
        <div>
          <h2>Penutupan Event</h2>
          <div style={{ color: '#666' }}>
            Halaman ini bersifat read-only untuk arsip operasional.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        <MessageBanner
          variant="info"
          message="Checklist di bawah adalah indikator status berdasarkan data yang tersedia."
        />
        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat ringkasan penutupan…</div> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error && !forbidden ? (
          <>
            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Ringkasan Event</div>
              <div style={{ display: 'grid', gap: 6, color: '#555' }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <strong>Status event</strong>
                  <span>{eventStatus}</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <strong>Tanggal mulai</strong>
                  <span>Belum tersedia</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <strong>Tanggal selesai</strong>
                  <span>Belum tersedia</span>
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <strong>Jumlah peserta</strong>
                  <span>{participantCountLabel}</span>
                </div>
              </div>
            </div>

            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Checklist Penutupan (View-only)
              </div>
              {!checklistHasData ? (
                <EmptyState
                  title="Data penutupan belum tersedia"
                  description="Ringkasan penutupan dan checklist akan tampil setelah seluruh dokumen lengkap."
                />
              ) : null}
              <div style={{ display: 'grid', gap: 10 }}>
                {checklistItems.map((item) => (
                  <div
                    key={item.key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: 8,
                    }}
                  >
                    <div>{item.label}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 999,
                          border: '1px solid #cce5ff',
                          background: '#e7f1ff',
                          color: '#004085',
                        }}
                      >
                        Info
                      </span>
                      <span style={{ color: '#555' }}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </>
        ) : null}
      </div>
    </RequireEventRole>
  );
}
