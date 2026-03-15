'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { apiPost } from '@/lib/api';

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export default function GirisPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await apiPost<LoginResponse>('/auth/login', {
        email_or_phone: emailOrPhone,
        password,
      });
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş sırasında beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 500, margin: '64px auto' }}>
        <h1>Giriş</h1>
        <p>E-posta veya telefon ve şifreniz ile giriş yapın.</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 10 }}>
          <input
            placeholder="E-posta veya Telefon"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
          />
          <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }}
          />

          {error ? <p style={{ color: '#be123c', margin: 0 }}>{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            style={{ background: '#146c94', color: '#fff', border: 'none', borderRadius: 8, padding: 12 }}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
          <Link href="/dashboard">Demo Dashboard'a Git</Link>
        </form>
      </div>
    </main>
  );
}
