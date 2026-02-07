import { createClient, SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    if (typeof window === 'undefined') {
      return null;
    }
  }
  client = createClient(url, key);
  return client;
};

export const getAccessToken = async (): Promise<string | null> => {
  const sb = getSupabase();
  if (!sb) return null;
  const {
    data: { session },
  } = await sb.auth.getSession();
  const token = session?.access_token ?? null;
  if (typeof window !== 'undefined') {
    if (token) {
      try {
        window.localStorage.setItem('siap_jwt', token);
      } catch {}
    }
  }
  return token;
};
