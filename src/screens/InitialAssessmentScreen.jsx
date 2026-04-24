/**
 * InitialAssessmentScreen.jsx
 * Wizard de screening clínico inicial — AuraPlay
 *
 * Metodología base:
 *   - Jerarquía de pre-habilidades: Laura Mize (Teach Me To Talk)
 *   - Hitos DIR: Stanley Greenspan
 *   - Dominios ECO: James MacDonald
 *   - Signos de alerta por edad: González Lajas & García Cruz (AEPap 2019)
 *
 * 3 pasos:
 *   Paso 1 — Datos básicos del paciente
 *   Paso 2 — Screening clínico (10 preguntas en 3 grupos con skip logic)
 *   Paso 3 — Resultado + perfil clínico generado automáticamente
 */

import { useState } from 'react'
import { usePatient } from '../context/PatientContext'
import { updatePatient as persistPatient } from '../data/patients'

// ─── Constantes ──────────────────────────────────────────────────────────────

const DIAGNOSES = [
  { value: 'tel',         label: 'TEL / TDL',              desc: 'Trastorno del lenguaje sin otra condición asociada' },
  { value: 'tl_tea',      label: 'TL asociado a TEA',       desc: 'Trastorno del lenguaje + espectro autista' },
  { value: 'tl_tdah',     label: 'TL asociado a TDAH',      desc: 'Trastorno del lenguaje + déficit atencional' },
  { value: 'tl_tea_tdah', label: 'TL asociado a TEA + TDAH',desc: 'Combinación de los tres perfiles' },
]

/**
 * Preguntas organizadas en 3 grupos con lógica de skip.
 * Grupo A: prerequisitos relacionales (Mize niveles 1-4, DIR hitos 1-2)
 * Grupo B: prerequisitos lingüísticos (Mize niveles 5-8, DIR hito 3-4)
 * Grupo C: habilidades lingüísticas activas (Mize niveles 9-11, DIR hitos 5-6)
 *
 * Skip logic:
 *   Si Grupo A tiene ≤ 1 respuesta afirmativa → nivel N1, no preguntar B ni C
 *   Si Grupo B tiene ≤ 1 respuesta afirmativa → nivel N2/N3, no preguntar C
 */
const QUESTION_GROUPS = [
  {
    id: 'A',
    label: 'Regulación y engagement',
    subtitle: 'Base relacional y atencional (Hito DIR 1-2 · Mize pre-habilidades 1-4)',
    questions: [
      { id: 'A1', text: 'Responde cuando lo llaman por su nombre', weight: 2 },
      { id: 'A2', text: 'Mantiene contacto visual funcional (mira a los ojos al interactuar)', weight: 2 },
      { id: 'A3', text: 'Mantiene atención sostenida por al menos 2 minutos en una actividad', weight: 1 },
      { id: 'A4', text: 'Muestra interés en interactuar con otras personas (no solo con objetos)', weight: 1 },
    ],
  },
  {
    id: 'B',
    label: 'Comunicación no verbal e imitación',
    subtitle: 'Prerequisitos del lenguaje (Hito DIR 3 · Mize pre-habilidades 5-8 · Dominio ECO 2-3)',
    questions: [
      { id: 'B1', text: 'Señala objetos para mostrar o pedir (gesto de señalamiento)', weight: 2 },
      { id: 'B2', text: 'Imita acciones con objetos (ej: empuja un carrito igual que el adulto)', weight: 2 },
      { id: 'B3', text: 'Imita sonidos o vocalizaciones del adulto', weight: 2 },
      { id: 'B4', text: 'Participa en turnos comunicativos aunque sea no verbal (da y recibe)', weight: 1 },
    ],
  },
  {
    id: 'C',
    label: 'Lenguaje verbal',
    subtitle: 'Habilidades lingüísticas activas (Hito DIR 4-5 · Mize pre-habilidades 9-11)',
    questions: [
      { id: 'C1', text: 'Usa palabras sueltas con intención comunicativa (pide, nombra, comenta)', weight: 3 },
      { id: 'C2', text: 'Combina dos o más palabras (ej: "más agua", "mamá ven")', weight: 3 },
    ],
  },
]

const ALL_QUESTIONS = QUESTION_GROUPS.flatMap(g => g.questions)
const TOTAL_QUESTIONS = ALL_QUESTIONS.length

// ─── Motor de scoring ─────────────────────────────────────────────────────────

