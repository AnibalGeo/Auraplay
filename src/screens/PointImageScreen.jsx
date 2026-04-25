import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { getDifficultyForActivity } from '../utils/componentMap'
import { playVoiceFeedback } from '../utils/audioFeedback'
import ActivityScreen from '../components/ActivityScreen'

export default function PointImageScreen({ onFinish }) {
  const { patient, estimulusSettings } = usePatient()
  const difficulty = getDifficultyForActivity('point-image', patient.componentLevels)
  const allItems = getContent(patient.levelId)?.pointImages?.[difficulty] ?? []

  const exerciseCount = estimulusSettings?.exerciseCount?.['point-image'] ?? 10
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
    u.rate = 0.75   // más lento para N1-N3
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  }

  useEffect(() => {
    if (!current) return
    // En N1-N2 el estímulo auditivo es el núcleo — siempre se reproduce
    const delay = estimulusSettings?.simultaneousAudioVisual ? 400 : 700
    speakRef.current = setTimeout(() => speak(current.word), delay)
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

  const handleSelect = (option) => {
    if (selected !== null) return
    const isCorrect = option.word === current.word
    setSelected(option.word)
    speak(isCorrect ? '¡Muy bien!' : current.word)
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

  // reducedOptions: 2 opciones en vez de 3-4
  const options = estimulusSettings?.reducedOptions
    ? current.options.slice(0, 2)
    : current.options

  const progress = (index / items.length) * 100

  return (
    <ActivityScreen
      title="👆 Señala la imagen"
      componentType="lexico"
      current={index + 1}
      total={items.length}
      onBack={() => onFinish(score, items.length)}
      stimulusKey={index}
      stimulus={
        <div style={styles.promptCard}>
          <p style={styles.instruction}>
            {estimulusSettings?.simplifiedInstructions ? 'Toca' : 'Señala la imagen de…'}
          </p>
          <div style={styles.wordRow}>
            <span style={styles.wordText}>{current.word}</span>
            <button style={styles.audioBtn} onClick={() => speak(current.word)}>🔊</button>
          </div>
        </div>
      }
      response={
        <div style={{
          ...styles.imageGrid,
          gridTemplateColumns: options.length <= 2 ? '1fr 1fr' : '1fr 1fr',
        }}>
          {options.map((opt, i) => {
            const isCorrect = opt.word === current.word
            const isSelected = selected === opt.word
            let border = '3px solid transparent'
            let bg = '#fff'
            if (selected !== null) {
              if (isCorrect)        { border = '3px solid #4aab8a'; bg = '#e8f5e9' }
              else if (isSelected)  { border = '3px solid #e57373'; bg = '#fdecea' }
            }
            return (
              <button
                key={i}
                style={{ ...styles.imageCard, border, background: bg }}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
              >
                <span style={styles.imageEmoji}>{opt.emoji}</span>
              </button>
            )
          })}
        </div>
      }
    />
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    minHeight: '100vh', background: '#f5f0fa', padding: '0 16px 32px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    width: '100%', maxWidth: 480, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0 8px',
  },
  backBtn: {
    background: 'none', border: 'none', fontSize: 22,
    cursor: 'pointer', color: '#7c6bb0',
  },
  title: { fontSize: 18, fontWeight: 700, color: '#4a3880' },
  counter: { fontSize: 14, color: '#888' },
  progressTrack: {
    width: '100%', maxWidth: 480, height: 6,
    background: '#d9d0f0', borderRadius: 3, marginBottom: 24,
  },
  progressFill: {
    height: '100%', background: '#7c6bb0',
    borderRadius: 3, transition: 'width 0.3s ease',
  },
  promptCard: {
    width: '100%', maxWidth: 480, background: '#fff',
    borderRadius: 16, padding: '20px 24px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24,
  },
  instruction: { fontSize: 15, color: '#888', marginBottom: 8 },
  wordRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 12,
  },
  wordText: { fontSize: 32, fontWeight: 800, color: '#4a3880' },
  audioBtn: {
    background: '#ede8fa', border: 'none', borderRadius: 10,
    padding: '8px 14px', fontSize: 20, cursor: 'pointer',
  },
  imageGrid: {
    width: '100%', maxWidth: 480,
    display: 'grid', gap: 10,
  },
  imageCard: {
    borderRadius: 16, padding: '28px 16px',
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  imageEmoji: { fontSize: 72 },
  empty: { color: '#999', marginTop: 60, fontSize: 16 },
  backBtn2: {
    marginTop: 16, padding: '10px 28px', borderRadius: 12,
    background: '#7c6bb0', color: '#fff', border: 'none',
    fontSize: 16, cursor: 'pointer',
  },
}
