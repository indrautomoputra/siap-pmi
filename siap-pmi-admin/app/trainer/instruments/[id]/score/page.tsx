"use client";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "../../../../../lib/api";

export default function SubmitScorePage() {
  const params = useParams();
  const router = useRouter();
  const instrumentId = params?.id as string;
  const [academic, setAcademic] = useState<number>(0);
  const [attitude, setAttitude] = useState<number>(0);
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrumentId) return;
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      await apiPost(`/assessments/instruments/${instrumentId}/score`, {
        score_academic: academic,
        score_attitude: attitude,
        note,
      });
      setOk(true);
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "32px auto", padding: 16 }}>
      <h2>Submit Penilaian Instrumen {instrumentId}</h2>
      <form onSubmit={onSubmit}>
        <label>
          Nilai Akademik
          <input
            type="number"
            value={academic}
            onChange={(e) => setAcademic(Number(e.target.value))}
            min={0}
          />
        </label>
        <label>
          Nilai Sikap
          <input
            type="number"
            value={attitude}
            onChange={(e) => setAttitude(Number(e.target.value))}
            min={0}
          />
        </label>
        <label>
          Catatan
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {ok && <p style={{ color: "green" }}>Terkirim</p>}
    </div>
  );
}
