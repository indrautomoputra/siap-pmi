'use client';
import Link from 'next/link';
import { useEventContext } from './EventContext';
import EventHeader from './_components/EventHeader';

export default function EventLandingPage() {
  const { eventId, roles, loading } = useEventContext();
  const roleCards = [
    {
      key: 'PANITIA',
      title: 'Panitia',
      description: 'Kelola pelaksanaan event, peserta, dan keputusan kelulusan.',
      href: `/events/${eventId}/panitia/dashboard`,
    },
    {
      key: 'PELATIH',
      title: 'Pelatih',
      description: 'Nilai peserta dan pantau capaian penilaian.',
      href: `/events/${eventId}/pelatih/dashboard`,
    },
    {
      key: 'OBSERVER',
      title: 'Observer',
      description: 'Monitoring proses pelatihan dan rekap penilaian.',
      href: `/events/${eventId}/observer/dashboard`,
    },
    {
      key: 'PESERTA',
      title: 'Peserta',
      description: 'Pantau status enrollment dan isi evaluasi pelatihan.',
      href: `/events/${eventId}/peserta/dashboard`,
    },
  ].filter((item) => roles.includes(item.key as (typeof roles)[number]));
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <EventHeader />
      <div style={{ padding: 16, display: 'grid', gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>Peran Anda</h2>
          <div style={{ color: '#666' }}>Pilih peran untuk masuk ke dashboard.</div>
        </div>
        {loading ? (
          <div>Memuat peran event…</div>
        ) : roleCards.length === 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ color: '#b45309' }}>Role belum terpasang pada event.</div>
            <Link href={`/events/${eventId}/enrollments`}>Lihat Enrollments (read-only)</Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
            }}
          >
            {roleCards.map((item) => (
              <div
                key={item.key}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: 16,
                  display: 'grid',
                  gap: 8,
                }}
              >
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div style={{ color: '#666', fontSize: 14 }}>{item.description}</div>
                <Link href={item.href} style={{ width: 'fit-content' }}>
                  Masuk
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
