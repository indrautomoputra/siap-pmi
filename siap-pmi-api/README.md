# SIAP PMI API (Backend)

Backend SIAP PMI menyediakan API internal berbasis NestJS untuk operasional event, termasuk enrollment, penilaian, evaluasi peserta, kelulusan manual, laporan, dan penutupan event.

## Scope

- Single provinsi
- Event-based, role per event

## Prinsip Non-Negotiable

- Tidak ada role global
- Tidak ada auto-grading
- Kelulusan diputuskan manual

## Tech Stack

- NestJS
- Supabase + RLS

## Menjalankan Secara Lokal

```bash
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

## Smoke Test

```bash
npm run lint
npm run typecheck
npm run build
```
