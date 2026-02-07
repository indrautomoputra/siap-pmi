## SIAP PMI

Repositori ini berisi beberapa komponen utama untuk proyek SIAP PMI:

- admin-sulsel: aplikasi admin berbasis Next.js
- api-sulsel: layanan API berbasis NestJS
- supabase-sulsel: konfigurasi dan migrasi database

## Struktur Direktori

- admin-sulsel/ — Frontend admin (Next.js)
- api-sulsel/ — Backend API (NestJS)
- supabase-sulsel/ — Migrasi dan konfigurasi Supabase
- docs-sulsel/ — Dokumen proyek

## Prasyarat

- Node.js dan npm
- Git
- Supabase CLI (opsional, untuk menjalankan lokal)

## Menjalankan Admin

```bash
cd admin-sulsel
npm install
npm run dev
```

## Menjalankan API

```bash
cd api-sulsel
npm install
npm run start:dev
```

## Supabase (Opsional)

```bash
npx supabase start
```

## Catatan

- Sesuaikan konfigurasi environment (.env) sesuai kebutuhan tiap aplikasi.
