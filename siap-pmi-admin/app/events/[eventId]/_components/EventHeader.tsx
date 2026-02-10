'use client';

import { useEventContext } from '../EventContext';
import StatusBadge from './StatusBadge';

type EventHeaderInfo = {
  date?: string;
  location?: string;
  personInCharge?: string;
};

export default function EventHeader({ info }: { info?: EventHeaderInfo }) {
  const { eventId, eventName, eventStatus, role } = useEventContext();
  const hasInfo = info?.date || info?.location || info?.personInCharge;
  const title = eventName ? eventName : `Event ${eventId}`;

  return (
    <section
      style={{
        borderBottom: '1px solid #eee',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>{title}</h1>
        <StatusBadge status={eventStatus} />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#555' }}>
        <div>Event ID: {eventId}</div>
        <div>Role Aktif: {role ?? '-'}</div>
      </div>
      {hasInfo ? (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: '#666' }}>
          {info?.date ? <div>Tanggal: {info.date}</div> : null}
          {info?.location ? <div>Lokasi: {info.location}</div> : null}
          {info?.personInCharge ? <div>PJ: {info.personInCharge}</div> : null}
        </div>
      ) : null}
    </section>
  );
}
