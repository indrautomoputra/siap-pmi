'use client';
import { createContext, useContext, useMemo, useState } from 'react';

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed';
export type EventRole = 'PANITIA' | 'PELATIH' | 'OBSERVER' | 'PESERTA';

type Ctx = {
  eventId: string;
  eventStatus: EventStatus;
  role: EventRole | null;
};

const EventContext = createContext<Ctx | null>(null);

export function useEventContext(): Ctx {
  const ctx = useContext(EventContext);
  if (!ctx) {
    throw new Error('EventContext not available');
  }
  return ctx;
}

export function EventContextProvider({
  eventId,
  children,
}: {
  eventId: string;
  children: React.ReactNode;
}) {
  const [role] = useState<EventRole | null>(() => {
    try {
      const storedRole = typeof window !== 'undefined' ? window.localStorage.getItem(`siap_role_${eventId}`) : null;
      if (storedRole === 'PANITIA' || storedRole === 'PELATIH' || storedRole === 'OBSERVER' || storedRole === 'PESERTA') {
        return storedRole as EventRole;
      }
    } catch {}
    return null;
  });
  const [status] = useState<EventStatus>(() => {
    try {
      const storedStatus = typeof window !== 'undefined' ? (window.localStorage.getItem(`siap_event_status_${eventId}`) as EventStatus | null) : null;
      if (storedStatus === 'draft' || storedStatus === 'published' || storedStatus === 'ongoing' || storedStatus === 'completed') {
        return storedStatus;
      }
    } catch {}
    return 'ongoing';
  });

  const value = useMemo<Ctx>(() => ({ eventId, eventStatus: status, role }), [eventId, status, role]);
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
