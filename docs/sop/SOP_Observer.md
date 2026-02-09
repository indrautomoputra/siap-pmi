# SOP Observer

## Tujuan & Batas Wewenang
- Mengamati jalannya event dan menyediakan oversight.
- Hanya membaca data rekap, tidak melakukan penilaian, approve, atau input keputusan.
- Evaluasi/KAP hanya bahan masukan; tidak mempengaruhi kelulusan.
- Dapat melakukan ekspor CSV untuk arsip dan audit.
- Tidak lintas provinsi; semua tindakan dalam satu event yang sama.

## Langkah Kerja End-to-End
- Persiapan
  - Pastikan memiliki peran OBSERVER pada event yang dipantau.
- Observasi & Rekap
  - Lihat rekap assessment, KAP, peserta, dan keputusan kelulusan.
- Snapshot & Export
  - Ekspor CSV peserta, penilaian, dan kelulusan untuk dokumentasi.
- Pelaporan
  - Sampaikan temuan dan rekomendasi kepada Panitia/Operator Sistem.

## Troubleshooting
- Salah eventId / mismatch header
  - 403 PermissionDeniedForEvent; setel header x-event-id sama dengan :eventId pada URL.
- Akses ditolak (403) karena role
  - Pastikan peran OBSERVER terpasang pada event tersebut.
- Duplikat (409)
  - Tidak berlaku untuk tindakan baca; jika terjadi saat ekspor, periksa integritas data dan laporkan.

## Checklist Penutupan Event (kontribusi Observer)
- Pastikan seluruh rekap telah ditinjau.
- Ekspor CSV disimpan untuk audit internal.
- Laporkan temuan kepada Panitia/Operator Sistem sebelum status event completed.

## Referensi Endpoint
- Dashboard/Reports (baca)
  - GET /events/:eventId/dashboard/participants
  - GET /events/:eventId/dashboard/assessments/recap
  - GET /events/:eventId/dashboard/kap/recap
- Graduation (baca)
  - GET /events/:eventId/graduations
- Export CSV
  - GET /events/:eventId/exports/participants.csv
  - GET /events/:eventId/exports/assessments.csv
  - GET /events/:eventId/exports/graduations.csv
