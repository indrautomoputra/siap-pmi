# CHANGE CONTROL SOP SIAP PMI

## Tujuan Change Control
SOP ini memastikan setiap perubahan pada Sistem SIAP PMI selama masa change-freeze dilakukan secara tertib, terdokumentasi, dan hanya untuk kebutuhan kritis yang menjaga kontinuitas operasional internal single province dengan sistem event-based dan role per event.

## Jenis Perubahan yang Diizinkan
Perubahan yang diizinkan terbatas pada bugfix kritis serta perbaikan keamanan atau integritas data yang berdampak langsung pada operasional event aktif. Setiap perubahan harus menjaga kebijakan role per event dan tidak memperluas cakupan di luar provinsi.

## Perubahan yang Dilarang
Dilarang melakukan pengembangan fitur baru, penerapan auto-grading, pengenalan role global, serta perubahan pada domain pelatihan yang mengubah alur inti pelaksanaan event.

## Alur Pengajuan Perubahan
Pengusul perubahan adalah PIC Operasional Event atau Admin Sistem Internal yang bertanggung jawab atas layanan harian. Reviewer berasal dari fungsi governance yang memeriksa kesesuaian dengan kebijakan change-freeze dan dampak operasional. Approver adalah Governance Officer dan Pimpinan Unit Operasional yang memberikan persetujuan final sebelum perubahan dijalankan.

## Bukti yang Wajib Disertakan
Pengajuan wajib menyertakan bukti insiden atau kebutuhan kritis, analisis dampak operasional, rencana rollback, serta bukti uji minimal pada skenario yang terdampak, termasuk penegasan bahwa tidak ada fitur baru yang ditambahkan.

## Dokumentasi dan Arsip Keputusan
Setiap perubahan yang disetujui didokumentasikan dalam log perubahan resmi, mencakup tanggal, alasan, pihak pengusul, pihak reviewer, pihak approver, ringkasan tindakan, dan hasil verifikasi pasca-perubahan. Seluruh dokumen keputusan serta bukti pendukung diarsipkan untuk keperluan audit internal.
