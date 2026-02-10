# INCIDENT DRILL – TABLETOP SIAP PMI

## Tujuan Drill
Dokumen ini menjadi pedoman simulasi insiden berbasis tabletop untuk memastikan kesiapan respons tim pada Sistem SIAP PMI dengan fokus pada keputusan operasional, koordinasi, dan dokumentasi tanpa perubahan kode atau fitur.

## Ruang Lingkup
Drill ini berlaku untuk penggunaan internal pada tingkat provinsi dengan cakupan single province. Seluruh simulasi bersifat event-based dan mengikuti ketentuan role per event.

## Peran dalam Drill
Incident Lead bertanggung jawab mengoordinasikan respons, memastikan keputusan operasional, dan menutup drill. Ops Support bertugas melakukan verifikasi kondisi, pencatatan waktu, serta komunikasi internal. Admin Event bertugas memeriksa status event dan hak akses per event. Observer bertugas merekam temuan, kepatuhan proses, dan kualitas komunikasi.

## Skenario 1: AUTH/AKSES – User Sah Tidak Bisa Login Saat Event Ongoing
### Trigger
Pada saat event berlangsung, beberapa peserta melaporkan tidak dapat login meskipun kredensial valid.
### Dampak
Partisipasi peserta terhambat, aktivitas event tertunda, dan potensi penurunan kepatuhan jadwal operasional.
### Langkah Respon Menit-ke-Menit
Menit 0–5 dilakukan verifikasi awal oleh Ops Support untuk memastikan event terkait, waktu kejadian, dan jumlah pengguna terdampak. Menit 6–10 Admin Event memeriksa status event dan memastikan role per event peserta masih aktif. Menit 11–15 Incident Lead memutuskan pengumuman internal, menginstruksikan pencatatan insiden, dan penyesuaian alur operasional sementara. Menit 16–25 Ops Support mengumpulkan bukti gejala, mencatat waktu dan dampak, serta memvalidasi bahwa tidak ada perubahan fitur dilakukan. Menit 26–40 dilakukan komunikasi internal terarah kepada pihak terkait, memastikan akses hanya pada event yang terdampak. Menit 41–60 dilakukan penilaian stabilitas akses dan penetapan langkah mitigasi operasional, termasuk pengaturan ulang jadwal kegiatan internal jika diperlukan.
### Keputusan Operasional
Menunda sementara aktivitas yang memerlukan login, menetapkan waktu ulang sesi, dan mengarahkan peserta menggunakan jalur komunikasi resmi tanpa melakukan perubahan sistem.
### Kriteria Selesai
Kondisi login kembali normal, daftar pengguna terdampak diverifikasi, dan keputusan operasional tercatat dengan bukti komunikasi internal.

## Skenario 2: DATA/UI – Form Assessment Gagal Submit (Client Error)
### Trigger
Pelatih atau observer melaporkan form assessment gagal disubmit dengan pesan error pada sisi client.
### Dampak
Data assessment belum tercatat, potensi keterlambatan penilaian, dan risiko ketidaklengkapan data event.
### Langkah Respon
Ops Support memastikan event terkait, jenis form, dan jumlah pengguna terdampak. Admin Event memeriksa status event dan hak akses per event untuk role yang mengisi assessment. Incident Lead memutuskan langkah operasional sementara, termasuk penggunaan waktu tambahan pengisian. Ops Support memastikan bukti tangkapan layar dan kronologi terkumpul serta melakukan komunikasi internal untuk penyesuaian jadwal dan pengingat pengisian ulang setelah kondisi stabil tanpa melakukan perubahan fitur.
### Keputusan Operasional
Memberikan waktu pengisian tambahan, mengarahkan pelatih atau observer untuk menunggu stabilisasi, dan mendokumentasikan kejadian sebagai insiden operasional.
### Kriteria Selesai
Form assessment dapat disubmit kembali, data assessment pada event tersebut tercatat, dan laporan insiden selesai.

## Skenario 3: OPERASIONAL – Role Salah Terpasang pada Event Aktif
### Trigger
Ditemukan role per event terpasang keliru sehingga pengguna mendapatkan akses yang tidak semestinya pada event aktif.
### Dampak
Risiko akses tidak sah, potensi perubahan data oleh pihak yang tidak berwenang, dan pelanggaran tata kelola role per event.
### Langkah Respon
Ops Support mencatat kejadian dan mengidentifikasi event serta akun yang terdampak. Admin Event memeriksa penetapan role per event dan memastikan daftar role yang benar. Incident Lead memutuskan pembatasan akses sementara pada akun terkait melalui penyesuaian operasional yang diizinkan. Ops Support mencatat perubahan operasional yang dilakukan, menginformasikan pemangku kepentingan internal, dan melakukan verifikasi ulang akses sesuai role per event.
### Keputusan Operasional
Melakukan koreksi penetapan role per event sesuai prosedur internal, membatasi akses pada akun terdampak, dan memastikan tidak ada tindakan lintas event.
### Kriteria Selesai
Role per event sudah sesuai, akses kembali normal, serta dokumentasi koreksi dan komunikasi internal lengkap.

## Checklist Keberhasilan Drill
Drill dinyatakan berhasil apabila seluruh peran menjalankan tugasnya, waktu respons tercatat, keputusan operasional tanpa coding diambil dan dijalankan, komunikasi internal terdokumentasi, dan laporan ringkas drill tersedia untuk audit.
