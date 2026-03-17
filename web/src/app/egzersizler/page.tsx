import { Sidebar } from '@/components/Sidebar';

export default function EgzersizlerPage() {
  return (
    <main className="container" style={{ display: 'flex', gap: 16 }}>
      <Sidebar />
      <section style={{ flex: 1 }}>
        <div className="card">
          <h1>Egzersiz Reçeteleme</h1>
          <p>Hazır protokolden hızlı plan oluşturun veya manuel program yazın.</p>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="card">
              <h3>Hazır Protokoller</h3>
              <ul>
                <li>Ön çapraz bağ rehabilitasyonu</li>
                <li>Menisküs rehabilitasyonu</li>
                <li>Rotator cuff onarımı sonrası rehabilitasyon</li>
              </ul>
            </div>
            <div className="card">
              <h3>Program Parametreleri</h3>
              <p>Set: 3 • Tekrar: 10 • Bekleme: 2 sn • Dinlenme: 30 sn</p>
              <button style={{ background: '#146c94', color: '#fff', border: 'none', borderRadius: 8, padding: 10 }}>
                Hastaya Ata
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
