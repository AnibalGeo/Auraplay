/**
 * TherapyPlanScreen.jsx
 * Pantalla de plan terapéutico automático — AuraPlay Sprint 2
 *
 * Flujo:
 *   1. Si el paciente no tiene plan → generarlo al montar el componente
 *   2. Si ya tiene plan → mostrarlo con opción de regenerar
 *   3. El terapeuta puede marcar semanas como completadas
 *   4. Botón "Iniciar" en cada actividad navega directamente a ella
 */

import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'
import { updatePatient as persistPatient } from '../data/patients'
import { generateTherapyPlan } from '../data/generateTherapyPlan'

// ─── Constantes visuales ──────────────────────────────────────────────────────

const COMPONENT_COLORS = {
  fonologico:      { bg: '#e6f7f0', text: '#1a7a54', border: '#b2dfce' },
  lexico:          { bg: '#f0ebfa', text: '#5a3d8a', border: '#cfc0f0' },
  morfosintactico: { bg: '#fef0ef', text: '#9a3a28', border: '#f0c0b0' },
  pragmatico:      { bg: '#fef8e6', text: '#7a5c00', border: '#e8d080' },
}

const COMPONENT_LABELS = {
  fonologico:      'Fonológico',
  lexico:          'Léxico-Sem.',
  morfosintactico: 'Morfosint.',
  pragmatico:      'Pragmático',
}

const DIAGNOSIS_LABELS = {
  tel:         'TEL/TDL',
  tl_tea:      'TL + TEA',
  tl_tdah:     'TL + TDAH',
  tl_tea_tdah: 'TL + TEA+TDAH',
}

