import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { getDifficultyForActivity } from '../utils/componentMap'
import { playVoiceFeedback } from '../utils/audioFeedback'
import ActivityScreen from '../components/ActivityScreen'

export default function RhymeScreen({ onFinish }) {
  const { patient, estimulusSettings } = usePatient()
  const difficulty = getDifficultyForActivity('rhyme', patient.componentLevels)
  const allItems = getContent(patient.levelId)?.rhymes?.[difficulty] ?? []

  const exerciseCount = estimulusSettings?.exerciseCount?.['rhyme'] ?? 10
  const items = allItems.slice(0, exerciseCount)

  const [index, setIndex]     = useState(0)
  const [score, setScore]     = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)
  const speakRef = useRef(null)

  const current = items[index]

  // TTS
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
    speakRef.current = setTimeout(() => speak(`¿Qué palabra rima con ${current.word}?`), delay)
    return () => clearTimeout(speakRef.current)
  }, [index])

  if (!current || items.length === 0) {
    return (
      <div style={styles.container}>
        <p style={styles.empty}>No hay ejercicios de rimas disponibles en este nivel.</p>
        <button style={styles.btnSecondary} onClick={() => onFinish(0, 0)}>Volver</button>
      </div>
    )
  }

  const handleSelect = (option) => {
    if (selected !== null) return
    const isCorrect = option === current.correct
    setSelected(option)
    speak(isCorrect ? '¡Muy bien!' : `La respuesta es ${current.correct}`)
    playVoiceFeedback(isCorrect, estimulusSettings?.voiceFeedback ?? true)

    const newScore = isCorrect ? score + 1 : score

    setTimeout(() => {
      if (index + 1 >= items.length) {
        setFinished(true)
        onFinish(newScore, items.length)
      } else {
        setScore(newScore)
        setSelected(null)
        setIndex(index + 1)
      }
    }, 1200)
  }

  const options = estimulusSettings?.reducedOptions
    ? [current.correct, current.options.find(o => o !== current.correct)]
    : current.options

  const progress = ((index) / items.length) * 100

  return (
    <ActivityScreen
      title="🎵 Rimas"
      componentType="fonologico"
      current={index + 1}
      total={items.length}
      onBack={() => onFinish(score, items.length)}
      stimulusKey={index}
      stimulus={
        <div style={styles.card}>
          <p style={styles.instruction}>¿Qué palabra rima con…?</p>
          <div style={styles.wordBox}>
            <span style={styles.wordEmoji}>{current.emoji}</span>
            <span style={styles.wordText}>{current.word}</span>
          </div>
          <button style={styles.audioBtn} onClick={() => speak(`¿Qué palabra rima con ${current.word}?`)}>
            🔊 Escuchar
          </button>
        </div>
      }
      response={
        <div style={styles.optionsGrid}>
          {options.map((option, i) => {
            let bg = '#fff'
            let border = '2px solid #e0e0e0'
            let color = '#333'
            if (selected !== null) {
              if (option === current.correct) { bg = '#e8f5e9'; border = '2px solid #4aab8a'; color = '#2e7d5e' }
              else if (option === selected)   { bg = '#fdecea'; border = '2px solid #e57373'; color = '#c62828' }
            }
            return (
              <button
                key={i}
                style={{ ...styles.optionBtn, background: bg, border, color }}
                onClick={() => handleSelect(option)}
                disabled={selected !== null}
              >
                {option}
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
    minHeight: '100vh', background: '#f0faf5', padding: '0 16px 32px',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    width: '100%', maxWidth: 480, display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 0 8px',
  },
  backBtn: {
    background: 'none', border: 'none', fontSize: 22,
    cursor: 'pointer', color: '#4aab8a',
  },
  title: { fontSize: 18, fontWeight: 700, color: '#2d6a4f' },
  counter: { fontSize: 14, color: '#888' },
  progressTrack: {
    width: '100%', maxWidth: 480, height: 6,
    background: '#c8e6c9', borderRadius: 3, marginBottom: 24,
  },
  progressFill: {
    height: '100%', background: '#4aab8a',
    borderRadius: 3, transition: 'width 0.3s ease',
  },
  card: {
    width: '100%', maxWidth: 480, background: '#fff',
    borderRadius: 16, padding: '28px 24px', textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 24,
  },
  instruction: { fontSize: 16, color: '#666', marginBottom: 12 },
  wordBox: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 12, marginBottom: 16,
  },
  wordEmoji: { fontSize: 52 },
  wordText: { fontSize: 36, fontWeight: 800, color: '#2d6a4f', letterSpacing: 2 },
  audioBtn: {
    background: '#e8f5e9', border: 'none', borderRadius: 12,
    padding: '8px 20px', fontSize: 15, color: '#4aab8a',
    cursor: 'pointer', fontWeight: 600,
  },
  optionsGrid: {
    width: '100%', maxWidth: 480,
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  optionBtn: {
    borderRadius: 16, padding: '20px 8px', fontSize: 20,
    fontWeight: 700, cursor: 'pointer',
    transition: 'all 0.15s ease', letterSpacing: 1,
  },
  empty: { color: '#999', marginTop: 60, fontSize: 16 },
  btnSecondary: {
    marginTop: 16, padding: '10px 28px', borderRadius: 12,
    background: '#4aab8a', color: '#fff', border: 'none',
    fontSize: 16, cursor: 'pointer',
  },
}
