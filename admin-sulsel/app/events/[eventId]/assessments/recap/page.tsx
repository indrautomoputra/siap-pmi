"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../../lib/api";

type RecapItem = {
  enrollment_id: string;
  instrument_id?: string;
  score_academic?: number | null;
  score_attitude?: number | null;
  note?: string | null;
};

export default function AssessmentsRecapPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [items, setItems] = useState<RecapItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<RecapItem[]>(
          `/events/${eventId}/assessments/recap`
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
      <h2>Rekap Assessment Event {eventId}</h2>
      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Enrollment</th>
            <th>Instrumen</th>
            <th>Akademik</th>
            <th>Sikap</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={`${it.enrollment_id}-${it.instrument_id ?? ""}`}>
              <td>{it.enrollment_id}</td>
              <td>{it.instrument_id ?? "-"}</td>
              <td>{it.score_academic ?? "-"}</td>
              <td>{it.score_attitude ?? "-"}</td>
              <td>{it.note ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
