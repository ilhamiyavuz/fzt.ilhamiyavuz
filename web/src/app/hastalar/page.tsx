import { Sidebar } from '@/components/Sidebar';

const hastalar = [
  { ad: 'Mehmet Kaya', tani: 'Ön çapraz bağ rehabilitasyonu', uyum: '%62', agri: '6/10' },
  { ad: 'Elif Demir', tani: 'Omuz sıkışma sendromu', uyum: '%71', agri: '4/10' },
  { ad: 'Ayşe Çelik', tani: 'Bel fıtığı egzersiz programı', uyum: '%85', agri: '3/10' },
];

export default function HastalarPage() {
  return (
    <main className="container" style={{ display: 'flex', gap: 16 }}>
      <Sidebar />
      <section style={{ flex: 1 }}>
        <div className="card">
          <h1>Hasta Listesi</h1>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Ad Soyad</th>
                <th style={{ textAlign: 'left' }}>Program</th>
                <th style={{ textAlign: 'left' }}>Uyum</th>
                <th style={{ textAlign: 'left' }}>Ağrı</th>
              </tr>
            </thead>
            <tbody>
              {hastalar.map((hasta) => (
                <tr key={hasta.ad}>
                  <td>{hasta.ad}</td>
                  <td>{hasta.tani}</td>
                  <td>{hasta.uyum}</td>
                  <td>{hasta.agri}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
