import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'
import { savePatient, searchPatients, updatePatient as persistPatient, getPatientById, deletePatient } from '../data/patients'
import { analyzeText } from '../utils/textAnalyzer'
import NewPatientForm from '../components/NewPatientForm'
import FamilyAccessSection from './FamilyAccessSection'

const STORAGE_KEY = 'auraplay_pin'
const getPin = () => localStorage.getItem(STORAGE_KEY) ?? '1234'

function isNote(e) { return e.type === 'note' || e.type === 'nota_clinica' }

// ── helpers ──────────────────────────────────────────────────────────────────

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
  const rem = 11 - (sum % 11)
  const expected = rem === 11 ? '0' : rem === 10 ? 'K' : String(rem)
  return dv === expected
}

function calcAgeMonths(birthDate) {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const now = new Date()
  return Math.max(0, (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth()))
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function timeAgo(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 7) return `hace ${days} días`
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  return `hace ${Math.floor(days / 365)} año${Math.floor(days / 365) > 1 ? 's' : ''}`
}

// ── CLINICAL PROFILE CARD ─────────────────────────────────────────────────────
// Componente nuevo. Va en view === 'menu', antes de los botones de acción.
// Lee directamente de patient — no recibe props adicionales.

const COMPONENT_LABELS = {
  fonologico:      'Fonológico',
  lexico:          'Léxico-Semántico',
  morfosintactico: 'Morfosintáctico',
  pragmatico:      'Pragmático',
}

const DIAGNOSIS_LABELS = {
  tel:         'TEL / TDL',
  tl_tea:      'TL + TEA',
  tl_tdah:     'TL + TDAH',
  tl_tea_tdah: 'TL + TEA + TDAH',
}

const CONFIDENCE_STYLES = {
  Alta:  { bg: '#e6f7f1', color: '#1a7a54', dot: '#4aab8a' },
  Media: { bg: '#fff8e6', color: '#9a6d0a', dot: '#e8a020' },
  Baja:  { bg: '#fef0ef', color: '#c0392b', dot: '#e07a5f' },
}

