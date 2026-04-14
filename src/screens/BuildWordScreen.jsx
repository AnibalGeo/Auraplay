import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import ProgressBar from '../components/ProgressBar'
import { playFeedback } from '../utils/audioFeedback'

function speak(text, rate = 0.82) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = rate
  u.pitch = 1.05
  synth.speak(u)
}

function BuildWordScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const words = getContent(patient.levelId).buildWords ?? []
  const exposureMs = estimulusSettings.slideTransitionDelay ?? 1500

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState([])
  const [options, setOptions] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)

  const current = words[idx]

  useEffect(() => {
    setSelected([])
    setFeedback(null)
    setAnswered(false)
    const shuffled = [...current.syllables]
      .map((syl, i) => ({ syl, id: i }))
      .sort(() => Math.random() - 0.5)
    setOptions(shuffled)
    if (estimulusSettings.simultaneousAudioVisual) {
      setTimeout(() => speak(current.word), 400)
    }
  }, [idx])

  function handleSyllable(item) {
    if (answered) return
    if (selected.find(s => s.id === item.id)) return
    setSelected(prev => [...prev, item])
  }

  function handleRemove(id) {
    if (answered) return
    setSelected(prev => prev.filter(s => s.id !== id))
  }

  function handlePlay() {
    speak(current.word, estimulusSettings.simultaneousAudioVisual ? 0.82 : 0.7)
  }

  function handleCheck() {
    if (answered || selected.length === 0) return
    setAnswered(true)
    const attempt = selected.map(s => s.syl).join('')
    const correct = current.syllables.join('')
    const isCorrect = attempt === correct
    playFeedback(isCorrect ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    setTimeout(() => {
      setFeedback({
        type: isCorrect ? 'correct' : 'wrong',
        text: isCorrect ? '¡Perfecto! 🎉' : `Era: ${current.syllables.join(' · ')}`,
      })
      setTimeout(() => {
        if (idx + 1 >= words.length) {
          onFinish(isCorrect ? 1 : 0, words.length)
        } else {
          setIdx(i => i + 1)
        }
      }, exposureMs)
    }, 1000)
  }

  function handleClear() {
    if (answered) return
    setSelected([])
  }

  if (words.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Armar Palabras</span>
        </div>
        <div className="game-area">
          <p className="instruction">No hay ejercicios disponibles para este nivel.</p>
          <button className="check-btn" onClick={onBack}>Volver</button>
        </div>
      </div>
    )
  }

  const isUsed = id => selected.some(s => s.id === id)
  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '13px'

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <ProgressBar current={idx + 1} total={words.length} />
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Armar Palabras</span>
      </div>

      <div className="game-area" style={{ gap: '14px' }}>
        <div className="word-target">
          <div className="word-target-label">¿Qué imagen ves?</div>
          <span className="word-target-img">{current.emoji}</span>
          <div className="word-target-hint">{current.hint}</div>
        </div>

        <button
          className="play-btn"
          onClick={handlePlay}
          style={{ width: '56px', height: '56px', fontSize: '20px' }}
        >
          ▶
        </button>

        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Toca las sílabas en orden'
            : 'Toca las sílabas en orden para formar la palabra'}
        </p>

        <div className="syllable-slots">
          {current.syllables.map((_, i) => {
            const filled = selected[i]
            return (
              <div
                key={i}
                className={`syllable-slot ${filled ? 'filled' : ''}`}
                onClick={() => filled && handleRemove(filled.id)}
                style={{ cursor: filled ? 'pointer' : 'default' }}
              >
                {filled ? filled.syl : '?'}
              </div>
            )
          })}
        </div>

        <div className="syllable-options">
          {options.map(item => (
            <button
              key={item.id}
              className={`syllable-btn ${isUsed(item.id) ? 'used' : ''}`}
              onClick={() => handleSyllable(item)}
            >
              {item.syl}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleClear}
            style={{
              padding: '10px 20px', background: 'white',
              border: '2px solid var(--mint2)', borderRadius: '12px',
              cursor: 'pointer', fontSize: '14px', color: 'var(--text2)',
            }}
          >
            Borrar
          </button>
          <button className="check-btn" onClick={handleCheck}>Verificar ✓</button>
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>{feedback.text}</div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center' }}>
          {level.label} · {level.ageRange}
        </div>
      </div>
    </div>
  )
}

export default BuildWordScreen
