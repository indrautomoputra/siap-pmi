'use client';

import Forbidden from './Forbidden';

export default function PermissionDenied({ reason }: { reason?: string }) {
  return <Forbidden message={reason ?? 'Role tidak sesuai untuk halaman ini.'} />;
}
