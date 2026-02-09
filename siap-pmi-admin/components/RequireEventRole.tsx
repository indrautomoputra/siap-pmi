'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Forbidden from './Forbidden';
import { useEventContext, EventRole } from '../app/events/[eventId]/EventContext';

export function useRequireEventRole(allowed: EventRole[]) {
  const { role, loading } = useEventContext();
  return { ok: !!role && allowed.includes(role), loading, role };
}

export default function RequireEventRole({
  allowed,
  children,
}: {
  allowed: EventRole[];
  children: React.ReactNode;
}) {
  const { role, loading, ok } = useRequireEventRole(allowed);
  const router = useRouter();
  useEffect(() => {
    if (!loading && !role) {
      router.replace('/events');
    }
  }, [role, router, loading]);
  if (loading) return <div style={{ padding: 16 }}>Memuat…</div>;
  if (!role) return null;
  if (!ok) return <Forbidden message="Role tidak sesuai untuk halaman ini." />;
  return <>{children}</>;
}

export function requireEventRole(allowed: EventRole[], children: React.ReactNode) {
  return <RequireEventRole allowed={allowed}>{children}</RequireEventRole>;
}