function ClinicalProfileCard({ onStartPlan, onReassess }) {
  const { patient } = usePatient()
  const [expanded, setExpanded] = useState(false)

  const profile = patient.clinicalProfile
  const hasAssessment = patient.assessmentCompleted && profile

  // Datos de sesión para el card
  const allHistory = patient.sessionHistory || []
  const lastActivity = [...allHistory].reverse().find(e => !isNote(e))
  const lastNote = [...allHistory].reverse().find(e => isNote(e))
  const lastSessionDate = lastNote?.date || lastActivity?.date || null
  const totalSessions = patient.sessionsCompleted || 0

  // ── Sin evaluación completada ─────────────────────────────────────────────
  if (!hasAssessment) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #fff8e6 0%, #fef0ef 100%)',
        borderRadius: 16,
        padding: '16px',
        border: '2px dashed #e8a020',
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 24 }}>📋</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#7a5c00', margin: '0 0 4px' }}>
              Evaluación inicial pendiente
            </p>
            <p style={{ fontSize: 12, color: '#9a6d0a', margin: '0 0 12px', lineHeight: 1.5 }}>
              Completa el screening para que AuraPlay sugiera nivel, componente prioritario y frecuencia de trabajo.
            </p>
            <button
              onClick={onReassess}
              style={{
                padding: '8px 16px',
                background: '#e8a020',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Iniciar evaluación →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Con evaluación completada ─────────────────────────────────────────────
  const confStyle = CONFIDENCE_STYLES[profile.confidence] ?? CONFIDENCE_STYLES['Media']
  const diagLabel = DIAGNOSIS_LABELS[patient.diagnosis] ?? patient.diagnosis
  const focusItems = (profile.priorityAreas || []).slice(0, 3)

  return (
    <div style={{
      background: 'linear-gradient(160deg, #f0faf6 0%, #f5f0fa 100%)',
      borderRadius: 16,
      border: '1.5px solid #c8e8dc',
      overflow: 'hidden',
      marginBottom: 4,
    }}>
      {/* ── Header siempre visible ── */}
      <div style={{ padding: '14px 16px' }}>

        {/* Fila superior: nivel + diagnóstico */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          {/* Badge nivel */}
          <div style={{
            background: 'linear-gradient(135deg, #4aab8a, #7c6bb0)',
            color: '#fff',
            fontSize: 18,
            fontWeight: 900,
            padding: '8px 14px',
            borderRadius: 12,
            letterSpacing: '-0.5px',
            flexShrink: 0,
            lineHeight: 1,
          }}>
            {profile.levelId}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#2d7a62', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Perfil Clínico
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3a3a3a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {diagLabel}
            </p>
          </div>
          {/* Badge confianza */}
          <div style={{
            background: confStyle.bg,
            color: confStyle.color,
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 99,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: confStyle.dot, display: 'inline-block' }} />
            {profile.confidence}
          </div>
        </div>

        {/* Foco inicial — siempre visible, máx 3 items */}
        {focusItems.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#666', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Foco inicial
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {focusItems.map(area => (
                <span key={area} style={{
                  background: '#fff',
                  border: '1.5px solid #c8e8dc',
                  color: '#2d7a62',
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 99,
                }}>
                  {area}
                </span>
              ))}
              {(profile.priorityAreas || []).length > 3 && (
                <span style={{ fontSize: 12, color: '#888', alignSelf: 'center' }}>
                  +{profile.priorityAreas.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Fila de stats: última sesión + total */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e8f5f0',
          }}>
            <p style={{ fontSize: 10, color: '#999', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase' }}>Última sesión</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3a3a3a', margin: 0 }}>
              {lastSessionDate ? timeAgo(lastSessionDate) : 'Sin sesiones'}
            </p>
          </div>
          <div style={{
            flex: 1,
            background: '#fff',
            borderRadius: 10,
            padding: '8px 12px',
            border: '1px solid #e8f5f0',
          }}>
            <p style={{ fontSize: 10, color: '#999', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase' }}>Total sesiones</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#3a3a3a', margin: 0 }}>
              {totalSessions} {totalSessions === 1 ? 'sesión' : 'sesiones'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Detalle expandible ── */}
      {expanded && (
        <div style={{
          padding: '0 16px 14px',
          borderTop: '1px solid #e0f0e8',
          marginTop: 0,
        }}>
          {/* Componente prioritario */}
          <div style={{ paddingTop: 14, marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#666', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Componente prioritario
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#2d7a62', margin: 0 }}>
              {COMPONENT_LABELS[profile.primaryComponent] ?? profile.primaryComponent}
            </p>
          </div>

          {/* Frecuencia sugerida */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#666', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Recomendación
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: '#f8faf9', borderRadius: 10, padding: '8px 12px' }}>
                <p style={{ fontSize: 10, color: '#999', margin: '0 0 2px' }}>Frecuencia</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3a3a3a', margin: 0 }}>{profile.suggestedFrequency}</p>
              </div>
              <div style={{ flex: 1, background: '#f8faf9', borderRadius: 10, padding: '8px 12px' }}>
                <p style={{ fontSize: 10, color: '#999', margin: '0 0 2px' }}>Duración</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#3a3a3a', margin: 0 }}>{profile.sessionDuration}</p>
              </div>
            </div>
          </div>

          {/* Hito DIR */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#666', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Hito DIR estimado
            </p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5,6].map(n => (
                <div key={n} style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 99,
                  background: n <= (profile.dirLevel || 0) ? '#7c6bb0' : '#e8e0f0',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#7c6bb0', fontWeight: 600, margin: '4px 0 0' }}>
              Nivel {profile.dirLevel}/6 · {profile.dirLabel}
            </p>
          </div>

          {/* Fecha de evaluación + re-evaluar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>
              Evaluado {timeAgo(profile.assessmentDate)}
            </p>
            <button
              onClick={onReassess}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
              }}
            >
              Re-evaluar
            </button>
          </div>
        </div>
      )}

      {/* ── Footer: expandir + CTA ── */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #e0f0e8',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'rgba(255,255,255,0.6)',
      }}>
        <button
          onClick={() => setExpanded(p => !p)}
          style={{
            flex: 1,
            background: 'none',
            border: '1.5px solid #c8e8dc',
            borderRadius: 10,
            padding: '8px',
            fontSize: 12,
            fontWeight: 600,
            color: '#2d7a62',
            cursor: 'pointer',
          }}
        >
          {expanded ? '▲ Menos detalle' : '▼ Ver detalle'}
        </button>
        <button
          onClick={onStartPlan}
          style={{
            flex: 2,
            background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
            border: 'none',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            letterSpacing: '-0.2px',
          }}
        >
          Iniciar Plan Terapéutico →
        </button>
      </div>
    </div>
  )
}

// ── sub-views ─────────────────────────────────────────────────────────────────

function PinScreen({ onUnlock, onClose }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function handleDigit(digit) {
    const next = pin + digit
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === getPin()) {
        onUnlock()
      } else {
        setError(true)
        setTimeout(() => setPin(''), 600)
      }
    }
  }

  return (
    <div style={{ background: 'white', borderRadius: '24px', padding: '32px 28px', width: '300px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
      <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#3a3a3a', marginBottom: '4px' }}>Panel del Terapeuta</h2>
      <p style={{ fontSize: '12px', color: '#666', marginBottom: '24px' }}>Ingresa el PIN para continuar</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: '16px', height: '16px', borderRadius: '50%',
            background: pin.length > i ? error ? '#e07a5f' : '#4aab8a' : '#e8f5f0',
            border: `2px solid ${pin.length > i ? error ? '#e07a5f' : '#4aab8a' : '#c8e8dc'}`,
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      {error && <p style={{ fontSize: '12px', color: '#e07a5f', marginBottom: '12px' }}>PIN incorrecto.</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => handleDigit(String(n))} style={numBtnStyle}>{n}</button>
        ))}
        <button onClick={onClose} style={{ ...numBtnStyle, background: '#fef4f2', border: '2px solid #fef4f2', color: '#e07a5f' }}>✕</button>
        <button onClick={() => handleDigit('0')} style={numBtnStyle}>0</button>
        <button onClick={() => setPin(p => { setError(false); return p.slice(0, -1) })} style={numBtnStyle}>⌫</button>
      </div>
    </div>
  )
}

const numBtnStyle = {
  padding: '14px', borderRadius: '12px', border: '2px solid #e8f5f0',
  background: 'white', fontSize: '20px', fontWeight: '600', cursor: 'pointer', color: '#3a3a3a',
}


// ── Buscar Paciente ───────────────────────────────────────────────────────────

function PatientSummary({ patient: p, onConfirm, onBack }) {
  const lvl = LEVELS[p.levelId]
  const cfg = STIMULUS_CONFIG[p.diagnosis]
  const lastNote = [...(p.sessionHistory || [])].reverse().find(e => isNote(e))
  const lastActivity = [...(p.sessionHistory || [])].reverse().find(e => !isNote(e))
  const totalNotes = (p.sessionHistory || []).filter(e => isNote(e)).length
  const ageMonths = p.ageMonths || calcAgeMonths(p.birthDate)

  function row(label, value) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '13px', color: '#888' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#3a3a3a' }}>{value}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={onBack} style={backBtnStyle}>←</button>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#3a3a3a' }}>Resumen clínico</h3>
      </div>

      <div style={{ background: '#f0faf6', borderRadius: '16px', padding: '16px', border: '1px solid #c8e8dc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: '800', color: '#2d7a62', marginBottom: '2px' }}>{p.name}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>{p.rut}</p>
          </div>
          <span style={{
            background: cfg?.color + '20', color: cfg?.color,
            border: `1px solid ${cfg?.color}44`,
            borderRadius: '20px', padding: '4px 12px',
            fontSize: '11px', fontWeight: '700',
          }}>
            {cfg?.label ?? p.diagnosis}
          </span>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', padding: '16px', border: '2px solid #e8f5f0' }}>
        {row('Edad', `${ageMonths} meses (${Math.floor(ageMonths / 12)} a ${ageMonths % 12} m)`)}
        {row('Nivel actual', `${lvl?.label ?? p.levelId} · ${lvl?.ageRange ?? ''}`)}
        {row('Total sesiones', totalNotes)}
        {row('Estrellas acumuladas', `⭐ ${p.stars ?? 0}`)}
        {row('Última sesión', lastNote ? formatDate(lastNote.date) : '—')}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>Última actividad</span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#3a3a3a' }}>
            {lastActivity ? formatDate(lastActivity.date) : '—'}
          </span>
        </div>
      </div>

      {lastNote?.notes && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px' }}>ÚLTIMA NOTA CLÍNICA</p>
          <div style={{ background: '#f8f8f6', borderRadius: '14px', padding: '14px' }}>
            {lastNote.testsApplied?.length > 0 && (
              <p style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600', marginBottom: '6px' }}>
                {lastNote.testsApplied.join(' · ')}
              </p>
            )}
            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
              {lastNote.notes}
            </p>
            <p style={{ fontSize: '11px', color: '#bbb', marginTop: '8px' }}>
              {formatDate(lastNote.date)}{lastNote.duration ? ` · ${lastNote.duration} min` : ''}
            </p>
          </div>
        </div>
      )}

      <button onClick={onConfirm} style={primaryBtnStyle}>
        Iniciar sesión con este paciente →
      </button>
    </div>
  )
}

function SearchPatient({ onBack, onSelected }) {
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState(null)
  const [, setRefresh] = useState(0)
  const { patient: activePatient, resetPatient } = usePatient()
  const results = searchPatients(query)

  if (preview) {
    return (
      <PatientSummary
        patient={preview}
        onConfirm={() => onSelected(preview)}
        onBack={() => setPreview(null)}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <button onClick={onBack} style={backBtnStyle}>←</button>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#3a3a3a' }}>Buscar paciente</h3>
      </div>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Nombre o RUT..."
        autoFocus
        style={inputStyle}
      />

      {results.length === 0 && (
        <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '24px 0' }}>
          {query ? 'Sin resultados.' : 'No hay pacientes registrados.'}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {results.map(p => {
          const lastNote = [...(p.sessionHistory || [])].reverse().find(e => isNote(e))
          const lvl = LEVELS[p.levelId]
          return (
            <div key={p.id} style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
              <button onClick={() => setPreview(p)} style={{
                flex: 1, padding: '14px 16px', borderRadius: '14px', border: '2px solid #e8f5f0',
                background: 'white', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#3a3a3a', marginBottom: '2px' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: '#888' }}>{p.rut}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#4aab8a' }}>{lvl?.label ?? p.levelId}</p>
                    <p style={{ fontSize: '11px', color: '#bbb' }}>
                      {lastNote ? formatDate(lastNote.date) : 'Sin sesiones'}
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`¿Eliminar a ${p.name}? Esta acción no se puede deshacer.`)) {
                    deletePatient(p.id)
                    if (activePatient.id === p.id) resetPatient()
                    setRefresh(n => n + 1)
                  }
                }}
                style={{ background: '#fdecea', border: 'none', borderRadius: '8px', padding: '4px 10px', color: '#c62828', cursor: 'pointer', fontSize: '12px' }}
              >
                Eliminar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Registro de Sesión ────────────────────────────────────────────────────────

const TESTS = ['PLON-R', 'TEPSI', 'BLOC', 'SCREENING', 'TOKEN TEST', 'PEABODY', 'Otro']

function wordCount(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const CATEGORY_LABELS = {
  concordancia_genero:  'Género',
  concordancia_numero:  'Número',
  concordancia_verbal:  'Verbal',
  conector:             'Conector',
  termino_clinico:      'Clínico',
  frase_incompleta:     'Incompleta',
}
const CATEGORY_COLORS = {
  concordancia_genero:  '#7c6bb0',
  concordancia_numero:  '#e8a020',
  concordancia_verbal:  '#e07a5f',
  conector:             '#4aab8a',
  termino_clinico:      '#3b82f6',
  frase_incompleta:     '#888',
}

function SessionTab() {
  const { patient, addSessionEntry, updatePatient } = usePatient()
  const [date, setDate] = useState(todayISO())
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [testsApplied, setTestsApplied] = useState(new Set())
  const [otroText, setOtroText] = useState('')
  const [expanded, setExpanded] = useState(new Set())
  const [saved, setSaved] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [analysisOpen, setAnalysisOpen] = useState(true)
  const debounceRef = useRef(null)

  const wc = wordCount(notes)
  const MAX_WORDS = 300

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (!notes.trim()) { setAnalysis(null); return }
    debounceRef.current = setTimeout(() => {
      const result = analyzeText(notes)
      setAnalysis(result.errors.length > 0 ? result : null)
    }, 800)
    return () => clearTimeout(debounceRef.current)
  }, [notes])

  function handleApplySuggestions() {
    if (!analysis) return
    let corrected = notes
    for (const err of analysis.errors) {
      if (err.suggestion) {
        corrected = corrected.replaceAll(err.original, err.suggestion)
      }
    }
    setNotes(corrected)
    setAnalysis(null)
  }

  function toggleTest(test) {
    setTestsApplied(prev => {
      const next = new Set(prev)
      next.has(test) ? next.delete(test) : next.add(test)
      return next
    })
  }

  function handleNotesChange(e) {
    const val = e.target.value
    if (wordCount(val) <= MAX_WORDS) setNotes(val)
  }

  function handleSave() {
    const tests = [...testsApplied].map(t => t === 'Otro' && otroText ? otroText : t)
    const noteData = {
      clinicalNote: notes.trim(),
      clinicalNoteTests: tests,
      clinicalNoteDuration: parseInt(duration) || 0,
    }

    const contextHistory = [...(patient.sessionHistory || [])]
    let activityIdx = -1
    for (let i = contextHistory.length - 1; i >= 0; i--) {
      if (contextHistory[i].type === 'activity' && contextHistory[i].date?.slice(0, 10) === date) {
        activityIdx = i
        break
      }
    }

    if (activityIdx !== -1) {
      contextHistory[activityIdx] = { ...contextHistory[activityIdx], ...noteData }
      updatePatient({ sessionHistory: contextHistory })
      if (patient.id) {
        const current = getPatientById(patient.id)
        if (current) {
          const rHistory = [...(current.sessionHistory ?? [])]
          let rIdx = -1
          for (let i = rHistory.length - 1; i >= 0; i--) {
            if (rHistory[i].type === 'activity' && rHistory[i].date?.slice(0, 10) === date) {
              rIdx = i; break
            }
          }
          if (rIdx !== -1) {
            rHistory[rIdx] = { ...rHistory[rIdx], ...noteData }
          } else {
            rHistory.push({ id: String(Date.now()), type: 'nota_clinica', date, ...noteData, notes: notes.trim(), testsApplied: tests, duration: parseInt(duration) || 0 })
          }
          persistPatient(patient.id, { sessionHistory: rHistory, updatedAt: new Date().toISOString() })
        }
      }
    } else {
      const entry = {
        id: String(Date.now()),
        type: 'nota_clinica',
        date,
        duration: parseInt(duration) || 0,
        notes: notes.trim(),
        testsApplied: tests,
        activitiesCompleted: patient.sessionsCompleted ?? 0,
        starsEarned: patient.stars ?? 0,
      }
      addSessionEntry(entry)
      if (patient.id) {
        const current = getPatientById(patient.id)
        if (current) {
          persistPatient(patient.id, {
            sessionHistory: [...(current.sessionHistory ?? []), entry],
            updatedAt: new Date().toISOString(),
          })
        }
      }
    }

    setNotes('')
    setDuration('')
    setDate(todayISO())
    setTestsApplied(new Set())
    setOtroText('')
    setAnalysis(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const history = [...(patient.sessionHistory || [])]
    .filter(e => isNote(e))
    .reverse()
    .slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>FECHA</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ width: '110px' }}>
          <label style={labelStyle}>DURACIÓN (min)</label>
          <input
            type="number" min="1" max="180"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder="45"
            style={inputStyle}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>TESTS APLICADOS</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TESTS.map(test => {
            const checked = testsApplied.has(test)
            return (
              <button
                key={test}
                onClick={() => toggleTest(test)}
                style={{
                  padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '600',
                  border: `2px solid ${checked ? '#4aab8a' : '#e8f5f0'}`,
                  background: checked ? '#e8f5f0' : 'white',
                  color: checked ? '#2d7a62' : '#888',
                  transition: 'all 0.15s',
                }}
              >
                {checked ? '✓ ' : ''}{test}
              </button>
            )
          })}
        </div>
        {testsApplied.has('Otro') && (
          <input
            value={otroText}
            onChange={e => setOtroText(e.target.value)}
            placeholder="Nombre del test..."
            style={{ ...inputStyle, marginTop: '8px' }}
          />
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>NOTAS DE SESIÓN</label>
          <span style={{ fontSize: '11px', color: wc >= MAX_WORDS ? '#e07a5f' : '#aaa', fontWeight: '600' }}>
            {wc} / {MAX_WORDS} palabras
          </span>
        </div>
        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Observaciones del terapeuta, logros, dificultades..."
          rows={5}
          style={{
            ...inputStyle,
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: '1.5',
            borderColor: wc >= MAX_WORDS ? '#e07a5f' : analysis ? '#e8a020' : '#e8f5f0',
          }}
        />
      </div>

      {analysis && (
        <div style={{ border: '2px solid #f0d080', borderRadius: '14px', overflow: 'hidden' }}>
          <button
            onClick={() => setAnalysisOpen(o => !o)}
            style={{
              width: '100%', padding: '10px 14px', background: '#fffbe8',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#7a5c00' }}>
              🔍 Análisis lingüístico · {analysis.summary.total} {analysis.summary.total === 1 ? 'sugerencia' : 'sugerencias'}
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {Object.entries(analysis.summary.por_categoria).map(([cat, n]) => (
                <span key={cat} style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px',
                  background: CATEGORY_COLORS[cat] + '22', color: CATEGORY_COLORS[cat],
                  border: `1px solid ${CATEGORY_COLORS[cat]}55`,
                }}>
                  {CATEGORY_LABELS[cat] ?? cat}: {n}
                </span>
              ))}
              <span style={{ fontSize: '12px', color: '#aaa' }}>{analysisOpen ? '▲' : '▼'}</span>
            </div>
          </button>

          {analysisOpen && (
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px', background: 'white' }}>
              {analysis.errors.map((err, i) => (
                <div key={i} style={{ borderLeft: `3px solid ${CATEGORY_COLORS[err.category]}`, paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: '#e07a5f', fontWeight: '600', textDecoration: 'line-through' }}>
                      {err.original}
                    </span>
                    {err.suggestion && (
                      <>
                        <span style={{ fontSize: '12px', color: '#aaa' }}>→</span>
                        <span style={{ fontSize: '13px', color: '#2d7a62', fontWeight: '600' }}>{err.suggestion}</span>
                      </>
                    )}
                    <span style={{
                      fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '8px',
                      background: CATEGORY_COLORS[err.category] + '18', color: CATEGORY_COLORS[err.category],
                      marginLeft: 'auto',
                    }}>
                      {CATEGORY_LABELS[err.category] ?? err.category}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>{err.explanation}</p>
                </div>
              ))}

              {analysis.errors.some(e => e.suggestion) && (
                <button
                  onClick={handleApplySuggestions}
                  style={{
                    marginTop: '4px', padding: '8px 14px', borderRadius: '10px',
                    border: 'none', background: '#2d7a62', color: 'white',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer', alignSelf: 'flex-start',
                  }}
                >
                  ✓ Aplicar todas las sugerencias
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <button onClick={handleSave} style={{ ...primaryBtnStyle, background: saved ? '#2d7a62' : '#4aab8a' }}>
        {saved ? '✓ Registro guardado' : '💾 Guardar registro'}
      </button>

      {history.length > 0 && (
        <div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '10px' }}>
            ÚLTIMAS SESIONES
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((entry, i) => {
              const isExpanded = expanded.has(i)
              const preview = entry.notes.split(/\s+/).slice(0, 20).join(' ')
              const hasMore = entry.notes.split(/\s+/).length > 20
              return (
                <div key={i} style={{ background: '#f8f8f6', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#3a3a3a' }}>
                      {formatDate(entry.date)}
                    </span>
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      {entry.duration ? `${entry.duration} min` : '—'}
                    </span>
                  </div>
                  {entry.testsApplied?.length > 0 && (
                    <p style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600', marginBottom: '6px' }}>
                      {entry.testsApplied.join(' · ')}
                    </p>
                  )}
                  {entry.notes && (
                    <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                      {isExpanded ? entry.notes : preview}
                      {!isExpanded && hasMore ? '...' : ''}
                    </p>
                  )}
                  {hasMore && (
                    <button
                      onClick={() => setExpanded(prev => {
                        const next = new Set(prev)
                        next.has(i) ? next.delete(i) : next.add(i)
                        return next
                      })}
                      style={{ fontSize: '12px', color: '#4aab8a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', marginTop: '4px', padding: 0 }}
                    >
                      {isExpanded ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sensory Profile ───────────────────────────────────────────────────────────

const SENSORY_BADGES = [
  { key: 'animationsEnabled',       label: 'Animaciones',           type: 'enrich' },
  { key: 'simultaneousAudioVisual', label: 'Audio + Visual',        type: 'enrich' },
  { key: 'backgroundElements',      label: 'Fondo',                 type: 'enrich' },
  { key: 'sequentialStimulus',      label: 'Secuencial',            type: 'reduce' },
  { key: 'extendedExposureTime',    label: 'Tiempo extendido',      type: 'reduce' },
  { key: 'reducedOptions',          label: 'Opciones reducidas',    type: 'reduce' },
  { key: 'largerText',              label: 'Texto grande',          type: 'reduce' },
  { key: 'simplifiedInstructions',  label: 'Instrucciones simples', type: 'reduce' },
]

function SensoryProfile({ settings }) {
  function badgeStyle(key, type) {
    const active = settings[key]
    if (!active) return { bg: '#f0f0f0', color: '#aaa', border: '#e0e0e0' }
    if (type === 'enrich') return { bg: '#e8f5f0', color: '#2d7a62', border: '#b0dece' }
    return { bg: '#fff8e0', color: '#b07800', border: '#f0d070' }
  }

  return (
    <div>
      <label style={labelStyle}>PERFIL SENSORIAL</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {SENSORY_BADGES.map(({ key, label, type }) => {
          const { bg, color, border } = badgeStyle(key, type)
          const active = settings[key]
          return (
            <span key={key} style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
              background: bg, color, border: `1.5px solid ${border}`,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <span style={{ fontSize: '9px' }}>{active ? (type === 'enrich' ? '●' : '▲') : '○'}</span>
              {label}
            </span>
          )
        })}
      </div>
      <p style={{ fontSize: '11px', color: '#aaa', marginTop: '8px' }}>
        <span style={{ color: '#2d7a62', fontWeight: '700' }}>● Verde</span> enriquecido &nbsp;·&nbsp;
        <span style={{ color: '#b07800', fontWeight: '700' }}>▲ Amarillo</span> reducido &nbsp;·&nbsp;
        <span style={{ color: '#ccc', fontWeight: '700' }}>○ Gris</span> desactivado
      </p>
    </div>
  )
}

// ── Stimulus Toggle ───────────────────────────────────────────────────────────

function StimulusToggle({ label, desc, value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
    >
      <div style={{ flex: 1, paddingRight: '12px' }}>
        <p style={{ fontSize: '13px', fontWeight: '600', color: '#3a3a3a', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '11px', color: '#aaa' }}>{desc}</p>
      </div>
      <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: value ? '#4aab8a' : '#ddd', flexShrink: 0, position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: '3px', left: value ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  )
}

// ── Hitos del desarrollo ──────────────────────────────────────────────────────

const MILESTONES_BY_LEVEL = {
  N1: [
    { id: 'n1_palabras',    label: 'Más de 10 palabras funcionales' },
    { id: 'n1_combinacion', label: 'Combinaciones de 2 palabras' },
    { id: 'n1_ordenes',     label: 'Comprensión de órdenes simples' },
    { id: 'n1_juego',       label: 'Juego funcional con objetos' },
  ],
  N2: [
    { id: 'n2_vocabulario', label: 'Más de 50 palabras' },
    { id: 'n2_frases',      label: 'Frases de 2-3 elementos' },
    { id: 'n2_pronombres',  label: 'Uso de pronombres yo/tú' },
    { id: 'n2_juego',       label: 'Juego simbólico básico' },
  ],
  N3: [
    { id: 'n3_oraciones',   label: 'Oraciones simples completas' },
    { id: 'n3_preguntas',   label: 'Preguntas qué / dónde / quién' },
    { id: 'n3_narracion',   label: 'Narración de 3 eventos en secuencia' },
    { id: 'n3_plurales',    label: 'Uso de plurales regulares' },
  ],
  N4: [
    { id: 'n4_compuestas',  label: 'Oraciones compuestas' },
    { id: 'n4_conectores',  label: 'Conectores: y / pero / porque' },
    { id: 'n4_fonologia',   label: 'Conciencia fonológica emergente' },
    { id: 'n4_vocabulario', label: 'Vocabulario +1500 palabras' },
  ],
  N5: [
    { id: 'n5_narracion',   label: 'Narración inicio-nudo-desenlace' },
    { id: 'n5_metaforas',   label: 'Comprensión de metáforas básicas' },
    { id: 'n5_lectura',     label: 'Lectoescritura emergente' },
  ],
  N6: [
    { id: 'n6_inferencial', label: 'Comprensión inferencial' },
    { id: 'n6_escolar',     label: 'Lenguaje escolar funcional' },
    { id: 'n6_morfologia',  label: 'Morfología compleja' },
    { id: 'n6_ironia',      label: 'Comprensión de ironía básica' },
  ],
  N7: [
    { id: 'n7_academico',   label: 'Lenguaje académico' },
    { id: 'n7_textos',      label: 'Comprensión de textos escritos' },
    { id: 'n7_argumenta',   label: 'Discurso argumentativo' },
  ],
}

const MILESTONE_STATES = ['no_iniciado', 'en_proceso', 'logrado']
const MILESTONE_LABELS = { no_iniciado: 'No iniciado', en_proceso: 'En proceso', logrado: 'Logrado' }
const MILESTONE_COLORS = { no_iniciado: '#bbb', en_proceso: '#e8a020', logrado: '#4aab8a' }
const MILESTONE_ICONS  = { no_iniciado: '○', en_proceso: '◑', logrado: '●' }

function MilestonesSection() {
  const { patient, level, updatePatient } = usePatient()
  const hitos = MILESTONES_BY_LEVEL[patient.levelId] || []
  const milestones = patient.milestones || {}

  function cycleState(id) {
    const current = milestones[id] || 'no_iniciado'
    const next = MILESTONE_STATES[(MILESTONE_STATES.indexOf(current) + 1) % MILESTONE_STATES.length]
    updatePatient({ milestones: { ...milestones, [id]: next } })
  }

  if (!hitos.length) return null

  const counts = hitos.reduce((acc, h) => {
    const st = milestones[h.id] || 'no_iniciado'
    acc[st] = (acc[st] || 0) + 1
    return acc
  }, {})

  return (
    <div style={{ background: '#f8f8f6', borderRadius: '14px', padding: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', margin: 0 }}>HITOS DEL DESARROLLO · {level.ageRange}</p>
        <span style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600' }}>
          {counts.logrado || 0}/{hitos.length} logrados
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {hitos.map(h => {
          const st = milestones[h.id] || 'no_iniciado'
          return (
            <button key={h.id} onClick={() => cycleState(h.id)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'white', border: `1.5px solid ${MILESTONE_COLORS[st]}22`,
              borderRadius: '10px', padding: '8px 12px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '16px', color: MILESTONE_COLORS[st], flexShrink: 0 }}>{MILESTONE_ICONS[st]}</span>
              <span style={{ fontSize: '13px', color: '#3a3a3a', flex: 1, lineHeight: '1.3' }}>{h.label}</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: MILESTONE_COLORS[st], flexShrink: 0 }}>{MILESTONE_LABELS[st]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Cambiar PIN ───────────────────────────────────────────────────────────────

function ChangePinSection() {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [msg, setMsg] = useState(null)

  function handleSave() {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMsg({ text: 'El PIN debe tener exactamente 4 dígitos', ok: false })
      return
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'Los PINs no coinciden', ok: false })
      return
    }
    localStorage.setItem(STORAGE_KEY, newPin)
    setNewPin('')
    setConfirmPin('')
    setMsg({ text: 'PIN actualizado', ok: true })
  }

  return (
    <div style={{ background: '#f8f8f6', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', margin: 0 }}>CAMBIAR PIN</p>
      <div>
        <label style={labelStyle}>NUEVO PIN</label>
        <input type="password" maxLength={4} value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setMsg(null) }} placeholder="4 dígitos" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>CONFIRMAR PIN</label>
        <input type="password" maxLength={4} value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setMsg(null) }} placeholder="4 dígitos" style={inputStyle} />
      </div>
      {msg && <p style={{ fontSize: '12px', fontWeight: '600', color: msg.ok ? '#2d7a62' : '#e07a5f', margin: 0 }}>{msg.text}</p>}
      <button onClick={handleSave} style={{ ...primaryBtnStyle, background: '#4aab8a' }}>Guardar PIN</button>
    </div>
  )
}

// ── PIN Modo Familia ───────────────────────────────────────────────────────────

function HomePinConfig() {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [msg, setMsg] = useState(null)
  const currentPin = localStorage.getItem('auraplay_home_pin')

  function handleSave() {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMsg({ text: 'El PIN debe tener exactamente 4 dígitos', ok: false })
      return
    }
    if (newPin !== confirmPin) {
      setMsg({ text: 'Los PINs no coinciden', ok: false })
      return
    }
    localStorage.setItem('auraplay_home_pin', newPin)
    setNewPin('')
    setConfirmPin('')
    setMsg({ text: 'PIN del modo familia configurado', ok: true })
  }

  return (
    <div style={{ background: '#f0faf6', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#2d7a62', margin: 0 }}>
          👨‍👩‍👧 PIN MODO FAMILIA
        </p>
        {currentPin && (
          <span style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600' }}>✓ Configurado</span>
        )}
      </div>
      <p style={{ fontSize: '11px', color: '#666', margin: 0, lineHeight: 1.5 }}>
        PIN separado para que la familia acceda a sus rutinas en casa. Distinto a la contraseña del terapeuta.
      </p>
      <div>
        <label style={labelStyle}>NUEVO PIN (4 dígitos)</label>
        <input type="password" maxLength={4} value={newPin} onChange={e => { setNewPin(e.target.value.replace(/\D/g, '')); setMsg(null) }} placeholder="Ej: 5678" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle}>CONFIRMAR PIN</label>
        <input type="password" maxLength={4} value={confirmPin} onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '')); setMsg(null) }} placeholder="Repetir PIN" style={inputStyle} />
      </div>
      {msg && (
        <p style={{ fontSize: '12px', fontWeight: '600', color: msg.ok ? '#2d7a62' : '#e07a5f', margin: 0 }}>{msg.text}</p>
      )}
      <button onClick={handleSave} style={{ ...primaryBtnStyle, background: '#4aab8a' }}>
        Guardar PIN del modo familia
      </button>
    </div>
  )
}

// ── Config tabs ───────────────────────────────────────────────────────────────

function ConfigPanel({ onViewProgress, onViewHistory }) {
  const {
    patient, level, stimulusConfig,
    estimulusSettings, updateStimulusSettings,
    updatePatient, setLevelById, setDiagnosis, advanceLevel, decreaseLevel, loadStimulusSettings,
    resetPatient,
  } = usePatient()
  const [activeTab, setActiveTab] = useState('patient')
  const [confirmReset, setConfirmReset] = useState(false)
  const [previewLevelId, setPreviewLevelId] = useState(patient.levelId)

  return (
    <div>
      <div style={{ display: 'flex', borderBottom: '1px solid #e8f5f0', marginBottom: '20px', overflowX: 'auto' }}>
        {[
          { id: 'patient', label: '👤 Paciente' },
          { id: 'level',   label: '📊 Nivel' },
          { id: 'stimuli', label: '⚙️ Estímulos' },
          { id: 'session', label: '📋 Registro' },
          { id: 'family',  label: '👨‍👩‍👧 Familia' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flexShrink: 0, padding: '12px 10px', background: activeTab === tab.id ? '#e8f5f0' : 'white',
            border: 'none', borderBottom: activeTab === tab.id ? '3px solid #4aab8a' : '3px solid transparent',
            cursor: 'pointer', fontSize: '12px', fontWeight: '600',
            color: activeTab === tab.id ? '#2d7a62' : '#666', transition: 'all 0.2s',
          }}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'patient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', overflow: 'hidden', background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', border: '2px solid #c8e8dc' }}>
              {patient.profilePhoto
                ? <img src={patient.profilePhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '🧒'}
            </div>
            <label style={{ padding: '6px 14px', background: '#e8f5f0', borderRadius: '10px', fontSize: '12px', fontWeight: '700', color: '#2d7a62', cursor: 'pointer', border: '2px solid #c8e8dc' }}>
              Cambiar foto
              <input type="file" accept="image/jpg,image/jpeg,image/png" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = ev => updatePatient({ profilePhoto: ev.target.result })
                reader.readAsDataURL(file)
              }} />
            </label>
          </div>

          <div>
            <label style={labelStyle}>NOMBRE DEL PACIENTE</label>
            <input value={patient.name} onChange={e => updatePatient({ name: e.target.value })} style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>DIAGNÓSTICO</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {Object.entries(STIMULUS_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => setDiagnosis(key)} style={{
                  flex: 1, padding: '12px', borderRadius: '14px',
                  border: `2px solid ${patient.diagnosis === key ? cfg.color : '#e8f5f0'}`,
                  background: patient.diagnosis === key ? cfg.color + '15' : 'white',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '700',
                  color: patient.diagnosis === key ? cfg.color : '#666', transition: 'all 0.2s',
                }}>{cfg.label}</button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#666', marginTop: '8px', lineHeight: '1.5' }}>
              {stimulusConfig.description}
            </p>
          </div>

          <SensoryProfile settings={estimulusSettings} />

          <div style={{ background: '#f8f8f6', borderRadius: '14px', padding: '14px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '8px' }}>RESUMEN DE SESIÓN</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Sesiones completadas</span>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>{patient.sessionsCompleted ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '13px', color: '#888' }}>Estrellas acumuladas</span>
              <span style={{ fontSize: '13px', fontWeight: '700' }}>⭐ {patient.stars ?? 0}</span>
            </div>
          </div>

          <MilestonesSection />
          <FamilyAccessSection />
          <ChangePinSection />

          <div>
            {!confirmReset ? (
              <button onClick={() => setConfirmReset(true)} style={{ ...primaryBtnStyle, background: '#fef4f2', color: '#e07a5f', border: '2px solid #fde0da' }}>
                🗑 Resetear sesión del paciente
              </button>
            ) : (
              <div style={{ background: '#fef4f2', borderRadius: '14px', padding: '14px' }}>
                <p style={{ fontSize: '13px', color: '#c0392b', marginBottom: '12px', fontWeight: '600' }}>
                  ¿Resetear todas las estrellas y sesiones de {patient.name}?
                </p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { updatePatient({ stars: 0, sessionsCompleted: 0, sessionHistory: [] }); setConfirmReset(false) }} style={{ ...primaryBtnStyle, background: '#e07a5f', flex: 1 }}>
                    Sí, resetear
                  </button>
                  <button onClick={() => setConfirmReset(false)} style={{ ...primaryBtnStyle, background: 'white', color: '#666', border: '2px solid #eee', flex: 1 }}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'level' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
            Selecciona el nivel terapéutico para {patient.name}. El nivel determina el vocabulario, complejidad y objetivos de cada actividad.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(LEVELS).map(([id, lvl]) => (
              <button key={id} onClick={() => { setPreviewLevelId(id); setLevelById(id) }} style={{
                padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
                border: `2px solid ${previewLevelId === id ? '#4aab8a' : '#e8f5f0'}`,
                background: previewLevelId === id ? '#e8f5f0' : 'white', transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: previewLevelId === id ? '#2d7a62' : '#3a3a3a', marginBottom: '2px' }}>
                      {lvl.label}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888' }}>{lvl.ageRange}</p>
                  </div>
                  {previewLevelId === id && <span style={{ fontSize: '16px' }}>✓</span>}
                </div>
              </button>
            ))}
          </div>

          <div>
            <label style={labelStyle}>NIVELES POR COMPONENTE</label>
            {[
              { key: 'fonologico',      label: 'Fonológico 🔊' },
              { key: 'lexico',          label: 'Léxico-Semántico 📚' },
              { key: 'morfosintactico', label: 'Morfosintáctico 🧩' },
              { key: 'pragmatico',      label: 'Pragmático 💬' },
            ].map(comp => (
              <div key={comp.key} style={{ marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: '600' }}>{comp.label}</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['inicial', 'intermedio', 'avanzado'].map(lvl => (
                    <button key={lvl} onClick={() => updatePatient({ componentLevels: { ...patient.componentLevels, [comp.key]: lvl } })} style={{
                      flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer',
                      border: `2px solid ${patient.componentLevels?.[comp.key] === lvl ? '#4aab8a' : '#e8f5f0'}`,
                      background: patient.componentLevels?.[comp.key] === lvl ? '#e8f5f0' : 'white',
                      fontSize: '12px', fontWeight: '600',
                      color: patient.componentLevels?.[comp.key] === lvl ? '#2d7a62' : '#888',
                    }}>
                      {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stimuli' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '10px' }}>🔁 PRESENTACIÓN</p>
            {[
              { key: 'simultaneousAudioVisual', label: 'Audio + Visual simultáneo',    desc: 'Presenta imagen y audio al mismo tiempo' },
              { key: 'animationsEnabled',       label: 'Animaciones activadas',         desc: 'Transiciones y efectos visuales' },
              { key: 'backgroundElements',      label: 'Elementos de fondo',            desc: 'Decoración visual de contexto' },
              { key: 'sequentialStimulus',      label: 'Estímulo secuencial',           desc: 'Presenta opciones una a una, no todas juntas' },
              { key: 'extendedExposureTime',    label: 'Tiempo de exposición extendido',desc: 'Más tiempo para observar el estímulo' },
            ].map(item => (
              <StimulusToggle key={item.key} label={item.label} desc={item.desc} value={estimulusSettings[item.key]} onChange={v => updateStimulusSettings(item.key, v)} />
            ))}
          </div>

          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '10px' }}>🎯 DIFICULTAD</p>
            {[
              { key: 'reducedOptions',         label: 'Opciones reducidas',       desc: 'Menos alternativas por ejercicio' },
              { key: 'largerText',              label: 'Texto más grande',         desc: 'Aumenta tamaño de fuente' },
              { key: 'simplifiedInstructions', label: 'Instrucciones simples',    desc: 'Lenguaje simplificado en consignas' },
            ].map(item => (
              <StimulusToggle key={item.key} label={item.label} desc={item.desc} value={estimulusSettings[item.key]} onChange={v => updateStimulusSettings(item.key, v)} />
            ))}
          </div>

          <div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#666', marginBottom: '10px' }}>⏱ VELOCIDAD</p>
            {[
              { key: 'wordSpeakDelay',       label: 'Tiempo para pronunciar palabra', defaultVal: 1000 },
              { key: 'slideTransitionDelay', label: 'Tiempo entre ejercicios',         defaultVal: 1500 },
            ].map(({ key, label, defaultVal }) => {
              const val = estimulusSettings[key] ?? defaultVal
              return (
                <div key={key} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#3a3a3a' }}>{label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#4aab8a' }}>{(val / 1000).toFixed(1)}s</span>
                  </div>
                  <input type="range" min={300} max={2100} step={300} value={val} onChange={e => updateStimulusSettings(key, Number(e.target.value))} style={{ width: '100%', accentColor: '#4aab8a' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#999' }}>0.3s</span>
                    <span style={{ fontSize: '11px', color: '#999' }}>2.1s</span>
                  </div>
                </div>
              )
            })}
          </div>

          <p style={{ fontSize: '11px', color: '#999', lineHeight: '1.6', padding: '12px', background: '#f8f8f6', borderRadius: '12px' }}>
            Los estímulos se configuran según el perfil sensorial individual del paciente, independiente del diagnóstico.
          </p>
        </div>
      )}

      {activeTab === 'session' && <SessionTab />}

      {activeTab === 'family' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '16px' }}>
              Gestiona el acceso familiar de <strong>{patient.name}</strong>. La familia ingresa con el RUT del paciente y un PIN asignado aquí.
            </p>
            <FamilyAccessSection />
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#888', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Contraseña de acceso
            </p>
            <HomePinConfig />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

function TherapistPanel({ onClose, onViewProgress, onViewHistory, onStartPlan, onOpenHomeMode, onOpenBuilder, onOpenMyExercises }) {
  const { patient, level, loadPatient, setLevelById, estimulusSettings, resetAssessment } = usePatient()
  const [view, setView]         = useState('menu')
  const [savedMsg, setSavedMsg] = useState(false)

  function handleOpenHomeMode() {
    if (onOpenHomeMode) onOpenHomeMode()
    onClose()
  }

  function handleSelectPatient(p) {
    loadPatient(p)
    setLevelById(p.levelId)
    onClose()
  }

  function handleSaveSession() {
    if (!patient.id) return
    persistPatient(patient.id, {
      name:              patient.name,
      diagnosis:         patient.diagnosis,
      levelId:           patient.levelId,
      stars:             patient.stars,
      sessionsCompleted: patient.sessionsCompleted,
      sessionHistory:    patient.sessionHistory,
      estimulusSettings,
    })
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  /**
   * Re-evaluar: resetea el assessment para que App.jsx muestre el wizard.
   * El panel se cierra y el gate en App lo intercepta automáticamente.
   */
  function handleReassess() {
    resetAssessment()
    onClose()
  }

  /**
   * Iniciar Plan Terapéutico: cierra el panel y va directo a home
   * para que el terapeuta seleccione la primera actividad.
   * Si el padre pasa onStartPlan, lo usa; si no, simplemente cierra.
   */
  function handleStartPlan() {
    if (onStartPlan) onStartPlan()
    else onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 100 }}>
        <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '0 0 32px' }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#3a3a3a' }}>🔐 Panel del Terapeuta</h2>
              <p style={{ fontSize: '11px', color: '#666' }}>Gestión de pacientes</p>
            </div>
            <button onClick={onClose} style={{ background: '#fef4f2', border: 'none', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', color: '#e07a5f', fontWeight: '600' }}>Cerrar</button>
          </div>

          <div style={{ padding: '20px' }}>
            {view === 'menu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* ── Paciente activo ── */}
                <div style={{ background: '#f0faf6', borderRadius: '14px', padding: '14px 16px', border: '1px solid #c8e8dc' }}>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#2d7a62', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paciente activo</p>
                  <p style={{ fontSize: '16px', fontWeight: '800', color: '#1a2a1a', margin: '0 0 2px' }}>{patient.name}</p>
                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{level.label} · {level.ageRange} · ⭐ {patient.stars}</p>
                </div>

                {/* ── Perfil clínico ── */}
                <ClinicalProfileCard
                  onStartPlan={handleStartPlan}
                  onReassess={handleReassess}
                />

                {/* ── Acciones: grid 2 columnas ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => setView('new')} style={actionBtnStyle}>
                    <span style={{ fontSize: 18 }}>➕</span>
                    <span>Nuevo paciente</span>
                  </button>
                  <button onClick={() => setView('search')} style={{ ...actionBtnStyle, background: '#f0ecfa', color: '#6a4c9c', border: '1.5px solid #ddd6f5' }}>
                    <span style={{ fontSize: 18 }}>🔍</span>
                    <span>Buscar paciente</span>
                  </button>
                  <button onClick={() => setView('config')} style={{ ...actionBtnStyle, background: '#f5f5f5', color: '#555', border: '1.5px solid #e8e8e8' }}>
                    <span style={{ fontSize: 18 }}>⚙️</span>
                    <span>Configurar</span>
                  </button>
                  {onViewProgress && (
                    <button onClick={onViewProgress} style={{ ...actionBtnStyle, background: '#fff8e8', color: '#b87000', border: '1.5px solid #fde8a0' }}>
                      <span style={{ fontSize: 18 }}>📊</span>
                      <span>Progreso</span>
                    </button>
                  )}
                  {onOpenBuilder && (
                    <button onClick={onOpenBuilder} style={{ ...actionBtnStyle, background: '#f0f9ff', color: '#0369a1', border: '1.5px solid #bae6fd' }}>
                      <span style={{ fontSize: 18 }}>✨</span>
                      <span>Crear ejercicio</span>
                    </button>
                  )}
                  {onOpenMyExercises && (
                    <button onClick={onOpenMyExercises} style={{ ...actionBtnStyle, background: '#fdf4ff', color: '#7e22ce', border: '1.5px solid #e9d5ff' }}>
                      <span style={{ fontSize: 18 }}>📝</span>
                      <span>Mis ejercicios</span>
                    </button>
                  )}
                </div>

                {/* ── Acciones secundarias ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {patient.id && (
                    <button onClick={handleSaveSession} style={{
                      padding: '11px 16px', borderRadius: '12px', border: '1.5px solid #c8e8dc',
                      background: savedMsg ? '#e8f5f0' : 'white',
                      color: savedMsg ? '#2d7a62' : '#4aab8a',
                      fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span>{savedMsg ? '✓' : '💾'}</span>
                      <span>{savedMsg ? 'Sesión guardada' : 'Guardar sesión'}</span>
                    </button>
                  )}
                  {onOpenHomeMode && (
                    <button onClick={handleOpenHomeMode} style={{
                      padding: '11px 16px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f0faf6, #e8f5f0)',
                      border: '1.5px solid #c8e8dc',
                      color: '#2d7a62', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 16 }}>👨‍👩‍👧</span>
                      <span>Modo Familia</span>
                      <span style={{ marginLeft: 'auto', color: '#aaa' }}>›</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {view === 'new' && (
              <NewPatientForm onBack={() => setView('menu')} onSaved={onClose} />
            )}
            {view === 'search' && (
              <SearchPatient onBack={() => setView('menu')} onSelected={handleSelectPatient} />
            )}
            {view === 'config' && (
              <div>
                <button onClick={() => setView('menu')} style={{ ...backBtnStyle, marginBottom: '16px' }}>← Volver</button>
                <ConfigPanel onViewProgress={onViewProgress} onViewHistory={onViewHistory} />
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default TherapistPanel

// ── shared styles ─────────────────────────────────────────────────────────────

const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#666', display: 'block', marginBottom: '6px' }

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: '12px',
  border: '2px solid #e8f5f0', fontSize: '14px', color: '#3a3a3a',
  outline: 'none', boxSizing: 'border-box',
}

const primaryBtnStyle = {
  width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
  background: '#4aab8a', color: 'white', fontSize: '14px', fontWeight: '700',
  cursor: 'pointer', textAlign: 'center',
}

// Botón de acción compacto para el grid 2 columnas del menú
const actionBtnStyle = {
  padding: '14px 10px', borderRadius: '14px', border: '1.5px solid #c8e8dc',
  background: '#4aab8a', color: 'white', fontSize: '12px', fontWeight: '700',
  cursor: 'pointer', textAlign: 'center',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
}

const backBtnStyle = {
  padding: '8px 14px', borderRadius: '10px', border: '2px solid #e8f5f0',
  background: 'white', cursor: 'pointer', fontSize: '14px', color: '#666', fontWeight: '600',
}

const errorStyle = { fontSize: '12px', color: '#e07a5f', marginTop: '4px' }
