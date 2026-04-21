import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'
import { getAllPatients, searchPatients } from '../data/patients'
import NewPatientForm from '../components/NewPatientForm'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

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
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#2d2d2d' }}>NexiaPlay</h1>
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
