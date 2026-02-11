'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  disabled?: boolean;
  disabledReason?: string;
  icon?: ReactNode;
}

export default function DashboardCard({
  title,
  description,
  href,
  disabled,
  disabledReason,
  icon,
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

  const isDisabled = Boolean(disabled || disabledReason);

  if (isDisabled) {
    return (
      <div
        style={{
          ...baseStyle,
          background: '#f8fafc',
          color: '#94a3b8',
          cursor: 'not-allowed',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon ? <div style={{ display: 'grid' }}>{icon}</div> : null}
          <div style={{ fontWeight: 600, color: '#475569' }}>{title}</div>
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{description}</div>
        {disabledReason ? (
          <div style={{ fontSize: 12 }}>{disabledReason}</div>
        ) : (
          <div style={{ fontSize: 12 }}>Tidak tersedia</div>
        )}
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
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon ? <div style={{ display: 'grid' }}>{icon}</div> : null}
        <div style={{ fontWeight: 600, color: '#111827' }}>{title}</div>
      </div>
      <div style={{ fontSize: 13, color: '#4b5563' }}>{description}</div>
      <div style={{ fontSize: 12, color: '#2563eb' }}>Buka</div>
    </Link>
  );
}
