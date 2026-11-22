export default function BookDetailLoading() {
  return (
    <main style={{ minHeight: '100vh', background: '#f5faff', padding: '100px 24px' }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 48,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 290,
          aspectRatio: '4 / 5',
          borderRadius: 18,
          background: '#e2eaf4',
        }} />
        <div>
          <div style={{
            width: '60%',
            height: 28,
            borderRadius: 8,
            background: '#e2eaf4',
            marginBottom: 22,
          }} />
          <div style={{
            width: '35%',
            height: 22,
            borderRadius: 8,
            background: '#e2eaf4',
            marginBottom: 40,
          }} />
          <p style={{ color: '#64748b' }}>Номын мэдээллийг ачаалж байна...</p>
        </div>
      </div>
    </main>
  )
}
