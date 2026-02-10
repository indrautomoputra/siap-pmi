# CHANGE CONTROL SOP SIAP PMI

## Ruang Lingkup dan Prinsip
SOP ini mengatur pengendalian perubahan selama masa change-freeze pada Sistem SIAP PMI yang sudah dinyatakan READY untuk frontend dan backend. Kebijakan berlaku pada operasional internal single province dengan sistem berbasis event dan role per event.

## Jenis Perubahan yang Diizinkan
Perubahan yang diizinkan terbatas pada bugfix kritis yang berdampak langsung pada keberlangsungan operasional event aktif, keamanan akses data, atau stabilitas layanan, serta tidak menambah fitur baru dan tidak mengubah kebijakan role per event.

## Perubahan yang Dilarang
Dilarang melakukan pengembangan fitur baru, penerapan auto-grading, pengenalan role global lintas event, perubahan alur domain inti, atau perluasan cakupan lintas provinsi.

## Alur Pengajuan Perubahan
Pengajuan perubahan hanya dapat dilakukan oleh PIC Operasional Event atau Admin Sistem Internal yang bertanggung jawab atas operasional harian. Persetujuan wajib diberikan oleh Governance Officer dan Pimpinan Unit Operasional sebelum perubahan dijalankan. Pengajuan harus menyertakan bukti insiden atau kebutuhan kritis, analisis dampak operasional, rencana rollback, serta bukti uji minimal pada skenario yang terdampak.

## Dokumentasi dan Arsip Keputusan
Setiap perubahan yang disetujui harus didokumentasikan dalam log perubahan resmi, mencakup tanggal, alasan, pihak pengusul, pihak penyetuju, ringkasan tindakan, serta hasil verifikasi pasca-perubahan. Seluruh dokumen keputusan dan bukti pendukung diarsipkan untuk keperluan audit internal.