const WEEK_STATUS_COLORS = {
  pending:    { bg: '#f8f8f8', border: '#e0e0e0', label: 'Pendiente' },
  active:     { bg: '#f0faf6', border: '#4aab8a', label: 'En curso' },
  completed:  { bg: '#e6f7f0', border: '#2d7a62', label: 'Completada' },
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TherapyPlanScreen({ onBack, onNavigate }) {
  const { patient, updatePatient } = usePatient()
  const [plan, setPlan]               = useState(patient.therapyPlan || null)
  const [generating, setGenerating]   = useState(false)
  const [activeWeek, setActiveWeek]   = useState(0) // índice de la semana expandida
  const [confirmRegen, setConfirmRegen] = useState(false)
  const [savedMsg, setSavedMsg]       = useState(false)

  // Si no hay plan, generar al montar
  useEffect(() => {
    if (!plan && patient.assessmentCompleted) {
      handleGenerate()
    }
  }, [])

  function handleGenerate() {
    setGenerating(true)
    // Pequeño delay para dar feedback visual de "pensando"
    setTimeout(() => {
      const newPlan = generateTherapyPlan(patient)
      setPlan(newPlan)
      savePlan(newPlan)
      setGenerating(false)
      setActiveWeek(0)
      setConfirmRegen(false)
    }, 800)
  }

  function savePlan(p) {
    updatePatient({ therapyPlan: p })
    if (patient.id) {
      persistPatient(patient.id, { therapyPlan: p })
    }
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 2000)
  }

  function handleCompleteWeek(weekIdx) {
    if (!plan) return
    const updatedWeeks = plan.weeks.map((w, i) =>
      i === weekIdx ? { ...w, completed: true, completedAt: new Date().toISOString() } : w
    )
    const completedCount = updatedWeeks.filter(w => w.completed).length
    const updatedPlan = {
      ...plan,
      weeks: updatedWeeks,
      completedWeeks: completedCount,
      status: completedCount === 4 ? 'completed' : 'active',
    }
    setPlan(updatedPlan)
    savePlan(updatedPlan)
    // Expandir siguiente semana automáticamente
    if (weekIdx < 3) setActiveWeek(weekIdx + 1)
  }

  function getWeekStatus(week, idx) {
    if (week.completed) return 'completed'
    if (idx === (plan?.completedWeeks || 0)) return 'active'
    return 'pending'
  }

  // ─── Sin evaluación ────────────────────────────────────────────────────────
  if (!patient.assessmentCompleted || !patient.clinicalProfile) {
    return (
      <div style={styles.root}>
        <Header onBack={onBack} title="Plan Terapéutico" />
        <div style={styles.emptyState}>
          <span style={{ fontSize: 48 }}>📋</span>
          <h2 style={styles.emptyTitle}>Evaluación requerida</h2>
          <p style={styles.emptyText}>
            Completa el screening inicial para que AuraPlay pueda generar un plan terapéutico personalizado.
          </p>
          <button onClick={onBack} style={styles.primaryBtn}>← Volver al panel</button>
        </div>
      </div>
    )
  }

  // ─── Generando ─────────────────────────────────────────────────────────────
  if (generating) {
    return (
      <div style={styles.root}>
        <Header onBack={onBack} title="Plan Terapéutico" />
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner} />
          <h2 style={styles.loadingTitle}>Analizando perfil clínico…</h2>
          <p style={styles.loadingText}>
            Generando plan de 4 semanas basado en {DIAGNOSIS_LABELS[patient.diagnosis]}, nivel {patient.clinicalProfile?.levelId} y áreas prioritarias detectadas.
          </p>
        </div>
      </div>
    )
  }

  // ─── Sin plan aún (no debería llegar aquí, pero por seguridad) ────────────
  if (!plan) {
    return (
      <div style={styles.root}>
        <Header onBack={onBack} title="Plan Terapéutico" />
        <div style={styles.emptyState}>
          <button onClick={handleGenerate} style={styles.primaryBtn}>
            ✨ Generar plan automático
          </button>
        </div>
      </div>
    )
  }

  // ─── Render principal ──────────────────────────────────────────────────────
  const profile = patient.clinicalProfile
  const progress = plan.completedWeeks / 4

  return (
    <div style={styles.root}>
      <Header onBack={onBack} title="Plan Terapéutico" />

      <div style={styles.content}>

        {/* ── Hero del plan ── */}
        <div style={styles.heroCard}>
          {/* Encabezado */}
          <div style={styles.heroHeader}>
            <div>
              <p style={styles.heroMeta}>
                {DIAGNOSIS_LABELS[plan.diagnosis]} · {plan.levelId} · {plan.ageMonths} meses
              </p>
              <h2 style={styles.heroTitle}>Plan de 4 semanas</h2>
              <p style={styles.heroGoal}>{plan.goal}</p>
            </div>
            <div style={styles.heroBadge}>
              <span style={styles.heroBadgeNum}>{plan.completedWeeks}</span>
              <span style={styles.heroBadgeDen}>/4</span>
            </div>
          </div>

          {/* Barra de progreso del plan */}
          <div style={styles.planProgressBar}>
            <div style={{ ...styles.planProgressFill, width: `${progress * 100}%` }} />
          </div>

          {/* Stats rápidos */}
          <div style={styles.heroStats}>
            <StatChip icon="⏱" label="Por sesión" value={`${plan.sessionDuration} min`} />
            <StatChip icon="📅" label="Frecuencia" value={`${plan.sessionsPerWeek}x sem`} />
            <StatChip icon="🎯" label="Ejercicios" value={`${plan.weeks[0]?.exercisesPerSession} por sesión`} />
          </div>

          {/* Foco clínico */}
          {plan.focusAreas.length > 0 && (
            <div style={styles.heroFocus}>
              <p style={styles.heroFocusLabel}>Foco clínico</p>
              <div style={styles.heroFocusChips}>
                {plan.focusAreas.slice(0, 4).map(area => (
                  <span key={area} style={styles.focusChip}>{area}</span>
                ))}
              </div>
            </div>
          )}

          {/* Estado del plan */}
          {plan.status === 'completed' && (
            <div style={styles.planCompletedBadge}>
              🎉 Plan completado — ¡Excelente trabajo!
            </div>
          )}
        </div>

        {/* ── Semanas ── */}
        <div style={styles.sectionTitle}>Semanas del plan</div>

        {plan.weeks.map((week, idx) => {
          const status    = getWeekStatus(week, idx)
          const statusCfg = WEEK_STATUS_COLORS[status]
          const isOpen    = activeWeek === idx

          return (
            <div key={week.week} style={{
              ...styles.weekCard,
              borderColor: statusCfg.border,
              background: isOpen ? '#fff' : statusCfg.bg,
            }}>
              {/* Header de semana — siempre visible */}
              <button
                style={styles.weekHeader}
                onClick={() => setActiveWeek(isOpen ? -1 : idx)}
              >
                <div style={styles.weekHeaderLeft}>
                  <div style={{
                    ...styles.weekNum,
                    background: status === 'completed' ? '#4aab8a' : status === 'active' ? '#e8a020' : '#e0e0e0',
                    color: status === 'pending' ? '#999' : '#fff',
                  }}>
                    {status === 'completed' ? '✓' : week.week}
                  </div>
                  <div>
                    <p style={styles.weekLabel}>{week.label}</p>
                    <p style={styles.weekGoalPreview}>{week.goal}</p>
                  </div>
                </div>
                <div style={styles.weekHeaderRight}>
                  <span style={{
                    ...styles.weekStatusBadge,
                    background: statusCfg.bg,
                    color: statusCfg.border,
                    border: `1px solid ${statusCfg.border}`,
                  }}>
                    {statusCfg.label}
                  </span>
                  <span style={{ fontSize: 14, color: '#aaa' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>

              {/* Detalle expandido */}
              {isOpen && (
                <div style={styles.weekBody}>

                  {/* Actividades */}
                  <p style={styles.weekSectionLabel}>ACTIVIDADES</p>
                  <div style={styles.activitiesGrid}>
                    {week.activities.map(act => {
                      const compStyle = COMPONENT_COLORS[act.component] || COMPONENT_COLORS.lexico
                      return (
                        <div key={act.id} style={styles.activityCard}>
                          <div style={styles.activityCardTop}>
                            <span style={styles.activityEmoji}>{act.emoji}</span>
                            <div style={{ flex: 1 }}>
                              <p style={styles.activityLabel}>{act.label}</p>
                              <div style={{
                                ...styles.activityCompBadge,
                                background: compStyle.bg,
                                color: compStyle.text,
                                border: `1px solid ${compStyle.border}`,
                              }}>
                                {COMPONENT_LABELS[act.component]}
                              </div>
                            </div>
                          </div>
                          <p style={styles.activityFocus}>
                            {act.clinicalFocus.join(' · ')}
                          </p>
                          <div style={styles.activityFooter}>
                            <span style={styles.activityFreq}>
                              {act.sessionsCount}x esta semana
                            </span>
                            {/* Solo navegar si la semana está activa o completada */}
                            {(status === 'active' || status === 'completed') && onNavigate && (
                              <button
                                style={styles.activityGoBtn}
                                onClick={() => onNavigate(act.id)}
                              >
                                Iniciar →
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Nota clínica */}
                  {week.clinicalNote && (
                    <div style={styles.clinicalNote}>
                      <span style={{ fontSize: 14 }}>⚕️</span>
                      <p style={styles.clinicalNoteText}>{week.clinicalNote}</p>
                    </div>
                  )}

                  {/* Tarea en casa */}
                  <div style={styles.homeTaskBox}>
                    <p style={styles.homeTaskTitle}>🏠 Tarea en casa</p>
                    <p style={styles.homeTaskArea}>{week.homeTask.area}</p>
                    <p style={styles.homeTaskDesc}>{week.homeTask.task}</p>
                  </div>

                  {/* Config de sesión */}
                  <div style={styles.sessionConfig}>
                    <SessionConfigChip label="Duración" value={`${week.sessionDuration} min`} />
                    <SessionConfigChip label="Sesiones/sem" value={`${week.sessionsPerWeek}`} />
                    <SessionConfigChip label="Ejercicios" value={`${week.exercisesPerSession}`} />
                  </div>

                  {/* CTA completar semana */}
                  {status !== 'completed' && (
                    <button
                      style={{
                        ...styles.completeWeekBtn,
                        opacity: status === 'pending' ? 0.5 : 1,
                        cursor: status === 'pending' ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => status === 'active' && handleCompleteWeek(idx)}
                      disabled={status === 'pending'}
                    >
                      {status === 'pending'
                        ? '🔒 Completa la semana anterior primero'
                        : '✓ Marcar semana como completada'}
                    </button>
                  )}
                  {status === 'completed' && week.completedAt && (
                    <p style={styles.completedAt}>
                      Completada el {new Date(week.completedAt).toLocaleDateString('es-CL')}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* ── Footer: regenerar plan ── */}
        <div style={styles.footer}>
          {savedMsg && (
            <p style={styles.savedMsg}>✓ Plan guardado</p>
          )}

          {!confirmRegen ? (
            <button
              style={styles.regenBtn}
              onClick={() => setConfirmRegen(true)}
            >
              🔄 Regenerar plan desde cero
            </button>
          ) : (
            <div style={styles.regenConfirm}>
              <p style={styles.regenConfirmText}>
                ¿Regenerar el plan? Se perderá el progreso actual.
              </p>
              <div style={styles.regenConfirmBtns}>
                <button
                  style={{ ...styles.primaryBtn, flex: 1 }}
                  onClick={handleGenerate}
                >
                  Sí, regenerar
                </button>
                <button
                  style={{ ...styles.secondaryBtn, flex: 1 }}
                  onClick={() => setConfirmRegen(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <p style={styles.footerNote}>
            Plan generado automáticamente. Revisa y ajusta según criterio clínico.
          </p>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Header({ onBack, title }) {
  return (
    <div style={styles.headerBar}>
      <button onClick={onBack} style={styles.backBtn}>←</button>
      <h1 style={styles.headerTitle}>{title}</h1>
      <div style={{ width: 40 }} />
    </div>
  )
}

function StatChip({ icon, label, value }) {
  return (
    <div style={styles.statChip}>
      <span style={styles.statIcon}>{icon}</span>
      <div>
        <p style={styles.statLabel}>{label}</p>
        <p style={styles.statValue}>{value}</p>
      </div>
    </div>
  )
}

function SessionConfigChip({ label, value }) {
  return (
    <div style={styles.sessionChip}>
      <p style={styles.sessionChipLabel}>{label}</p>
      <p style={styles.sessionChipValue}>{value}</p>
    </div>
  )
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = {
  root: {
    minHeight: '100dvh',
    background: '#f5f7f5',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #e8f5f0',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '2px solid #e8f5f0',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 18,
    color: '#3a3a3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: 0,
  },
  content: {
    flex: 1,
    padding: '16px 16px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    maxWidth: 640,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Hero
  heroCard: {
    background: 'linear-gradient(160deg, #f0faf6 0%, #f5f0fa 100%)',
    borderRadius: 20,
    padding: '20px',
    border: '1.5px solid #c8e8dc',
  },
  heroHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  heroMeta: {
    fontSize: 11,
    fontWeight: 700,
    color: '#2d7a62',
    margin: '0 0 4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: '#1a2a1a',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  heroGoal: {
    fontSize: 13,
    color: '#444',
    margin: 0,
    lineHeight: 1.5,
  },
  heroBadge: {
    background: 'linear-gradient(135deg, #4aab8a, #7c6bb0)',
    borderRadius: 14,
    padding: '10px 14px',
    textAlign: 'center',
    flexShrink: 0,
  },
  heroBadgeNum: {
    display: 'block',
    fontSize: 28,
    fontWeight: 900,
    color: '#fff',
    lineHeight: 1,
  },
  heroBadgeDen: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 600,
  },
  planProgressBar: {
    height: 8,
    background: '#d0eae0',
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 14,
  },
  planProgressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4aab8a, #7c6bb0)',
    borderRadius: 99,
    transition: 'width 0.5s ease',
  },
  heroStats: {
    display: 'flex',
    gap: 8,
    marginBottom: 14,
  },
  statChip: {
    flex: 1,
    background: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: '8px 10px',
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  statIcon: { fontSize: 16 },
  statLabel: { fontSize: 9, color: '#888', margin: '0 0 1px', fontWeight: 700, textTransform: 'uppercase' },
  statValue: { fontSize: 12, fontWeight: 700, color: '#1a2a1a', margin: 0 },
  heroFocus: { marginTop: 4 },
  heroFocusLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 6px',
  },
  heroFocusChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  focusChip: {
    background: '#fff',
    border: '1.5px solid #c8e8dc',
    color: '#2d7a62',
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 99,
  },
  planCompletedBadge: {
    marginTop: 14,
    background: '#2d7a62',
    color: '#fff',
    borderRadius: 12,
    padding: '10px 16px',
    fontSize: 14,
    fontWeight: 700,
    textAlign: 'center',
  },
  // Semanas
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    paddingLeft: 4,
  },
  weekCard: {
    background: '#f8f8f8',
    borderRadius: 16,
    border: '2px solid #e0e0e0',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  weekHeader: {
    width: '100%',
    background: 'none',
    border: 'none',
    padding: '14px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  weekHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  weekNum: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 900,
    flexShrink: 0,
  },
  weekLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 2px',
  },
  weekGoalPreview: {
    fontSize: 11,
    color: '#888',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: 200,
  },
  weekHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  weekStatusBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 99,
  },
  weekBody: {
    padding: '0 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    borderTop: '1px solid #ebebeb',
    paddingTop: 14,
  },
  weekSectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: 0,
  },
  // Actividades
  activitiesGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  activityCard: {
    background: '#fff',
    borderRadius: 12,
    padding: '12px 14px',
    border: '1.5px solid #e8e8e8',
  },
  activityCardTop: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  activityEmoji: {
    fontSize: 22,
    flexShrink: 0,
    marginTop: 2,
  },
  activityLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 4px',
  },
  activityCompBadge: {
    display: 'inline-block',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 99,
  },
  activityFocus: {
    fontSize: 11,
    color: '#888',
    margin: '0 0 8px',
    lineHeight: 1.4,
  },
  activityFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityFreq: {
    fontSize: 11,
    fontWeight: 600,
    color: '#4aab8a',
  },
  activityGoBtn: {
    background: 'linear-gradient(135deg, #4aab8a, #3d9478)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '6px 12px',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
  },
  // Nota clínica
  clinicalNote: {
    background: '#f8f8f6',
    borderRadius: 10,
    padding: '10px 12px',
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  clinicalNoteText: {
    fontSize: 12,
    color: '#555',
    margin: 0,
    lineHeight: 1.5,
    flex: 1,
  },
  // Tarea en casa
  homeTaskBox: {
    background: 'linear-gradient(135deg, #fff8e6, #fff3e0)',
    borderRadius: 12,
    padding: '14px',
    border: '1.5px solid #f0d080',
  },
  homeTaskTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#7a5c00',
    margin: '0 0 4px',
  },
  homeTaskArea: {
    fontSize: 13,
    fontWeight: 700,
    color: '#5a3c00',
    margin: '0 0 6px',
  },
  homeTaskDesc: {
    fontSize: 12,
    color: '#6a4c00',
    margin: 0,
    lineHeight: 1.6,
  },
  // Config sesión
  sessionConfig: {
    display: 'flex',
    gap: 8,
  },
  sessionChip: {
    flex: 1,
    background: '#f0faf6',
    borderRadius: 10,
    padding: '8px',
    textAlign: 'center',
    border: '1px solid #c8e8dc',
  },
  sessionChipLabel: {
    fontSize: 9,
    color: '#888',
    fontWeight: 700,
    textTransform: 'uppercase',
    margin: '0 0 2px',
  },
  sessionChipValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#2d7a62',
    margin: 0,
  },
  // CTA semana
  completeWeekBtn: {
    width: '100%',
    padding: '13px',
    background: '#4aab8a',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
  completedAt: {
    fontSize: 11,
    color: '#4aab8a',
    fontWeight: 600,
    textAlign: 'center',
    margin: 0,
  },
  // Footer
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    paddingTop: 4,
  },
  savedMsg: {
    textAlign: 'center',
    fontSize: 13,
    color: '#2d7a62',
    fontWeight: 700,
    margin: 0,
  },
  regenBtn: {
    width: '100%',
    padding: '12px',
    background: '#fff',
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: '#666',
    cursor: 'pointer',
  },
  regenConfirm: {
    background: '#fff8e6',
    borderRadius: 12,
    padding: '14px',
    border: '1.5px solid #f0d080',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  regenConfirmText: {
    fontSize: 13,
    color: '#7a5c00',
    fontWeight: 600,
    margin: 0,
  },
  regenConfirmBtns: {
    display: 'flex',
    gap: 8,
  },
  primaryBtn: {
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #4aab8a, #3d9478)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '12px 20px',
    background: '#fff',
    color: '#666',
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerNote: {
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    margin: 0,
  },
  // Estados vacíos y carga
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: 0,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 320,
  },
  loadingState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    gap: 20,
    textAlign: 'center',
  },
  loadingSpinner: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    border: '4px solid #e8f5f0',
    borderTopColor: '#4aab8a',
    animation: 'spin 0.8s linear infinite',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: 0,
  },
  loadingText: {
    fontSize: 13,
    color: '#666',
    margin: 0,
    lineHeight: 1.6,
    maxWidth: 320,
  },
}
