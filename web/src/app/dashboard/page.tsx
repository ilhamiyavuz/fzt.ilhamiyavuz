'use client';

import { useEffect, useMemo, useState } from 'react';

import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { apiGet } from '@/lib/api';

type DashboardResponse = {
  total_active_patients: number;
  today_exercised_count: number;
  active_program_count: number;
  message: string;
};

const fallbackData: DashboardResponse = {
  total_active_patients: 0,
  today_exercised_count: 0,
  active_program_count: 0,
  message: 'Veri bulunamadı',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardResponse>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('access_token') || '';
  }, []);

  useEffect(() => {
    let active = true;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiGet<DashboardResponse>('/physiotherapists/me/dashboard', token || undefined);
        if (active) setData(response);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Dashboard verisi alınamadı');
          setData(fallbackData);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="container" style={{ display: 'flex', gap: 16 }}>
      <Sidebar />
      <section style={{ flex: 1 }}>
        <Topbar />

        {error ? (
          <div className="card" style={{ marginBottom: 16, color: '#be123c' }}>
            {error}
          </div>
        ) : null}

        <div className="grid grid-3">
          <article className="card">
            <h3>Toplam Aktif Hasta</h3>
            <p style={{ fontSize: 28, margin: 0 }}>{loading ? '...' : data.total_active_patients}</p>
          </article>
          <article className="card">
            <h3>Bugün Egzersiz Yapan</h3>
            <p style={{ fontSize: 28, margin: 0 }}>{loading ? '...' : data.today_exercised_count}</p>
          </article>
          <article className="card">
            <h3>Aktif Program Sayısı</h3>
            <p style={{ fontSize: 28, margin: 0 }}>{loading ? '...' : data.active_program_count}</p>
          </article>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Durum Mesajı</h3>
          <p>{loading ? 'Yükleniyor...' : data.message}</p>
        </div>
      </section>
    </main>
  );
}
