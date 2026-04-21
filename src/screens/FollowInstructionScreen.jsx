import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { getDifficultyForActivity } from '../utils/componentMap'
import { playVoiceFeedback } from '../utils/audioFeedback'

// Actividad: el terapeuta lee una instrucción y el niño selecciona
// la imagen que corresponde a ejecutarla correctamente.
// Evidencia: comprensión de instrucciones de 1-3 elementos es un
// hito clave N2-N5 (Narbona & Chevrie-Müller, 2001; Paul, 2007)

export default function FollowInstructionScreen({ onFinish }) {
  const { patient, estimulusSettings } = usePatient()
  const difficulty = getDifficultyForActivity('follow-instruction', patient.componentLevels)
  const allItems = getContent(patient.levelId)?.instructions?.[difficulty] ?? []

  const exerciseCount = estimulusSettings?.exerciseCount?.['follow-instruction'] ?? 10
  const items = allItems.slice(0, exerciseCount)

  const [index, setIndex]       = useState(0)
  const [score, setScore]       = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const speakRef = useRef(null)

  const current = items[index]

  const speak = (text) => {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'es-ES'
    u.rate = estimulusSettings?.extendedExposureTime ? 0.70 : 0.80
    u.pitch = 1.05
    window.speechSynthesis.speak(u)
  }

  useEffect(() => {
    if (!current) return
    setRevealed(false)

    // sequentialStimulus: primero escucha, luego aparecen las imágenes
    const audioDelay = estimulusSettings?.simultaneousAudioVisual ? 400 : 800
    speakRef.current = setTimeout(() => {
      speak(current.instruction)
      if (estimulusSettings?.sequentialStimulus) {
        setTimeout(() => setRevealed(true), 1800)
      } else {
        setRevealed(true)
      }
    }, audioDelay)

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
    ? [
        current.options.find(o => o.word === current.correct),
        current.options.find(o => o.word !== current.correct)
      ].filter(Boolean)
    : current.options

  const handleSelect = (opt) => {
    if (selected !== null || !revealed) return
    const isCorrect = opt.word === current.correct
    setSelected(opt.word)
    speak(isCorrect ? '¡Muy bien!' : `La respuesta correcta es: ${current.correct}`)
    playVoiceFeedback(isCorrect, estimulusSettings?.voiceFeedback ?? true)

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

  // Número de elementos en la instrucción (1, 2 o 3) para mostrar complejidad
  const complexity = current.elements ?? 1
  const complexityLabel = ['', 'Simple', 'Dos pasos', 'Tres pasos'][complexity] ?? ''

  const progress = (index / items.length) * 100

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => onFinish(score, items.length)}>←</button>
        <span style={styles.title}>👂 Sigue la instrucción</span>
        <span style={styles.counter}>{index + 1} / {items.length}</span>
      </div>

      {/* Progreso */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      {/* Instrucción */}
      <div style={styles.promptCard}>
        <div style={styles.complexityRow}>
          <span style={styles.complexityBadge}>{complexityLabel}</span>
          {estimulusSettings?.sequentialStimulus && !revealed && (
            <span style={styles.listeningBadge}>🔊 Escuchando…</span>
          )}
        </div>
        <p style={styles.instructionText}>
          {estimulusSettings?.simplifiedInstructions
            ? current.simplified ?? current.instruction
            : current.instruction}
        </p>
        <button
          style={styles.audioBtn}
          onClick={() => speak(current.instruction)}
        >
          🔊 Repetir instrucción
        </button>
      </div>

      {/* Opciones — se revelan después del audio si sequentialStimulus */}
      <div style={{
        ...styles.grid,
        opacity: revealed ? 1 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: revealed ? 'auto' : 'none',
      }}>
        {options.map((opt, i) => {
          const isCorrect = opt.word === current.correct
          const isSelected = selected === opt.word
          let bg = '#fff'
          let border = '2px solid #e0e0e0'
          let color = '#333'
          if (selected !== null) {
            if (isCorrect)       { bg = '#fff3e0'; border = '2px solid #e8a020'; color = '#b56a00' }
            else if (isSelected) { bg = '#fdecea'; border = '2px solid #e57373'; color = '#c62828' }
          }
          return (
            <button
              key={i}
              style={{ ...styles.optCard, background: bg, border, color }}
              onClick={() => handleSelect(opt)}
              disabled={selected !== null || !revealed}
            >
              <span style={styles.optEmoji}>{opt.emoji}</span>
              {!estimulusSettings?.simplifiedInstructions && (
                <span style={styles.optWord}>{opt.word}</span>
              )}
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
    minHeight: '100vh', background: '#fff8f0', padding: '0 16px 32px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    width: '100%', maxWidth: 480, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0 8px',
  },
  backBtn: {
    background: 'none', border: 'none', fontSize: 22,
    cursor: 'pointer', color: '#e07a5f',
  },
  title: { fontSize: 18, fontWeight: 700, color: '#a04030' },
  counter: { fontSize: 14, color: '#888' },
  progressTrack: {
    width: '100%', maxWidth: 480, height: 6,
    background: '#fcd5c8', borderRadius: 3, marginBottom: 24,
  },
  progressFill: {
    height: '100%', background: '#e07a5f',
    borderRadius: 3, transition: 'width 0.3s ease',
  },
  promptCard: {
    width: '100%', maxWidth: 480, background: '#fff',
    borderRadius: 16, padding: '20px 24px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  complexityRow: {
    display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
    justifyContent: 'center',
  },
  complexityBadge: {
    background: '#fff3e0', color: '#e8a020', borderRadius: 20,
    padding: '4px 14px', fontSize: 13, fontWeight: 700,
  },
  listeningBadge: {
    background: '#fdecea', color: '#e57373', borderRadius: 20,
    padding: '4px 14px', fontSize: 13, fontWeight: 600,
  },
  instructionText: {
    fontSize: 20, fontWeight: 700, color: '#333',
    lineHeight: 1.4, margin: 0,
  },
  audioBtn: {
    background: '#fff3e0', border: 'none', borderRadius: 12,
    padding: '8px 20px', fontSize: 15, color: '#e07a5f',
    cursor: 'pointer', fontWeight: 600,
  },
  grid: {
    width: '100%', maxWidth: 480,
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  optCard: {
    borderRadius: 16, padding: '20px 8px',
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  optEmoji: { fontSize: 52 },
  optWord: { fontSize: 14, fontWeight: 600, color: 'inherit' },
  empty: { color: '#999', marginTop: 60, fontSize: 16 },
  backBtn2: {
    marginTop: 16, padding: '10px 28px', borderRadius: 12,
    background: '#e07a5f', color: '#fff', border: 'none',
    fontSize: 16, cursor: 'pointer',
  },
}
