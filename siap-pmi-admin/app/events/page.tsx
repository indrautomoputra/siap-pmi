'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '../../lib/api';

type TrainingEvent = {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
};

export default function EventsPickerPage() {
  const [items, setItems] = useState<TrainingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiGet<{ items: TrainingEvent[]; limit: number; offset: number }>('/events');
        setItems(res.items);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);
  return (
    <div style={{ padding: 16 }}>
      <h1>Pilih Event</h1>
      {loading && <p>Memuat daftar event…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {items.map((ev) => (
          <li key={ev.id}>
            <Link href={`/events/${ev.id}`}>{ev.name} — {ev.status}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
