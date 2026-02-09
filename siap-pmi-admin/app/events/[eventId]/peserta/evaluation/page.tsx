'use client';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';

export default function PesertaEvaluationPage() {
  const { eventId, eventStatus, role } = useEventContext();
  return (
    <RequireEventRole allowed={['PESERTA']}>
      <div style={{ padding: 16 }}>
        <h2>Peserta – Evaluasi/KAP</h2>
        <p>Event: {eventId}</p>
        <p>Role: {role}</p>
        <p>Status Event: {eventStatus}</p>
      </div>
    </RequireEventRole>
  );
}
