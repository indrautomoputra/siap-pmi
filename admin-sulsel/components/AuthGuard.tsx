'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const hasToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage.getItem('siap_jwt');
  } catch {
    return false;
  }
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!hasToken()) {
      router.replace('/login');
    }
  }, [router]);
  return <>{children}</>;
}
