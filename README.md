# SIAP PMI

SIAP PMI adalah sistem internal untuk mengelola pelatihan PMI dalam satu provinsi, berbasis event dan peran per event. Aplikasi ini mendukung alur operasional end-to-end: pendaftaran peserta, penilaian pelatih, evaluasi peserta, keputusan kelulusan manual, hingga laporan dan penutupan event.

Repo ini memuat frontend admin (Next.js), backend API (NestJS), serta infrastruktur Supabase untuk autentikasi, data operasional, dan RLS.

## Scope

- Single provinsi
- Event-based: semua halaman dan data dibatasi oleh event
- Role per event: PANITIA, PELATIH, OBSERVER, PESERTA

## Prinsip Non-Negotiable

- Tidak ada role global
- Tidak ada auto-grading
- Kelulusan diputuskan manual

## Tech Stack

- Frontend: Next.js (App Router)
- Backend: NestJS
- Data/Auth: Supabase + RLS

## Struktur Direktori

- siap-pmi-admin/ — Frontend admin (Next.js)
- siap-pmi-api/ — Backend API (NestJS)
- supabase/ — Migrasi dan konfigurasi Supabase
- docs/ — Dokumen proyek

## Menjalankan Secara Lokal

### Frontend (siap-pmi-admin)

```bash
cd siap-pmi-admin
npm install
npm run dev
```

Env yang dibutuhkan:

- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### Backend (siap-pmi-api)

```bash
cd siap-pmi-api
npm install
npm run start:dev
```

Env yang dibutuhkan:

- SUPABASE_URL
- SUPABASE_ANON_KEY (atau SUPABASE_PUBLIC_KEY)
- KAP_HASH_SALT
- JWT_SECRET
- ADMIN_ORIGIN
- PORT (opsional, default 3000)
- SENTRY_DSN (opsional)
- SENTRY_TRACES_SAMPLE_RATE (opsional)

### Supabase (opsional)

```bash
npx supabase start
```

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

## Milestone: v1.0 Portfolio Ready

- Tujuan: paket demo + evidence siap untuk reviewer internal.
- Ruang lingkup: tanpa perubahan flow bisnis dan tanpa auto-grading.
- Rekomendasi tagging (opsional, bila menggunakan git tag):
  - git tag -a v1.0.0 -m "Milestone: v1.0 Portfolio Ready"
  - git push origin v1.0.0

## Smoke Test

```bash
cd siap-pmi-admin
npm run lint
npm run typecheck
npm run build
```

```bash
cd siap-pmi-api
npm run lint
npm run typecheck
npm run build
```
