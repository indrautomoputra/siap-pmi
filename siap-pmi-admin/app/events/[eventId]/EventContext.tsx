'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiGet } from '../../../lib/api';
import { getSupabaseClient } from '../../../lib/supabaseClient';

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type EventRole = 'PANITIA' | 'PELATIH' | 'OBSERVER' | 'PESERTA';
type TrainingEvent = { id: string; name: string; status: EventStatus };

type Ctx = {
  eventId: string;
  eventStatus: EventStatus;
  role: EventRole | null;
  loading: boolean;
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
  const [role, setRole] = useState<EventRole | null>(null);
  const [status, setStatus] = useState<EventStatus>('ongoing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ items: TrainingEvent[]; limit: number; offset: number }>('/events');
        const ev = res.items.find((e) => e.id === eventId);
        if (active && ev) setStatus(ev.status);
      } catch {
        if (active) setStatus('ongoing');
      }
      try {
        const sb = getSupabaseClient();
        if (!sb) {
          if (active) setRole(null);
          return;
        }
        const { data: userData } = await sb.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) {
          if (active) setRole(null);
          return;
        }
        const { data, error } = await sb
          .from('event_role_assignments')
          .select('role')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .limit(1);
        if (!error && data && data.length > 0) {
          const r = data[0]?.role as EventRole | undefined;
          if (active) setRole(r ?? null);
        } else {
          if (active) setRole(null);
        }
      } catch {
        if (active) setRole(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [eventId]);

  const value = useMemo<Ctx>(() => ({ eventId, eventStatus: status, role, loading }), [eventId, status, role, loading]);
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
