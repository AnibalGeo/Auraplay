function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div style={{ width: '100%', padding: '10px 20px 0', boxSizing: 'border-box' }}>
      <div style={{ background: '#e8f5f0', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
        <div style={{
          background: 'var(--teal)',
          height: '100%',
          width: `${pct}%`,
          borderRadius: '99px',
          transition: 'width 0.35s ease',
        }} />
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text2)', marginTop: '5px' }}>
        {current} de {total}
      </div>
    </div>
  )
}

export default ProgressBar
