'use client';

import MessageBanner from '@/components/MessageBanner';

type StatusBannerProps = {
  status:
    | 'draft'
    | 'published'
    | 'ongoing'
    | 'completed'
    | 'cancelled'
    | string;
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

  if (status === 'completed' || status === 'cancelled') {
    return (
      <MessageBanner
        variant="info"
        message="Event sudah selesai, semua read-only"
      />
    );
  }

  return (
    <MessageBanner
      variant="info"
      message={`Status event: ${status}`}
    />
  );
}
