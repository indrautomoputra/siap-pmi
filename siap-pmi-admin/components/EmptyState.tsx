'use client';

export default function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        border: '1px dashed #ccc',
        borderRadius: 8,
        padding: 16,
        background: '#fafafa',
      }}
    >
      <div style={{ fontWeight: 600 }}>{title}</div>
      {description ? <div style={{ color: '#666' }}>{description}</div> : null}
    </div>
  );
}
