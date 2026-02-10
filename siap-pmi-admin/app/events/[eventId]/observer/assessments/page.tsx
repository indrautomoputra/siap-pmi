'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import DisabledActionBanner from '@/components/DisabledActionBanner';
import StatusBanner from '@/components/StatusBanner';
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

const getDisabledReason = (status: string) => {
  if (status === 'draft' || status === 'published') {
    return 'Event belum berjalan, aksi tulis belum tersedia';
  }
  if (status === 'completed' || status === 'cancelled') {
    return 'Event sudah selesai, semua read-only';
  }
  return '';
};

const getAssessmentStatus = (item: ReportsParticipantItem) => {
  if (item.hasAssessment) return 'Terkirim';
  if (item.lastAssessmentAt) return 'Draft';
  return 'Belum Dinilai';
};

export default function ObserverAssessmentsPage() {
  const { eventId, eventStatus } = useEventContext();
  const [participants, setParticipants] = useState<ReportsParticipantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      setForbidden(false);
      try {
        const res = await eventGet<ReportsParticipantsResponse>(
          eventId,
          `/events/${eventId}/reports/participants`,
        );
        if (!active) return;
        setParticipants(res.participants ?? []);
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
  const progress = participants.length
    ? Math.round((assessedCount / participants.length) * 100)
    : 0;

  return (
    <RequireEventRole allowed={['OBSERVER']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <EventHeader />
        <div>
          <h2>Observer – Daftar Penilaian Peserta</h2>
          <div style={{ color: '#666' }}>
            Penilaian hanya dapat dikirim saat event ongoing.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        {eventStatus !== 'ongoing' ? (
          <DisabledActionBanner
            reason={`Status event ${eventStatus}. Tautan penilaian tetap tersedia, aksi submit dinonaktifkan.`}
          />
        ) : null}
        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat daftar peserta…</div> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && !forbidden ? (
          participants.length === 0 ? (
            <EmptyState
              title="Belum ada peserta"
              description="Daftar peserta akan muncul setelah enrollment tersedia."
            />
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Progress Penilaian</div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: '#e5e7eb',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: '#22c55e',
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>
                  {assessedCount}/{participants.length} peserta dinilai ({progress}%)
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th>Peserta</th>
                    <th>Status Penilaian</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((item) => (
                    <tr key={item.enrollmentId}>
                      <td>{item.participantName ?? item.enrollmentId}</td>
                      <td>{getAssessmentStatus(item)}</td>
                      <td>
                        {eventStatus === 'ongoing' ? (
                          <Link
                            href={`/events/${eventId}/observer/assessments/${item.enrollmentId}`}
                          >
                            Nilai
                          </Link>
                        ) : (
                          <div style={{ display: 'grid', gap: 4 }}>
                            <button type="button" disabled>
                              Lihat
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
            </div>
          )
        ) : null}
      </div>
    </RequireEventRole>
  );
}
