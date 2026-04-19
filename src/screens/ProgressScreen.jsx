import { useMemo, useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { getPatientById } from '../data/patients'
import { LEVELS, STIMULUS_CONFIG } from '../data/levels'

// ── Constantes ────────────────────────────────────────────────────────────────

const AXES = [
  { name: 'Fonético-Fonológico', ids: ['minimal-pairs', 'build-word'],  color: '#4aab8a', compKey: 'fonologico' },
  { name: 'Léxico-Semántico',    ids: ['semantic', 'listen'],           color: '#7c6bb0', compKey: 'lexico' },
  { name: 'Morfosintáctico',     ids: ['syntax', 'narrative'],          color: '#e07a5f', compKey: 'morfosintactico' },
  { name: 'Pragmático',          ids: ['pragmatic'],                    color: '#e8a020', compKey: 'pragmatico' },
]

function axisColor(activityId) {
  return AXES.find(a => a.ids.includes(activityId))?.color ?? '#aaa'
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtShort(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' })
}

function daysSince(iso) {
  if (!iso) return null
  return Math.max(0, Math.floor((new Date() - new Date(iso)) / (1000 * 60 * 60 * 24)))
}

function words80(text) {
  const ws = (text ?? '').trim().split(/\s+/)
  if (ws.length <= 80) return { preview: text, hasMore: false }
  return { preview: ws.slice(0, 80).join(' '), hasMore: true }
}

// ── Exportar ──────────────────────────────────────────────────────────────────

function exportTxt(fullPatient, level, initialLevel, cfg, activityEntries, noteEntries, axisStats, avgAccuracy) {
  const days = daysSince(fullPatient.createdAt)
  const today = new Date().toLocaleDateString('es-CL')
  const lines = [
    'INFORME DE PROGRESO — AURAPLAY',
    '='.repeat(40),
    `Paciente:         ${fullPatient.name}`,
    `RUT:              ${fullPatient.rut || '—'}`,
    `Diagnóstico:      ${cfg?.label ?? fullPatient.diagnosis}`,
    `Nivel actual:     ${level.label} (${level.ageRange})`,
    `Días en terapia:  ${days === null ? '—' : days === 0 ? 'Hoy' : days}`,
    `Fecha de informe: ${today}`,
    '',
    'RESUMEN',
    '-'.repeat(40),
    `Total sesiones:       ${noteEntries.length}`,
    `Total estrellas:      ${fullPatient.stars ?? 0}`,
    `Promedio de aciertos: ${avgAccuracy !== null ? avgAccuracy + '%' : '—'}`,
    `Nivel inicial:        ${initialLevel ? initialLevel.label + ' (' + initialLevel.ageRange + ')' : '—'}`,
    `Nivel actual:         ${level.label} (${level.ageRange})`,
    '',
    'PROGRESO POR EJE LINGÜÍSTICO',
    '-'.repeat(40),
    ...axisStats.map(a =>
      `${a.name.padEnd(14)} ${a.count > 0 ? a.pct + '%' : 'Sin datos'} (${a.count} actividad${a.count !== 1 ? 'es' : ''})`
    ),
    '',
    'NOTAS CLÍNICAS',
    '-'.repeat(40),
    ...[...noteEntries].reverse().slice(0, 10).flatMap(n => [
      `${fmt(n.date)}${n.duration ? ' · ' + n.duration + ' min' : ''}`,
      n.testsApplied?.length ? 'Tests: ' + n.testsApplied.join(', ') : '',
      n.notes || '',
      '',
    ]).filter((l, i, arr) => !(l === '' && arr[i - 1] === '')),
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const rut = (fullPatient.rut || 'sin-rut').replace(/\./g, '').replace('-', '')
  const dateStr = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `${fullPatient.name.replace(/\s+/g, '_')}_${rut}_${dateStr}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Componente ────────────────────────────────────────────────────────────────

function ProgressScreen({ onBack }) {
  const { patient, level } = usePatient()
  const [expanded, setExpanded] = useState(new Set())

  const fullPatient = useMemo(() => {
    if (patient.id) return getPatientById(patient.id) ?? patient
    return patient
  }, [patient])

  const history       = fullPatient.sessionHistory ?? []
  const activityEntries = history.filter(e => e.type === 'activity')
  const noteEntries     = history.filter(e => e.type === 'nota_clinica' || e.type === 'note')

  const cfg          = STIMULUS_CONFIG[fullPatient.diagnosis]
  const initialLevel = LEVELS[fullPatient.initialLevelId] ?? null
  const days         = daysSince(fullPatient.createdAt)

  // Promedio de aciertos global
  const avgAccuracy = useMemo(() => {
    if (activityEntries.length === 0) return null
    const avg = activityEntries.reduce((s, e) => s + (e.score / (e.total || 1)), 0) / activityEntries.length
    return Math.round(avg * 100)
  }, [activityEntries])

  // Gráfico: últimas 8 actividades
  const chartData = [...activityEntries].slice(-8)

  // Progreso por eje
  const axisStats = useMemo(() => AXES.map(axis => {
    const entries = activityEntries.filter(e => axis.ids.includes(e.activityId))
    if (entries.length === 0) return { ...axis, pct: 0, count: 0 }
    const avg = entries.reduce((s, e) => s + (e.score / (e.total || 1)), 0) / entries.length
    return { ...axis, pct: Math.round(avg * 100), count: entries.length }
  }), [activityEntries])

  // Últimas 3 notas
  const lastNotes = [...noteEntries].reverse().slice(0, 3)

  const BAR_H = 80 // px de área de barras

  return (
    <div className="screen" style={{ background: '#f5f9f7', overflowY: 'auto' }}>

      {/* ── Header ── */}
      <div style={{ background: 'white', padding: '14px 20px', borderBottom: '1px solid #e8f5f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={{ background: '#f0faf6', border: 'none', borderRadius: '10px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px', color: '#2d7a62' }}>←</button>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#2d2d2d' }}>{fullPatient.name}</h2>
            <p style={{ fontSize: '12px', color: '#888' }}>
              {level.label} · {level.ageRange}
              {days !== null ? ` · ${days === 0 ? 'Hoy' : `${days} días en terapia`}` : ''}
            </p>
          </div>
          <span style={{ background: (cfg?.color ?? '#aaa') + '22', color: cfg?.color ?? '#aaa', border: `1px solid ${(cfg?.color ?? '#aaa')}44`, borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: '700' }}>
            {cfg?.label ?? fullPatient.diagnosis}
          </span>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Tarjetas 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Card label="SESIONES COMPLETADAS" value={patient.sessionHistory?.length ?? 0} />
          <Card label="ESTRELLAS ACUMULADAS" value={`⭐ ${fullPatient.stars ?? 0}`} />
          <Card
            label="NIVEL INICIAL → ACTUAL"
            value={initialLevel ? `${initialLevel.label} → ${level.label}` : level.label}
            small
          />
          <Card
            label="PROMEDIO DE ACIERTOS"
            value={avgAccuracy !== null ? `${avgAccuracy}%` : '—'}
            valueColor={avgAccuracy >= 70 ? '#4aab8a' : avgAccuracy >= 40 ? '#e8a020' : '#e07a5f'}
          />
        </div>

        {/* ── Gráfico de barras ── */}
        {chartData.length > 0 && (
          <Section title={`ÚLTIMAS ${chartData.length} ACTIVIDADES`}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', paddingLeft: '24px', position: 'relative' }}>
              {/* Eje Y */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 20, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: '4px', width: '20px' }}>
                {[3, 2, 1, 0].map(n => (
                  <span key={n} style={{ fontSize: '9px', color: '#bbb', lineHeight: 1 }}>{n}</span>
                ))}
              </div>
              {/* Líneas de referencia */}
              <div style={{ position: 'absolute', left: '24px', right: 0, top: 0, bottom: 20, pointerEvents: 'none' }}>
                {[0, 1, 2, 3].map((_, i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(i / 3) * BAR_H}px`, borderTop: '1px dashed #f0f0f0' }} />
                ))}
              </div>
              {/* Barras */}
              {chartData.map((entry, i) => {
                const h = Math.max(4, ((entry.earned ?? 0) / 3) * BAR_H)
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '9px', color: '#999', fontWeight: '700' }}>{entry.earned ?? 0}★</span>
                    <div style={{ width: '100%', height: `${BAR_H}px`, display: 'flex', alignItems: 'flex-end' }}>
                      <div style={{ width: '100%', height: `${h}px`, background: axisColor(entry.activityId), borderRadius: '4px 4px 0 0' }} />
                    </div>
                    <span style={{ fontSize: '9px', color: '#bbb' }}>{fmtShort(entry.date)}</span>
                  </div>
                )
              })}
            </div>
            {/* Leyenda */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
              {AXES.map(a => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: a.color }} />
                  <span style={{ fontSize: '10px', color: '#888' }}>{a.name}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Progreso por eje lingüístico ── */}
        <Section title="PROGRESO POR COMPONENTE LINGÜÍSTICO">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {axisStats.map(({ name, pct, count, color, compKey }) => {
              const compLevel = fullPatient.componentLevels?.[compKey] ?? 'inicial'
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#3a3a3a' }}>{name}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: color, borderRadius: '20px', padding: '1px 7px', textTransform: 'capitalize' }}>
                        {compLevel}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {count > 0 ? `${pct}% · ${count} actividad${count !== 1 ? 'es' : ''}` : 'Sin datos'}
                    </span>
                  </div>
                  <div style={{ background: '#f0f0f0', borderRadius: '8px', height: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '8px', minWidth: count > 0 ? '4px' : 0 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* ── Últimas 3 notas clínicas ── */}
        {lastNotes.length > 0 && (
          <Section title="NOTAS CLÍNICAS RECIENTES">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {lastNotes.map((note, i) => {
                const { preview, hasMore } = words80(note.notes)
                const isExpanded = expanded.has(i)
                return (
                  <div key={i} style={{ background: '#f8f8f6', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#3a3a3a' }}>{fmt(note.date)}</span>
                      {note.duration > 0 && <span style={{ fontSize: '12px', color: '#999' }}>{note.duration} min</span>}
                    </div>
                    {note.testsApplied?.length > 0 && (
                      <p style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600', marginBottom: '6px' }}>
                        {note.testsApplied.join(' · ')}
                      </p>
                    )}
                    {note.notes && (
                      <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
                        {isExpanded ? note.notes : preview}{!isExpanded && hasMore ? '…' : ''}
                      </p>
                    )}
                    {hasMore && (
                      <button
                        onClick={() => setExpanded(prev => {
                          const next = new Set(prev)
                          next.has(i) ? next.delete(i) : next.add(i)
                          return next
                        })}
                        style={{ marginTop: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#4aab8a', fontWeight: '600', padding: 0 }}
                      >
                        {isExpanded ? 'Ver menos' : 'Ver más'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── Estado vacío ── */}
        {activityEntries.length === 0 && noteEntries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#ccc' }}>
            <p style={{ fontSize: '48px', marginBottom: '8px' }}>📊</p>
            <p style={{ fontSize: '14px' }}>Aún no hay datos registrados.</p>
          </div>
        )}

        {/* ── Exportar ── */}
        <button
          onClick={() => exportTxt(fullPatient, level, initialLevel, cfg, activityEntries, noteEntries, axisStats, avgAccuracy)}
          style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '2px solid #c8e8dc', background: 'white', color: '#2d7a62', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
        >
          📄 Exportar resumen (.txt)
        </button>
      </div>
    </div>
  )
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function Card({ label, value, small, valueColor }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: '10px', fontWeight: '700', color: '#aaa', marginBottom: '6px', letterSpacing: '0.4px' }}>{label}</p>
      <p style={{ fontSize: small ? '16px' : '22px', fontWeight: '800', color: valueColor ?? '#2d2d2d', lineHeight: 1.2 }}>{value}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', color: '#aaa', marginBottom: '14px', letterSpacing: '0.4px' }}>{title}</p>
      {children}
    </div>
  )
}

export default ProgressScreen
