'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase, getAccessToken } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = getSupabase();
    if (!sb) {
      setError('Konfigurasi Supabase belum tersedia');
      setLoading(false);
      return;
    }
    const { error: signInError } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    const token = await getAccessToken();
    if (!token) {
      setError('Tidak dapat mengambil JWT dari Supabase');
      setLoading(false);
      return;
    }
    router.replace('/'); // redirect to dashboard root
  };

  return (
    <div style={{ maxWidth: 360, margin: '64px auto' }}>
      <h1>Login Admin</h1>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p style={{ marginTop: 12, fontSize: 12 }}>
        Token disimpan di localStorage sebagai siap_jwt
      </p>
    </div>
  );
}
