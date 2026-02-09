# UX Polish & A11Y Dasar – SIAP PMI (Frontend)

Dokumen ini merangkum perbaikan UX ringan dan aksesibilitas dasar tanpa perubahan backend.

## Daftar Perbaikan UX
- Standarisasi label CTA utama: Isi Evaluasi, Kirim Evaluasi, Nilai / Update Penilaian, Kembali ke Dashboard.
- Microcopy untuk state disabled, read-only, dan success agar konsisten dan jelas.
- Banner pesan terpadu untuk error dan success di flow evaluasi dan penilaian.
- Loading state dengan teks jelas pada halaman evaluasi/penilaian.

## Daftar Copy/Label Final
- CTA Peserta: Isi Evaluasi, Kirim Evaluasi, Lihat Evaluasi (read-only), Kembali ke Dashboard.
- CTA Pelatih/Observer: Nilai / Update Penilaian, Kembali ke Dashboard.
- Microcopy Disabled: draft “Event belum dimulai.”, published “Event belum berlangsung.”, completed “Event sudah selesai.”, cancelled “Event dibatalkan.”
- Microcopy Read-only: Evaluasi “Evaluasi sudah terkirim atau event tidak sedang berlangsung.”, Penilaian “Penilaian sudah terkirim atau event tidak sedang berlangsung.”
- Microcopy Success: Evaluasi “Evaluasi tersimpan — Data tersimpan. Perubahan tidak dapat dilakukan.”, Penilaian “Penilaian tersimpan — Data tersimpan. Perubahan tidak dapat dilakukan.”

## Aturan Disabled/Read-Only per Status Event
- draft: semua aksi write disabled.
- published: peserta dapat submit evaluasi; pelatih/observer read-only.
- ongoing: pelatih/observer dapat submit penilaian; peserta dapat submit evaluasi.
- completed/cancelled: semua write disabled; semua form read-only.

## Prinsip Copy
- Konsisten: gunakan istilah yang sama pada CTA dan status.
- Ringkas: satu kalimat menjelaskan status dan dampaknya.
- Berorientasi aksi: CTA menggunakan kata kerja langsung.
- Kontekstual: pesan menyebutkan alasan (mis. event tidak sedang berlangsung).

## Catatan Aksesibilitas Dasar
- CTA dan tombol memiliki aria-label yang deskriptif.
- Banner pesan memakai role dan aria-live sesuai konteks.
- Form memakai aria-busy saat loading atau submit.
- Fokus keyboard mengandalkan default browser (tanpa menonaktifkan outline).

## Batasan
- Tidak menambah endpoint backend.
- Tidak menambah fitur bisnis baru.
- Tidak mengubah logika assessment/evaluation/graduation.
