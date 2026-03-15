import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container">
      <div className="card" style={{ maxWidth: 560, margin: '64px auto', textAlign: 'center' }}>
        <h1>Fizyoterapist Web Paneline Hoş Geldiniz</h1>
        <p>Hasta takibi, egzersiz reçeteleme ve AI analiz sonuçlarını tek ekranda yönetin.</p>
        <Link href="/giris">Panele Giriş Yap</Link>
      </div>
    </main>
  );
}
