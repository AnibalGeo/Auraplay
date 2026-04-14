import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import ProgressBar from '../components/ProgressBar'
import { playFeedback } from '../utils/audioFeedback'

function PragmaticScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const exercises = getContent(patient.levelId).inferences ?? []

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
    if (correct) setScore(newScore)
    playFeedback(correct ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    setTimeout(() => {
      setFeedback({
        type: correct ? 'correct' : 'wrong',
        text: correct ? '¡Muy bien! Entendiste la situación ✨' : `La respuesta era "${current.correct}".`,
      })
      setTimeout(() => {
        if (idx + 1 >= exercises.length) {
          onFinish(newScore, exercises.length)
        } else {
          setIdx(i => i + 1)
        }
      }, exposureMs)
    }, 1000)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'

  // Max 2 opciones si reducedOptions, garantizando que la correcta esté incluida
  const visibleOptions = estimulusSettings.reducedOptions
    ? [current?.correct, current?.options?.find(o => o !== current?.correct)].filter(Boolean)
    : current?.options ?? []

  if (exercises.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Inferencias</span>
        </div>
        <div className="game-area">
          <p className="instruction">No hay ejercicios disponibles para este nivel.</p>
          <button className="check-btn" onClick={onBack}>Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <ProgressBar current={idx + 1} total={exercises.length} />
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Inferencias</span>
      </div>

      <div className="game-area" style={{ gap: '20px' }}>
        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Lee y elige la respuesta'
            : 'Lee la situación y elige la mejor respuesta'}
        </p>

        <div style={{ background: 'white', borderRadius: '18px', padding: '20px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          {current.emoji && (
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>{current.emoji}</div>
          )}
          <p style={{ fontSize: '16px', color: 'var(--text)', lineHeight: '1.6', marginBottom: '12px' }}>
            {current.situation}
          </p>
          <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--purple)' }}>
            {current.question}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '400px' }}>
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
                style={{ padding: '14px 20px', background: bg, border, borderRadius: '14px', cursor: answered ? 'default' : 'pointer', fontSize: '15px', fontWeight: '600', color, transition: noAnim ? 'none' : 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', textAlign: 'left' }}
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

export default PragmaticScreen
