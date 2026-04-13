import { useState, useEffect } from 'react'
import { usePatient } from '../context/PatientContext'

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
  const { level, estimulusSettings } = usePatient()
  const pairs = level.fonologia.minimalPairs
  const exposureMs = estimulusSettings.extendedExposureTime ? 3500 : 2000

  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [choices, setChoices] = useState([])

  const current = pairs[idx]

  useEffect(() => {
    setAnswered(false)
    setSelected(null)
    setFeedback(null)
    // MinimalPairs siempre son 2 opciones — reducedOptions no cambia nada aquí
    const shuffled = [pairs[idx], pairs[idx].distractor].sort(() => Math.random() - 0.5)
    setChoices(shuffled)
  }, [idx])

  function handlePlay() {
    speak(current.word, estimulusSettings.simultaneousAudioVisual ? 0.82 : 0.7)
  }

  function handleAnswer(word) {
    if (answered) return
    setAnswered(true)
    setSelected(word)
    const correct = word === current.word
    const newScore = correct ? score + 1 : score
    if (correct) {
      setScore(newScore)
      setFeedback({ type: 'correct', text: '¡Muy bien! ✨' })
    } else {
      setFeedback({ type: 'wrong', text: `La palabra era: ${current.word}` })
    }
    setTimeout(() => {
      if (idx + 1 >= pairs.length) {
        onFinish(newScore, pairs.length)
      } else {
        setIdx(i => i + 1)
      }
    }, exposureMs)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'

  return (
    <div className={`screen${noAnim ? ' no-anim' : ''}`} style={whiteBg ? { background: 'white' } : undefined}>
      <div className="activity-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span className="activity-title">Palabras Similares</span>
        <div className="progress-dots">
          {pairs.map((_, i) => (
            <div key={i} className={`dot ${i < idx ? 'done' : i === idx ? 'current' : ''}`} />
          ))}
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

        <div style={{ fontSize: '11px', color: 'var(--text2)', textAlign: 'center', marginTop: '8px' }}>
          {level.label} · {level.ageRange}
        </div>
      </div>
    </div>
  )
}

export default MinimalPairsScreen
