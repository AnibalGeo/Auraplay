import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { useAuth } from '../context/AuthContext'
import { LEVELS } from '../data/levels'
import TherapistPanel from './TherapistPanel'

function hasContent(obj) {
  if (!obj) return false
  if (Array.isArray(obj)) return obj.length > 0
  return Object.values(obj).some(v => Array.isArray(v) && v.length > 0)
}

const ACTIVITY_GROUPS = [
  {
    id: 'fonetico',
    name: 'Fonético-Fonológico',
    color: '#4aab8a',
    bgColor: '#e8f5ee',
    activities: [
      { id: 'minimal-pairs',  label: 'Palabras similares', icon: '🔊' },
      { id: 'build-word',     label: 'Armar palabras',     icon: '🧱' },
      { id: 'rhyme',          label: 'Rimas',              icon: '🎵' },
    ],
  },
  {
    id: 'lexico',
    name: 'Léxico-Semántico',
    color: '#7c6bb0',
    bgColor: '#f0edf8',
    activities: [
      { id: 'listen',         label: 'Escucha atento',       icon: '📚' },
      { id: 'semantic',       label: 'Semántica',            icon: '🔤' },
      { id: 'point-image',    label: 'Señala la imagen',     icon: '👆' },
      { id: 'category',       label: '¿Cuál no pertenece?',  icon: '🔍' },
    ],
  },
  {
    id: 'morfosintactico',
    name: 'Morfosintáctico',
    color: '#e07a5f',
    bgColor: '#fdf0ec',
    activities: [
      { id: 'syntax',             label: 'Completar frases',     icon: '🧩' },
      { id: 'narrative',          label: 'Ordenar historia',      icon: '📖' },
      { id: 'follow-instruction', label: 'Sigue la instrucción',  icon: '👂' },
    ],
  },
  {
    id: 'pragmatico',
    name: 'Pragmático',
    color: '#e8a020',
    bgColor: '#fff8e1',
    activities: [
      { id: 'pragmatic',            label: 'Inferencias',       icon: '💭' },
      { id: 'communicative-intent', label: '¿Para qué sirve?',  icon: '💬' },
    ],
  },
]

const SUGGESTIONS = {
  tel:         ['Pares mínimos con /r/ y /l/: refuerza discriminación fonológica', 'Frases con conectores "pero" y "porque": morfosintaxis funcional'],
  tl_tea:      ['Inferencias simples: trabaja intención comunicativa', 'Señala la imagen: vocabulario receptivo sin presión expresiva'],
  tl_tdah:     ['Escucha atento: discriminación con apoyo visual', 'Semántica: categorías con ritmo rápido para mantener atención'],
  tl_tea_tdah: ['Inferencias simples: contexto social estructurado', 'Escucha atento: estímulo controlado con tiempos extendidos'],
}

function isActivityAvailable(activityId, level) {
  if (!level) return false
  const map = {
    'minimal-pairs':       level.fonologia?.minimalPairs,
    'build-word':          level.fonologia?.buildWords,
    'listen':              level.semantica?.listen,
    'semantic':            level.semantica?.opposites || level.semantica?.definitions,
    'syntax':              level.morfosintaxis?.connectors,
    'narrative':           level.morfosintaxis?.narrativeSequence,
    'pragmatic':           level.pragmatica?.inferences,
    'rhyme':               level.rhymes,
    'point-image':         level.pointImages,
    'category':            level.categories,
    'follow-instruction':  level.instructions,
    'communicative-intent':level.communicativeIntents,
  }
  return hasContent(map[activityId])
}

function calcWeekProgress(sessionHistory, groupId) {
  if (!sessionHistory?.length) return 0
  const now    = Date.now()
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const recent = sessionHistory.filter(
    e => e.type === 'activity' && (now - new Date(e.date).getTime()) < weekMs
  )
  const groupMap = {
    fonetico:        ['minimal-pairs', 'build-word', 'rhyme'],
    lexico:          ['listen', 'semantic', 'point-image', 'category'],
    morfosintactico: ['syntax', 'narrative', 'follow-instruction'],
    pragmatico:      ['pragmatic', 'communicative-intent'],
  }
  const ids      = groupMap[groupId] ?? []
  const relevant = recent.filter(e => ids.includes(e.activityId))
  if (!relevant.length) return 0
  const avg = relevant.reduce((s, e) => s + (e.score / (e.total || 1)), 0) / relevant.length
  return Math.round(avg * 100)
}

