'use client';

export default function ErrorState({
  message,
  retry,
}: {
  message: string;
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
      <div style={{ fontWeight: 600 }}>Terjadi kesalahan</div>
      <div>{message}</div>
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
