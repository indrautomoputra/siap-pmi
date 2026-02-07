'use client';
import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const [eventId, setEventId] = useState("");
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Dashboard Admin SIAP PMI</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <label>Event ID</label>
          <input
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="contoh: evt_123"
          />
        </div>
        <ul style={{ marginTop: 16 }}>
          <li>
            <Link href={`/events/${eventId}/enrollments`}>
              Daftar Peserta
            </Link>
          </li>
          <li>
            <Link href={`/events/${eventId}/assessments/recap`}>
              Rekap Assessment
            </Link>
          </li>
          <li>
            <Link href={`/events/${eventId}/graduations`}>Kelulusan</Link>
          </li>
          <li>
            <Link href={`/observer/events/${eventId}/overview`}>
              Observer Overview
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
