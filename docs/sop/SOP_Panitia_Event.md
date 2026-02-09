# SOP Panitia Event

## Tujuan & Batas Wewenang
- Mengelola peserta untuk event tertentu (approve/reject enrollment).
- Melihat rekap penilaian dan evaluasi; tidak melakukan penilaian.
- Evaluasi/KAP hanya bahan masukan dan tidak mempengaruhi kelulusan.
- Mencatat keputusan kelulusan hasil rapat manusia (bukan auto-grading).
- Melakukan snapshot dan ekspor CSV untuk dokumentasi.
- Tidak lintas provinsi; seluruh tindakan selalu dalam konteks satu event.

## Langkah Kerja End-to-End
- Persiapan Event
  - Koordinasi dengan Operator Sistem untuk pembuatan event dan perubahan status: draft → published → ongoing.
  - Pastikan memiliki peran PANITIA pada event tersebut.
- Enrollment
  - Pantau pendaftaran peserta yang masuk pada event.
  - Lakukan approve/reject sesuai verifikasi.
- Assessment & Evaluation
  - Pelatih melakukan submit penilaian melalui endpoint penilaian.
  - Peserta melakukan submit evaluasi; Panitia dapat melihat agregat.
- Rapat Kelulusan
  - Laksanakan rapat dan putuskan status (lulus/tidak lulus/ditunda).
  - Catat keputusan via sistem satu kali per peserta pada event.
- Snapshot & Export
  - Ambil CSV peserta, penilaian, dan kelulusan untuk arsip.

## Troubleshooting
- Salah eventId / mismatch header
  - Gejala: 403 PermissionDeniedForEvent (EVENT_CONTEXT_MISMATCH).
  - Perbaikan: Pastikan header x-event-id sama dengan :eventId pada URL; atau set x-event-id saat endpoint tanpa :eventId.
- Akses ditolak (403) karena role
  - Gejala: 403 PermissionDeniedForEvent untuk endpoint yang mensyaratkan PANITIA.
  - Perbaikan: Pastikan user memiliki role PANITIA pada event tersebut.
- Duplikat (409)
  - Enrollment: pendaftaran yang sama ditolak dengan 409.
  - Assessment: skor ganda untuk kombinasi (instrument, enrollment) ditolak 409.
  - Graduation: keputusan untuk enrollment yang sama ditolak 409 bila sudah ada.
- Perubahan keputusan kelulusan (DITUNDA → LULUS)
  - Sistem mencatat satu keputusan final per enrollment dan tidak mendukung update.
  - Prosedur operasional: jika keputusan berubah di rapat berikutnya, catat di notulen rapat dan arsipkan sebagai evidence. Tidak melakukan perubahan data di sistem tanpa proses change control resmi.

## Checklist Penutupan Event (completed)
- Semua enrollment telah direview (approved/rejected).
- Semua penilaian dan evaluasi yang relevan selesai.
- Keputusan kelulusan telah dicatat untuk peserta yang memenuhi syarat.
- Snapshot dan ekspor CSV disimpan di folder evidence internal.
- Status event diubah menjadi completed oleh Operator Sistem.

## Referensi Endpoint
- Daftar Event: GET /events (dengan konteks event; hanya untuk verifikasi akses).
- Enrollment
  - Approve: POST /enrollments/:id/approve
  - Reject: POST /enrollments/:id/reject
- Assessment (rekap baca)
  - GET /events/:eventId/assessments
  - GET /events/:eventId/assessments/:assessmentId
- Evaluation (agregat)
  - GET /events/:eventId/evaluations
- Graduation
  - POST /events/:eventId/graduations/decide
  - GET /events/:eventId/graduations
- Export CSV
  - GET /events/:eventId/exports/participants.csv
  - GET /events/:eventId/exports/assessments.csv
  - GET /events/:eventId/exports/graduations.csv
