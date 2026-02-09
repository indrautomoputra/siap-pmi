'use client';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';

export default function PanitiaDashboardPage() {
  const { eventId, eventStatus, role } = useEventContext();
  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16 }}>
        <h2>Panitia – Dashboard</h2>
        <p>Event: {eventId}</p>
        <p>Role: {role}</p>
        <p>Status Event: {eventStatus}</p>
      </div>
    </RequireEventRole>
  );
}
