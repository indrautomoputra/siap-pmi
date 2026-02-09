'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import { eventFetch, ForbiddenError } from '@/lib/eventApi';
import { getSupabaseClient } from '@/lib/supabaseClient';

type EvaluationMeResponse = {
  id: string;
  eventId: string;
  enrollmentId: string;
  responses: Record<string, unknown>;
  submittedAt: string;
};

type EnrollmentRow = {
  id: string;
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

export default function PesertaEvaluationPage() {
  const { eventId, eventStatus } = useEventContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationMeResponse | null>(
    null,
  );
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [responsesText, setResponsesText] = useState('{\n  \n}');

  const canWrite = useMemo(
    () => eventStatus === 'published' || eventStatus === 'ongoing',
    [eventStatus],
  );

  const loadEnrollment = useCallback(async (): Promise<string | null> => {
    const sb = getSupabaseClient();
    if (!sb) {
      setError('Supabase client belum terkonfigurasi.');
      return null;
    }
    const { data: userData } = await sb.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setError('User tidak ditemukan.');
      return null;
    }
    const { data, error: sbError } = await sb
      .from('enrollments')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .limit(1);
    if (sbError) {
      setError(sbError.message);
      return null;
    }
    return (data?.[0] as EnrollmentRow | undefined)?.id ?? null;
  }, [eventId]);

  const loadEvaluation = useCallback(async () => {
    const res = await eventFetch(eventId, `/events/${eventId}/evaluations/me`);
    if (res.status === 404) {
      setEvaluation(null);
      return;
    }
    if (!res.ok) {
      setError(await parseErrorMessage(res));
      return;
    }
    const data = (await res.json()) as EvaluationMeResponse;
    setEvaluation(data);
    setResponsesText(JSON.stringify(data.responses ?? {}, null, 2));
  }, [eventId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setForbidden(false);
    try {
      const enrollment = await loadEnrollment();
      setEnrollmentId(enrollment);
      if (enrollment) {
        await loadEvaluation();
      }
    } catch (e) {
      if (e instanceof ForbiddenError) {
        setForbidden(true);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [loadEnrollment, loadEvaluation]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollmentId || !canWrite || evaluation) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    let responses: Record<string, unknown>;
    try {
      responses = JSON.parse(responsesText) as Record<string, unknown>;
    } catch {
      setError('Format JSON tidak valid.');
      setSubmitting(false);
      return;
    }
    try {
      const res = await eventFetch(eventId, `/events/${eventId}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentId, responses }),
      });
      if (!res.ok) {
        setError(await parseErrorMessage(res));
        return;
      }
      setSuccess('Evaluasi sudah dikirim.');
      await loadEvaluation();
    } catch (e) {
      if (e instanceof ForbiddenError) {
        setForbidden(true);
      } else {
        setError((e as Error).message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireEventRole allowed={['PESERTA']}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <h2>Peserta – Evaluasi Pelatihan</h2>
        <div style={{ marginBottom: 12 }}>Event: {eventId}</div>
        <div style={{ marginBottom: 12 }}>Status Event: {eventStatus}</div>
        {!canWrite && (
          <EmptyState
            title="Evaluasi tidak dapat diisi pada status ini."
            description="Evaluasi hanya dapat dikirim saat event berstatus published atau ongoing."
          />
        )}
        {forbidden && <Forbidden />}
        {loading && <p>Memuat...</p>}
        {!loading && !forbidden && error && <ErrorState message={error} retry={load} />}
        {!loading && !forbidden && !error && !enrollmentId && (
          <EmptyState
            title="Enrollment tidak ditemukan."
            description="Pastikan Anda terdaftar sebagai peserta pada event ini."
          />
        )}
        {!loading && !forbidden && !error && enrollmentId && (
          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Responses (JSON)
              <textarea
                value={responsesText}
                onChange={(e) => setResponsesText(e.target.value)}
                rows={10}
                style={{ width: '100%', marginTop: 6 }}
                readOnly={!canWrite || !!evaluation}
              />
            </label>
            {evaluation && (
              <div style={{ color: '#2e7d32', marginBottom: 12 }}>
                Evaluasi sudah dikirim pada {evaluation.submittedAt}
              </div>
            )}
            {success && (
              <div style={{ color: '#2e7d32', marginBottom: 12 }}>{success}</div>
            )}
            {error && (
              <div style={{ color: '#b71c1c', marginBottom: 12 }}>{error}</div>
            )}
            <button
              type="submit"
              disabled={!canWrite || submitting || !!evaluation}
            >
              {submitting ? 'Mengirim...' : 'Kirim Evaluasi'}
            </button>
          </form>
        )}
      </div>
    </RequireEventRole>
  );
}
