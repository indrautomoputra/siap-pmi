'use client';

import MessageBanner from '@/components/MessageBanner';

interface StatusBannerProps {
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  className?: string;
}

export default function StatusBanner({ status, className }: StatusBannerProps) {
  if (status === 'ongoing') {
    return null;
  }

  if (status === 'draft' || status === 'published') {
    return (
      <div className={className}>
        <MessageBanner
          variant="info"
          message="Event belum berjalan, aksi tulis belum tersedia"
        />
      </div>
    );
  }

  if (status === 'completed' || status === 'cancelled') {
    return (
      <div className={className}>
        <MessageBanner
          variant="info"
          message="Event sudah selesai, semua read-only"
        />
      </div>
    );
  }

  return <div className={className} />;
}
