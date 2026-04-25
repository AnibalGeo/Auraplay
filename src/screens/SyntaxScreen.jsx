import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback, playVoiceFeedback } from '../utils/audioFeedback'
import { getDifficultyForActivity } from '../utils/componentMap'
import ActivityScreen from '../components/ActivityScreen'

function SyntaxScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const contentData = getContent(patient.levelId)
  const difficulty = getDifficultyForActivity('syntax', patient.componentLevels)
  const _exercises = contentData.connectors?.[difficulty] ?? contentData.connectors?.inicial ?? []
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
    playVoiceFeedback(correct, estimulusSettings?.voiceFeedback ?? true)
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
    <ActivityScreen
      title="Completar Frases"
      componentType="morfosintactico"
      current={idx + 1}
      total={exercises.length}
      onBack={onBack}
      stimulusKey={idx}
      stimulus={
        <>
          <p className="instruction" style={{ fontSize: instrSize }}>
            {estimulusSettings.simplifiedInstructions
              ? 'Elige la palabra correcta'
              : 'Elige la palabra que completa mejor la oración'}
          </p>
          <div className="prompt-card">
            <p className="syntax-sentence">
              {parts[0]}
              <span className="syntax-blank">{selected || '___'}</span>
              {parts[1]}
            </p>
          </div>
        </>
      }
      response={
        <div className="connector-options">
          {visibleOptions.map(option => {
            let cls = 'connector-opt'
            if (selected === option) {
              cls += option === current.correct ? ' correct' : ' wrong'
            } else if (answered && option === current.correct) {
              cls += ' correct'
            }
            return (
              <button key={option} className={cls} onClick={() => handleAnswer(option)}>
                {option}
              </button>
            )
          })}
        </div>
      }
      feedback={feedback && (
        <div className={`feedback-banner ${feedback.type}`} style={{ maxWidth: '400px', lineHeight: '1.5' }}>
          {feedback.text}
        </div>
      )}
      action={showNext && (
        <button className="check-btn" onClick={() => nextAction.current?.()}>Siguiente →</button>
      )}
    />
  )
}

export default SyntaxScreen
