'use client';
import { useEffect, useMemo, useState } from 'react';
import { useEventContext } from '../EventContext';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import DisabledActionBanner from '@/components/DisabledActionBanner';
import MessageBanner from '@/components/MessageBanner';
import PermissionDenied from '@/components/PermissionDenied';
import { apiGet } from '../../../../lib/api';

type Enrollment = {
  id: string;
  participant_name: string;
  display_name?: string | null;
  status: string;
  review_status: string;
};

export default function EnrollmentsPage() {
  const { eventId, eventStatus, role, loading: roleLoading } = useEventContext();
  const [items, setItems] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Enrollment[]>(
          `/events/${eventId}/enrollments`
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
  const filteredItems = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter(
      (en) =>
        en.id.toLowerCase().includes(q) ||
        en.participant_name.toLowerCase().includes(q) ||
        (en.display_name ?? '').toLowerCase().includes(q) ||
        en.status.toLowerCase().includes(q) ||
        en.review_status.toLowerCase().includes(q),
    );
  }, [items, query]);
  if (roleLoading) {
    return <div style={{ padding: 16 }}>Memuat…</div>;
  }
  if (role && role !== 'PANITIA' && role !== 'PESERTA') {
    return <PermissionDenied reason="Role tidak sesuai untuk halaman ini." />;
  }
  return (
    <div style={{ padding: 16, display: 'grid', gap: 12 }}>
      <div>
        <h2>Enrollments – Daftar Peserta</h2>
        <div style={{ color: '#666' }}>Halaman read-only sesuai role dan status event.</div>
      </div>

      {!role ? (
        <MessageBanner variant="info" message="Role belum terpasang." />
      ) : null}

      {eventStatus !== 'ongoing' ? (
        <DisabledActionBanner reason={`Status event ${eventStatus}. Enrollments hanya dapat dilihat.`} />
      ) : null}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari peserta, ID, status"
          style={{ padding: 8, minWidth: 240 }}
        />
      </div>

      {loading ? <div>Memuat daftar peserta…</div> : null}
      {error ? <ErrorState message={error} /> : null}

      {!loading && !error ? (
        filteredItems.length === 0 ? (
          <EmptyState
            title="Belum ada data peserta"
            description="Daftar peserta akan muncul ketika enrollment tersedia."
          />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left' }}>
                <th>ID</th>
                <th>Nama</th>
                <th>Display</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((en) => (
                <tr key={en.id}>
                  <td>{en.id}</td>
                  <td>{en.participant_name}</td>
                  <td>{en.display_name ?? '-'}</td>
                  <td>{en.status}</td>
                  <td>{en.review_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      ) : null}
    </div>
  );
}
