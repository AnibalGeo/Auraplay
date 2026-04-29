import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function FamilyPasswordChangeScreen({ patientId: patientIdProp, onBack }) {
  const { changeFamilyPin, familyPatientId } = useAuth()
  const patientId = patientIdProp || familyPatientId
  console.log('patientId:', patientId)
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChangePin() {
    setError('')
    setSuccess(false)

    if (!currentPin) { setError('Ingresa tu PIN actual'); return }
    if (!newPin || newPin.length < 4) { setError('Nuevo PIN debe tener al menos 4 dígitos'); return }
    if (newPin !== confirmPin) { setError('Los PINs no coinciden'); return }
    if (newPin === currentPin) { setError('El nuevo PIN debe ser diferente'); return }

    const result = changeFamilyPin(patientId, currentPin, newPin)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess(true)
    setTimeout(() => {
      setCurrentPin('')
      setNewPin('')
      setConfirmPin('')
      setSuccess(false)
    }, 2000)
  }

  return (
    <div className="screen">
      <div style={{ padding: '24px 20px', maxWidth: 480, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
              marginBottom: 16, padding: 0, color: '#666'
            }}
          >← Atrás</button>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>
            Cambiar PIN
          </h1>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            Actualiza tu código de acceso familiar
          </p>
        </div>

        {/* Alertas */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
            background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b'
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>✗ {error}</p>
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 20,
            background: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534'
          }}>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>✓ PIN actualizado correctamente</p>
          </div>
        )}

        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* PIN actual */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', display: 'block', marginBottom: 6 }}>
              PIN actual
            </label>
            <input
              type="password"
              inputMode="text"
              maxLength="20"
              value={currentPin}
              onChange={e => setCurrentPin(e.target.value)}
              placeholder="••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb',
                fontSize: 16, fontWeight: 700, boxSizing: 'border-box',
                letterSpacing: 2
              }}
            />
          </div>

          {/* Nuevo PIN */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', display: 'block', marginBottom: 6 }}>
              Nuevo PIN
            </label>
            <input
              type="password"
              inputMode="text"
              maxLength="20"
              value={newPin}
              onChange={e => setNewPin(e.target.value)}
              placeholder="••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb',
                fontSize: 16, fontWeight: 700, boxSizing: 'border-box',
                letterSpacing: 2
              }}
            />
          </div>

          {/* Confirmar PIN */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#666', display: 'block', marginBottom: 6 }}>
              Confirma nuevo PIN
            </label>
            <input
              type="password"
              inputMode="text"
              maxLength="20"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value)}
              placeholder="••••"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #e5e7eb',
                fontSize: 16, fontWeight: 700, boxSizing: 'border-box',
                letterSpacing: 2
              }}
            />
          </div>

          {/* Botón */}
          <button
            onClick={handleChangePin}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              background: '#4aab8a', color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', marginTop: 8, transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.target.style.background = '#3d8a6e'}
            onMouseLeave={e => e.target.style.background = '#4aab8a'}
          >
            Actualizar PIN
          </button>
        </div>

        {/* Info */}
        <div style={{ marginTop: 32, padding: 16, borderRadius: 12, background: '#f0fdf4' }}>
          <p style={{ fontSize: 12, color: '#166534', fontWeight: 600, margin: 0 }}>
            💡 El PIN debe tener al menos 4 dígitos. Úsalo solo para acceso familiar.
          </p>
        </div>
      </div>
    </div>
  )
}