Auth & Role Resolution – SIAP PMI (Next.js App Router)

Alur Session Auth
- Frontend menggunakan Supabase Auth session.
- Hook useAuth membaca session, menyimpan JWT ke localStorage (siap_jwt), dan mendengarkan perubahan auth state.
- AuthGuard tetap memverifikasi keberadaan token untuk akses halaman non-login.

Role Per Event (Source of Truth)
- Role diambil per event dari tabel event_role_assignments melalui Supabase (RLS).
- Tidak ada role global; role hanya berlaku di event terkait.
- Jika tidak ada role pada event, pengguna dianggap tidak terdaftar dan diarahkan ke /events.

Event Status
- Status event diambil dari API list /events (AuthGuard aktif).
- Status dipakai sebagai state UI untuk enable/disable tombol tanpa logika bisnis baru.

Guard Frontend
- RequireEventRole memakai EventContext.role dan loading state.
- Jika loading: tampilkan state memuat.
- Jika role null: redirect ke /events.
- Jika role tidak sesuai: render 403.

Event-scoping & x-event-id
- Semua request event-scoped memakai header x-event-id.
- eventFetch menambahkan x-event-id dan Authorization.
- Status 401 mengarahkan ke /login.
- Status 403 menghasilkan Forbidden state di UI.

Catatan
- Tidak ada endpoint backend baru.
- Tidak ada logic bisnis baru di frontend.
