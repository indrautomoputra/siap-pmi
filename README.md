## SIAP PMI

Repositori ini berisi beberapa komponen utama untuk proyek SIAP PMI:

- siap-pmi-admin: aplikasi admin berbasis Next.js
- siap-pmi-api: layanan API berbasis NestJS
- supabase: konfigurasi dan migrasi database

## Struktur Direktori

- siap-pmi-admin/ — Frontend admin (Next.js)
- siap-pmi-api/ — Backend API (NestJS)
- supabase/ — Migrasi dan konfigurasi Supabase
- docs/ — Dokumen proyek

## Prasyarat

- Node.js dan npm
- Git
- Supabase CLI (opsional, untuk menjalankan lokal)

## Menjalankan Admin

```bash
cd siap-pmi-admin
npm install
npm run dev
```

## Menjalankan API

```bash
cd siap-pmi-api
npm install
npm run start:dev
```

## Supabase (Opsional)

```bash
npx supabase start
```

## Catatan

- Sesuaikan konfigurasi environment (.env) sesuai kebutuhan tiap aplikasi.
