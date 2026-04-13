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

        <div className="activities-grid">
          <div className="activity-card teal" onClick={() => onNavigate('minimal-pairs')}>
            <span className="activity-icon">👂</span>
            <div className="activity-name">Palabras Similares</div>
            <div className="activity-desc">Pares mínimos</div>
          </div>
          <div className="activity-card purple" onClick={() => onNavigate('build-word')}>
            <span className="activity-icon">🧩</span>
            <div className="activity-name">Armar Palabras</div>
            <div className="activity-desc">Une las sílabas</div>
          </div>
          <div className="activity-card peach" onClick={() => onNavigate('listen')}>
            <span className="activity-icon">🔊</span>
            <div className="activity-name">Escucha Atento</div>
            <div className="activity-desc">Discriminación auditiva</div>
          </div>
          <div className="activity-card yellow" onClick={() => onNavigate('syntax')}>
            <span className="activity-icon">📝</span>
            <div className="activity-name">Completar Frases</div>
            <div className="activity-desc">Conectores</div>
          </div>
          <div className="activity-card teal" onClick={() => onNavigate('semantic')}>
            <span className="activity-icon">🧠</span>
            <div className="activity-name">Semántica</div>
            <div className="activity-desc">Opuestos y definiciones</div>
          </div>
          <div className="activity-card purple" onClick={() => onNavigate('pragmatic')}>
            <span className="activity-icon">💬</span>
            <div className="activity-name">Inferencias</div>
            <div className="activity-desc">Contexto social</div>
          </div>
        </div>

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