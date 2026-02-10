'use client';
import { useEffect, useState } from 'react';
import { useEventContext } from '../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import DisabledActionBanner from '@/components/DisabledActionBanner';
import { apiGet } from '../../../../lib/api';

type Graduation = {
  enrollment_id: string;
  decision: string;
  decided_by?: string | null;
  decided_at?: string | null;
};

export default function GraduationsPage() {
  const { eventId, eventStatus } = useEventContext();
  const [items, setItems] = useState<Graduation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Graduation[]>(
          `/events/${eventId}/graduations`
        );
        setItems(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [eventId]);
  return (
    <RequireEventRole allowed={['PANITIA', 'PELATIH']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div>
          <h2>Kelulusan</h2>
          <div style={{ color: '#666' }}>Keputusan kelulusan bersifat read-only.</div>
        </div>
        {eventStatus !== 'completed' ? (
          <DisabledActionBanner
            reason={`Status event ${eventStatus}. Data kelulusan bersifat ringkasan dan read-only.`}
          />
        ) : null}
        {loading ? <div>Memuat keputusan…</div> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !error ? (
          items.length === 0 ? (
            <EmptyState
              title="Belum ada keputusan kelulusan"
              description="Keputusan akan muncul setelah rapat kelulusan."
            />
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th>Enrollment</th>
                  <th>Keputusan</th>
                  <th>Oleh</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.enrollment_id}>
                    <td>{it.enrollment_id}</td>
                    <td>{it.decision}</td>
                    <td>{it.decided_by ?? '-'}</td>
                    <td>{it.decided_at ?? '-'}</td>
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
