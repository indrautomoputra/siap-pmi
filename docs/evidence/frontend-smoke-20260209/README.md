# Evidence Pack – Frontend Smoke Test (Write Flows)
Tanggal: 2026-02-09  
Target: SIAP PMI Frontend (Next.js)

## Ringkasan
- Dev server dijalankan: npm run dev (siap-pmi-admin) berhasil start.
- Manual smoke test di browser: **Blocked** (tidak ada akses browser/login interaktif di environment ini).
- Evidence screenshot: **Belum tersedia** (butuh eksekusi manual di browser).

## Hasil Skenario
1) Peserta – Evaluasi  
Status: **Blocked**  
Catatan: Butuh login peserta, submit evaluasi, verifikasi read-only dan status “Sudah terkirim”.

2) Pelatih – Assessment Peserta  
Status: **Blocked**  
Catatan: Butuh login pelatih, submit assessment, verifikasi read-only dan CTA sesuai state.

3) Observer – Proteksi Akses Pelatih  
Status: **Blocked**  
Catatan: Butuh login observer, akses route pelatih untuk verifikasi Forbidden 403.

4) Event Completed – Read-Only  
Status: **Blocked**  
Catatan: Butuh event status completed untuk verifikasi CTA disabled dan alasan jelas.

## Evidence
Folder screenshot: ./screenshots  
Folder logs: ./logs  
Daftar evidence yang dibutuhkan per skenario:
- Dashboard sebelum CTA
- Halaman form
- Success/read-only setelah submit
- Forbidden/disabled untuk skenario 3 & 4
