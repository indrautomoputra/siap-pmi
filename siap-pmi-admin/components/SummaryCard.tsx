'use client';

export default function SummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div
      style={{
        border: '1px solid #eee',
        borderRadius: 8,
        padding: 12,
        minWidth: 180,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#666' }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>{value}</div>
      {subtitle ? (
        <div style={{ fontSize: 12, color: '#666' }}>{subtitle}</div>
      ) : null}
    </div>
  );
}