export default function HomeScreen({ onNavigate }) {
  const { patient, stimulusConfig } = usePatient()
  const { logout } = useAuth()                          // ← useAuth conectado
  const [showPanel,    setShowPanel]    = useState(false)
  const [showLogout,   setShowLogout]   = useState(false) // confirm dialog
  const [expanded,     setExpanded]     = useState({
    fonetico: true, lexico: true, morfosintactico: true, pragmatico: true
  })
  const level = LEVELS[patient.levelId]

  const diagColors = {
    tel:         { bg: '#e8f5ee', color: '#2d7a62' },
    tl_tea:      { bg: '#f0edf8', color: '#4a3880' },
    tl_tdah:     { bg: '#fff8e1', color: '#854F0B' },
    tl_tea_tdah: { bg: '#fdf0ec', color: '#993C1D' },
  }
  const dc       = diagColors[patient.diagnosis] ?? diagColors.tel
  const diagLabel = stimulusConfig?.label ?? patient.diagnosis?.toUpperCase()
  const suggestions = SUGGESTIONS[patient.diagnosis] ?? SUGGESTIONS.tel

  function handleLogout() {
    setShowLogout(false)
    logout()
  }

  return (
    <div className="screen">

      {/* ── Header con logout ───────────────────────────────────────────── */}
      <div className="home-header" style={{ position: 'relative' }}>
        <span className="logo-text">AuraPlay</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="star-count">
            <span>⭐</span>
            <span>{patient.stars ?? 0}</span>
          </div>

          {/* Botón cerrar sesión — visible sobre header blanco */}
          <button
            onClick={() => setShowLogout(true)}
            style={{
              background: '#fef4f2',
              border: '1.5px solid #fde0da',
              borderRadius: 10,
              padding: '6px 12px',
              color: '#e07a5f',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 13 }}>⎋</span> Salir
          </button>
        </div>
      </div>

      {/* ── Confirm dialog logout ──────────────────────────────────────── */}
      {showLogout && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 20,
            padding: '28px 24px', maxWidth: 320, width: '100%',
            textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <span style={{ fontSize: 36 }}>👋</span>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#1a2a1a' }}>
                ¿Cerrar sesión?
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#666', lineHeight: 1.5 }}>
                Volverás a la pantalla de inicio de AuraPlay.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogout(false)}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: '2px solid #e8e8e8', background: '#fff',
                  fontSize: 14, fontWeight: 600, color: '#666', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #e07a5f, #c0392b)',
                  fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer',
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TherapistPanel */}
      {showPanel && (
        <TherapistPanel
          onClose={() => setShowPanel(false)}
          onViewProgress={() => { setShowPanel(false); onNavigate('progress') }}
          onViewHistory={() => { setShowPanel(false); onNavigate('session-history') }}
          onStartPlan={() => { setShowPanel(false); onNavigate('therapy-plan') }}
          onOpenHomeMode={() => { setShowPanel(false); onNavigate('home-mode') }}
        />
      )}

      <div className="home-scroll">

        {/* Patient card */}
        <div className="patient-card">
          <div className="patient-avatar">
            {patient.profilePhoto
              ? <img src={patient.profilePhoto} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : '🧒'}
          </div>
          <div style={{ flex: 1 }}>
            <div className="patient-name">{patient.name?.split(' ')[0] ?? 'Paciente'}</div>
            <div className="patient-meta">{patient.levelId} · {level?.label ?? ''}</div>
          </div>
          <div className="diag-badge" style={{ background: dc.bg, color: dc.color }}>
            {diagLabel}
          </div>
        </div>

        {/* Activities */}
        <div className="section-label">Actividades de hoy</div>

        {ACTIVITY_GROUPS.map(group => (
          <div key={group.id} className="activity-group">
            <div
              className="group-header"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpanded(p => ({ ...p, [group.id]: !p[group.id] }))}
            >
              <div className="group-dot" style={{ background: group.color }} />
              <span className="group-name">{group.name}</span>
              <span style={{
                marginLeft: 'auto', fontSize: 13, color: '#ccc',
                transition: 'transform 0.2s',
                transform: expanded[group.id] ? 'rotate(90deg)' : 'rotate(0deg)',
              }}>›</span>
            </div>
            {expanded[group.id] && group.activities.map(act => {
              const available = isActivityAvailable(act.id, level)
              return (
                <div
                  key={act.id}
                  className={`activity-row${available ? '' : ' disabled'}`}
                  onClick={() => available && onNavigate(act.id)}
                >
                  <div className="activity-icon" style={{ background: group.bgColor }}>
                    {act.icon}
                  </div>
                  <span className="activity-label">{act.label}</span>
                  {available
                    ? <span className="activity-arrow">›</span>
                    : <span className="activity-status">No disponible</span>}
                </div>
              )
            })}
          </div>
        ))}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <>
            <div className="section-label">Sugerencias para esta sesión</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {suggestions.map((s, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: 12,
                  border: '0.5px solid rgba(0,0,0,0.09)',
                  padding: '10px 14px', fontSize: 13, color: '#555',
                  lineHeight: 1.4, boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}>
                  💡 {s}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Progress */}
        <div className="section-label">Progreso de la semana</div>
        <div className="progress-section">
          {ACTIVITY_GROUPS.map(group => {
            const pct = calcWeekProgress(patient.sessionHistory, group.id)
            return (
              <div key={group.id} className="progress-row">
                <span className="progress-label">{group.name.split('-')[0].trim()}</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: group.color }} />
                </div>
                <span className="progress-pct" style={{ color: group.color }}>{pct}%</span>
              </div>
            )
          })}
        </div>

        {/* Therapist panel button */}
        <button className="therapist-btn" onClick={() => setShowPanel(true)}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <span className="therapist-label">Panel del terapeuta</span>
          <span style={{ fontSize: 16, color: '#ccc' }}>›</span>
        </button>

      </div>
    </div>
  )
}
