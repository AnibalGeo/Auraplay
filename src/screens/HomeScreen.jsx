import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import TherapistPanel from './TherapistPanel'

function HomeScreen({ onNavigate }) {
  const { patient, level, stimulusConfig } = usePatient()
  const [showPanel, setShowPanel] = useState(false)

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
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--mint)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text2)',
            }}
          >
            ⚙️
          </button>
        </div>
      </div>

      {showPanel && <TherapistPanel onClose={() => setShowPanel(false)} onViewProgress={() => { setShowPanel(false); onNavigate('progress') }} />}

      <div className="home-content">
        <div className="patient-card">
          <div className="avatar">🧒</div>
          <div className="patient-info">
            <h2>Hola, {patient.name} 👋</h2>
            <p>{level.label} · {level.ageRange}</p>
          </div>
          <div
            style={{
              background: stimulusConfig.color + '22',
              color: stimulusConfig.color,
              border: `1px solid ${stimulusConfig.color}44`,
              borderRadius: '10px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              marginLeft: 'auto',
              flexShrink: 0,
            }}
          >
            {stimulusConfig?.label ?? patient.diagnosis.toUpperCase()}
          </div>
        </div>

        <p className="section-title">Actividades de hoy</p>

        {(() => {
          const f = level.fonologia
          const s = level.semantica
          const m = level.morfosintaxis
          const p = level.pragmatica

          const all = [
            { key: 'minimal-pairs', color: 'teal',   icon: '👂', name: 'Palabras Similares', desc: 'Pares mínimos',           show: f.minimalPairs?.length > 0 },
            { key: 'build-word',    color: 'purple',  icon: '🧩', name: 'Armar Palabras',     desc: 'Une las sílabas',         show: f.buildWords?.length > 0 },
            { key: 'listen',        color: 'peach',   icon: '🔊', name: 'Escucha Atento',     desc: 'Discriminación auditiva', show: s.listen?.length > 0 },
            { key: 'syntax',        color: 'yellow',  icon: '📝', name: 'Completar Frases',   desc: 'Conectores',              show: m.connectors?.length > 0 },
            { key: 'semantic',      color: 'teal',    icon: '🧠', name: 'Semántica',           desc: 'Opuestos y definiciones', show: (s.opposites?.length > 0) || (s.definitions?.length > 0) },
            { key: 'narrative',     color: 'peach',   icon: '📖', name: 'Ordenar Historia',   desc: 'Secuencia narrativa',     show: m.narrativeSequence?.length > 0 },
            { key: 'pragmatic',     color: 'purple',  icon: '💬', name: 'Inferencias',         desc: 'Contexto social',         show: p.inferences?.length > 0 },
          ]

          const visible = all.filter(a => a.show)
          const few = visible.length <= 2

          return (
            <div
              className={few ? undefined : 'activities-grid'}
              style={few ? {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px',
              } : undefined}
            >
              {visible.map(a => (
                <div
                  key={a.key}
                  className={`activity-card ${a.color}`}
                  style={few ? { width: 'calc(50% - 6px)', maxWidth: '160px' } : undefined}
                  onClick={() => onNavigate(a.key)}
                >
                  <span className="activity-icon">{a.icon}</span>
                  <div className="activity-name">{a.name}</div>
                  <div className="activity-desc">{a.desc}</div>
                </div>
              ))}
            </div>
          )
        })()}

        <p className="section-title">Progreso de la semana</p>
        <div className="progress-section">
          <div className="progress-row">
            <span className="progress-label">Discriminación auditiva</span>
            <div className="progress-bar">
              <div className="progress-fill teal" style={{ width: '72%' }}></div>
            </div>
            <span className="progress-pct">72%</span>
          </div>
          <div className="progress-row">
            <span className="progress-label">Conciencia fonológica</span>
            <div className="progress-bar">
              <div className="progress-fill purple" style={{ width: '55%' }}></div>
            </div>
            <span className="progress-pct">55%</span>
          </div>
          <div className="progress-row">
            <span className="progress-label">Morfosintaxis</span>
            <div className="progress-bar">
              <div className="progress-fill coral" style={{ width: '40%' }}></div>
            </div>
            <span className="progress-pct">40%</span>
          </div>
          <div className="progress-row">
            <span className="progress-label">Semántica</span>
            <div className="progress-bar">
              <div className="progress-fill yellow" style={{ width: '60%' }}></div>
            </div>
            <span className="progress-pct">60%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomeScreen