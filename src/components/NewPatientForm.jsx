import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'
import { savePatient } from '../data/patients'
import RUTInput from '../components/RUTInput'
import { useRUT } from '../hooks/useRUT'
import { validateRUT } from '../utils/rutUtils'

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
  const rut = useRUT()

  const [form, setForm] = useState({
    name: '', birthDate: '', phone: '', guardianName: '',
    diagnosis: 'tel', levelId: 'N4',
  })
  const [errors, setErrors] = useState({})

  const ageMonths = calcAgeMonths(form.birthDate)

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: null }))
  }

  function handleSave() {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'El nombre es obligatorio.'
    if (!rut.value.trim()) newErrors.rut = 'El RUT es obligatorio.'
    else if (rut.error) newErrors.rut = rut.error
    else if (!rut.isValid) newErrors.rut = 'RUT inválido.'
    if (!form.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria.'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const now = new Date().toISOString()
    const saved = savePatient({
      rut: rut.value,
      ...form,
      ageMonths,
      initialLevelId: form.levelId,
      createdAt: now,
      updatedAt: now,
    })
    loadPatient(saved)
    setLevelById(saved.levelId)
    onSaved()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: '#f0faf6', border: 'none', borderRadius: '10px',
              padding: '8px 12px', cursor: 'pointer', fontSize: '16px', color: '#2d7a62',
            }}
          >←</button>
        )}
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#3a3a3a' }}>Nuevo paciente</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* RUT Input mejorado */}
        <div>
          <RUTInput
            value={rut.value}
            onChange={rut.onChange}
            onBlur={rut.onBlur}
            error={rut.error || errors.rut}
            label="RUT"
            placeholder="Ej: 12.345.678-K"
          />
        </div>

        {/* Nombre */}
        <div>
          <label style={labelStyle}>NOMBRE COMPLETO</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ej: Mateo González"
            style={{ ...inputStyle, borderColor: errors.name ? '#e07a5f' : '#e8f5f0' }}
          />
          {errors.name && <p style={{ fontSize: '12px', color: '#e07a5f', marginTop: '4px' }}>{errors.name}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label style={labelStyle}>TELÉFONO (opcional)</label>
          <input
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="Ej: +56 9 8765 4321"
            style={{ ...inputStyle }}
          />
        </div>

        {/* Tutor */}
        <div>
          <label style={labelStyle}>NOMBRE DEL TUTOR (opcional)</label>
          <input
            value={form.guardianName}
            onChange={e => set('guardianName', e.target.value)}
            placeholder="Ej: Ana González"
            style={{ ...inputStyle }}
          />
        </div>

        {/* Fecha de nacimiento */}
        <div>
          <label style={labelStyle}>FECHA DE NACIMIENTO</label>
          <input
            type="date"
            value={form.birthDate}
            onChange={e => set('birthDate', e.target.value)}
            style={{ ...inputStyle, borderColor: errors.birthDate ? '#e07a5f' : '#e8f5f0' }}
          />
          {errors.birthDate && (
            <p style={{ fontSize: '12px', color: '#e07a5f', marginTop: '4px' }}>{errors.birthDate}</p>
          )}
          {form.birthDate && !errors.birthDate && (
            <p style={{ fontSize: '12px', color: '#4aab8a', marginTop: '4px' }}>
              {Math.floor(ageMonths / 12)},{ageMonths % 12} años ({ageMonths} meses)
            </p>
          )}
        </div>

        {/* Diagnóstico */}
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

        {/* Nivel inicial */}
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

        {/* Botón guardar */}
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
