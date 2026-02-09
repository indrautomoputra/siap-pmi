# Runbook Operasional

## Start/Stop Sistem
- Supabase (local)
  - Start: jalankan stack lokal sesuai panduan internal.
  - Stop: hentikan layanan lokal saat tidak digunakan.
- API
  - Start: jalankan server pengembangan/produksi sesuai environment internal.
  - Stop: hentikan proses API dengan tertib.
- Admin
  - Start: jalankan aplikasi admin internal, pastikan origin sesuai konfigurasi API.
  - Stop: hentikan proses admin.

## Healthcheck
- API merespon endpoint dasar (contoh: GET /events) dengan autentikasi valid.
- Guard EventContext berjalan: akses event membutuhkan header x-event-id.
- Admin dapat memuat halaman event tanpa CORS error.
- Supabase siap: koneksi database sehat; RLS aktif.
- Bukti audit tersedia saat keputusan kelulusan dicatat.

## Membaca Log Penting
- API
  - Perhatikan error 4xx/5xx dengan pesan domain (EnrollmentAlreadyExists, PermissionDeniedForEvent, dsb.).
  - Lihat audit log bila keputusan kelulusan dicatat.
- Admin
  - Periksa konsol browser jika terjadi CORS atau auth error.
- Supabase
  - Tinjau log database jika perlu untuk integritas data.

## Prosedur Insiden
- P0 (Major outage/API down)
  - Eskalasi segera ke Operator Sistem dan Governance.
  - Lakukan rollback ke versi stabil bila perlu.
- P1 (RLS kebocoran/akses salah event)
  - Nonaktifkan jalur akses terdampak, verifikasi RLS, kumpulkan evidence.
  - Perbaiki kebijakan/policy secara minimal (hardening) dengan approval.
- P2 (Pesan error/UX minor)
  - Catat di Backlog Registry label IMPROVEMENT (BUGFIX ONLY).
  - Jadwalkan perbaikan tanpa menambah fitur.

## Prosedur Rollback (Kode + Migrasi)
- Kode
  - Kembalikan ke commit stabil terakhir.
  - Pastikan lint/typecheck lolos.
- Migrasi
  - Terapkan migrasi pembatalan atau reset ke state aman sesuai SOP internal.
  - Validasi RLS kembali sebelum membuka akses.

## Post-Incident Checklist
- Ringkasan insiden, dampak, dan waktu pemulihan.
- Daftar perubahan yang dilakukan (kode/policy) beserta evidence.
- Validasi ulang healthcheck dan RLS.
- Pembaruan dokumentasi operasional bila relevan.
