"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet } from "../../../../../lib/api";

type RecapItem = {
  enrollment_id: string;
  score_academic?: number | null;
  score_attitude?: number | null;
  note?: string | null;
};

type Graduation = {
  enrollment_id: string;
  decision: string;
};

export default function ObserverOverviewPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [recap, setRecap] = useState<RecapItem[]>([]);
  const [grads, setGrads] = useState<Graduation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const run = async () => {
      if (!eventId) return;
      setLoading(true);
      setError(null);
      try {
        const [r, g] = await Promise.all([
          apiGet<RecapItem[]>(`/events/${eventId}/assessments/recap`),
          apiGet<Graduation[]>(`/events/${eventId}/graduations`),
        ]);
        setRecap(r);
        setGrads(g);
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
      <h2>Observer Overview Event {eventId}</h2>
      {loading && <p>Memuat...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", gap: 24 }}>
        <div>
          <h3>Rekap Penilaian</h3>
          <table>
            <thead>
              <tr>
                <th>Enrollment</th>
                <th>Akademik</th>
                <th>Sikap</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {recap.map((it) => (
                <tr key={it.enrollment_id}>
                  <td>{it.enrollment_id}</td>
                  <td>{it.score_academic ?? "-"}</td>
                  <td>{it.score_attitude ?? "-"}</td>
                  <td>{it.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Kelulusan</h3>
          <table>
            <thead>
              <tr>
                <th>Enrollment</th>
                <th>Keputusan</th>
              </tr>
            </thead>
            <tbody>
              {grads.map((g) => (
                <tr key={g.enrollment_id}>
                  <td>{g.enrollment_id}</td>
                  <td>{g.decision}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
