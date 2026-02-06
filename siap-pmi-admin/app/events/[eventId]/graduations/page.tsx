"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../lib/api";

type Graduation = {
  enrollment_id: string;
  decision: string;
  decided_by?: string | null;
  decided_at?: string | null;
};

export default function GraduationsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [items, setItems] = useState<Graduation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Graduation[]>(
          `/events/${eventId}/graduations`
        );
        setItems(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [eventId]);
  return (
    <div style={{ padding: 16 }}>
      <h2>Kelulusan Event {eventId}</h2>
      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Enrollment</th>
            <th>Keputusan</th>
            <th>Oleh</th>
            <th>Waktu</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.enrollment_id}>
              <td>{it.enrollment_id}</td>
              <td>{it.decision}</td>
              <td>{it.decided_by ?? "-"}</td>
              <td>{it.decided_at ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
