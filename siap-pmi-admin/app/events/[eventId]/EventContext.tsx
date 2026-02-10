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
  eventName: string;
  role: EventRole | null;
  roles: EventRole[];
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
  const [roles, setRoles] = useState<EventRole[]>([]);
  const [status, setStatus] = useState<EventStatus>('ongoing');
  const [name, setName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setLoading(true);
      try {
        const res = await apiGet<{ items: TrainingEvent[]; limit: number; offset: number }>('/events');
        const ev = res.items.find((e) => e.id === eventId);
        if (active && ev) {
          setStatus(ev.status);
          setName(ev.name);
        }
      } catch {
        if (active) {
          setStatus('ongoing');
          setName('');
        }
      }
      try {
        const sb = getSupabaseClient();
        if (!sb) {
          if (active) {
            setRole(null);
            setRoles([]);
          }
          return;
        }
        const { data: userData } = await sb.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) {
          if (active) {
            setRole(null);
            setRoles([]);
          }
          return;
        }
        const { data, error } = await sb
          .from('event_role_assignments')
          .select('role')
          .eq('event_id', eventId)
          .eq('user_id', userId);
        if (!error && data && data.length > 0) {
          const mappedRoles = data
            .map((item) => item?.role as EventRole | undefined)
            .filter((item): item is EventRole => !!item);
          if (active) {
            setRoles(mappedRoles);
            setRole(mappedRoles[0] ?? null);
          }
        } else {
          if (active) {
            setRole(null);
            setRoles([]);
          }
        }
      } catch {
        if (active) {
          setRole(null);
          setRoles([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [eventId]);

  const value = useMemo<Ctx>(
    () => ({
      eventId,
      eventStatus: status,
      eventName: name,
      role,
      roles,
      loading,
    }),
    [eventId, status, name, role, roles, loading],
  );
  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}
