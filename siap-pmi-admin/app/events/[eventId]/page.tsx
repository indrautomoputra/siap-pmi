'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEventContext } from './EventContext';

export default function EventLandingPage() {
  const { eventId, role, loading } = useEventContext();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !role) {
      router.replace('/events'); // tidak terdaftar pada event
      return;
    }
    if (loading) return;
    const target =
      role === 'PANITIA'
        ? `/events/${eventId}/panitia/dashboard`
        : role === 'PELATIH'
        ? `/events/${eventId}/pelatih/dashboard`
        : role === 'OBSERVER'
        ? `/events/${eventId}/observer/dashboard`
        : `/events/${eventId}/peserta/dashboard`;
    router.replace(target);
  }, [router, role, eventId, loading]);
  return (
    <div style={{ padding: 16 }}>
      <h1>Memuat area sesuai peran…</h1>
    </div>
  );
}
