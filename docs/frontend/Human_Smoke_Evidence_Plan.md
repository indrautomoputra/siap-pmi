# Human Smoke Evidence Plan – Frontend SIAP PMI

## Tujuan Evidence
Menyediakan bukti manual yang dapat diaudit untuk memastikan flow write terbatas berjalan sesuai role dan status event.

## Peran yang Diuji
- Peserta
- Pelatih
- Observer

## Skenario Utama (Ringkas)
1. Peserta mengisi evaluasi pada event published/ongoing sampai sukses dan read-only.
2. Pelatih mengisi penilaian pada event ongoing sampai sukses dan read-only.
3. Observer mencoba akses route pelatih dan menerima Forbidden.
4. Event completed menonaktifkan semua CTA write dengan alasan jelas.
5. Validasi kembali status dashboard setelah submit (Sudah terkirim/read-only).

## Evidence yang Dikumpulkan
- Screenshot dashboard sebelum klik CTA.
- Screenshot halaman form (evaluasi/penilaian).
- Screenshot success/read-only setelah submit.
- Screenshot forbidden/disabled untuk akses role/event tidak sesuai.

## PIC Pelaksana
Nama: ____________________  
Jabatan/Unit: ____________________  
Kontak: ____________________

## Estimasi Waktu Eksekusi
- 60–90 menit untuk 1 event dan 3 role (peserta, pelatih, observer).

## Catatan
- Evidence disimpan pada folder /docs/evidence/frontend-smoke-YYYYMMDD/.
- Tidak ada perubahan backend atau logika bisnis.
