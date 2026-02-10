'use client';

import { EventStatus } from '../EventContext';

const stylesByStatus: Record<
  EventStatus,
  { label: string; background: string; border: string; color: string }
> = {
  draft: {
    label: 'Draft',
    background: '#f1f5f9',
    border: '#cbd5e1',
    color: '#475569',
  },
  published: {
    label: 'Published',
    background: '#e0f2fe',
    border: '#93c5fd',
    color: '#1d4ed8',
  },
  ongoing: {
    label: 'Ongoing',
    background: '#dcfce7',
    border: '#86efac',
    color: '#166534',
  },
  completed: {
    label: 'Completed',
    background: '#f3f4f6',
    border: '#d1d5db',
    color: '#374151',
  },
  cancelled: {
    label: 'Cancelled',
    background: '#fee2e2',
    border: '#fecaca',
    color: '#991b1b',
  },
};

export default function StatusBadge({ status }: { status: EventStatus }) {
  const style = stylesByStatus[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 999,
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {style.label}
    </span>
  );
}
