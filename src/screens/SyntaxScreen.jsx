import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback } from '../utils/audioFeedback'

function SyntaxScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const _exercises = getContent(patient.levelId).connectors ?? []
  const n = estimulusSettings.exerciseCount?.['syntax'] ?? 12
  const exercises = _exercises.slice(0, n)

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [shuffledOptions, setShuffledOptions] = useState([])
  const [showNext, setShowNext] = useState(false)
  const nextAction = useRef(null)

  const current = exercises[idx]
  const exposureMs = estimulusSettings.slideTransitionDelay ?? 1500

  useEffect(() => {
    if (!current) return
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
    setShowNext(false)
    setShuffledOptions([...current.options].sort(() => Math.random() - 0.5))
  }, [idx])

  function handleAnswer(option) {
    if (answered) return
    setAnswered(true)
    setSelected(option)
    const correct = option === current.correct
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)
    nextAction.current = () => {
      if (idx + 1 >= exercises.length) onFinish(newScore, exercises.length)
      else setIdx(i => i + 1)
    }
    playFeedback(correct ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    setTimeout(() => {
      setFeedback({
        type: correct ? 'correct' : 'wrong',
        text: correct
          ? `¡Correcto! ✨ ${current.explanation}`
          : `La respuesta era "${current.correct}". ${current.explanation}`,
      })
      setTimeout(() => setShowNext(true), 800)
    }, 1000)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'

  // Max 2 opciones si reducedOptions, garantizando que la correcta esté incluida
  const visibleOptions = estimulusSettings.reducedOptions
    ? (() => {
        const wrong = shuffledOptions.find(o => o !== current?.correct)
        return shuffledOptions.filter(o => o === current?.correct || o === wrong)
      })()
    : shuffledOptions

  const parts = current?.sentence.split('___') ?? ['', '']

  if (exercises.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Completar Frases</span>
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
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Completar Frases</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>{level.label}</span>
          <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: '600' }}>{idx + 1} de {exercises.length}</span>
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

        {showNext && (
          <button className="check-btn" onClick={() => nextAction.current?.()}>Siguiente →</button>
        )}

      </div>
    </div>
  )
}

export default SyntaxScreen
