'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading] = useState(false);

  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      const token = data.session?.access_token ?? null;
      if (token) {
        try {
          window.localStorage.setItem('siap_jwt', token);
        } catch {}
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      const token = session?.access_token ?? null;
      if (token) {
        try {
          window.localStorage.setItem('siap_jwt', token);
        } catch {}
      } else {
        try {
          window.localStorage.removeItem('siap_jwt');
        } catch {}
      }
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const sb = getSupabaseClient();
    if (!sb) return;
    await sb.auth.signOut();
    try {
      window.localStorage.removeItem('siap_jwt');
    } catch {}
  };

  return { user, loading, signOut };
}
