'use client';

export default function ErrorState({
  title,
  message,
  details,
  retry,
}: {
  title?: string;
  message: string;
  details?: string[];
  retry?: () => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #f5c6cb',
        background: '#f8d7da',
        color: '#721c24',
        borderRadius: 8,
        padding: 16,
      }}
    >
      <div style={{ fontWeight: 600 }}>{title ?? 'Terjadi kesalahan'}</div>
      <div>{message}</div>
      {details && details.length > 0 ? (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {details.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {retry ? (
        <button
          onClick={retry}
          style={{
            marginTop: 8,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px solid #721c24',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          Coba lagi
        </button>
      ) : null}
    </div>
  );
}
