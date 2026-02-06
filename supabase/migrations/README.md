# Supabase Migrations

## Prerequisites
- Node.js
- Supabase CLI

## Local development
```bash
npx supabase db reset --local
```

## Production deployment
```bash
npx supabase db push
```

## Rollback procedure
- Buat migration baru yang membatalkan perubahan (reverse migration).
- Jalankan deployment ulang menggunakan `npx supabase db push`.
- Untuk environment lokal, gunakan `npx supabase db reset --local` untuk reset penuh.

## Troubleshooting
- Jika migration gagal karena objek sudah ada, pastikan migration menggunakan `if not exists`.
- Jika RLS error karena policy belum tersedia, pastikan urutan migration 001 → 004 berjalan tanpa terlewat.
- Jika `supabase db reset --local` gagal, jalankan `npx supabase stop` lalu `npx supabase start`, ulangi reset.
