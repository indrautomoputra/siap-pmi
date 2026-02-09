'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function PelatihAssessmentPage() {
  const params = useParams();
  const participantId = params?.participantId as string | undefined;
  const { eventId, eventStatus } = useEventContext();
  const [items, setItems] = useState<AssessmentScoreItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setSuccess(null);
    setForbidden(false);
    try {
      const res = await eventFetch(eventId, `/events/${eventId}/assessments`);
      if (!res.ok) {
        setError(await parseErrorMessage(res));
        return;
      }
      const data = (await res.json()) as AssessmentScoreListResponseDto;
      setItems(data.items ?? []);
    } catch (e) {
      if (e instanceof ForbiddenError) {
        setForbidden(true);
      } else {
        setError((e as Error).message);
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
    if (!participantId || !canWrite || currentAssessment) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(payloadText) as Record<string, unknown>;
    } catch {
      setError('Format JSON tidak valid.');
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
        setError(await parseErrorMessage(res));
        return;
      }
      setSuccess('Penilaian berhasil dikirim.');
      await load();
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
    <RequireEventRole allowed={['PELATIH']}>
      <div style={{ padding: 16, maxWidth: 720 }}>
        <h2>Pelatih – Penilaian Peserta</h2>
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
        {!loading && !forbidden && error && <ErrorState message={error} retry={load} />}
        {!loading && !forbidden && !error && !participantId && (
          <EmptyState title="Peserta tidak ditemukan." />
        )}
        {!loading && !forbidden && !error && participantId && (
          <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
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
            {currentAssessment && (
              <div style={{ color: '#2e7d32', marginBottom: 12 }}>
                Penilaian sudah dikirim pada {currentAssessment.createdAt}
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
              disabled={!canWrite || submitting || !!currentAssessment}
            >
              {submitting ? 'Mengirim...' : 'Kirim Penilaian'}
            </button>
          </form>
        )}
      </div>
    </RequireEventRole>
  );
}
