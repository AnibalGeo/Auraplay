function ProgressBar({ current, total }) {
  return (
    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--teal)', fontWeight: '600', padding: '8px 20px 0' }}>
      Ejercicio {current} de {total}
    </div>
  )
}

export default ProgressBar
