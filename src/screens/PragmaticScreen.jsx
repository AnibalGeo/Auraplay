import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback } from '../utils/audioFeedback'
import { getDifficultyForActivity } from '../utils/componentMap'

function PragmaticScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const contentData = getContent(patient.levelId)
  const difficulty = getDifficultyForActivity('pragmatic', patient.componentLevels)
  const _exercises = contentData.inferences?.[difficulty] ?? contentData.inferences?.inicial ?? []
  const n = estimulusSettings.exerciseCount?.['pragmatic'] ?? 12
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
        text: correct ? '¡Muy bien! Entendiste la situación ✨' : `La respuesta era "${current.correct}".`,
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
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h2 className="activity-title">Inferencias</h2>
        <span style={{fontSize:13,color:'#999'}}>{idx+1} / {exercises.length}</span>
      </div>
      <div className="progress-track-thin">
        <div className="progress-fill-thin" style={{width:`${(idx/exercises.length)*100}%`,background:'#e8a020'}}/>
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

        {showNext && (
          <button className="check-btn" onClick={() => nextAction.current?.()}>Siguiente →</button>
        )}

      </div>
    </div>
  )
}

export default PragmaticScreen
