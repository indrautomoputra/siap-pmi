'use client';

export default function DisabledActionBanner({
  reason,
}: {
  reason: string;
}) {
  return (
    <div
      role="note"
      style={{
        border: '1px solid #cbd5e1',
        background: '#f1f5f9',
        color: '#334155',
        borderRadius: 8,
        padding: 12,
        margin: '8px 0',
      }}
    >
      <div style={{ fontWeight: 600 }}>Aksi tidak tersedia</div>
      <div>{reason}</div>
    </div>
  );
}
