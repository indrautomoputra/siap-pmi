'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventContext } from '../../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Forbidden from '@/components/Forbidden';
import { eventFetch, ForbiddenError } from '@/lib/eventApi';

type AssessmentScoreItemDto = {
  id: string;
  eventId: string;
  instrumentId: string;
  assesseeEnrollmentId: string;
  assessorUserId: string;
  type: 'akademik' | 'sikap';
  payload: Record<string, unknown>;
  createdAt: string;
};

type AssessmentScoreListResponseDto = {
  eventId: string;
  items: AssessmentScoreItemDto[];
};

type ErrorDetail = {
  title: string;
  message: string;
  details?: string[];
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

export default function ObserverAssessmentPage() {
  const params = useParams();
  const participantId = params?.participantId as string | undefined;
  const router = useRouter();
  const { eventId, eventStatus } = useEventContext();
  const [items, setItems] = useState<AssessmentScoreItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<ErrorDetail | null>(null);
  const [submitError, setSubmitError] = useState<ErrorDetail | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [type, setType] = useState<'akademik' | 'sikap'>('akademik');
  const [instrumentId, setInstrumentId] = useState('');
  const [payloadText, setPayloadText] = useState('{\n  \n}');

  const canWrite = eventStatus === 'ongoing';

  const currentAssessment = useMemo(
    () =>
      items.find(
        (item) =>
          item.assesseeEnrollmentId === participantId && item.type === type,
      ) ?? null,
    [items, participantId, type],
  );

  useEffect(() => {
    if (currentAssessment) {
      setPayloadText(JSON.stringify(currentAssessment.payload ?? {}, null, 2));
      setInstrumentId(currentAssessment.instrumentId ?? '');
    } else {
      setPayloadText('{\n  \n}');
      setInstrumentId('');
    }
  }, [currentAssessment]);

  const load = useCallback(async () => {
    if (!participantId) return;
    setLoading(true);
    setLoadError(null);
    setSuccess(null);
    setForbidden(false);
    try {
      const res = await eventFetch(eventId, `/events/${eventId}/assessments`);
      if (!res.ok) {
        setLoadError(await parseErrorDetails(res, 'Gagal memuat'));
        return;
      }
      const data = (await res.json()) as AssessmentScoreListResponseDto;
      setItems(data.items ?? []);
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
  }, [eventId, participantId]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !participantId || !canWrite || currentAssessment) return;
    setSubmitting(true);
    setSubmitError(null);
    setSuccess(null);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>;
    } catch {
      setSubmitError({
        title: 'Format tidak valid',
        message: 'Format JSON tidak valid.',
      });
      setSubmitting(false);
      return;
    }
    try {
      const body: {
        assesseeEnrollmentId: string;
        type: 'akademik' | 'sikap';
        payload: Record<string, unknown>;
        instrumentId?: string;
      } = {
        assesseeEnrollmentId: participantId,
        type,
        payload,
      };
      if (instrumentId) {
        body.instrumentId = instrumentId;
      }
      const res = await eventFetch(eventId, `/events/${eventId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setSubmitError(await parseErrorDetails(res, 'Gagal mengirim'));
        return;
      }
      setSuccess('Penilaian berhasil dikirim.');
      await load();
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
    <RequireEventRole allowed={['OBSERVER']}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <h2>Observer – Penilaian Peserta</h2>
        <div style={{ marginBottom: 12 }}>Event: {eventId}</div>
        <div style={{ marginBottom: 12 }}>Peserta: {participantId ?? '-'}</div>
        <div style={{ marginBottom: 12 }}>Status Event: {eventStatus}</div>
        {!canWrite && (
          <EmptyState
            title="Penilaian hanya dapat dikirim saat event ongoing."
            description="Selain ongoing, penilaian bersifat read-only."
          />
        )}
        {forbidden && <Forbidden />}
        {loading && <p>Memuat...</p>}
        {!loading && !forbidden && loadError && (
          <ErrorState
            title={loadError.title}
            message={loadError.message}
            details={loadError.details}
            retry={load}
          />
        )}
        {!loading && !forbidden && !loadError && !participantId && (
          <EmptyState title="Peserta tidak ditemukan." />
        )}
        {!loading && !forbidden && !loadError && participantId && (
          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
            {!canWrite || currentAssessment ? (
              <EmptyState
                title="Mode read-only"
                description="Penilaian tidak dapat diubah pada status ini."
              />
            ) : null}
            <label style={{ display: 'block', marginBottom: 8 }}>
              Tipe Penilaian
              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value as 'akademik' | 'sikap')
                }
                style={{ display: 'block', marginTop: 6 }}
                disabled={!canWrite || !!currentAssessment}
              >
                <option value="akademik">Akademik</option>
                <option value="sikap">Sikap</option>
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Instrument ID (Opsional)
              <input
                type="text"
                value={instrumentId}
                onChange={(e) => setInstrumentId(e.target.value)}
                style={{ width: '100%', marginTop: 6 }}
                readOnly={!canWrite || !!currentAssessment}
              />
            </label>
            <label style={{ display: 'block', marginBottom: 8 }}>
              Payload (JSON)
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={10}
                style={{ width: '100%', marginTop: 6 }}
                readOnly={!canWrite || !!currentAssessment}
              />
            </label>
            {success && (
              <div
                style={{
                  border: '1px solid #c8e6c9',
                  background: '#e8f5e9',
                  color: '#1b5e20',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                {success}
              </div>
            )}
            {currentAssessment && (
              <div
                style={{
                  border: '1px solid #c8e6c9',
                  background: '#e8f5e9',
                  color: '#1b5e20',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12,
                }}
              >
                Penilaian sudah dikirim pada {currentAssessment.createdAt}
              </div>
            )}
            {submitError && (
              <ErrorState
                title={submitError.title}
                message={submitError.message}
                details={submitError.details}
              />
            )}
            <button
              type="submit"
              disabled={!canWrite || submitting || !!currentAssessment}
            >
              {submitting ? 'Mengirim...' : 'Kirim Penilaian'}
            </button>
            {currentAssessment || success ? (
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/events/${eventId}/observer/dashboard`)
                  }
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
