Read-Only Dashboard – SIAP PMI (Next.js App Router)

Ringkasan Data per Role

Panitia/Dashboard
- Ringkasan jumlah peserta dan status review.
- Status event dan indikator progres (cakupan penilaian, pengumpulan evaluasi).
- Status keputusan kelulusan (ringkas).

Pelatih/Dashboard
- Daftar peserta.
- Status penilaian per peserta (sudah/belum dinilai, waktu terakhir).
- Ringkasan cakupan penilaian.

Observer/Dashboard
- Ringkasan monitoring (jumlah peserta, submisi penilaian, respons KAP).
- Rekap penilaian (rata-rata akademik/sikap per peserta).
- Ringkasan keputusan kelulusan.

Peserta/Dashboard
- Status enrollment dan review status.
- Informasi event (eventId, status event).

Sumber Data Read-Only (API yang sudah ada)
- Events: GET /events
- Dashboard participants: GET /events/:eventId/dashboard/participants
- Dashboard assessment recap: GET /events/:eventId/dashboard/assessments/recap
- Dashboard KAP recap: GET /events/:eventId/dashboard/kap/recap
- Reports summary: GET /events/:eventId/reports/summary
- Reports participants: GET /events/:eventId/reports/participants
- Graduations: GET /events/:eventId/graduations
- Assessment scores list: GET /events/:eventId/assessments
- Peserta enrollment status: Supabase RLS enrollments (read-only)

Aturan UI Berdasarkan Status Event
- draft: tampilkan info “Event belum dimulai” dan nonaktifkan link operasional.
- published: peserta dapat melihat info; pelatih/observer dalam mode read-only.
- ongoing: tampilkan data aktif (read-only).
- completed: tampilkan rekap dan status akhir (read-only).

Batasan Read-Only
- Tidak ada create/update/delete di UI dashboard.
- Semua fetch menggunakan event-scoped context dan x-event-id untuk endpoint API.
- Error dan akses ditangani dengan state UI (loading, empty, error, forbidden).
