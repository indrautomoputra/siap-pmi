'use client';
import { useEventContext } from '../EventContext';
import RequireEventRole from '@/components/RequireEventRole';
import EmptyState from '@/components/EmptyState';
import DisabledActionBanner from '@/components/DisabledActionBanner';

export default function ClosurePage() {
  const { eventStatus } = useEventContext();

  return (
    <RequireEventRole allowed={['PANITIA']}>
      <div style={{ padding: 16, display: 'grid', gap: 12 }}>
        <div>
          <h2>Penutupan Event</h2>
          <div style={{ color: '#666' }}>Ringkasan penutupan bersifat read-only.</div>
        </div>
        {eventStatus !== 'completed' ? (
          <DisabledActionBanner
            reason={`Status event ${eventStatus}. Penutupan tersedia setelah event selesai.`}
          />
        ) : null}
        <EmptyState
          title="Data penutupan belum tersedia"
          description="Ringkasan penutupan dan checklist akan tampil setelah seluruh dokumen lengkap."
        />
        <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Checklist Penutupan (View-only)</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: '#555' }}>
            <li>Assessment lengkap dan tervalidasi</li>
            <li>Evaluation peserta lengkap</li>
            <li>Rapat kelulusan dilakukan dan dicatat</li>
            <li>Kelulusan dicatat manual pada event</li>
            <li>Event ditutup dan arsip disimpan</li>
          </ul>
        </div>
      </div>
    </RequireEventRole>
  );
}
