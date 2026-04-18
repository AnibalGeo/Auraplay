import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import TherapistPanel from './TherapistPanel'

const LANGUAGE_LEVELS = [
  {
    id: 'fonetico',
    name: 'Fonético-Fonológico',
    emoji: '🔊',
    color: '#4aab8a',
    activities: [
      { key: 'minimal-pairs', icon: '👂', name: 'Palabras Similares', desc: 'Pares mínimos' },
      { key: 'build-word',    icon: '🧩', name: 'Armar Palabras',     desc: 'Une las sílabas' },
    ],
    progressLabel: 'Fonético-Fonológico',
    progressPct: 72,
  },
  {
    id: 'lexico',
    name: 'Léxico-Semántico',
    emoji: '📚',
    color: '#7c6bb0',
    activities: [
      { key: 'listen',   icon: '🔊', name: 'Escucha Atento', desc: 'Discriminación auditiva' },
      { key: 'semantic', icon: '🧠', name: 'Semántica',       desc: 'Opuestos y definiciones' },
    ],
    progressLabel: 'Léxico-Semántico',
    progressPct: 60,
  },
  {
    id: 'morfosintactico',
    name: 'Morfosintáctico',
    emoji: '🧩',
    color: '#e07a5f',
    activities: [
      { key: 'syntax',    icon: '📝', name: 'Completar Frases', desc: 'Conectores' },
      { key: 'narrative', icon: '📖', name: 'Ordenar Historia', desc: 'Secuencia narrativa' },
    ],
    progressLabel: 'Morfosintáctico',
    progressPct: 40,
  },
  {
    id: 'pragmatico',
    name: 'Pragmático',
    emoji: '💬',
    color: '#e8a020',
    activities: [
      { key: 'pragmatic', icon: '💬', name: 'Inferencias', desc: 'Contexto social' },
    ],
    progressLabel: 'Pragmático',
    progressPct: 55,
  },
]

function isActivityAvailable(key, level) {
  const f = level.fonologia
  const s = level.semantica
  const m = level.morfosintaxis
  const p = level.pragmatica
  switch (key) {
    case 'minimal-pairs': return (f?.minimalPairs?.length ?? 0) > 0
    case 'build-word':    return (f?.buildWords?.length ?? 0) > 0
    case 'listen':        return (s?.listen?.length ?? 0) > 0
    case 'semantic':      return ((s?.opposites?.length ?? 0) + (s?.definitions?.length ?? 0)) > 0
    case 'syntax':        return (m?.connectors?.length ?? 0) > 0
    case 'narrative':     return (m?.narrativeSequence?.length ?? 0) > 0
    case 'pragmatic':     return (p?.inferences?.length ?? 0) > 0
    default:              return false
  }
}

