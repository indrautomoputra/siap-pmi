# SOP Pelatih

## Tujuan & Batas Wewenang
- Memberikan penilaian terhadap peserta pada event yang sama.
- Tidak melakukan approve/reject enrollment.
- Evaluasi/KAP tidak mempengaruhi kelulusan.
- Tidak melakukan auto-grading; keputusan kelulusan ditetapkan rapat manusia.
- Tidak lintas provinsi; tindakan selalu pada satu event yang sama.

## Langkah Kerja End-to-End
- Persiapan
  - Pastikan memiliki peran PELATIH pada event yang ditugaskan.
- Penilaian (Assessment)
  - Lakukan submit skor untuk instrumen penilaian terhadap enrollment yang disetujui.
  - Pastikan kombinasi (instrument, enrollment) belum dinilai sebelumnya.
- Evaluasi & Rapat
  - Opsional: lihat rekap penilaian untuk persiapan rapat.
  - Ikut rapat penetapan kelulusan bila diminta.
- Snapshot & Export
  - Jika diperlukan oleh Panitia, berikan dukungan untuk ekspor rekap kepada Panitia/Observer.

## Troubleshooting
- Salah eventId / mismatch header
  - 403 PermissionDeniedForEvent; setel header x-event-id sama dengan :eventId pada URL.
- Akses ditolak (403) karena role
  - Endpoint penilaian hanya untuk PELATIH; pastikan role benar pada event.
- Duplikat (409)
  - Submit skor kedua kali untuk kombinasi yang sama ditolak 409.

## Checklist Penutupan Event (kontribusi Pelatih)
- Semua penilaian untuk peserta yang relevan telah disubmit.
- Mendukung Panitia dalam menyusun bahan rapat dan memastikan tidak ada penilaian yang tertinggal.
- Menyerahkan catatan penilaian ke Panitia untuk arsip.

## Referensi Endpoint
- Assessment
  - POST /events/:eventId/assessments
  - GET /events/:eventId/assessments
  - GET /events/:eventId/assessments/:assessmentId
- Graduation (lihat)
  - GET /events/:eventId/graduations
