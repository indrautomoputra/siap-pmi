'use client';
import { useEffect, useState } from 'react';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import StatusBanner from '@/components/StatusBanner';
import { eventGet, ForbiddenError } from '@/lib/eventApi';

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

const getParticipantName = (item: GraduationDecision) =>
  item.displayName ??
  item.participantName ??
  item.enrollmentId ??
  item.enrollment_id ??
  '-';

const getDecisionLabel = (decision?: string) => {
  if (!decision) return '-';
  const normalized = decision.toLowerCase();
  if (normalized === 'lulus') return 'LULUS';
  if (normalized === 'tidak_lulus' || normalized === 'tidak lulus')
    return 'TIDAK_LULUS';
  if (normalized === 'ditunda') return 'DITUNDA';
  return decision.toUpperCase().replace(/\s+/g, '_');
};

const getDecidedAtLabel = (item: GraduationDecision) => {
  const value = item.decidedAt ?? item.decided_at;
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

export default function PanitiaGraduationsPage() {
  const { eventId, eventStatus } = useEventContext();
  const [items, setItems] = useState<GraduationDecision[]>([]);
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
        const data = await eventGet<GraduationDecision[]>(
          eventId,
          `/events/${eventId}/graduations`,
        );
        if (!active) return;
        setItems(data ?? []);
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

  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <EventHeader />
        <div>
          <h2>Panitia – Kelulusan</h2>
          <div style={{ color: '#666' }}>
            Keputusan kelulusan bersifat read-only.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        {forbidden ? <Forbidden /> : null}
        {loading ? <div>Memuat keputusan kelulusan…</div> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error && !forbidden ? (
          items.length === 0 ? (
            <EmptyState
              title="Keputusan kelulusan belum ditetapkan."
              description="Keputusan akan muncul setelah rapat kelulusan."
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Nama Peserta</th>
                  <th>Status</th>
                  <th>Catatan Rapat</th>
                  <th>Tanggal Keputusan</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id ?? item.enrollmentId ?? item.enrollment_id}>
                    <td>{getParticipantName(item)}</td>
                    <td>{getDecisionLabel(item.decision)}</td>
                    <td>{item.note ?? '-'}</td>
                    <td>{getDecidedAtLabel(item)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
      </div>
    </RequireEventRole>
  );
}