function HomeScreen({ onNavigate }) {
  const { patient, level, stimulusConfig } = usePatient()
  const [showPanel, setShowPanel] = useState(false)
  const [collapsed, setCollapsed] = useState({})

  function toggleSection(id) {
    setCollapsed(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const suggestions = {
    tel: [
      { icon: '👂', text: 'Pares mínimos con /r/ y /l/: refuerza discriminación fonológica' },
      { icon: '📝', text: 'Frases con conectores "pero" y "porque": morfosintaxis funcional' },
    ],
    tl_tea: [
      { icon: '💬', text: 'Inferencias sobre emociones en láminas' },
      { icon: '🧩', text: 'Contexto social: ¿qué diría o haría el personaje?' },
    ],
    tl_tdah: [
      { icon: '🔊', text: 'Discriminación auditiva: sesión corta de 5 min' },
      { icon: '🧠', text: 'Semántica: opuestos con tarjetas de imágenes' },
      { icon: '👂', text: 'Escucha atenta: instrucciones de 2 pasos' },
    ],
    tl_tea_tdah: [
      { icon: '💬', text: 'Inferencias simples: ¿qué pasó primero?' },
      { icon: '🔊', text: 'Escucha atenta con turno de habla regulado' },
    ],
  }
  const suggestionItems = suggestions[patient.diagnosis] ?? suggestions.tel

  return (
    <div className="screen home-screen">
      <div className="header">
        <div className="logo">
          <div className="logo-icon">A</div>
          <div className="logo-text">
            <h1>AuraPlay</h1>
            <p>Therapeutic Journeys</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="star-count">⭐ {patient.stars}</div>
          <button
            onClick={() => setShowPanel(true)}
            style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', background: 'var(--mint)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {showPanel && (
        <TherapistPanel
          onClose={() => setShowPanel(false)}
          onViewProgress={() => { setShowPanel(false); onNavigate('progress') }}
          onViewHistory={() => { setShowPanel(false); onNavigate('session-history') }}
        />
      )}

      <div className="home-content">
        {/* Patient card */}
        <div className="patient-card">
          <div className="avatar" style={patient.profilePhoto ? { overflow: 'hidden', padding: 0 } : undefined}>
            {patient.profilePhoto
              ? <img src={patient.profilePhoto} alt="avatar" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '50%', display: 'block' }} />
              : '🧒'}
          </div>
          <div className="patient-info">
            <h2>Hola, {patient.name} 👋</h2>
            <p>{level.label} · {level.ageRange}</p>
          </div>
          <div style={{ background: stimulusConfig.color + '22', color: stimulusConfig.color, border: `1px solid ${stimulusConfig.color}44`, borderRadius: '10px', padding: '4px 10px', fontSize: '11px', fontWeight: '700', marginLeft: 'auto', flexShrink: 0 }}>
            {stimulusConfig?.label ?? patient.diagnosis.toUpperCase()}
          </div>
        </div>

        {/* Collapsible activity sections */}
        <p className="section-title">Actividades de hoy</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {LANGUAGE_LEVELS.map(section => {
            const available = section.activities.filter(a => isActivityAvailable(a.key, level))
            const hasActivities = available.length > 0
            const isOpen = hasActivities && !collapsed[section.id]

            return (
              <div key={section.id} style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${hasActivities ? section.color + '44' : '#e8e8e8'}` }}>
                {/* Section header */}
                <button
                  onClick={() => hasActivities && toggleSection(section.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '13px 16px',
                    background: hasActivities ? section.color + '12' : '#f8f8f8',
                    border: 'none', cursor: hasActivities ? 'pointer' : 'default',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{section.emoji}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: hasActivities ? section.color : '#aaa', flex: 1 }}>
                    {section.name}
                  </span>
                  {hasActivities ? (
                    <>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'white', background: section.color, borderRadius: '20px', padding: '2px 8px', flexShrink: 0 }}>
                        {available.length}
                      </span>
                      <span style={{ fontSize: '14px', color: section.color, flexShrink: 0, marginLeft: '4px' }}>
                        {isOpen ? '▾' : '▸'}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#bbb', fontStyle: 'italic' }}>No disponible en este nivel</span>
                  )}
                </button>

                {/* Activity cards */}
                {isOpen && (
                  <div style={{ background: 'white', padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {available.map(a => (
                      <button
                        key={a.key}
                        onClick={() => onNavigate(a.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '12px 14px', borderRadius: '12px',
                          background: section.color + '08',
                          border: `1.5px solid ${section.color}33`,
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                        }}
                      >
                        <span style={{ fontSize: '28px', flexShrink: 0 }}>{a.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#3a3a3a', marginBottom: '2px' }}>{a.name}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{a.desc}</div>
                        </div>
                        <span style={{ fontSize: '16px', color: section.color, flexShrink: 0 }}>→</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Suggestions */}
        <div style={{ marginBottom: '20px' }}>
          <p className="section-title">Sugerencias para esta sesión</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {suggestionItems.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'white', borderRadius: '12px', border: `1.5px solid ${stimulusConfig.color}33`, padding: '10px 14px' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
                <span style={{ fontSize: '13px', color: '#3a3a3a', lineHeight: '1.4' }}>{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <p className="section-title">Progreso de la semana</p>
        <div className="progress-section">
          {LANGUAGE_LEVELS.map(section => (
            <div key={section.id} className="progress-row">
              <span className="progress-label">{section.progressLabel}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${section.progressPct}%`, background: section.color }} />
              </div>
              <span className="progress-pct">{section.progressPct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomeScreen
