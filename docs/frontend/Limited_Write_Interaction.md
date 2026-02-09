Limited Write Interaction – SIAP PMI (Next.js App Router)

Alur Evaluasi Peserta
- Halaman: /events/:eventId/peserta/evaluation
- Guard: role PESERTA (event-based).
- Fetch evaluasi existing: GET /events/:eventId/evaluations/me (x-event-id wajib).
- Jika belum ada, peserta mengisi responses (JSON) sesuai DTO CreateEvaluationRequestDto.
- Submit: POST /events/:eventId/evaluations dengan enrollmentId dan responses.
- Setelah submit sukses, UI menampilkan status “Evaluasi sudah dikirim” dan form menjadi read-only.
- Status event: published/ongoing boleh isi, draft/completed/cancelled disabled/read-only.

Alur Assessment Pelatih/Observer
- Halaman: /events/:eventId/pelatih/assessments/:participantId
- Halaman: /events/:eventId/observer/assessments/:participantId
- Guard: role PELATIH atau OBSERVER (event-based).
- Fetch assessment existing: GET /events/:eventId/assessments lalu filter by assesseeEnrollmentId.
- Form mengikuti DTO CreateAssessmentScoreRequestDto (type dan payload JSON; instrumentId opsional).
- Submit: POST /events/:eventId/assessments tanpa perhitungan total di frontend.
- Status event: hanya ongoing yang boleh submit; selain itu read-only.

Batasan Write Interaction
- Tidak menambah endpoint backend dan tidak menambah fitur bisnis baru.
- Semua request memakai eventFetch dan header x-event-id.
- 401 diarahkan ke /login; 403 menampilkan Forbidden.
- Error validasi menampilkan pesan backend apa adanya.
- Kelulusan tetap hasil rapat (read-only di UI).

Kenapa Tidak Ada Auto-Grading
- Aturan organisasi menetapkan keputusan kelulusan berasal dari rapat manusia.
- Penilaian/evaluasi hanya sebagai bahan masukan, bukan penentu otomatis.
