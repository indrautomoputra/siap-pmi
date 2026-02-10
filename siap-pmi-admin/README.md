# SIAP PMI Admin (Frontend)

SIAP PMI Admin adalah aplikasi internal berbasis Next.js untuk mengelola pelatihan PMI per event. UI berfokus pada operasional event, monitoring penilaian, evaluasi peserta, keputusan kelulusan manual, laporan, dan penutupan event.

## Scope

- Single provinsi
- Event-based, role per event

## Prinsip Non-Negotiable

- Tidak ada role global
- Tidak ada auto-grading
- Kelulusan diputuskan manual

## Tech Stack

- Next.js (App Router)
- Supabase Auth (client) untuk resolusi role
- Integrasi API NestJS

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Env yang dibutuhkan:

- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Demo Path (alur klik)

1. Login
2. Pilih Event
3. Event Hub (role cards)
4. Dashboard sesuai role
5. Assessments (list & detail)
6. Evaluation peserta
7. Graduations (read-only)
8. Reports (read-only)
9. Closure (read-only)

## Screenshot Checklist

- Login
- Pilih Event
- Event Hub (role cards)
- Dashboard Panitia
- Dashboard Pelatih
- Dashboard Observer
- Dashboard Peserta
- Assessments List (Pelatih)
- Assessments Detail (Pelatih)
- Evaluation Peserta
- Graduations (read-only)
- Reports (read-only)
- Closure (read-only)

## Smoke Test

```bash
npm run lint
npm run typecheck
npm run build
```
