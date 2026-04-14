import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'

function NarrativeScreen({ onFinish, onBack }) {
  const { level, estimulusSettings } = usePatient()
  const stories = level.morfosintaxis?.narrativeSequence ?? []

  const [idx, setIdx] = useState(0)
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const story = stories[idx]
  const exposureMs = estimulusSettings.extendedExposureTime ? 3500 : 2000

  useEffect(() => {
    if (!story) return
    const shuffled = story.frames
      .map((frame, i) => ({ ...frame, originalIndex: i }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
  }, [idx])

  if (!story) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Ordenar Historia</span>
        </div>
        <div className="game-area" style={{ justifyContent: 'center', alignItems: 'center' }}>
          <p style={{ color: 'var(--text2)', textAlign: 'center' }}>
            No hay historias disponibles para este nivel.
          </p>
          <button className="check-btn" onClick={onBack} style={{ marginTop: '16px' }}>Volver</button>
        </div>
      </div>
    )
  }

  function handleCardClick(position) {
    if (answered) return

    if (selected === null) {
      setSelected(position)
    } else if (selected === position) {
      setSelected(null)
    } else {
      // swap cards at selected and position
      const next = [...cards]
      const tmp = next[selected]
      next[selected] = next[position]
      next[position] = tmp
      setCards(next)
      setSelected(null)
    }
  }

  function handleCheck() {
    if (answered) return
    const isCorrect = cards.every((card, i) => card.originalIndex === story.correctOrder[i])
    setAnswered(true)
    if (isCorrect) setScore(s => s + 1)
    setFeedback({
      type: isCorrect ? 'correct' : 'wrong',
      text: isCorrect ? '¡Muy bien! Ordenaste la historia 🎉' : 'Casi... el orden correcto era diferente.',
    })
    setTimeout(() => {
      if (idx + 1 >= stories.length) {
        onFinish(isCorrect ? score + 1 : score, stories.length)
      } else {
        setIdx(i => i + 1)
      }
    }, exposureMs)
  }

  function handleReset() {
    if (answered) return
    const shuffled = story.frames
      .map((frame, i) => ({ ...frame, originalIndex: i }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelected(null)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '13px'

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Ordenar Historia</span>
        <div className="progress-dots">
          {stories.map((_, i) => (
            <div key={i} className={`dot ${i < idx ? 'done' : i === idx ? 'current' : ''}`} />
          ))}
        </div>
      </div>

      <div className="game-area" style={{ gap: '14px' }}>
        <div className="word-target">
          <div className="word-target-label">📖 {story.title}</div>
        </div>

        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Toca dos tarjetas para cambiarlas de lugar'
            : 'Toca una tarjeta para seleccionarla y luego toca otra para intercambiarlas. Ordena la historia.'}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          maxWidth: '360px',
        }}>
          {cards.map((card, i) => (
            <div
              key={i}
              onClick={() => handleCardClick(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                border: `2px solid ${selected === i ? 'var(--teal)' : 'var(--mint2)'}`,
                background: selected === i ? 'var(--mint)' : 'white',
                cursor: answered ? 'default' : 'pointer',
                transition: noAnim ? 'none' : 'all 0.15s',
                boxShadow: selected === i ? '0 0 0 3px var(--teal)33' : '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              <span style={{ fontSize: '32px', flexShrink: 0 }}>{card.emoji}</span>
              <span style={{
                fontSize: estimulusSettings.largerText ? '16px' : '14px',
                color: 'var(--text)',
                lineHeight: '1.4',
              }}>
                {card.text}
              </span>
              <span style={{
                marginLeft: 'auto',
                fontSize: '18px',
                color: 'var(--text2)',
                flexShrink: 0,
              }}>
                {selected === i ? '✋' : '↕'}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              background: 'white',
              border: '2px solid var(--mint2)',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'var(--text2)',
            }}
          >
            Mezclar
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

export default NarrativeScreen
