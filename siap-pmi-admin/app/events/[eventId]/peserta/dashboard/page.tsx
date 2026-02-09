'use client';
import { useEffect, useState } from 'react';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import SummaryCard from '@/components/SummaryCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { getSupabaseClient } from '@/lib/supabaseClient';

type EnrollmentItem = {
  id: string;
  status: string;
  review_status: string;
  registered_at: string;
};

const getStatusMessage = (status: string) => {
  if (status === 'draft') return 'Event belum dimulai. Operasional dinonaktifkan.';
  if (status === 'published')
    return 'Event sudah dipublikasikan. Peserta dapat melihat informasi.';
  if (status === 'ongoing') return 'Event berlangsung. Data tampil read-only.';
  if (status === 'completed')
    return 'Event selesai. Menampilkan rekap akhir.';
  return 'Event dibatalkan.';
};

export default function PesertaDashboardPage() {
  const { eventId, eventStatus } = useEventContext();
  const [enrollment, setEnrollment] = useState<EnrollmentItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const sb = getSupabaseClient();
        if (!sb) {
          setError('Konfigurasi Supabase belum tersedia');
          return;
        }
        const { data: userData } = await sb.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) {
          setError('User tidak ditemukan');
          return;
        }
        const { data, error: supaError } = await sb
          .from('enrollments')
          .select('id, status, review_status, registered_at')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .limit(1);
        if (supaError) {
          setError(supaError.message);
          return;
        }
        if (!active) return;
        if (data && data.length > 0) {
          setEnrollment(data[0] as EnrollmentItem);
        } else {
          setEnrollment(null);
        }
      } catch (e) {
        if (!active) return;
        setError((e as Error).message);
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
    <RequireEventRole allowed={['PESERTA']}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2>Peserta – Dashboard</h2>
          <div style={{ color: '#666' }}>{getStatusMessage(eventStatus)}</div>
        </div>

        {loading ? <div>Memuat status peserta…</div> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error ? (
          <>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <SummaryCard title="Event" value={eventId} />
              <SummaryCard title="Status Event" value={eventStatus} />
              <SummaryCard
                title="Status Enrollment"
                value={enrollment ? enrollment.status : '-'}
              />
              <SummaryCard
                title="Review Enrollment"
                value={enrollment ? enrollment.review_status : '-'}
              />
            </div>

            {enrollment ? (
              <div>
                <div>Terdaftar sejak</div>
                <div>{new Date(enrollment.registered_at).toLocaleDateString()}</div>
              </div>
            ) : (
              <EmptyState
                title="Belum terdaftar"
                description="Status enrollment belum ditemukan untuk event ini."
              />
            )}
          </>
        ) : null}
      </div>
    </RequireEventRole>
  );
}
