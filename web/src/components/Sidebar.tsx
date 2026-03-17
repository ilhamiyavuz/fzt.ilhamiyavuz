import Link from 'next/link';

const links = [
  { href: '/dashboard', label: 'Genel Dashboard' },
  { href: '/hastalar', label: 'Hasta Listesi' },
  { href: '/egzersizler', label: 'Egzersiz Reçeteleme' },
  { href: '/dashboard', label: 'Takip ve Analiz' },
  { href: '/dashboard', label: 'Klinik Notlar' },
  { href: '/dashboard', label: 'Raporlar' },
];

export function Sidebar() {
  return (
    <aside className="card" style={{ minWidth: 260, height: 'fit-content' }}>
      <h2 style={{ marginTop: 0 }}>Fizyoterapist Paneli</h2>
      <nav style={{ display: 'grid', gap: 10 }}>
        {links.map((item) => (
          <Link key={item.href + item.label} href={item.href} style={{ textDecoration: 'none', color: '#1f2937' }}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