/**
 * Genera el perfil clínico completo a partir de las respuestas.
 * Retorna un objeto ClinicalProfile con shape fijo y predecible.
 */
function computeClinicalProfile(answers, diagnosis, ageMonths) {
  const groupScores = {}
  for (const group of QUESTION_GROUPS) {
    const positives = group.questions.filter(q => answers[q.id] === true)
    groupScores[group.id] = {
      total: group.questions.length,
      positive: positives.length,
      ratio: positives.length / group.questions.length,
    }
  }

  const gA = groupScores['A']
  const gB = groupScores['B']
  const gC = groupScores['C']

  // ── Asignación de nivel ──────────────────────────────────────────────────
  let levelId = 'N1'
  let levelReason = ''

  if (gA.positive <= 1) {
    levelId = 'N1'
    levelReason = 'Regulación y engagement no consolidados. Intervención pre-lingüística requerida.'
  } else if (gA.positive === 2 && gB.positive <= 1) {
    levelId = 'N1'
    levelReason = 'Engagement parcial, sin prerequisitos de imitación. Nivel inicial.'
  } else if (gA.positive >= 3 && gB.positive <= 1) {
    levelId = 'N2'
    levelReason = 'Base relacional presente, prerequisitos de lenguaje en desarrollo.'
  } else if (gA.positive >= 3 && gB.positive === 2) {
    levelId = 'N2'
    levelReason = 'Imitación y señalamiento en consolidación.'
  } else if (gA.positive >= 3 && gB.positive >= 3 && !answers['C1']) {
    levelId = 'N3'
    levelReason = 'Prerequisitos consolidados, lenguaje verbal emergente.'
  } else if (answers['C1'] && !answers['C2']) {
    // Palabras sueltas presentes, sin combinación
    levelId = ageMonths <= 30 ? 'N2' : 'N3'
    levelReason = 'Palabras funcionales presentes, combinación de dos palabras pendiente.'
  } else if (answers['C1'] && answers['C2']) {
    // Combinación de 2 palabras presente — ajustar por edad
    if (ageMonths <= 36)      levelId = 'N3'
    else if (ageMonths <= 48) levelId = 'N4'
    else if (ageMonths <= 60) levelId = 'N5'
    else if (ageMonths <= 84) levelId = 'N6'
    else                      levelId = 'N7'
    levelReason = 'Lenguaje combinatorio presente. Nivel ajustado por edad cronológica.'
  }

  // ── Ajustes por diagnóstico ──────────────────────────────────────────────
  // Para TEA y perfil mixto, no subir más de N4 sin evaluación formal
  if ((diagnosis === 'tl_tea' || diagnosis === 'tl_tea_tdah') && parseInt(levelId[1]) > 4) {
    levelId = 'N4'
    levelReason += ' Nivel máximo sugerido para perfil TEA sin evaluación formal adicional.'
  }

  // ── Fortalezas detectadas ────────────────────────────────────────────────
  const strengths = []
  if (gA.positive >= 3) strengths.push('Regulación y atención presentes')
  if (answers['A2'])    strengths.push('Contacto visual funcional')
  if (answers['B1'])    strengths.push('Señalamiento intencional')
  if (answers['B2'])    strengths.push('Imitación de acciones con objetos')
  if (answers['B3'])    strengths.push('Imitación vocal')
  if (answers['B4'])    strengths.push('Turnos comunicativos no verbales')
  if (answers['C1'])    strengths.push('Palabras funcionales presentes')
  if (answers['C2'])    strengths.push('Combinación de palabras')

  // ── Áreas prioritarias ───────────────────────────────────────────────────
  const priorityAreas = []
  if (!answers['A1'])                         priorityAreas.push('Respuesta al nombre')
  if (!answers['A2'])                         priorityAreas.push('Contacto visual y engagement')
  if (!answers['A3'])                         priorityAreas.push('Atención sostenida')
  if (!answers['B1'])                         priorityAreas.push('Señalamiento y atención conjunta')
  if (!answers['B2'] || !answers['B3'])       priorityAreas.push('Imitación (prerequisito crítico)')
  if (answers['B3'] && !answers['C1'])        priorityAreas.push('Primeras palabras funcionales')
  if (answers['C1'] && !answers['C2'])        priorityAreas.push('Combinación de dos palabras')
  if (diagnosis === 'tl_tea')                 priorityAreas.push('Pragmática social y atención conjunta')
  if (diagnosis === 'tl_tdah')               priorityAreas.push('Regulación atencional y sesiones cortas')
  if (diagnosis === 'tl_tea_tdah')           priorityAreas.push('Regulación sensorial como prerequisito')

  // ── Componente prioritario ───────────────────────────────────────────────
  let primaryComponent = 'lexico'
  if (!answers['A1'] || !answers['A2'] || gA.positive <= 1) primaryComponent = 'pragmatico'
  else if (!answers['B1'] || !answers['B3'])                 primaryComponent = 'fonologico'
  else if (!answers['C2'])                                   primaryComponent = 'lexico'
  else if (diagnosis === 'tl_tea')                           primaryComponent = 'pragmatico'
  else                                                       primaryComponent = 'morfosintactico'

  // ── Frecuencia sugerida ──────────────────────────────────────────────────
  let suggestedFrequency = '2-3 veces por semana'
  let sessionDuration = '30-40 minutos'
  if (!answers['A3'] || diagnosis === 'tl_tdah' || diagnosis === 'tl_tea_tdah') {
    suggestedFrequency = '3-4 veces por semana (sesiones cortas)'
    sessionDuration = '15-20 minutos'
  } else if (gA.positive <= 2) {
    suggestedFrequency = 'Diario si es posible'
    sessionDuration = '10-15 minutos'
  }

  // ── Confianza del screening ──────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length
  let confidence = 'Alta'
  let confidenceNote = 'Todas las preguntas respondidas.'
  if (answeredCount < 6) {
    confidence = 'Baja'
    confidenceNote = 'Pocas preguntas respondidas. Nivel es una estimación inicial.'
  } else if (answeredCount < 9) {
    confidence = 'Media'
    confidenceNote = 'Algunas preguntas sin respuesta. Validar con evaluación formal.'
  }

  // ── Hito DIR estimado ────────────────────────────────────────────────────
  let dirLevel = 1
  if (gA.positive >= 3 && answers['A2'])        dirLevel = 2
  if (dirLevel >= 2 && gB.positive >= 2)         dirLevel = 3
  if (dirLevel >= 3 && answers['B4'])            dirLevel = 4
  if (dirLevel >= 4 && answers['C1'])            dirLevel = 5
  if (dirLevel >= 5 && answers['C2'])            dirLevel = 6

  const DIR_LABELS = {
    1: 'Regulación y atención al entorno',
    2: 'Engagement y relación',
    3: 'Comunicación recíproca intencional',
    4: 'Solución de problemas compartida',
    5: 'Uso de símbolos y lenguaje',
    6: 'Pensamiento lógico y abstracto',
  }

  return {
    // Resultado principal
    levelId,
    levelReason,
    primaryComponent,
    // Perfil cualitativo
    strengths,
    priorityAreas,
    suggestedFrequency,
    sessionDuration,
    // Hitos clínicos
    dirLevel,
    dirLabel: DIR_LABELS[dirLevel],
    groupScores,
    // Metadatos
    confidence,
    confidenceNote,
    answeredCount,
    // Respuestas raw para re-evaluación futura
    rawAnswers: { ...answers },
    assessmentDate: new Date().toISOString(),
  }
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function InitialAssessmentScreen({ onDone }) {
  const { patient, updatePatient } = usePatient()

  const [step, setStep] = useState(1) // 1 | 2 | 3
  const [activeGroup, setActiveGroup] = useState(0) // índice de QUESTION_GROUPS
  const [skippedGroups, setSkippedGroups] = useState([]) // grupos que se saltaron

  // Paso 1 — datos básicos
  const [name, setName] = useState(patient.name || '')
  const [ageMonths, setAgeMonths] = useState(patient.ageMonths || 36)
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || 'tel')
  const [step1Error, setStep1Error] = useState('')

  // Paso 2 — respuestas del screening
  const [answers, setAnswers] = useState({})
  const [groupDone, setGroupDone] = useState(false)

  // Paso 3 — perfil generado
  const [profile, setProfile] = useState(null)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const currentGroup = QUESTION_GROUPS[activeGroup]
  const totalSteps = 3

  function ageLabel(months) {
    const y = Math.floor(months / 12)
    const m = months % 12
    if (y === 0) return `${m} meses`
    if (m === 0) return `${y} año${y > 1 ? 's' : ''}`
    return `${y} año${y > 1 ? 's' : ''} ${m} m`
  }

  // ── Paso 1 → 2 ────────────────────────────────────────────────────────────

  function handleStep1Next() {
    if (!name.trim()) { setStep1Error('El nombre es obligatorio'); return }
    setStep1Error('')
    // Guardar datos básicos en contexto inmediatamente
    updatePatient({ name: name.trim(), ageMonths, diagnosis })
    setStep(2)
  }

  // ── Paso 2: responder preguntas ────────────────────────────────────────────

  function answer(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function allGroupAnswered() {
    return currentGroup.questions.every(q => answers[q.id] !== undefined)
  }

  function handleGroupNext() {
    // Skip logic: evaluar si continuar con siguiente grupo
    const positives = currentGroup.questions.filter(q => answers[q.id] === true).length

    // Grupo A: si ≤ 1 afirmativa → saltar B y C, ir directo a resultado
    if (currentGroup.id === 'A' && positives <= 1) {
      finishScreening(['B', 'C'])
      return
    }
    // Grupo B: si ≤ 1 afirmativa → saltar C, ir a resultado
    if (currentGroup.id === 'B' && positives <= 1) {
      finishScreening(['C'])
      return
    }

    // Siguiente grupo o finalizar
    if (activeGroup < QUESTION_GROUPS.length - 1) {
      setActiveGroup(prev => prev + 1)
    } else {
      finishScreening([])
    }
  }

  function finishScreening(skipped) {
    setSkippedGroups(skipped)
    const computed = computeClinicalProfile(answers, diagnosis, ageMonths)
    setProfile(computed)
    setStep(3)
  }

  // ── Paso 3: guardar y continuar ────────────────────────────────────────────

  function handleFinish() {
    if (!profile) return

    const clinicalData = {
      assessmentCompleted: true,
      assessmentDate: profile.assessmentDate,
      clinicalProfile: profile,
      recommendedFocus: profile.priorityAreas,
      levelId: profile.levelId,
      diagnosis,
      name: name.trim(),
      ageMonths,
      // Actualizar componentLevels con el componente prioritario en nivel inicial
      componentLevels: {
        fonologico:     'inicial',
        lexico:         'inicial',
        morfosintactico:'inicial',
        pragmatico:     'inicial',
        // El componente prioritario no necesita un nivel diferente al inicio
        // pero lo marcamos en el perfil para que el panel del terapeuta lo destaque
      },
      updatedAt: new Date().toISOString(),
    }

    // 1. Actualizar contexto en memoria
    updatePatient(clinicalData)

    // 2. Persistir en roster si el paciente ya tiene id
    if (patient.id) {
      persistPatient(patient.id, clinicalData)
    }

    onDone()
  }

  function handleSkip() {
    // Permitir saltar el screening — marca como completado con perfil vacío
    updatePatient({
      assessmentCompleted: true,
      assessmentDate: new Date().toISOString(),
      clinicalProfile: null,
      recommendedFocus: [],
    })
    if (patient.id) {
      persistPatient(patient.id, {
        assessmentCompleted: true,
        assessmentDate: new Date().toISOString(),
        clinicalProfile: null,
        recommendedFocus: [],
      })
    }
    onDone()
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={styles.root}>
      {/* Header con progreso */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎯</span>
            <span style={styles.logoText}>AuraPlay</span>
          </div>
          <button onClick={handleSkip} style={styles.skipBtn}>
            Omitir evaluación
          </button>
        </div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <p style={styles.progressLabel}>Paso {step} de {totalSteps}</p>
      </div>

      {/* ── PASO 1: Datos básicos ─────────────────────────────────────────── */}
      {step === 1 && (
        <div style={styles.card}>
          <div style={styles.stepBadge}>Paso 1</div>
          <h2 style={styles.cardTitle}>Datos del paciente</h2>
          <p style={styles.cardSubtitle}>
            Esta información permite personalizar el screening clínico.
          </p>

          {/* Nombre */}
          <div style={styles.field}>
            <label style={styles.label}>Nombre del niño / niña</label>
            <input
              style={styles.input}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Sofía"
              autoFocus
            />
            {step1Error && <p style={styles.errorMsg}>{step1Error}</p>}
          </div>

          {/* Edad */}
          <div style={styles.field}>
            <label style={styles.label}>
              Edad: <strong style={{ color: '#4aab8a' }}>{ageLabel(ageMonths)}</strong>
            </label>
            <input
              style={styles.slider}
              type="range"
              min={12}
              max={144}
              step={1}
              value={ageMonths}
              onChange={e => setAgeMonths(Number(e.target.value))}
            />
            <div style={styles.sliderLabels}>
              <span>12 meses</span>
              <span>12 años</span>
            </div>
          </div>

          {/* Diagnóstico */}
          <div style={styles.field}>
            <label style={styles.label}>Diagnóstico preliminar</label>
            <div style={styles.diagGrid}>
              {DIAGNOSES.map(d => (
                <button
                  key={d.value}
                  style={{
                    ...styles.diagCard,
                    ...(diagnosis === d.value ? styles.diagCardActive : {}),
                  }}
                  onClick={() => setDiagnosis(d.value)}
                >
                  <span style={styles.diagLabel}>{d.label}</span>
                  <span style={styles.diagDesc}>{d.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button style={styles.primaryBtn} onClick={handleStep1Next}>
            Comenzar screening →
          </button>
        </div>
      )}

      {/* ── PASO 2: Screening ─────────────────────────────────────────────── */}
      {step === 2 && (
        <div style={styles.card}>
          <div style={styles.stepBadge}>Paso 2 · Grupo {currentGroup.id}</div>
          <h2 style={styles.cardTitle}>{currentGroup.label}</h2>
          <p style={styles.cardSubtitle}>{currentGroup.subtitle}</p>

          {/* Indicador de grupos */}
          <div style={styles.groupDots}>
            {QUESTION_GROUPS.map((g, i) => (
              <div
                key={g.id}
                style={{
                  ...styles.groupDot,
                  ...(i === activeGroup ? styles.groupDotActive : {}),
                  ...(skippedGroups.includes(g.id) ? styles.groupDotSkipped : {}),
                  ...(i < activeGroup && !skippedGroups.includes(g.id) ? styles.groupDotDone : {}),
                }}
              />
            ))}
          </div>

          {/* Preguntas */}
          <div style={styles.questionList}>
            {currentGroup.questions.map((q, idx) => (
              <div key={q.id} style={styles.questionRow}>
                <p style={styles.questionText}>
                  <span style={styles.questionNum}>{idx + 1}</span>
                  {q.text}
                </p>
                <div style={styles.answerBtns}>
                  <button
                    style={{
                      ...styles.answerBtn,
                      ...(answers[q.id] === true ? styles.answerBtnYes : {}),
                    }}
                    onClick={() => answer(q.id, true)}
                  >
                    ✓ Sí
                  </button>
                  <button
                    style={{
                      ...styles.answerBtn,
                      ...(answers[q.id] === false ? styles.answerBtnNo : {}),
                    }}
                    onClick={() => answer(q.id, false)}
                  >
                    ✗ No
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Nota clínica de skip logic */}
          {currentGroup.id === 'A' && (
            <p style={styles.clinicalNote}>
              ℹ️ Si la mayoría de respuestas son No, el screening determinará el nivel automáticamente.
            </p>
          )}

          <button
            style={{
              ...styles.primaryBtn,
              ...(allGroupAnswered() ? {} : styles.primaryBtnDisabled),
            }}
            onClick={handleGroupNext}
            disabled={!allGroupAnswered()}
          >
            {activeGroup < QUESTION_GROUPS.length - 1 ? 'Continuar →' : 'Ver resultado →'}
          </button>
        </div>
      )}

      {/* ── PASO 3: Resultado ─────────────────────────────────────────────── */}
      {step === 3 && profile && (
        <div style={styles.card}>
          <div style={styles.stepBadge}>Resultado del screening</div>

          {/* Nivel sugerido — hero */}
          <div style={styles.resultHero}>
            <div style={styles.levelBadge}>{profile.levelId}</div>
            <div style={styles.resultHeroText}>
              <h2 style={styles.resultTitle}>Nivel sugerido</h2>
              <p style={styles.resultSubtitle}>{profile.levelReason}</p>
            </div>
          </div>

          {/* Confianza */}
          <div style={{
            ...styles.confidenceBadge,
            background: profile.confidence === 'Alta' ? '#e6f7f1' :
                        profile.confidence === 'Media' ? '#fff8e6' : '#fef0ef',
            color: profile.confidence === 'Alta' ? '#1a7a54' :
                   profile.confidence === 'Media' ? '#9a6d0a' : '#c0392b',
          }}>
            Confianza del screening: <strong>{profile.confidence}</strong>
            {' · '}{profile.confidenceNote}
          </div>

          {/* Hito DIR */}
          <div style={styles.dirRow}>
            <span style={styles.dirIcon}>🧠</span>
            <div>
              <p style={styles.dirLabel}>Hito DIR estimado: <strong>{profile.dirLevel}/6</strong></p>
              <p style={styles.dirDesc}>{profile.dirLabel}</p>
            </div>
          </div>

          {/* Dos columnas: fortalezas y áreas prioritarias */}
          <div style={styles.profileGrid}>
            <div style={styles.profileCol}>
              <h3 style={styles.profileColTitle}>✅ Fortalezas</h3>
              {profile.strengths.length === 0
                ? <p style={styles.profileEmpty}>Sin fortalezas detectadas aún</p>
                : profile.strengths.map(s => (
                    <div key={s} style={styles.profileChip}>{s}</div>
                  ))
              }
            </div>
            <div style={styles.profileCol}>
              <h3 style={{ ...styles.profileColTitle, color: '#e07a5f' }}>🎯 Áreas prioritarias</h3>
              {profile.priorityAreas.length === 0
                ? <p style={styles.profileEmpty}>Sin áreas críticas detectadas</p>
                : profile.priorityAreas.map(a => (
                    <div key={a} style={{ ...styles.profileChip, background: '#fef0ef', color: '#c0392b' }}>{a}</div>
                  ))
              }
            </div>
          </div>

          {/* Recomendaciones */}
          <div style={styles.recsBox}>
            <h3 style={styles.recsTitle}>📋 Recomendaciones iniciales</h3>
            <div style={styles.recsGrid}>
              <div style={styles.recItem}>
                <span style={styles.recItemLabel}>Componente prioritario</span>
                <span style={styles.recItemValue}>{COMPONENT_LABELS[profile.primaryComponent]}</span>
              </div>
              <div style={styles.recItem}>
                <span style={styles.recItemLabel}>Frecuencia sugerida</span>
                <span style={styles.recItemValue}>{profile.suggestedFrequency}</span>
              </div>
              <div style={styles.recItem}>
                <span style={styles.recItemLabel}>Duración por sesión</span>
                <span style={styles.recItemValue}>{profile.sessionDuration}</span>
              </div>
            </div>
          </div>

          {/* Nota clínica */}
          <p style={styles.clinicalNote}>
            ⚕️ Este screening es una estimación basada en observación indirecta.
            No reemplaza evaluación estandarizada. Revisa el perfil con la fonoaudióloga tratante.
          </p>

          <button style={styles.primaryBtn} onClick={handleFinish}>
            Comenzar con {name} →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const COMPONENT_LABELS = {
  fonologico:      'Fonológico 🔊',
  lexico:          'Léxico-Semántico 📚',
  morfosintactico: 'Morfosintáctico 🧩',
  pragmatico:      'Pragmático 💬',
}

// ─── Estilos inline ──────────────────────────────────────────────────────────
// Inline styles para no depender de archivos CSS externos ni romper estilos actuales.
// Paleta consistente con AuraPlay: teal #4aab8a, coral #e07a5f, purple #7c6bb0, gold #e8a020

const styles = {
  root: {
    minHeight: '100dvh',
    background: 'linear-gradient(160deg, #f0faf5 0%, #fafafa 50%, #f5f0fa 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 0 40px',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  header: {
    width: '100%',
    maxWidth: 640,
    padding: '20px 24px 0',
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: { fontSize: 24 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1a3a2a',
    letterSpacing: '-0.3px',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 6,
    textDecoration: 'underline',
  },
  progressBar: {
    height: 6,
    background: '#e0e0e0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #4aab8a, #7c6bb0)',
    borderRadius: 99,
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
    marginBottom: 0,
  },
  card: {
    width: '100%',
    maxWidth: 640,
    background: '#fff',
    borderRadius: 20,
    padding: '28px 28px 32px',
    marginTop: 20,
    boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
    boxSizing: 'border-box',
  },
  stepBadge: {
    display: 'inline-block',
    background: '#e6f7f1',
    color: '#1a7a54',
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 99,
    marginBottom: 12,
    letterSpacing: '0.3px',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 6px',
    letterSpacing: '-0.4px',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    margin: '0 0 24px',
    lineHeight: 1.5,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  errorMsg: {
    color: '#e07a5f',
    fontSize: 13,
    marginTop: 6,
  },
  slider: {
    width: '100%',
    accentColor: '#4aab8a',
    cursor: 'pointer',
    marginBottom: 4,
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#aaa',
  },
  diagGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  diagCard: {
    background: '#f8f8f8',
    border: '2px solid #e0e0e0',
    borderRadius: 12,
    padding: '12px 14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
  },
  diagCardActive: {
    background: '#e6f7f1',
    borderColor: '#4aab8a',
  },
  diagLabel: {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: '#1a3a2a',
    marginBottom: 3,
  },
  diagDesc: {
    display: 'block',
    fontSize: 11,
    color: '#777',
    lineHeight: 1.4,
  },
  primaryBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #4aab8a 0%, #3d9478 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '-0.2px',
    transition: 'opacity 0.2s, transform 0.1s',
  },
  primaryBtnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  // Paso 2 — screening
  groupDots: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
  },
  groupDot: {
    width: 32,
    height: 6,
    borderRadius: 99,
    background: '#e0e0e0',
    transition: 'background 0.3s',
  },
  groupDotActive: { background: '#4aab8a' },
  groupDotDone:   { background: '#b2dfdb' },
  groupDotSkipped:{ background: '#e0e0e0', opacity: 0.4 },
  questionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 20,
  },
  questionRow: {
    background: '#f8faf9',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  questionText: {
    margin: 0,
    fontSize: 14,
    color: '#222',
    lineHeight: 1.5,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  questionNum: {
    background: '#4aab8a',
    color: '#fff',
    borderRadius: 99,
    width: 22,
    height: 22,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    marginTop: 1,
  },
  answerBtns: {
    display: 'flex',
    gap: 8,
  },
  answerBtn: {
    flex: 1,
    padding: '10px',
    border: '2px solid #e0e0e0',
    borderRadius: 10,
    background: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: '#555',
  },
  answerBtnYes: {
    background: '#e6f7f1',
    borderColor: '#4aab8a',
    color: '#1a7a54',
  },
  answerBtnNo: {
    background: '#fef0ef',
    borderColor: '#e07a5f',
    color: '#c0392b',
  },
  clinicalNote: {
    background: '#f5f5f5',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    color: '#666',
    lineHeight: 1.5,
    marginBottom: 16,
  },
  // Paso 3 — resultado
  resultHero: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    background: 'linear-gradient(135deg, #e6f7f1, #f0ebfa)',
    borderRadius: 16,
    padding: '20px',
    marginBottom: 16,
  },
  levelBadge: {
    background: 'linear-gradient(135deg, #4aab8a, #7c6bb0)',
    color: '#fff',
    fontSize: 28,
    fontWeight: 900,
    padding: '12px 18px',
    borderRadius: 14,
    letterSpacing: '-1px',
    flexShrink: 0,
  },
  resultHeroText: { flex: 1 },
  resultTitle: {
    margin: '0 0 4px',
    fontSize: 18,
    fontWeight: 700,
    color: '#1a2a1a',
  },
  resultSubtitle: {
    margin: 0,
    fontSize: 13,
    color: '#444',
    lineHeight: 1.5,
  },
  confidenceBadge: {
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 1.5,
  },
  dirRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    background: '#f8f4ff',
    borderRadius: 12,
    padding: '12px 16px',
    marginBottom: 20,
  },
  dirIcon: { fontSize: 24 },
  dirLabel: { margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#333' },
  dirDesc:  { margin: 0, fontSize: 12, color: '#7c6bb0' },
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
    marginBottom: 20,
  },
  profileCol: {},
  profileColTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1a7a54',
    marginBottom: 8,
    marginTop: 0,
  },
  profileChip: {
    background: '#e6f7f1',
    color: '#1a5a3a',
    fontSize: 12,
    padding: '6px 10px',
    borderRadius: 8,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  profileEmpty: {
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
  },
  recsBox: {
    background: '#f8faf9',
    borderRadius: 14,
    padding: '16px',
    marginBottom: 16,
  },
  recsTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1a2a1a',
    margin: '0 0 12px',
  },
  recsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  recItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
    gap: 8,
  },
  recItemLabel: { color: '#666' },
  recItemValue: { fontWeight: 700, color: '#1a3a2a', textAlign: 'right' },
}
