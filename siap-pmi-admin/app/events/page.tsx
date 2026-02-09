export default function EventsPickerPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>Pilih Event</h1>
      <p>Silakan pilih atau masukkan Event ID untuk melanjutkan.</p>
      <ul>
        <li>Halaman ini bersifat global minimal untuk pemilihan event.</li>
        <li>Semua halaman operasional berada pada konteks /events/:eventId/...</li>
      </ul>
    </div>
  );
}
