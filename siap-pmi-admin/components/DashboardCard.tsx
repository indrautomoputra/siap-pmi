'use client';

import Link from 'next/link';

type DashboardCardProps = {
  title: string;
  description?: string;
  href: string;
  disabledReason?: string;
};

export default function DashboardCard({
  title,
  description,
  href,
  disabledReason,
}: DashboardCardProps) {
  const baseStyle = {
    border: '1px solid #e5e7eb',
    borderRadius: 10,
    padding: 16,
    display: 'grid',
    gap: 6,
    minWidth: 220,
    background: '#fff',
  } as const;

  if (disabledReason) {
    return (
      <div style={{ ...baseStyle, background: '#f8fafc', color: '#94a3b8' }}>
        <div style={{ fontWeight: 600, color: '#475569' }}>{title}</div>
        {description ? (
          <div style={{ fontSize: 13, color: '#64748b' }}>{description}</div>
        ) : null}
        <div style={{ fontSize: 12 }}>{disabledReason}</div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      style={{
        ...baseStyle,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ fontWeight: 600, color: '#111827' }}>{title}</div>
      {description ? (
        <div style={{ fontSize: 13, color: '#4b5563' }}>{description}</div>
      ) : null}
      <div style={{ fontSize: 12, color: '#2563eb' }}>Buka</div>
    </Link>
  );
}
