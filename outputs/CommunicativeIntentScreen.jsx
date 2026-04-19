import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { getDifficultyForActivity } from '../utils/componentMap'

// Actividad: Intención Comunicativa — ¿Para qué sirve?
// El niño ve un escenario social y elige la intención comunicativa correcta
// (pedir, rechazar, saludar, agradecer, disculparse, informar, preguntar)
// Componente: pragmatico — N4-N7
// Evidencia: Bishop (2003), Paul (2007) — déficit de intención comunicativa
// es el núcleo del trastorno pragmático y del perfil TEA

export default function CommunicativeIntentScreen({ onFinish }) {
  const { patient, estimulusSettings } = usePatient()
  const difficulty = getDifficultyForActivity('communicative-intent', patient.componentLevels)
  const allItems = getContent(patient.levelId)?.communicativeIntents?.[difficulty] ?? []

  const exerciseCount = estimulusSettings?.exerciseCount?.['communicative-intent'] ?? 10
  const items = allItems.slice(0, exerciseCount)

  const [index, setIndex]       = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState(null)
  const speakRef = useRef(null)

  const current = items[index]

  const speak = (text) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = 0.82
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
  }

  useEffect(() => {
    if (!current) return
    const delay = estimulusSettings?.simultaneousAudioVisual ? 500 : 800
    speakRef.current = setTimeout(() => speak(current.scenario), delay)
    return () => clearTimeout(speakRef.current)
  }, [index])

  if (!current || items.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No hay ejercicios disponibles en este nivel.</p>
        <button style={styles.backBtn2} onClick={() => onFinish(0, 0)}>Volver</button>
      </div>
    )
  }

  const options = estimulusSettings?.reducedOptions
    ? [current.correct, current.options.find(o => o !== current.correct)].filter(Boolean)
    : current.options

  // Shuffle estable por ítem
  const shuffled = [...options].sort((a, b) =>
    ((a.charCodeAt(0) + index) % 3) - ((b.charCodeAt(0) + index) % 3)
  )

  const handleSelect = (opt) => {
    if (selected !== null) return
    const isCorrect = opt === current.correct
    setSelected(opt)
    speak(isCorrect ? '¡Muy bien!' : `La respuesta es: ${current.correct}`)

    const newScore = isCorrect ? score + 1 : score

    setTimeout(() => {
      if (index + 1 >= items.length) {
        onFinish(newScore, items.length)
      } else {
        setScore(newScore)
        setSelected(null)
        setIndex(index + 1)
      }
    }, 1400)
  }

  const progress = (index / items.length) * 100

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => onFinish(score, items.length)}>←</button>
        <span style={styles.title}>💬 ¿Para qué sirve?</span>
        <span style={styles.counter}>{index + 1} / {items.length}</span>
      </div>

      {/* Progreso */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Escenario */}
      <div style={styles.scenarioCard}>
        <span style={styles.sceneEmoji}>{current.emoji}</span>
        <p style={styles.scenarioText}>{current.scenario}</p>
        <p style={styles.question}>
          {estimulusSettings?.simplifiedInstructions
            ? '¿Qué hace?'
            : current.question ?? '¿Para qué sirve lo que dice?'}
        </p>
        <button style={styles.audioBtn} onClick={() => speak(current.scenario)}>
          🔊 Escuchar
        </button>
      </div>

      {/* Opciones */}
      <div style={styles.optionsGrid}>
        {shuffled.map((opt, i) => {
          const isCorrect = opt === current.correct
          const isSelected = selected === opt
          let bg = '#fff'
          let border = '2px solid #e0e0e0'
          let color = '#333'
          if (selected !== null) {
            if (isCorrect)       { bg = '#fff8e1'; border = '2px solid #e8a020'; color = '#b56a00' }
            else if (isSelected) { bg = '#fdecea'; border = '2px solid #e57373'; color = '#c62828' }
          }
          // Emoji de intención comunicativa
          const intentEmoji = {
            'Pedir':        '🙏',
            'Rechazar':     '🙅',
            'Saludar':      '👋',
            'Agradecer':    '😊',
            'Disculparse':  '😔',
            'Informar':     '📢',
            'Preguntar':    '🤔',
            'Invitar':      '🎉',
            'Advertir':     '⚠️',
            'Consolar':     '🤗',
            'Protestar':    '😤',
            'Proponer':     '💡',
            'Negarse':      '🚫',
            'Animar':       '🌟',
            'Quejarse':     '😒',
            'Ordenar':      '👆',
            'Felicitar':    '🎊',
            'Reprochar':    '😠',
          }[opt] ?? '💬'

          return (
            <button
              key={i}
              style={{ ...styles.optBtn, background: bg, border, color }}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null}
            >
              <span style={styles.intentEmoji}>{intentEmoji}</span>
              <span style={styles.intentLabel}>{opt}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100vh', background: '#fffbf0', padding: '0 16px 32px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    width: '100%', maxWidth: 480, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0 8px',
  },
  backBtn: {
    background: 'none', border: 'none', fontSize: 22,
    cursor: 'pointer', color: '#e8a020',
  },
  title: { fontSize: 18, fontWeight: 700, color: '#9a6500' },
  counter: { fontSize: 14, color: '#888' },
  progressTrack: {
    width: '100%', maxWidth: 480, height: 6,
    background: '#fde9b0', borderRadius: 3, marginBottom: 24,
  },
  progressFill: {
    height: '100%', background: '#e8a020',
    borderRadius: 3, transition: 'width 0.3s ease',
  },
  scenarioCard: {
    width: '100%', maxWidth: 480, background: '#fff',
    borderRadius: 20, padding: '24px', textAlign: 'center',
    boxShadow: '0 2px 16px rgba(232,160,32,0.10)', marginBottom: 24,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  sceneEmoji: { fontSize: 64 },
  scenarioText: {
    fontSize: 17, color: '#444', lineHeight: 1.5,
    margin: 0, fontStyle: 'italic',
  },
  question: {
    fontSize: 15, fontWeight: 700, color: '#9a6500', margin: 0,
  },
  audioBtn: {
    background: '#fff8e1', border: 'none', borderRadius: 12,
    padding: '8px 20px', fontSize: 15, color: '#e8a020',
    cursor: 'pointer', fontWeight: 600,
  },
  optionsGrid: {
    width: '100%', maxWidth: 480,
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  optBtn: {
    borderRadius: 16, padding: '16px 8px',
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  intentEmoji: { fontSize: 36 },
  intentLabel: { fontSize: 14, fontWeight: 700 },
  empty: { color: '#999', marginTop: 60, fontSize: 16 },
  backBtn2: {
    marginTop: 16, padding: '10px 28px', borderRadius: 12,
    background: '#e8a020', color: '#fff', border: 'none',
    fontSize: 16, cursor: 'pointer',
  },
}
