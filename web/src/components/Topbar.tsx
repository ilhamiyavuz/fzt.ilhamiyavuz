export function Topbar() {
  return (
    <header className="card" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <strong>Merhaba, Dr. Ayşe Yılmaz</strong>
        <p style={{ margin: '6px 0 0 0', color: '#6b7280' }}>Bugünkü hasta takibini buradan yönetebilirsiniz.</p>
      </div>
      <button
        style={{
          background: '#146c94',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '10px 14px',
          cursor: 'pointer',
        }}
      >
        Yeni Hasta Ekle
      </button>
    </header>
  );
}
