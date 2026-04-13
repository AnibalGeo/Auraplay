import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'

function speak(text, rate = 0.82) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = rate
  u.pitch = 1.05
  synth.speak(u)
}

function ListenScreen({ onFinish, onBack }) {
  const { level, estimulusSettings } = usePatient()
  const rounds = level.semantica.listen
  const exposureMs = estimulusSettings.extendedExposureTime ? 3500 : 2000

  const [idx, setIdx] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [score, setScore] = useState(0)
  const [choices, setChoices] = useState([])

  const current = rounds[idx]

  useEffect(() => {
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    setPlaying(false)

    // Construir opciones (max 2 si reducedOptions)
    const all = [...current.options].sort(() => Math.random() - 0.5)
    if (estimulusSettings.reducedOptions) {
      const correct = all.find(o => o.e === current.correct)
      const other = all.find(o => o.e !== current.correct)
      setChoices([correct, other].filter(Boolean).sort(() => Math.random() - 0.5))
    } else {
      setChoices(all)
    }

    // Presentación secuencial: mostrar imágenes 2s antes de habilitar audio
    if (estimulusSettings.sequentialStimulus) {
      setAudioEnabled(false)
      setTimeout(() => setAudioEnabled(true), 2000)
    } else {
      setAudioEnabled(true)
      const delay = estimulusSettings.simultaneousAudioVisual ? 500 : 800
      setTimeout(() => playSound(), delay)
    }
  }, [idx])

  function playSound() {
    setPlaying(true)
    const rate = estimulusSettings.simultaneousAudioVisual ? 0.82 : 0.7
    speak(current.sound, rate)
    setTimeout(() => setPlaying(false), 1800)
  }

  function handleAudioBtn() {
    if (!audioEnabled) return
    playSound()
  }

  function handleAnswer(option) {
    if (answered) return
    setAnswered(true)
    setSelected(option.e)
    const correct = option.e === current.correct
    const newScore = correct ? score + 1 : score
    if (correct) {
      setScore(newScore)
      setFeedback({ type: 'correct', text: '¡Muy bien! ✨' })
    } else {
      setFeedback({ type: 'wrong', text: `Era: ${current.label}` })
    }
    setTimeout(() => {
      if (idx + 1 >= rounds.length) {
        onFinish(newScore, rounds.length)
      } else {
        setIdx(i => i + 1)
      }
    }, exposureMs)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'
  const cols = estimulusSettings.reducedOptions ? 2 : choices.length

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Escucha Atento</span>
        <div className="progress-dots">
          {rounds.map((_, i) => (
            <div key={i} className={`dot ${i < idx ? 'done' : i === idx ? 'current' : ''}`} />
          ))}
        </div>
      </div>

      <div className="game-area" style={{ gap: '20px' }}>
        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Escucha y elige la imagen'
            : estimulusSettings.sequentialStimulus
              ? 'Mira las imágenes. Cuando el botón esté activo, escucha y elige.'
              : estimulusSettings.simultaneousAudioVisual
                ? 'Escucha el sonido y toca la imagen correcta'
                : 'Primero escucha con atención. Luego elige la imagen.'}
        </p>

        <button
          onClick={handleAudioBtn}
          disabled={!audioEnabled}
          style={{
            width: '90px', height: '90px', borderRadius: '50%', border: 'none',
            cursor: audioEnabled ? 'pointer' : 'not-allowed',
            fontSize: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: !audioEnabled
              ? '#e8e8e8'
              : playing
                ? 'linear-gradient(135deg, #7c6bb0, #9b7fd4)'
                : 'linear-gradient(135deg, #c8b8e8, #e8e0f5)',
            boxShadow: playing ? '0 6px 20px rgba(124,107,176,0.4)' : '0 4px 12px rgba(124,107,176,0.2)',
            transition: noAnim ? 'none' : 'all 0.3s',
            animation: (!noAnim && playing) ? 'pulse 0.8s ease-in-out infinite' : 'none',
            opacity: audioEnabled ? 1 : 0.5,
          }}
        >
          {audioEnabled ? '🔊' : '⏳'}
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${Math.min(cols, 3)}, 1fr)`,
          gap: '12px', width: '100%', maxWidth: '360px',
        }}>
          {choices.map(option => {
            let border = '3px solid transparent'
            let bg = 'white'
            if (selected === option.e) {
              border = option.e === current.correct ? '3px solid var(--teal)' : '3px solid var(--coral)'
              bg = option.e === current.correct ? '#f0faf6' : '#fef4f2'
            } else if (selected && option.e === current.correct) {
              border = '3px solid var(--teal)'
              bg = '#f0faf6'
            }
            return (
              <div
                key={option.e}
                onClick={() => handleAnswer(option)}
                style={{
                  background: bg, borderRadius: '16px', padding: '14px 8px',
                  textAlign: 'center', cursor: answered ? 'default' : 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border,
                  transition: noAnim ? 'none' : 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '36px', display: 'block', marginBottom: '4px' }}>{option.e}</span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)' }}>{option.l}</span>
              </div>
            )
          })}
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

export default ListenScreen
