'use client';
export default function Forbidden({ message }: { message?: string }) {
  return (
    <div style={{ padding: 24 }}>
      <h2>403 – Akses Ditolak</h2>
      <p>{message ?? 'Anda tidak memiliki akses ke halaman ini dalam konteks event saat ini.'}</p>
    </div>
  );
}
