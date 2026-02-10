'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventContext } from '../../EventContext';
import EventHeader from '../../_components/EventHeader';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import MessageBanner from '@/components/MessageBanner';
import Forbidden from '@/components/Forbidden';
import DisabledActionBanner from '@/components/DisabledActionBanner';
import StatusBanner from '@/components/StatusBanner';
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

type ErrorDetail = {
  title: string;
  message: string;
  details?: string[];
};

type SuccessDetail = {
  title: string;
  message: string;
};

const parseErrorDetails = async (
  res: Response,
  title: string,
): Promise<ErrorDetail> => {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const data = (await res.json()) as {
        message?: string | string[];
        error?: string;
        details?: string[] | Record<string, string[] | string>;
      };
      if (Array.isArray(data.message)) {
        return {
          title,
          message: data.message.join(', '),
          details: data.message,
        };
      }
      if (typeof data.message === 'string') {
        return {
          title,
          message: data.message,
          details: Array.isArray(data.details)
            ? data.details
            : data.details && typeof data.details === 'object'
            ? Object.entries(data.details).flatMap(([key, value]) =>
                Array.isArray(value)
                  ? value.map((item) => `${key}: ${item}`)
                  : [`${key}: ${value}`],
              )
            : undefined,
        };
      }
      if (typeof data.error === 'string') {
        return { title, message: data.error };
      }
    } catch {
      return { title, message: `Gagal memproses respons (${res.status})` };
    }
  }
  try {
    const text = await res.text();
    if (text) return { title, message: text };
  } catch {
    return { title, message: `Gagal memproses respons (${res.status})` };
  }
  return { title, message: `Request gagal (${res.status})` };
};

export default function PesertaEvaluationPage() {
  const router = useRouter();
  const { eventId, eventStatus } = useEventContext();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<ErrorDetail | null>(null);
  const [submitError, setSubmitError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState<SuccessDetail | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationMeResponse | null>(
    null,
  );
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [responsesText, setResponsesText] = useState('{\n  \n}');

  const canWrite = useMemo(() => eventStatus === 'ongoing', [eventStatus]);
  const disabledReason = useMemo(() => {
    if (eventStatus !== 'ongoing') {
      return `Status event ${eventStatus}. Evaluasi hanya dapat dikirim saat event ongoing.`;
    }
    if (evaluation) {
      return 'Evaluasi sudah dikirim.';
    }
    return '';
  }, [eventStatus, evaluation]);

  const loadEnrollment = useCallback(async (): Promise<string | null> => {
    const sb = getSupabaseClient();
    if (!sb) {
      setLoadError({
        title: 'Gagal memuat',
        message: 'Supabase client belum terkonfigurasi.',
      });
      return null;
    }
    const { data: userData } = await sb.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setLoadError({ title: 'Gagal memuat', message: 'User tidak ditemukan.' });
      return null;
    }
    const { data, error: sbError } = await sb
      .from('enrollments')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .limit(1);
    if (sbError) {
      setLoadError({ title: 'Gagal memuat', message: sbError.message });
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
      setLoadError(await parseErrorDetails(res, 'Gagal memuat'));
      return;
    }
    const data = (await res.json()) as EvaluationMeResponse;
    setEvaluation(data);
    setResponsesText(JSON.stringify(data.responses ?? {}, null, 2));
  }, [eventId]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
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
        setLoadError({
          title: 'Gagal memuat',
          message: (e as Error).message,
        });
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
    if (submitting || !enrollmentId || !canWrite || evaluation) return;
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(null);
    let responses: Record<string, unknown>;
    try {
      responses = JSON.parse(responsesText) as Record<string, unknown>;
    } catch {
      setSubmitError({
        title: 'Format tidak valid',
        message: 'Format JSON tidak valid.',
      });
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
        setSubmitError(await parseErrorDetails(res, 'Gagal mengirim'));
        return;
      }
      setSuccess({
        title: 'Evaluasi tersimpan',
        message: 'Data tersimpan. Perubahan tidak dapat dilakukan.',
      });
      await loadEvaluation();
    } catch (e) {
      if (e instanceof ForbiddenError) {
        setForbidden(true);
      } else {
        setSubmitError({
          title: 'Gagal mengirim',
          message: (e as Error).message,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RequireEventRole allowed={['PESERTA']}>
      <div style={{ padding: 16, maxWidth: 720, display: 'grid', gap: 12 }}>
        <EventHeader />
        <div>
          <h2>Peserta – Evaluasi Pelatihan</h2>
          <div style={{ color: '#666' }}>
            Evaluasi ini tidak mempengaruhi kelulusan.
          </div>
        </div>
        <StatusBanner status={eventStatus} />
        {!canWrite || evaluation ? (
          <DisabledActionBanner reason={disabledReason} />
        ) : null}
        {forbidden && <Forbidden />}
        {loading && <p>Memuat data evaluasi…</p>}
        {!loading && !forbidden && loadError && (
          <MessageBanner
            variant="error"
            title={loadError.title}
            message={loadError.message}
            details={loadError.details}
            actionLabel="Coba lagi"
            onAction={load}
          />
        )}
        {!loading && !forbidden && !loadError && !enrollmentId && (
          <EmptyState
            title="Enrollment tidak ditemukan."
            description="Pastikan Anda terdaftar sebagai peserta pada event ini."
          />
        )}
        {!loading && !forbidden && !loadError && enrollmentId && (
          <form onSubmit={onSubmit} style={{ marginTop: 16 }} aria-busy={loading || submitting}>
            {evaluation && !success ? (
              <MessageBanner
                variant="success"
                title="Evaluasi sudah terkirim"
                message={`Terkirim pada ${new Date(
                  evaluation.submittedAt,
                ).toLocaleString()}. Data bersifat read-only.`}
              />
            ) : null}
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
            {success && (
              <MessageBanner
                variant="success"
                title={success.title}
                message={success.message}
              />
            )}
            {submitError && (
              <MessageBanner
                variant="error"
                title={submitError.title}
                message={submitError.message}
                details={submitError.details}
              />
            )}
            <button
              type="submit"
              aria-label="Kirim Evaluasi"
              disabled={!canWrite || loading || submitting || !!evaluation}
            >
              {submitting ? 'Mengirim Evaluasi…' : 'Kirim Evaluasi'}
            </button>
            {evaluation || success ? (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/events/${eventId}/peserta/dashboard`)
                  }
                  aria-label="Kembali ke Dashboard Peserta"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            ) : null}
          </form>
        )}
      </div>
    </RequireEventRole>
  );
}
