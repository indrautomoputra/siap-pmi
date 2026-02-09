'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/events');
  }, [router]);
  return (
    <div style={{ padding: 16 }}>
      <h1>Mengarahkan ke pemilihan event…</h1>
    </div>
  );
}
