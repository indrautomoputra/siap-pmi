Baseline KPI – SIAP PMI (Tanpa Sistem Baru)

Tujuan
- Menetapkan KPI awal untuk monitoring operasional internal tanpa penambahan fitur.
- Menjaga fokus event-based dalam satu provinsi dan freeze perubahan.

Definisi KPI Awal
- Error Rate: Persentase permintaan yang berakhir 4xx/5xx per event.
- Incident Count: Jumlah insiden operasional per event diklasifikasikan P0/P1/P2.
- Waktu Event: Durasi dari kickoff event hingga keputusan kelulusan manusia tercatat di sistem.
- Lead Time Penanganan Insiden: Waktu dari deteksi hingga mitigasi awal untuk tiap prioritas.

Cara Pengambilan Data
- Log Sistem: Agregasi status respons (4xx/5xx), timestamp pencatatan kelulusan, aktivitas utama.
- Pencatatan Manual: Buku log insiden, notulen rapat kelulusan, daftar hadir, eksport CSV disimpan pada evidence pack.
- Rekonsiliasi: Operator mengompilasi ringkasan per event dari log dan bukti manual.

Frekuensi Review
- Mingguan: Tinjauan operasional oleh operator dan panitia untuk event aktif/baru selesai.
- Bulanan: Review manajemen untuk tren KPI dan kebijakan perbaikan (bugfix saja).

Batasan Interpretasi (Single Province)
- KPI hanya berlaku untuk satu provinsi; tidak dapat dibandingkan lintas provinsi.
- Skala event kecil–menengah; hasil tidak merepresentasikan event skala nasional.
- Tanpa fitur baru; perubahan terbatas pada bugfix sehingga perbaikan KPI bersifat operasional.
- Evaluasi/KAP bukan penentu kelulusan; interpretasi KPI tidak mengaitkan skor evaluasi dengan hasil kelulusan.
