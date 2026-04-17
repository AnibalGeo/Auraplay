import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { LEVELS } from '../data/levels'

const ACTIVITY_LABELS = {
  'minimal-pairs': 'Palabras Similares',
  'build-word': 'Armar Palabras',
  'listen': 'Escucha Atento',
  'syntax': 'Completar Frases',
  'semantic': 'Semántica',
  'narrative': 'Ordenar Historia',
  'pragmatic': 'Inferencias',
}

const ACTIVITY_EMOJIS = {
  'minimal-pairs': '👂',
  'build-word': '🔤',
  'listen': '🎧',
  'syntax': '📝',
  'semantic': '💡',
  'narrative': '📖',
  'pragmatic': '🧠',
}

const STIMULUS_LABELS = {
  animationsEnabled: 'Animaciones',
  simultaneousAudioVisual: 'Audio+Visual',
  backgroundElements: 'Fondo',
  sequentialStimulus: 'Secuencial',
  extendedExposureTime: 'Tiempo ext.',
  reducedOptions: 'Opciones reducidas',
  largerText: 'Texto grande',
  simplifiedInstructions: 'Instr. simples',
}

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
  )
}

function formatDuration(secs) {
  if (!secs) return null
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default function SessionHistoryScreen({ onBack }) {
  const { patient } = usePatient()
  const [expanded, setExpanded] = useState(new Set())
  const [dateFilter, setDateFilter] = useState('all')
  const [activityFilter, setActivityFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const allHistory = patient.sessionHistory || []

  // Include activity entries and standalone note entries
  const sessions = allHistory.filter(
    e => e.type === 'activity' || e.type === 'nota_clinica' || e.type === 'note'
  )

  const now = Date.now()
  const filtered = sessions
    .filter(e => {
      if (!e.date) return true
      const ms = now - new Date(e.date).getTime()
      if (dateFilter === 'month') return ms <= 30 * 86400000
      if (dateFilter === '3months') return ms <= 90 * 86400000
      return true
    })
    .filter(e => activityFilter === 'all' || e.activityId === activityFilter)
    .filter(e => levelFilter === 'all' || e.levelId === levelFilter)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  // Summary
  const activitySessions = filtered.filter(e => e.type === 'activity')
  const totalScore = activitySessions.reduce((s, e) => s + (e.score || 0), 0)
  const totalPossible = activitySessions.reduce((s, e) => s + (e.total || 0), 0)
  const avgPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : null

  const activityCounts = {}
  activitySessions.forEach(e => { activityCounts[e.activityId] = (activityCounts[e.activityId] || 0) + 1 })
  const mostPracticed = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]

  const levelCounts = {}
  activitySessions.forEach(e => { levelCounts[e.levelId] = (levelCounts[e.levelId] || 0) + 1 })
  const mostLevel = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0]

  // Unique values for dropdowns (from all sessions, not filtered)
  const uniqueActivities = [...new Set(sessions.filter(e => e.activityId).map(e => e.activityId))]
  const uniqueLevels = [...new Set(sessions.filter(e => e.levelId).map(e => e.levelId))]

  function toggleExpand(sid) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(sid) ? next.delete(sid) : next.add(sid)
      return next
    })
  }

  function handleExport() {
    let text = `HISTORIAL DE SESIONES — ${patient.name}\n`
    text += `RUT: ${patient.rut || '—'}\n`
    text += `Exportado: ${new Date().toLocaleDateString('es-CL')}\n\n`
    text += `Total sesiones: ${filtered.length}\n`
    if (avgPct !== null) text += `Promedio aciertos: ${avgPct}%\n`
    text += '\n---\n\n'

    filtered.forEach((e, i) => {
      text += `[${i + 1}] ${formatDateTime(e.date)}\n`
      if (e.type === 'activity') {
        text += `Actividad: ${ACTIVITY_EMOJIS[e.activityId] || ''} ${e.activityLabel || ACTIVITY_LABELS[e.activityId] || e.activityId}\n`
        text += `Nivel: ${e.levelLabel || LEVELS[e.levelId]?.label || e.levelId || '—'}\n`
        text += `Score: ${e.score}/${e.total} (${Math.round((e.score / e.total) * 100)}%)\n`
        if (e.duration) text += `Duración: ${formatDuration(e.duration)}\n`
        if (e.earned) text += `Estrellas: ${'⭐'.repeat(e.earned)}\n`
        if (e.clinicalNote) text += `Nota clínica: ${e.clinicalNote}\n`
        if (e.clinicalNoteTests?.length) text += `Tests: ${e.clinicalNoteTests.join(', ')}\n`
      } else {
        text += `Tipo: Nota clínica\n`
        if (e.notes) text += `Notas: ${e.notes}\n`
        if (e.testsApplied?.length) text += `Tests: ${e.testsApplied.join(', ')}\n`
        if (e.duration) text += `Duración: ${e.duration} min\n`
      }
      text += '\n'
    })

    try {
      navigator.clipboard.writeText(text).then(() => alert('Historial copiado al portapapeles'))
    } catch {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      alert('Historial copiado al portapapeles')
    }
  }

  return (
    <div className="screen" style={{ background: '#f8f9fa', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'white', padding: '16px 20px', borderBottom: '1px solid #e8f5f0',
        position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} style={backBtnStyle}>←</button>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#3a3a3a', margin: 0 }}>
              Historial de sesiones
            </h2>
            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
              {patient.name} · {patient.rut || '—'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '14px', padding: '14px', border: '1px solid #e8f5f0' }}>
          <p style={sectionLabel}>FILTROS</p>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {[
              { id: 'month', label: 'Este mes' },
              { id: '3months', label: 'Últimos 3 meses' },
              { id: 'all', label: 'Todo' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setDateFilter(f.id)}
                style={{
                  flex: 1, padding: '7px 4px', borderRadius: '10px', fontSize: '11px', fontWeight: '600',
                  border: `2px solid ${dateFilter === f.id ? '#4aab8a' : '#e8f5f0'}`,
                  background: dateFilter === f.id ? '#e8f5f0' : 'white',
                  color: dateFilter === f.id ? '#2d7a62' : '#888', cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={activityFilter} onChange={e => setActivityFilter(e.target.value)} style={selectStyle}>
              <option value="all">Todas las actividades</option>
              {uniqueActivities.map(a => (
                <option key={a} value={a}>{ACTIVITY_EMOJIS[a] || ''} {ACTIVITY_LABELS[a] || a}</option>
              ))}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={selectStyle}>
              <option value="all">Todos los niveles</option>
              {uniqueLevels.map(l => (
                <option key={l} value={l}>{LEVELS[l]?.label || l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary */}
        {filtered.length > 0 && (
          <div style={{ background: '#f0faf6', borderRadius: '14px', padding: '14px', border: '1px solid #c8e8dc' }}>
            <p style={{ ...sectionLabel, color: '#2d7a62' }}>RESUMEN · {filtered.length} sesiones</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { label: 'Total sesiones', value: filtered.length },
                { label: 'Promedio aciertos', value: avgPct !== null ? `${avgPct}%` : '—' },
                {
                  label: 'Más practicada',
                  value: mostPracticed
                    ? `${ACTIVITY_EMOJIS[mostPracticed[0]] || ''} ${ACTIVITY_LABELS[mostPracticed[0]] || mostPracticed[0]}`
                    : '—',
                },
                {
                  label: 'Nivel más trabajado',
                  value: mostLevel ? (LEVELS[mostLevel[0]]?.label || mostLevel[0]) : '—',
                },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'white', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>{label}</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#3a3a3a', margin: 0 }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export */}
        {filtered.length > 0 && (
          <button onClick={handleExport} style={{ ...primaryBtnStyle, background: '#f0ecfa', color: '#6a4c9c' }}>
            📋 Exportar historial ({filtered.length} sesiones)
          </button>
        )}

        {/* Sessions */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#aaa' }}>
            <p style={{ fontSize: '36px', marginBottom: '8px' }}>📭</p>
            <p style={{ fontSize: '14px' }}>No hay sesiones con los filtros aplicados</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map((session, i) => {
              const sid = session.id || `${session.date}-${i}`
              const isOpen = expanded.has(sid)
              const isActivity = session.type === 'activity'
              const pct = isActivity && session.total > 0
                ? Math.round((session.score / session.total) * 100)
                : null
              const dur = formatDuration(session.duration)

              return (
                <div key={sid} style={{ background: 'white', borderRadius: '14px', border: '1px solid #e8f5f0', overflow: 'hidden' }}>
                  <button
                    onClick={() => toggleExpand(sid)}
                    style={{ width: '100%', padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '11px', color: '#999', margin: '0 0 3px' }}>
                          {formatDateTime(session.date)}
                        </p>
                        {isActivity ? (
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#3a3a3a', margin: '0 0 2px' }}>
                            {ACTIVITY_EMOJIS[session.activityId] || '📌'}{' '}
                            {session.activityLabel || ACTIVITY_LABELS[session.activityId] || session.activityId}
                          </p>
                        ) : (
                          <p style={{ fontSize: '14px', fontWeight: '700', color: '#6a4c9c', margin: '0 0 2px' }}>
                            📋 Nota clínica
                          </p>
                        )}
                        {session.levelId && (
                          <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>
                            {session.levelLabel || LEVELS[session.levelId]?.label || session.levelId}
                            {dur && ` · ⏱ ${dur}`}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '10px' }}>
                        {isActivity && pct !== null && (
                          <>
                            <p style={{
                              fontSize: '15px', fontWeight: '700', margin: '0 0 1px',
                              color: pct >= 80 ? '#4aab8a' : pct >= 60 ? '#e8a020' : '#e07a5f',
                            }}>
                              {session.score}/{session.total}
                            </p>
                            <p style={{ fontSize: '11px', color: '#999', margin: '0 0 2px' }}>{pct}%</p>
                          </>
                        )}
                        {isActivity && session.earned > 0 && (
                          <p style={{ fontSize: '12px', margin: '0 0 2px' }}>{'⭐'.repeat(session.earned)}</p>
                        )}
                        <p style={{ fontSize: '11px', color: '#ccc', margin: 0 }}>{isOpen ? '▲' : '▼'}</p>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f4f4f4' }}>
                      {isActivity && session.stimulusSettings && (
                        <div style={{ marginTop: '10px' }}>
                          <p style={sectionLabel}>CONFIGURACIÓN DE ESTÍMULOS</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {Object.entries(session.stimulusSettings)
                              .filter(([, v]) => v === true)
                              .map(([k]) => (
                                <span key={k} style={{
                                  fontSize: '11px', padding: '3px 9px', borderRadius: '8px',
                                  background: '#e8f5f0', color: '#2d7a62', fontWeight: '600',
                                }}>
                                  {STIMULUS_LABELS[k] || k}
                                </span>
                              ))}
                            {Object.entries(session.stimulusSettings).filter(([, v]) => v === true).length === 0 && (
                              <span style={{ fontSize: '12px', color: '#bbb', fontStyle: 'italic' }}>Sin ajustes activos</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Clinical note */}
                      {(() => {
                        const noteText = isActivity ? session.clinicalNote : session.notes
                        const noteTests = isActivity ? session.clinicalNoteTests : session.testsApplied
                        if (!noteText) return null
                        return (
                          <div style={{ marginTop: '10px', background: '#f8f8f6', borderRadius: '10px', padding: '10px 12px' }}>
                            <p style={sectionLabel}>NOTA CLÍNICA</p>
                            <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.5', margin: 0 }}>{noteText}</p>
                            {noteTests?.length > 0 && (
                              <p style={{ fontSize: '11px', color: '#4aab8a', fontWeight: '600', marginTop: '6px', marginBottom: 0 }}>
                                {noteTests.join(' · ')}
                              </p>
                            )}
                          </div>
                        )
                      })()}

                      {isActivity && !session.clinicalNote && (
                        <p style={{ fontSize: '12px', color: '#ccc', marginTop: '10px', fontStyle: 'italic', marginBottom: 0 }}>
                          Sin nota clínica asociada
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const sectionLabel = { fontSize: '11px', fontWeight: '700', color: '#666', marginBottom: '8px', display: 'block' }

const backBtnStyle = {
  padding: '8px 14px', borderRadius: '10px', border: '2px solid #e8f5f0',
  background: 'white', cursor: 'pointer', fontSize: '14px', color: '#666', fontWeight: '600', flexShrink: 0,
}

const primaryBtnStyle = {
  width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
  background: '#4aab8a', color: 'white', fontSize: '14px', fontWeight: '700',
  cursor: 'pointer', textAlign: 'center',
}

const selectStyle = {
  flex: 1, padding: '8px 10px', borderRadius: '10px',
  border: '2px solid #e8f5f0', fontSize: '12px', color: '#3a3a3a',
  background: 'white', outline: 'none',
}
