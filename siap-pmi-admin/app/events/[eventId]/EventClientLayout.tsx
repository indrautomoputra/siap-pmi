'use client';

import Link from 'next/link';
import { EventContextProvider, useEventContext } from './EventContext';

function EventNav({ eventId }: { eventId: string }) {
  const { eventStatus } = useEventContext();
  const isDraft = eventStatus === 'draft';
  const items = [
    { key: 'panitia', label: 'Panitia' },
    { key: 'pelatih', label: 'Pelatih' },
    { key: 'observer', label: 'Observer' },
    { key: 'peserta', label: 'Peserta' },
  ];

  return (
    <section
      style={{
        borderBottom: '1px solid #eee',
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <strong>Event: {eventId}</strong>
      <span>Status: {eventStatus}</span>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {items.map((item) =>
          isDraft ? (
            <span key={item.key} style={{ opacity: 0.5 }}>
              {item.label}
            </span>
          ) : (
            <Link key={item.key} href={`/events/${eventId}/${item.key}/dashboard`}>
              {item.label}
            </Link>
          ),
        )}
      </div>
      {isDraft ? (
        <span style={{ color: '#b45309' }}>Event belum dimulai</span>
      ) : null}
    </section>
  );
}

export default function EventClientLayout({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  return (
    <EventContextProvider eventId={eventId}>
      <EventNav eventId={eventId} />
      <div>{children}</div>
    </EventContextProvider>
  );
}
