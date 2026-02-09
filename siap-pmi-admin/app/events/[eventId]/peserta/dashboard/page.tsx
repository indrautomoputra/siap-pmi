'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import SummaryCard from '@/components/SummaryCard';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { eventFetch, ForbiddenError } from '@/lib/eventApi';

type EnrollmentItem = {
  id: string;
  status: string;
  review_status: string;
  registered_at: string;
};

type EvaluationMeResponse = {
  id: string;
  submittedAt: string;
};

const parseErrorMessage = async (res: Response): Promise<string> => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = (await res.json()) as { message?: string | string[]; error?: string };
      if (Array.isArray(data.message)) {
        return data.message.join(', ');
      }
      if (typeof data.message === 'string') {
        return data.message;
      }
      if (typeof data.error === 'string') {
        return data.error;
      }
    } catch {
      return `Gagal memproses respons (${res.status})`;
    }
  }
  try {
    const text = await res.text();
    if (text) return text;
  } catch {
    return `Gagal memproses respons (${res.status})`;
  }
  return `Request gagal (${res.status})`;
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
  const [evaluation, setEvaluation] = useState<EvaluationMeResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const canWrite = useMemo(
    () => eventStatus === 'published' || eventStatus === 'ongoing',
    [eventStatus],
  );

  const disabledReason = useMemo(() => {
    if (eventStatus === 'draft') return 'Event belum dimulai.';
    if (eventStatus === 'completed') return 'Event sudah selesai.';
    if (eventStatus === 'cancelled') return 'Event dibatalkan.';
    return '';
  }, [eventStatus]);

  useEffect(() => {
    if (!eventId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);
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
        if (data && data.length > 0) {
          const res = await eventFetch(
            eventId,
            `/events/${eventId}/evaluations/me`,
          );
          if (res.status === 404) {
            setEvaluation(null);
          } else if (!res.ok) {
            setError(await parseErrorMessage(res));
          } else {
            const evaluationData = (await res.json()) as EvaluationMeResponse;
            setEvaluation(evaluationData);
          }
        } else {
          setEvaluation(null);
        }
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
    <RequireEventRole allowed={['PESERTA']}>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h2>Peserta – Dashboard</h2>
          <div style={{ color: '#666' }}>{getStatusMessage(eventStatus)}</div>
        </div>

        {loading ? <div>Memuat status peserta…</div> : null}
        {forbidden ? <Forbidden /> : null}
        {error ? <ErrorState message={error} /> : null}

        {!loading && !error && !forbidden ? (
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

            <div style={{ display: 'grid', gap: 8 }}>
              <h3>Evaluasi Peserta</h3>
              {evaluation ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ color: '#2e7d32' }}>Sudah terkirim</div>
                  <Link
                    href={`/events/${eventId}/peserta/evaluation`}
                    aria-label="Lihat Evaluasi (read-only)"
                  >
                    Lihat Evaluasi (read-only)
                  </Link>
                </div>
              ) : canWrite ? (
                <Link
                  href={`/events/${eventId}/peserta/evaluation`}
                  aria-label="Isi Evaluasi"
                >
                  Isi Evaluasi
                </Link>
              ) : (
                <div style={{ display: 'grid', gap: 4 }}>
                  <button type="button" disabled aria-label="Isi Evaluasi">
                    Isi Evaluasi
                  </button>
                  {disabledReason ? (
                    <div style={{ color: '#666', fontSize: 12 }}>
                      {disabledReason}
                    </div>
                  ) : null}
                </div>
              )}
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
