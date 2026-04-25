import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback, playVoiceFeedback } from '../utils/audioFeedback'
import { getDifficultyForActivity } from '../utils/componentMap'
import ActivityScreen from '../components/ActivityScreen'

function NarrativeScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const contentData = getContent(patient.levelId)
  const difficulty = getDifficultyForActivity('narrative', patient.componentLevels)
  const _stories = contentData.narrativeSequences?.[difficulty] ?? contentData.narrativeSequences?.inicial ?? []
  const n = estimulusSettings.exerciseCount?.['narrative'] ?? 12
  const stories = _stories.slice(0, n)

  const [idx, setIdx] = useState(0)
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showNext, setShowNext] = useState(false)
  const nextAction = useRef(null)

  const story = stories[idx]

  useEffect(() => {
    if (!story) return
    const shuffled = story.frames
      .map((frame, i) => ({ ...frame, originalIndex: i }))
      .sort(() => Math.random() - 0.5)
    setCards(shuffled)
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
    setShowNext(false)
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
    const finalScore = isCorrect ? score + 1 : score
    nextAction.current = () => {
      if (idx + 1 >= stories.length) onFinish(finalScore, stories.length)
      else setIdx(i => i + 1)
    }
    playFeedback(isCorrect ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    playVoiceFeedback(isCorrect, estimulusSettings?.voiceFeedback ?? true)
    setTimeout(() => {
      setFeedback({
        type: isCorrect ? 'correct' : 'wrong',
        text: isCorrect ? '¡Muy bien! Ordenaste la historia 🎉' : 'Casi... el orden correcto era diferente.',
      })
      setTimeout(() => setShowNext(true), 800)
    }, 1000)
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
    <ActivityScreen
      title="Ordenar Historia"
      componentType="morfosintactico"
      current={idx + 1}
      total={stories.length}
      onBack={onBack}
      stimulusKey={idx}
      stimulus={
        <>
          <div className="word-target">
            <div className="word-target-label">📖 {story.title}</div>
          </div>
          <p className="instruction" style={{ fontSize: instrSize }}>
            {estimulusSettings.simplifiedInstructions
              ? 'Toca dos tarjetas para cambiarlas de lugar'
              : 'Toca una tarjeta para seleccionarla y luego toca otra para intercambiarlas. Ordena la historia.'}
          </p>
        </>
      }
      response={
        <div className="narrative-grid">
          {cards.map((card, i) => {
            let cls = 'narrative-card'
            if (selected === i) cls += ' selected'
            if (answered && card.originalIndex === story.correctOrder[i]) cls += ' correct'
            return (
              <div key={i} className={cls} onClick={() => handleCardClick(i)}>
                <span className="narrative-num">{i + 1}</span>
                <span className="narrative-emoji">{card.emoji}</span>
                <p className="narrative-text">{card.text}</p>
              </div>
            )
          })}
        </div>
      }
      feedback={feedback && (
        <div className={`feedback-banner ${feedback.type}`}>{feedback.text}</div>
      )}
      action={
        showNext
          ? <button className="check-btn" onClick={() => nextAction.current?.()}>Siguiente →</button>
          : <div style={{ display: 'flex', gap: '10px' }}>
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
      }
    />
  )
}

export default NarrativeScreen
