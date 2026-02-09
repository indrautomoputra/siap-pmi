'use client';
import { useEventContext } from '../../EventContext';
import RequireEventRole from '@/components/RequireEventRole';

export default function ObserverMonitoringPage() {
  const { eventId, eventStatus, role } = useEventContext();
  return (
    <RequireEventRole allowed={['OBSERVER']}>
      <div style={{ padding: 16 }}>
        <h2>Observer – Monitoring</h2>
        <p>Event: {eventId}</p>
        <p>Role: {role}</p>
        <p>Status Event: {eventStatus}</p>
      </div>
    </RequireEventRole>
  );
}
