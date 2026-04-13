import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'

function SyntaxScreen({ onFinish, onBack }) {
  const { level, estimulusSettings } = usePatient()
  const exercises = level.morfosintaxis.connectors

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const current = exercises[idx]
  const exposureMs = estimulusSettings.extendedExposureTime ? 3500 : 2000

  useEffect(() => {
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
  }, [idx])

  function handleAnswer(option) {
    if (answered) return
    setAnswered(true)
    setSelected(option)
    const correct = option === current.correct
    const newScore = correct ? score + 1 : score
    if (correct) {
      setScore(newScore)
      setFeedback({ type: 'correct', text: `¡Correcto! ✨ ${current.explanation}` })
    } else {
      setFeedback({ type: 'wrong', text: `La respuesta era "${current.correct}". ${current.explanation}` })
    }
    setTimeout(() => {
      if (idx + 1 >= exercises.length) {
        onFinish(newScore, exercises.length)
      } else {
        setIdx(i => i + 1)
      }
    }, exposureMs)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'

  // Max 2 opciones si reducedOptions, garantizando que la correcta esté incluida
  const visibleOptions = estimulusSettings.reducedOptions
    ? [current?.correct, current?.options?.find(o => o !== current?.correct)].filter(Boolean)
    : current?.options ?? []

  const parts = current?.sentence.split('___') ?? ['', '']

  if (exercises.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Completar Frases</span>
        </div>
        <div className="game-area">
          <p className="instruction">Esta actividad no está disponible para el nivel actual.</p>
          <button className="check-btn" onClick={onBack}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Completar Frases</span>
        <div className="progress-dots">
          {exercises.map((_, i) => (
            <div key={i} className={`dot ${i < idx ? 'done' : i === idx ? 'current' : ''}`} />
          ))}
        </div>
      </div>

      <div className="game-area" style={{ gap: '20px' }}>
        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Elige la palabra correcta'
            : 'Elige la palabra que completa mejor la oración'}
        </p>

        <div style={{ background: 'white', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', lineHeight: '1.7' }}>
            {parts[0]}
            <span style={{ display: 'inline-block', minWidth: '80px', borderBottom: '3px solid var(--teal)', marginInline: '8px', verticalAlign: 'bottom', color: selected ? 'var(--teal)' : 'transparent', fontWeight: '700' }}>
              {selected || '___'}
            </span>
            {parts[1]}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '400px' }}>
          {visibleOptions.map(option => {
            let bg = 'white'
            let border = '2px solid var(--mint2)'
            let color = 'var(--text)'
            if (selected === option) {
              if (option === current.correct) { bg = '#f0faf6'; border = '2px solid var(--teal)'; color = 'var(--teal-dark)' }
              else { bg = '#fef4f2'; border = '2px solid var(--coral)'; color = 'var(--coral)' }
            } else if (answered && option === current.correct) {
              bg = '#f0faf6'; border = '2px solid var(--teal)'; color = 'var(--teal-dark)'
            }
            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                style={{ padding: '12px 24px', background: bg, border, borderRadius: '14px', cursor: answered ? 'default' : 'pointer', fontSize: '16px', fontWeight: '700', color, transition: noAnim ? 'none' : 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                {option}
              </button>
            )
          })}
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`} style={{ maxWidth: '400px', lineHeight: '1.5' }}>
            {feedback.text}
          </div>
        )}

        <div style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center' }}>
          {level.label} · {level.ageRange}
        </div>
      </div>
    </div>
  )
}

export default SyntaxScreen
