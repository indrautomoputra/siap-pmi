Tabletop Exercise (TTX) – SIAP PMI (Operasional Internal)

Tujuan
- Memvalidasi kesiapan operasional sistem yang sudah hardened tanpa fitur baru.
- Menegaskan praktik event-based dan role per event.
- Meneguhkan kebijakan kelulusan melalui rapat manusia; sistem hanya mencatat.
- Menjaga freeze perubahan (hanya bugfix) dan memastikan evaluasi/KAP tidak mempengaruhi kelulusan.

Ruang Lingkup
- Internal, satu provinsi saja (tidak lintas provinsi).
- Event skala kecil–menengah.
- Fokus pada proses manusia, tata kelola, dan evidencing.

Skenario Normal (Event Kecil–Menengah)
- Panitia membuat dan mengonfirmasi event internal aktif.
- Peserta mendaftar pada event tersebut; operator memverifikasi identitas dasar.
- Pelatih melakukan penilaian/assessment sesuai modul; data masuk ke sistem pada konteks event yang sama.
- Panitia mengkonsolidasi hasil dan menyiapkan bahan rapat kelulusan.
- Rapat kelulusan dilaksanakan; keputusan manusia ditetapkan (lulus/tidak/ditunda).
- Operator mencatat keputusan rapat ke sistem pada event yang sama; sistem menyimpan audit log.
- Panitia melakukan ekspor data (peserta/assessment/graduation) sebagai bukti dan menyimpan ke evidence pack.

Skenario Masalah
- Salah Role:
  - Contoh: Peserta mencoba mengakses endpoint kelulusan atau ekspor.
  - Ekspektasi: Ditolak oleh guard role; operator mengedukasi pengguna untuk menggunakan jalur yang sesuai.
- Salah Input (Event Context Mismatch):
  - Contoh: Header x-event-id berbeda dengan :eventId pada rute, atau payload mengacu ke event lain.
  - Ekspektasi: Ditolak (permission/validation) sesuai kebijakan event-based; operator mengembalikan proses ke event yang benar.
- Perubahan Keputusan:
  - Contoh: Rapat memutuskan revisi kelulusan setelah ditemukan bukti tambahan.
  - Ekspektasi: Keputusan direvisi oleh manusia melalui prosedur resmi; sistem mencatat perubahan beserta alasan dan bukti pendukung.

Pertanyaan Diskusi (Panitia/Pelatih/Operator)
- Panitia: Bagaimana memastikan semua aktivitas terjadi pada event yang sama (header, rute, data)?
- Panitia: Rencana bukti apa yang wajib dikumpulkan untuk rapat kelulusan dan setelahnya?
- Pelatih: Bagaimana menjamin penilaian tidak melampaui kewenangan role dan tetap pada event terkait?
- Operator: Langkah apa saat ada input yang ditolak karena mismatch event atau role?
- Semua: Bagaimana jalur eskalasi jika terjadi insiden prioritas tinggi (P0/P1)?
- Semua: Bagaimana memastikan freeze perubahan (hanya bugfix) ditegakkan selama periode event?
- Semua: Bagaimana menegakkan bahwa evaluasi/KAP tidak mempengaruhi kelulusan, hanya bahan masukan rapat?

Expected Decision & Tindakan (Tanpa Coding)
- Menegaskan bahwa akses dan data harus konsisten pada event yang sama; penolakan adalah perilaku yang diharapkan bila mismatch.
- Menetapkan prosedur edukasi pengguna saat ditolak oleh guard role atau event mismatch.
- Menetapkan tata cara rapat kelulusan, termasuk format notulen, daftar hadir, dan alasan keputusan.
- Menetapkan langkah pencatatan keputusan di sistem (operator) beserta lampiran bukti ke evidence pack.
- Menegaskan kebijakan freeze: tidak ada fitur baru, tidak lintas provinsi, hanya bugfix bila perlu.
- Menetapkan jalur eskalasi P0/P1/P2 dan kanal komunikasi resmi untuk insiden.
- Menetapkan ritme review operasional (mingguan/bulanan) dan tanggung jawab PIC.
