'use client';

import Link from 'next/link';
import { useEventContext } from '../EventContext';

type NavItem = {
  key: string;
  label: string;
  href: (eventId: string) => string;
};

export default function EventNav() {
  const { eventId, eventStatus, role } = useEventContext();
  const isDraft = eventStatus === 'draft';
  const items: NavItem[] = role
    ? role === 'PANITIA'
      ? [
          { key: 'dashboard', label: 'Dashboard', href: (id) => `/events/${id}` },
          { key: 'enrollments', label: 'Enrollments', href: (id) => `/events/${id}/enrollments` },
          { key: 'graduations', label: 'Kelulusan', href: (id) => `/events/${id}/graduations` },
          { key: 'closure', label: 'Penutupan', href: (id) => `/events/${id}/closure` },
        ]
      : role === 'PELATIH'
      ? [
          { key: 'dashboard', label: 'Dashboard', href: (id) => `/events/${id}` },
          { key: 'assessments', label: 'Assessment', href: (id) => `/events/${id}/pelatih/assessments` },
        ]
      : role === 'OBSERVER'
      ? [
          { key: 'dashboard', label: 'Dashboard', href: (id) => `/events/${id}` },
          { key: 'assessments', label: 'Assessment', href: (id) => `/events/${id}/observer/assessments` },
        ]
      : [
          { key: 'dashboard', label: 'Dashboard', href: (id) => `/events/${id}` },
          { key: 'enrollments', label: 'Enrollment', href: (id) => `/events/${id}/enrollments` },
          { key: 'evaluation', label: 'Evaluation', href: (id) => `/events/${id}/peserta/evaluation` },
        ]
    : [];

  return (
    <nav
      aria-label="Navigasi Event"
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
        {items.length === 0 ? (
          <span style={{ color: '#b45309' }}>Role belum terpasang pada event.</span>
        ) : (
          items.map((item) =>
            isDraft ? (
              <span key={item.key} style={{ opacity: 0.5 }}>
                {item.label}
              </span>
            ) : (
              <Link key={item.key} href={item.href(eventId)}>
                {item.label}
              </Link>
            ),
          )
        )}
      </div>
      {isDraft ? <span style={{ color: '#b45309' }}>Event belum dipublikasikan</span> : null}
    </nav>
  );
}
