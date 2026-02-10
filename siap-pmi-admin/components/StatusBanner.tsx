'use client';

import MessageBanner from '@/components/MessageBanner';
import { EventStatus } from '@/app/events/[eventId]/EventContext';

type StatusBannerProps = {
  status: EventStatus;
};

export default function StatusBanner({ status }: StatusBannerProps) {
  if (status === 'ongoing') {
    return null;
  }

  if (status === 'draft' || status === 'published') {
    return (
      <MessageBanner
        variant="info"
        message="Event belum berjalan, aksi tulis belum tersedia"
      />
    );
  }

  return (
    <MessageBanner
      variant="info"
      message="Event sudah selesai, semua read-only"
    />
  );
}
