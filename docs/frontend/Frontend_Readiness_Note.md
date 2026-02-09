# Frontend Readiness Note – SIAP PMI

## Ringkasan Ruang Lingkup
Dokumen ini menyatakan kesiapan frontend SIAP PMI untuk penggunaan internal dengan cakupan event-based dan role per event, tanpa perubahan backend maupun logika bisnis.

## Flow Aktif
**Read-only**
- Dashboard Panitia/Pelatih/Observer/Peserta (rekap dan informasi event).
- Ringkasan keputusan kelulusan (read-only).

**Limited Write**
- Evaluasi Peserta (submit evaluasi).
- Penilaian Pelatih/Observer (submit penilaian).

## Kepatuhan Event/Role
- Seluruh halaman operasional berada di bawah /events/:eventId/.
- Akses halaman dibatasi berdasarkan role per event (Panitia/Pelatih/Observer/Peserta).
- Event scoping dipertahankan melalui wrapper request (x-event-id).

## Status UX & A11Y (Basic)
- Copy CTA dan microcopy state distandardisasi.
- State disabled/read-only/success ditampilkan konsisten.
- A11Y dasar diterapkan: aria-label pada CTA, aria-busy pada form, dan banner message dengan role/aria-live.

## Keterbatasan
- Evidence manual (screenshot smoke test) belum tersedia dan menunggu eksekusi oleh PIC.

## Pernyataan
**Ready for Internal Use**  
(Dokumen ini siap untuk ditandatangani.)

Tanda tangan: ____________________  
Nama: ____________________  
Jabatan: ____________________  
Tanggal: ____________________
