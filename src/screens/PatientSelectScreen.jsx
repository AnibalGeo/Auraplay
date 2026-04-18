import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'
import { getAllPatients, savePatient, searchPatients } from '../data/patients'

// ── helpers ───────────────────────────────────────────────────────────────────

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
  let sum = 0
  let mul = 2
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
  return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const LEVEL_IDS = Object.keys(LEVELS)

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: '12px',
  border: '2px solid #e8f5f0',
  fontSize: '15px',
  color: '#2d2d2d',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
}

const labelStyle = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#aaa',
  display: 'block',
  marginBottom: '5px',
  letterSpacing: '0.4px',
}

// ── NewPatientForm ─────────────────────────────────────────────────────────────

function NewPatientForm({ onSaved, onBack }) {
  const { loadPatient, setLevelById } = usePatient()
  const [form, setForm] = useState({
    rut: '', name: '', birthDate: '', phone: '', guardianName: '',
    diagnosis: 'tdl', levelId: 'N4',
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
      {/* Header */}
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
            <p style={{ fontSize: '12px', color: '#4aab8a', marginTop: '4px' }}>{Math.floor(ageMonths / 12)},{ageMonths % 12} años ({ageMonths} meses)</p>
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

// ── ConfirmCard ────────────────────────────────────────────────────────────────

function ConfirmCard({ p, onConfirm, onCancel }) {
  const cfg = STIMULUS_CONFIG[p.diagnosis]
  const level = LEVELS[p.levelId] ?? null
  const lastActivity = [...(p.sessionHistory ?? [])].reverse().find(e => e.type === 'activity')
  const lastNote = [...(p.sessionHistory ?? [])].reverse().find(e => e.type === 'note')
  const sessionsCount = (p.sessionHistory ?? []).filter(e => e.type === 'note').length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50,
    }}>
      <div style={{
        background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 32px',
        width: '100%', maxWidth: '480px', boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#2d2d2d' }}>{p.name}</h3>
            <p style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>{p.rut || '—'}</p>
          </div>
          <span style={{
            background: (cfg?.color ?? '#aaa') + '22', color: cfg?.color ?? '#aaa',
            border: `1px solid ${(cfg?.color ?? '#aaa')}44`,
            borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '700',
          }}>
            {cfg?.label ?? p.diagnosis}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {[
            { label: 'Nivel actual', value: level ? `${level.label}` : '—' },
            { label: 'Sesiones', value: sessionsCount },
            { label: 'Estrellas', value: `⭐ ${p.stars ?? 0}` },
            { label: 'Última actividad', value: fmtDate(lastActivity?.date ?? lastNote?.date) },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: '#f5f9f7', borderRadius: '12px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', color: '#aaa', fontWeight: '700', marginBottom: '3px' }}>{label.toUpperCase()}</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#2d2d2d' }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {[
            { key: 'fonologico',      label: 'Fonético',   color: '#4aab8a' },
            { key: 'lexico',          label: 'Léxico',     color: '#7c6bb0' },
            { key: 'morfosintactico', label: 'Morfosint.', color: '#e07a5f' },
            { key: 'pragmatico',      label: 'Pragmático', color: '#e8a020' },
          ].map(comp => {
            const lvl = p.componentLevels?.[comp.key] ?? 'inicial'
            return (
              <div key={comp.key} style={{ background: comp.color + '18', border: `1px solid ${comp.color}44`, borderRadius: '8px', padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                <span style={{ fontSize: '9px', color: comp.color, fontWeight: '700' }}>{comp.label.toUpperCase()}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#3a3a3a', textTransform: 'capitalize' }}>{lvl}</span>
              </div>
            )
          })}
        </div>

        <button
          onClick={onConfirm}
          style={{
            width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
            background: '#4aab8a', color: 'white', fontSize: '15px', fontWeight: '800',
            cursor: 'pointer', marginBottom: '10px',
          }}
        >
          Iniciar sesión con {p.name.split(' ')[0]} →
        </button>
        <button
          onClick={onCancel}
          style={{
            width: '100%', padding: '12px', borderRadius: '14px', border: '2px solid #e8f5f0',
            background: 'white', color: '#888', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

// ── PatientSelectScreen ────────────────────────────────────────────────────────

function PatientSelectScreen({ onDone }) {
  const { loadPatient, setLevelById } = usePatient()
  const [query, setQuery] = useState('')
  const [allPatients, setAllPatients] = useState(() => getAllPatients())
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)

  const recent = useMemo(() =>
    [...allPatients]
      .sort((a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0))
      .slice(0, 5),
    [allPatients]
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return recent
    return searchPatients(query)
  }, [query, recent])

  function handleConfirm() {
    loadPatient(selected)
    setLevelById(selected.levelId)
    onDone()
  }

  if (showNew) {
    return (
      <div className="screen" style={{ overflowY: 'auto', padding: '24px 20px' }}>
        <NewPatientForm
          onSaved={onDone}
          onBack={() => setShowNew(false)}
        />
      </div>
    )
  }

  return (
    <div className="screen" style={{ background: '#f5f9f7', overflowY: 'auto' }}>
      {selected && (
        <ConfirmCard
          p={selected}
          onConfirm={handleConfirm}
          onCancel={() => setSelected(null)}
        />
      )}

      <div style={{ padding: '32px 20px 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '6px' }}>🌟</div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#2d2d2d' }}>AuraPlay</h1>
          <p style={{ fontSize: '13px', color: '#aaa' }}>Selecciona un paciente para comenzar</p>
        </div>

        {/* Botón nueva sesión */}
        <button
          onClick={() => setShowNew(true)}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: '#4aab8a', color: 'white', fontSize: '16px', fontWeight: '800',
            cursor: 'pointer', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>＋</span> Nueva sesión
        </button>

        {/* Buscador */}
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: '#aaa', pointerEvents: 'none' }}>🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o RUT…"
            style={{
              ...inputStyle,
              paddingLeft: '38px',
              border: '2px solid #e8f5f0',
            }}
          />
        </div>

        {/* Lista */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#ccc' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</p>
            <p style={{ fontSize: '14px' }}>No se encontraron pacientes.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!query.trim() && (
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', letterSpacing: '0.4px', marginBottom: '4px' }}>
                RECIENTES
              </p>
            )}
            {filtered.map(p => {
              const cfg = STIMULUS_CONFIG[p.diagnosis]
              const level = LEVELS[p.levelId]
              const lastEntry = [...(p.sessionHistory ?? [])].reverse()[0]
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  style={{
                    width: '100%', background: 'white', border: '2px solid #f0f0f0',
                    borderRadius: '16px', padding: '14px 16px', cursor: 'pointer',
                    textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                    background: (cfg?.color ?? '#aaa') + '20',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    🧒
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: '#2d2d2d', marginBottom: '2px' }}>{p.name}</p>
                      <span style={{
                        background: (cfg?.color ?? '#aaa') + '20', color: cfg?.color ?? '#aaa',
                        borderRadius: '8px', padding: '2px 8px', fontSize: '10px', fontWeight: '700', flexShrink: 0, marginLeft: '8px',
                      }}>
                        {cfg?.label ?? p.diagnosis}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#aaa' }}>
                      {p.rut || '—'} · {level?.label ?? p.levelId}
                    </p>
                    {lastEntry && (
                      <p style={{ fontSize: '11px', color: '#bbb', marginTop: '2px' }}>
                        Última sesión: {fmtDate(lastEntry.date)}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default PatientSelectScreen
