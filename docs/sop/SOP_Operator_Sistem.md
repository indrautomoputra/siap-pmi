# SOP Operator Sistem

## Tujuan & Batas Wewenang
- Menjaga ketersediaan sistem (API, Admin, Supabase).
- Menyiapkan event dan memastikan kontrol akses event-based.
- Tidak mengambil keputusan kelulusan; hanya memastikan pencatatan berjalan.
- Evaluasi/KAP tidak mempengaruhi kelulusan.
- Menjaga RLS Supabase sebagai garis pertahanan utama.
- Tidak lintas provinsi; setiap event berdiri sendiri.

## Langkah Kerja End-to-End
- Persiapan Infrastruktur
  - Pastikan API, Admin, dan Supabase berjalan sesuai environment.
  - Pastikan env key dan origin sesuai untuk akses admin internal.
- Event Lifecycle
  - Buat event (draft), publish, dan ubah ke ongoing sesuai jadwal operasional.
  - Pastikan peran PANITIA/PELATIH/OBSERVER/PESERTA terpasang pada event yang sama.
- Enrollment → Assessment/Evaluation → Rapat → Graduation
  - Verifikasi alur berjalan pada event yang benar.
  - Pastikan tidak ada akses lintas event/provinsi.
- Snapshot & Export
  - Pastikan proses ekspor tersedia dan disimpan sebagai evidence.
- Closeout
  - Pastikan seluruh evidence tersimpan sebelum event completed.

## Troubleshooting
- Salah eventId / mismatch header
  - 403 PermissionDeniedForEvent (EVENT_CONTEXT_MISMATCH).
  - Periksa header x-event-id dan :eventId pada URL serta konfigurasi client admin.
- Akses ditolak (403) karena role
  - Pastikan event_role_assignments benar untuk user yang relevan.
- Duplikat (409)
  - Enrollment/assessment/graduation/evaluation yang duplikat harus ditolak.
  - Verifikasi integritas data di DB dan audit log.
- Perubahan keputusan kelulusan (DITUNDA → LULUS)
  - Sistem tidak mengubah keputusan yang sudah dicatat.
  - Jika rapat memutuskan perubahan, jalankan change control dan simpan notulen rapat sebagai evidence. Tanpa approval, data tidak diubah.

## Checklist Penutupan Event (completed)
- Semua flow selesai dan tidak ada error outstanding.
- Ekspor CSV (participants, assessments, graduations) tersimpan.
- Audit log tersedia untuk keputusan kelulusan.
- Event diubah ke completed sesuai prosedur.
- Evidence pack tersimpan untuk audit internal.

## Referensi Endpoint
- Event
  - GET /events
- Enrollment
  - POST /enrollments
  - POST /enrollments/:id/approve
  - POST /enrollments/:id/reject
- Assessment
  - POST /events/:eventId/assessments
  - GET /events/:eventId/assessments
- Evaluation
  - POST /events/:eventId/evaluations
  - GET /events/:eventId/evaluations
- Graduation
  - POST /events/:eventId/graduations/decide
  - GET /events/:eventId/graduations
- Export CSV
  - GET /events/:eventId/exports/participants.csv
  - GET /events/:eventId/exports/assessments.csv
  - GET /events/:eventId/exports/graduations.csv
- Guard
  - EventContextGuard: header x-event-id wajib konsisten dengan :eventId

## Referensi RLS
- supabase/migrations/20240115000007_007_rls_auth_initplan.sql
- supabase/migrations/20260209000011_011_hardening_policies.sql
