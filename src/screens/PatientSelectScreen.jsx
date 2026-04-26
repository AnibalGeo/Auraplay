import { useState, useMemo } from 'react'
import { usePatient } from '../context/PatientContext'
import { APP_CONFIG } from '../config/app.config'
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
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {selected && (
        <ConfirmCard
          p={selected}
          onConfirm={handleConfirm}
          onCancel={() => setSelected(null)}
        />
      )}

      <div className="px-5 pt-8 pb-24">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Pacientes</h1>
            <p className="text-xs text-gray-400 mt-0.5">Selecciona para iniciar sesión</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 bg-emerald-500 text-white text-sm font-semibold px-3 py-2 rounded-xl cursor-pointer"
          >
            <span>＋</span><span>Registrar</span>
          </button>
        </div>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre o RUT…"
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none bg-white mb-4"
        />

        {!query.trim() && (
          <p className="text-xs font-bold text-gray-300 tracking-wider mb-3">RECIENTES</p>
        )}

        <div className="flex flex-col gap-2">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm">No se encontraron pacientes.</p>
            </div>
          ) : filtered.map(p => {
            const cfg = STIMULUS_CONFIG[p.diagnosis]
            const level = LEVELS[p.levelId]
            const lastEntry = [...(p.sessionHistory ?? [])].reverse()[0]
            const initial = (p.name || 'P').charAt(0).toUpperCase()
            const color = cfg?.color ?? '#4aab8a'
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p)}
                className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm text-left"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: color + '20', color }}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{level?.label ?? p.levelId}</p>
                  <span
                    className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: color + '18', color }}
                  >
                    {cfg?.label ?? p.diagnosis}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-2">
                  {lastEntry && (
                    <p className="text-xs text-gray-300 whitespace-nowrap">{fmtDate(lastEntry.date)}</p>
                  )}
                  <span className="text-gray-200 text-lg">›</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PatientSelectScreen
