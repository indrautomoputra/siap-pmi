# LESSONS LEARNED LOG SIAP PMI

## Tujuan
Dokumen ini digunakan untuk mencatat pelajaran yang diperoleh dari insiden operasional pada Sistem SIAP PMI agar perbaikan prosedural dapat dilakukan secara konsisten dan terdokumentasi untuk audit internal.

## Format Pencatatan
Setiap entri mencakup tanggal, insiden, pembelajaran, dan tindakan. Informasi disajikan ringkas namun jelas agar mudah ditelusuri saat audit, dan dapat mencantumkan eventId sebagai konteks operasional bila diperlukan.

## Contoh Entri
Entri 1 pada tanggal 2026-02-10 untuk insiden auth/akses pada eventId EVT-OPS-013, dengan pembelajaran bahwa verifikasi role per event harus dilakukan sebelum sesi dimulai untuk mencegah hambatan login. Tindakan yang dicatat adalah penerapan penguatan checklist verifikasi role per event dan pengaturan ulang sesi sesuai prosedur operasional.

Entri 2 pada tanggal 2026-02-10 untuk insiden data/UI pada eventId EVT-OPS-021, dengan pembelajaran bahwa koordinasi jadwal pengisian assessment harus seragam agar pengumpulan data tidak tertunda. Tindakan yang dicatat adalah penetapan jadwal pengisian terstandar dan pengingat internal terjadwal sebelum sesi assessment.

## Aturan Pemeliharaan Log
Log dipelihara oleh Ops Support dan diverifikasi oleh Incident Lead setelah setiap insiden ditutup. Setiap entri wajib dibuat maksimal satu hari kerja setelah penutupan insiden dan disimpan dalam arsip operasional untuk keperluan audit internal.
