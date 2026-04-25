import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { getDifficultyForActivity } from '../utils/componentMap'
import { playVoiceFeedback } from '../utils/audioFeedback'
import ActivityScreen from '../components/ActivityScreen'

export default function CategoryScreen({ onFinish }) {
  const { patient, estimulusSettings } = usePatient()
  const difficulty = getDifficultyForActivity('category', patient.componentLevels)
  const allItems = getContent(patient.levelId)?.categories?.[difficulty] ?? []

  const exerciseCount = estimulusSettings?.exerciseCount?.['category'] ?? 10
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
    speakRef.current = setTimeout(
      () => speak(`¿Cuál no pertenece al grupo de ${current.category}?`),
      delay
    )
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

  // reducedOptions: muestra 3 opciones (la intrusa + 2 del grupo) en vez de 4
  const options = estimulusSettings?.reducedOptions
    ? [
        current.intruder,
        ...current.options.filter(o => o.word !== current.intruder.word).slice(0, 2)
      ]
    : current.options

  // Mezclar opciones para que la intrusa no siempre esté en la misma posición
  // (shuffle estable por ítem usando index como seed)
  const shuffled = [...options].sort((a, b) =>
    ((a.word.charCodeAt(0) + index) % 3) - ((b.word.charCodeAt(0) + index) % 3)
  )

  const handleSelect = (opt) => {
    if (selected !== null) return
    const isCorrect = opt.word === current.intruder.word
    setSelected(opt.word)
    speak(isCorrect ? '¡Muy bien!' : `El que no pertenece es ${current.intruder.word}`)
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

  const progress = (index / items.length) * 100

  return (
    <ActivityScreen
      title="🔍 ¿Cuál no pertenece?"
      componentType="lexico"
      current={index + 1}
      total={items.length}
      onBack={() => onFinish(score, items.length)}
      stimulusKey={index}
      stimulus={
        <div style={styles.promptCard}>
          <p style={styles.instruction}>
            {estimulusSettings?.simplifiedInstructions
              ? '¿Cuál es diferente?'
              : `¿Cuál NO pertenece al grupo?`}
          </p>
          <span style={styles.categoryBadge}>📦 {current.category}</span>
          <button
            style={styles.audioBtn}
            onClick={() => speak(`¿Cuál no pertenece al grupo de ${current.category}?`)}
          >
            🔊 Escuchar
          </button>
        </div>
      }
      response={
        <div style={styles.grid}>
          {shuffled.map((opt, i) => {
            const isIntruder = opt.word === current.intruder.word
            const isSelected = selected === opt.word
            let bg = '#fff'
            let border = '2px solid #e0e0e0'
            let color = '#333'
            if (selected !== null) {
              if (isIntruder)       { bg = '#e8f5e9'; border = '2px solid #4aab8a'; color = '#2e7d5e' }
              else if (isSelected)  { bg = '#fdecea'; border = '2px solid #e57373'; color = '#c62828' }
            }
            return (
              <button
                key={i}
                style={{ ...styles.optCard, background: bg, border, color }}
                onClick={() => handleSelect(opt)}
                disabled={selected !== null}
              >
                <span style={styles.optEmoji}>{opt.emoji}</span>
                <span style={styles.optWord}>{opt.word}</span>
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
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  instruction: { fontSize: 16, color: '#555', margin: 0 },
  categoryBadge: {
    background: '#ede8fa', color: '#4a3880', borderRadius: 20,
    padding: '6px 18px', fontSize: 15, fontWeight: 700,
  },
  audioBtn: {
    background: '#ede8fa', border: 'none', borderRadius: 12,
    padding: '8px 20px', fontSize: 15, color: '#7c6bb0',
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
  optEmoji: { fontSize: 48 },
  optWord: { fontSize: 15, fontWeight: 700 },
  empty: { color: '#999', marginTop: 60, fontSize: 16 },
  backBtn2: {
    marginTop: 16, padding: '10px 28px', borderRadius: 12,
    background: '#7c6bb0', color: '#fff', border: 'none',
    fontSize: 16, cursor: 'pointer',
  },
}
