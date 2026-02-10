# Demo Guide – SIAP PMI

Dokumen ini adalah satu-satunya sumber demo untuk reviewer. Fokus pada flow yang sudah ada tanpa perubahan logika bisnis.

## 1) Prasyarat

### Environment
- Node.js
- Supabase CLI

### Env Frontend (siap-pmi-admin)
- NEXT_PUBLIC_API_BASE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### Env Backend (siap-pmi-api)
- SUPABASE_URL
- SUPABASE_ANON_KEY (atau SUPABASE_PUBLIC_KEY)
- KAP_HASH_SALT
- JWT_SECRET
- ADMIN_ORIGIN
- PORT (opsional, default 3000)
- SENTRY_DSN (opsional)
- SENTRY_TRACES_SAMPLE_RATE (opsional)

### Supabase lokal (opsional)
```bash
npx supabase start
npx supabase db reset --local
```

### User test
Siapkan minimal 4 akun test dan assign role per event:
- PANITIA
- PELATIH
- OBSERVER
- PESERTA

## 2) Demo Path (step-by-step)
1. Login
2. Pilih Event
3. Event Hub (role cards)
4. Dashboard sesuai role
5. Assessments (list & detail)
6. Evaluation peserta
7. Graduations (read-only)
8. Reports (read-only)
9. Closure (read-only)

## 3) Role yang perlu untuk demo dan yang harus terlihat

### PANITIA
- Event Hub menampilkan kartu role PANITIA.
- Dashboard Panitia menampilkan ringkasan event.
- Graduations, Reports, dan Closure tampil read-only tanpa CTA edit/submit/export.

### PELATIH
- Event Hub menampilkan kartu role PELATIH.
- Assessments list dan detail dapat diakses.
- Form assessment tampil read-only jika sudah ada penilaian atau event selesai.

### OBSERVER
- Event Hub menampilkan kartu role OBSERVER.
- Assessments list dan detail dapat diakses (read-only sesuai status event).
- Akses route pelatih yang tidak sesuai role menampilkan Forbidden.

### PESERTA
- Event Hub menampilkan kartu role PESERTA.
- Evaluation peserta dapat diakses.
- Setelah submit, evaluasi menjadi read-only dengan status “Sudah terkirim”.

## 4) Seed/demo data
Repo ini tidak menyediakan mekanisme seed otomatis.

Manual setup minimal:
1. Buat event dengan status published/ongoing.
2. Assign role per event untuk PANITIA/PELATIH/OBSERVER/PESERTA.
3. Buat minimal 1 peserta/enrollment agar assessments dan evaluation bisa ditampilkan.
4. Untuk Graduations/Reports/Closure, gunakan data yang sudah ada atau dokumentasikan empty state bila belum tersedia.

## 5) Catatan penting
- Kelulusan diputuskan manual (tidak ada auto-grading).
- Evaluasi peserta tidak mempengaruhi keputusan kelulusan.
