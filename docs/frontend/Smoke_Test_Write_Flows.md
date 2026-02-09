# Smoke Test Write Flows – SIAP PMI (Frontend)

Dokumen ini memuat skenario minimum untuk memverifikasi alur write yang sudah ada tanpa perubahan backend.

## 1) Peserta – Evaluasi
**Langkah**
- Login sebagai peserta.
- Pilih event dengan status published.
- Dari dashboard peserta, klik Isi Evaluasi.
- Isi form evaluasi dan submit.
- Buka kembali halaman evaluasi.

**Ekspektasi**
- CTA Isi Evaluasi muncul saat status published/ongoing dan evaluasi belum ada.
- Submit berhasil menampilkan banner sukses dan form menjadi read-only.
- Terdapat tombol Kembali ke Dashboard.
- Setelah submit, dashboard menampilkan status “Sudah terkirim” dan link view read-only.

**Verifikasi**
- UI: tombol submit disabled saat mengirim, tidak ada double submit.
- UI: state read-only jelas (input disabled + label).
- Response: POST /events/:eventId/evaluations mengembalikan 2xx.
- Event scoping: request memakai header x-event-id dan tidak bisa lintas event.

## 2) Pelatih – Assessment Peserta
**Langkah**
- Login sebagai pelatih.
- Pilih event dengan status ongoing.
- Dari dashboard pelatih, pilih peserta dan klik Nilai/Update Penilaian.
- Isi form assessment dan submit.
- Buka kembali halaman assessment.

**Ekspektasi**
- CTA Nilai/Update Penilaian aktif saat event ongoing.
- Submit berhasil menampilkan banner sukses dan form menjadi read-only.
- Terdapat tombol Kembali ke Dashboard.
- Jika sudah ada penilaian, halaman tampil read-only.

**Verifikasi**
- UI: tombol submit disabled saat mengirim, tidak ada double submit.
- UI: state read-only jelas (input disabled + label).
- Response: POST /events/:eventId/assessments mengembalikan 2xx.
- Event scoping: request memakai header x-event-id dan tidak bisa lintas event.

## 3) Observer – Proteksi Akses Pelatih
**Langkah**
- Login sebagai observer.
- Coba akses route pelatih: /events/:eventId/pelatih/assessments/:participantId.

**Ekspektasi**
- Halaman menampilkan 403 dan tidak menampilkan konten pelatih.

**Verifikasi**
- UI: Forbidden tampil konsisten.
- Response: API menolak akses (403) saat mencoba akses pelatih.

## 4) Event Completed – Read-Only
**Langkah**
- Pilih event dengan status completed.
- Akses dashboard peserta dan halaman evaluasi.
- Akses dashboard pelatih/observer dan halaman assessment.

**Ekspektasi**
- Semua CTA write disabled dan menampilkan alasan.
- Semua form tampil read-only tanpa submit.

**Verifikasi**
- UI: alasan disabled tampil (mis. “Event sudah selesai.”).
- Response: tidak ada request write yang berhasil.
