'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Forbidden from './Forbidden';
import { useEventContext, EventRole } from '../app/events/[eventId]/EventContext';

export function useRequireEventRole(allowed: EventRole[]) {
  const { role } = useEventContext();
  return !!role && allowed.includes(role);
}

export default function RequireEventRole({
  allowed,
  children,
}: {
  allowed: EventRole[];
  children: React.ReactNode;
}) {
  const { role } = useEventContext();
  const router = useRouter();
  useEffect(() => {
    if (!role) {
      router.replace('/events');
    }
  }, [role, router]);
  if (!role) return null;
  if (!allowed.includes(role)) return <Forbidden message="Role tidak sesuai untuk halaman ini." />;
  return <>{children}</>;
}

export function requireEventRole(allowed: EventRole[], children: React.ReactNode) {
  return <RequireEventRole allowed={allowed}>{children}</RequireEventRole>;
}
