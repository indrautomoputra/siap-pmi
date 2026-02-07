"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../lib/api";

type Enrollment = {
  id: string;
  participant_name: string;
  display_name?: string | null;
  status: string;
  review_status: string;
};

export default function EnrollmentsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [items, setItems] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Enrollment[]>(
          `/events/${eventId}/enrollments`
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
      <h2>Daftar Peserta Event {eventId}</h2>
      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Display</th>
            <th>Status</th>
            <th>Review</th>
          </tr>
        </thead>
        <tbody>
          {items.map((en) => (
            <tr key={en.id}>
              <td>{en.id}</td>
              <td>{en.participant_name}</td>
              <td>{en.display_name ?? "-"}</td>
              <td>{en.status}</td>
              <td>{en.review_status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
