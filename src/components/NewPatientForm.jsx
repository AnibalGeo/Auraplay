import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'
import { savePatient } from '../data/patients'

function formatRut(value) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const bodyDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${bodyDots}-${dv}`
}

function validateRut(rut) {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0, mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const expectedStr = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === expectedStr
}

function calcAgeMonths(birthDate) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()))
}

const LEVEL_IDS = Object.keys(LEVELS)

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '12px',
  border: '2px solid #e8f5f0', fontSize: '15px', color: '#2d2d2d',
  outline: 'none', boxSizing: 'border-box', background: 'white',
}

const labelStyle = {
  fontSize: '11px', fontWeight: '700', color: '#aaa',
  display: 'block', marginBottom: '5px', letterSpacing: '0.4px',
}

export default function NewPatientForm({ onSaved, onBack }) {
  const { loadPatient, setLevelById } = usePatient()
  const [form, setForm] = useState({
    rut: '', name: '', birthDate: '', phone: '', guardianName: '',
    diagnosis: 'tel', levelId: 'N4',
  })
  const [errors, setErrors] = useState({})

  const ageMonths = calcAgeMonths(form.birthDate)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  function handleRutChange(value) {
    const formatted = formatRut(value)
    setForm(f => ({ ...f, rut: formatted }))
    if (formatted.length > 3) {
      setErrors(e => ({ ...e, rut: validateRut(formatted) ? null : 'RUT inválido' }))
    } else {
      setErrors(e => ({ ...e, rut: null }))
    }
  }

  function handleSave() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.'
    if (!form.rut.trim()) newErrors.rut = 'El RUT es obligatorio.'
    else if (!validateRut(form.rut)) newErrors.rut = 'RUT inválido.'
    if (!form.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria.'
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    const now = new Date().toISOString()
    const saved = savePatient({ ...form, ageMonths, initialLevelId: form.levelId, createdAt: now, updatedAt: now })
    loadPatient(saved)
    setLevelById(saved.levelId)
    onSaved()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {onBack && (
          <button onClick={onBack} style={{ background: '#f0faf6', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', color: '#2d7a62' }}>←</button>
        )}
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#3a3a3a' }}>Nuevo paciente</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>RUT</label>
          <input
            value={form.rut}
            onChange={e => handleRutChange(e.target.value)}
            placeholder="Ej: 12.345.678-9"
            style={{ ...inputStyle, borderColor: errors.rut ? '#e07a5f' : '#e8f5f0' }}
          />
          {errors.rut && <p style={{ fontSize: '12px', color: '#e07a5f', marginTop: '4px' }}>{errors.rut}</p>}
        </div>

        {[
          { label: 'NOMBRE COMPLETO', field: 'name', placeholder: 'Ej: Mateo González', error: errors.name },
          { label: 'TELÉFONO (opcional)', field: 'phone', placeholder: 'Ej: +56 9 8765 4321' },
          { label: 'NOMBRE DEL TUTOR (opcional)', field: 'guardianName', placeholder: 'Ej: Ana González' },
        ].map(({ label, field, placeholder, error }) => (
          <div key={field}>
            <label style={labelStyle}>{label}</label>
            <input
              value={form[field]}
              onChange={e => set(field, e.target.value)}
              placeholder={placeholder}
              style={{ ...inputStyle, borderColor: error ? '#e07a5f' : '#e8f5f0' }}
            />
            {error && <p style={{ fontSize: '12px', color: '#e07a5f', marginTop: '4px' }}>{error}</p>}
          </div>
        ))}

        <div>
          <label style={labelStyle}>FECHA DE NACIMIENTO</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={e => set('birthDate', e.target.value)}
            style={{ ...inputStyle, borderColor: errors.birthDate ? '#e07a5f' : '#e8f5f0' }}
          />
          {errors.birthDate && <p style={{ fontSize: '12px', color: '#e07a5f', marginTop: '4px' }}>{errors.birthDate}</p>}
          {form.birthDate && !errors.birthDate && (
            <p style={{ fontSize: '12px', color: '#4aab8a', marginTop: '4px' }}>
              {Math.floor(ageMonths / 12)},{ageMonths % 12} años ({ageMonths} meses)
            </p>
          )}
        </div>

        <div>
          <label style={labelStyle}>DIAGNÓSTICO</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Object.entries(STIMULUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => set('diagnosis', key)}
                style={{
                  flex: 1, padding: '10px 6px', borderRadius: '12px',
                  border: `2px solid ${form.diagnosis === key ? cfg.color : '#e8f5f0'}`,
                  background: form.diagnosis === key ? cfg.color + '15' : 'white',
                  cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                  color: form.diagnosis === key ? cfg.color : '#aaa',
                  transition: 'all 0.15s', lineHeight: '1.3',
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>NIVEL INICIAL</label>
          <select
            value={form.levelId}
            onChange={e => set('levelId', e.target.value)}
            style={{ ...inputStyle }}
          >
            {LEVEL_IDS.map(id => (
              <option key={id} value={id}>{LEVELS[id].label} — {LEVELS[id].ageRange}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: '#4aab8a', color: 'white', fontSize: '15px', fontWeight: '800',
            cursor: 'pointer', marginTop: '4px',
          }}
        >
          Crear paciente →
        </button>
      </div>
    </div>
  )
}
