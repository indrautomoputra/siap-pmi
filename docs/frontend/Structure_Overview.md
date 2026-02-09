Struktur Frontend – SIAP PMI (Next.js App Router)

Prinsip
- Event-scoped: semua halaman operasional berada di bawah /events/:eventId/.
- Role-aware: akses halaman berdasarkan role per event (Panitia/Pelatih/Observer/Peserta).
- Halaman global minimal: login dan pemilihan event.

Struktur Folder
app/
- (auth)/login/page.tsx — autentikasi
- events/page.tsx — pemilihan event
- events/[eventId]/layout.tsx — context event + menu role
- events/[eventId]/page.tsx — redirect role-aware
- events/[eventId]/panitia/... — area panitia
- events/[eventId]/pelatih/... — area pelatih
- events/[eventId]/observer/... — area observer
- events/[eventId]/peserta/... — area peserta

Event-scoped & Role-aware UI
- Setiap halaman menggunakan EventContext { eventId, eventStatus, role }.
- Guard frontend memastikan role sesuai; bila tidak, render 403 dan arahkan ke /events.
- Wrapper fetch menambahkan header x-event-id untuk konsistensi event-based.

Larangan
- Tidak menambah halaman global non-event.
- Tidak menambah fitur backend maupun endpoint baru.
