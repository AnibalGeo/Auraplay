import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback } from '../utils/audioFeedback'
import { getDifficultyForActivity } from '../utils/componentMap'

function speak(text, rate = 0.82, pitch = 1.05) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = rate
  u.pitch = pitch
  synth.speak(u)
}

function MinimalPairsScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const contentData = getContent(patient.levelId)
  const difficulty = getDifficultyForActivity('minimal-pairs', patient.componentLevels)
  const _pairs = contentData.minimalPairs?.[difficulty] ?? contentData.minimalPairs?.inicial ?? []
  const n = estimulusSettings.exerciseCount?.['minimal-pairs'] ?? 12
  const pairs = _pairs.slice(0, n)
  const exposureMs = estimulusSettings.slideTransitionDelay ?? 1500

  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [choices, setChoices] = useState([])
  const [showNext, setShowNext] = useState(false)
  const nextAction = useRef(null)

  const current = pairs[idx]

  useEffect(() => {
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    setShowNext(false)
    // MinimalPairs siempre son 2 opciones — reducedOptions no cambia nada aquí
    const shuffled = [pairs[idx], pairs[idx].distractor].sort(() => Math.random() - 0.5)
    setChoices(shuffled)
  }, [idx])

  function handlePlay() {
    speak(current.word, estimulusSettings.simultaneousAudioVisual ? 0.82 : 0.7)
  }

  function handleAnswer(word) {
    if (answered) return
    speak(word)
    setAnswered(true)
    setSelected(word)
    const correct = word === current.word
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)
    nextAction.current = () => {
      if (idx + 1 >= pairs.length) onFinish(newScore, pairs.length)
      else setIdx(i => i + 1)
    }
    playFeedback(correct ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    setTimeout(() => {
      setFeedback({
        type: correct ? 'correct' : 'wrong',
        text: correct ? '¡Muy bien! ✨' : `La palabra era: ${current.word}`,
      })
      setTimeout(() => setShowNext(true), 800)
    }, 1000)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'

  if (pairs.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Palabras Similares</span>
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
        <span className="activity-title">Palabras Similares</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '500' }}>{level.label}</span>
          <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: '600' }}>{idx + 1} de {pairs.length}</span>
        </div>
      </div>

      <div className="game-area">
        <p className="instruction" style={{ fontSize: instrSize }}>
          {estimulusSettings.simplifiedInstructions
            ? 'Escucha. ¿Cuál es la palabra?'
            : estimulusSettings.simultaneousAudioVisual
              ? 'Toca ▶ y escucha con atención. ¿Cuál de estas palabras escuchas?'
              : 'Primero mira las imágenes. Luego toca ▶ y escucha con atención.'}
        </p>

        <button className="play-btn" onClick={handlePlay}>▶</button>

        <div className="word-choices">
          {choices.map(choice => {
            let cardClass = 'word-card'
            if (selected === choice.word) {
              cardClass += choice.word === current.word ? ' correct' : ' wrong'
            } else if (selected && choice.word === current.word) {
              cardClass += ' correct'
            }
            return (
              <div key={choice.word} className={cardClass} onClick={() => handleAnswer(choice.word)}>
                <span className="word-emoji">{choice.emoji}</span>
                <span className="word-text">{choice.word}</span>
              </div>
            )
          })}
        </div>

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>
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

export default MinimalPairsScreen
