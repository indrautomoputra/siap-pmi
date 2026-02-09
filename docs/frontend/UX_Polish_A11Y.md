# UX Polish & A11Y Dasar – SIAP PMI (Frontend)

Dokumen ini merangkum perbaikan UX ringan dan aksesibilitas dasar tanpa perubahan backend.

## Daftar Perbaikan UX
- Standarisasi label CTA utama: Isi Evaluasi, Kirim Evaluasi, Nilai / Update Penilaian, Kembali ke Dashboard.
- Microcopy untuk state disabled, read-only, dan success agar konsisten dan jelas.
- Banner pesan terpadu untuk error dan success di flow evaluasi dan penilaian.
- Loading state dengan teks jelas pada halaman evaluasi/penilaian.

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
