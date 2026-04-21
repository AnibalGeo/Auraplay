import { useState, useEffect, useRef } from 'react'
import { usePatient } from '../context/PatientContext'
import { getContent } from '../data/getContent'
import { playFeedback, playVoiceFeedback } from '../utils/audioFeedback'
import { getDifficultyForActivity } from '../utils/componentMap'

function speak(text, rate = 0.82) {
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'es-ES'
  u.rate = rate
  u.pitch = 1.05
  synth.speak(u)
}

function SemanticScreen({ onFinish, onBack }) {
  const { patient, level, estimulusSettings } = usePatient()
  const contentData = getContent(patient.levelId)
  const difficulty = getDifficultyForActivity('semantic', patient.componentLevels)

  const opposites = contentData.opposites?.[difficulty] ?? contentData.opposites?.inicial ?? []
  const definitions = contentData.definitions?.[difficulty] ?? contentData.definitions?.inicial ?? []

  const _allExercises = [
    ...opposites.map(o => ({ type: 'opposite', data: o })),
    ...definitions.map(d => ({ type: 'definition', data: d })),
  ]
  const n = estimulusSettings.exerciseCount?.['semantic'] ?? 12
  const allExercises = _allExercises.slice(0, n)

  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [options, setOptions] = useState([])
  const [showNext, setShowNext] = useState(false)
  const nextAction = useRef(null)

  const current = allExercises[idx]

  useEffect(() => {
    if (!current) return
    setSelected(null)
    setFeedback(null)
    setAnswered(false)
    setShowNext(false)

    if (current.type === 'opposite') {
      const correct = { word: current.data.opposite, emoji: current.data.oppositeEmoji }
      const wrong = opposites
        .filter(o => o.opposite !== current.data.opposite)
        .map(o => ({ word: o.opposite, emoji: o.oppositeEmoji }))
      const pool = estimulusSettings.reducedOptions
        ? [correct, wrong[0]].filter(Boolean)
        : [correct, ...wrong.slice(0, 2)]
      setOptions(pool.sort(() => Math.random() - 0.5))
    }

    if (current.type === 'definition') {
      const all = [...current.data.options].sort(() => Math.random() - 0.5)
      if (estimulusSettings.reducedOptions) {
        const correct = all.find(o => o === current.data.correct || o.word === current.data.correct)
        const other = all.find(o => o !== correct)
        setOptions([correct, other].filter(Boolean).sort(() => Math.random() - 0.5))
      } else {
        setOptions(all)
      }
    }
  }, [idx])

  function handleAnswer(word) {
    if (answered) return
    speak(word)
    setAnswered(true)
    setSelected(word)
    const correct =
      current.type === 'opposite'
        ? word === current.data.opposite
        : word === current.data.correct
    const newScore = correct ? score + 1 : score
    if (correct) setScore(newScore)
    const correctWord = current.type === 'opposite' ? current.data.opposite : current.data.correct
    nextAction.current = () => {
      if (idx + 1 >= allExercises.length) onFinish(newScore, allExercises.length)
      else setIdx(i => i + 1)
    }
    playFeedback(correct ? 'correct' : 'wrong', estimulusSettings.animationsEnabled)
    playVoiceFeedback(correct, estimulusSettings?.voiceFeedback ?? true)
    setTimeout(() => {
      setFeedback({
        type: correct ? 'correct' : 'wrong',
        text: correct ? '¡Muy bien! ✨' : `Era: ${correctWord}`,
      })
      setTimeout(() => setShowNext(true), 800)
    }, 1000)
  }

  const noAnim = !estimulusSettings.animationsEnabled
  const whiteBg = !estimulusSettings.backgroundElements
  const instrSize = estimulusSettings.largerText ? '18px' : '15px'
  const gridCols = estimulusSettings.reducedOptions ? 2 : Math.min(options.length, 3)

  if (allExercises.length === 0) {
    return (
      <div className="screen">
        <div className="activity-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <span className="activity-title">Semántica</span>
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
        <h2 className="activity-title">Semántica</h2>
        <span style={{fontSize:13,color:'#999'}}>{idx+1} / {allExercises.length}</span>
      </div>
      <div className="progress-track-thin">
        <div className="progress-fill-thin" style={{width:`${(idx/allExercises.length)*100}%`,background:'#7c6bb0'}}/>
      </div>

      <div className="game-area" style={{ gap: '20px' }}>

        {current.type === 'opposite' && (
          <>
            <p className="instruction" style={{ fontSize: instrSize }}>
              {estimulusSettings.simplifiedInstructions ? '¿Cuál es el contrario?' : '¿Cuál es el contrario de esta palabra?'}
            </p>
            <div style={{ background: 'white', borderRadius: '18px', padding: '20px 28px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', textAlign: 'center', position: 'relative' }}>
              <span style={{ fontSize: '52px', display: 'block', marginBottom: '8px' }}>{current.data.emoji}</span>
              <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', letterSpacing: '1px' }}>
                {current.data.word}
              </span>
              <button
                onClick={() => speak(current.data.word)}
                style={{ position: 'absolute', top: '10px', right: '12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1 }}
              >🔊</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '12px', width: '100%', maxWidth: '380px' }}>
              {options.map(opt => {
                let border = '3px solid transparent'
                let bg = 'white'
                if (selected === opt.word) {
                  border = opt.word === current.data.opposite ? '3px solid var(--teal)' : '3px solid var(--coral)'
                  bg = opt.word === current.data.opposite ? '#f0faf6' : '#fef4f2'
                } else if (answered && opt.word === current.data.opposite) {
                  border = '3px solid var(--teal)'; bg = '#f0faf6'
                }
                return (
                  <div key={opt.word} onClick={() => handleAnswer(opt.word)} style={{ background: bg, borderRadius: '16px', padding: '16px 8px', textAlign: 'center', cursor: answered ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border, transition: noAnim ? 'none' : 'all 0.2s', position: 'relative' }}>
                    <button
                      onClick={e => { e.stopPropagation(); speak(opt.word) }}
                      style={{ position: 'absolute', top: '6px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', padding: '2px', lineHeight: 1 }}
                    >🔊</button>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '4px' }}>{opt.emoji}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{opt.word}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {current.type === 'definition' && (
          <>
            <p className="instruction" style={{ fontSize: instrSize }}>
              {estimulusSettings.simplifiedInstructions ? 'Escucha y elige' : 'Escucha la descripción y elige la imagen correcta'}
            </p>
            <div style={{ background: 'white', borderRadius: '18px', padding: '18px 24px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', color: 'var(--text)', lineHeight: '1.6', fontStyle: 'italic' }}>
                "{current.data.definition}"
              </p>
              <button
                onClick={() => speak(current.data.definition)}
                style={{ marginTop: '10px', background: 'var(--mint)', border: '2px solid var(--mint2)', borderRadius: '10px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', color: 'var(--teal-dark)', fontWeight: '600' }}
              >
                🔊 Escuchar
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: '12px', width: '100%', maxWidth: '380px' }}>
              {options.map(opt => {
                const word = typeof opt === 'string' ? opt : opt.word
                let border = '3px solid transparent'
                let bg = 'white'
                if (selected === word) {
                  border = word === current.data.correct ? '3px solid var(--teal)' : '3px solid var(--coral)'
                  bg = word === current.data.correct ? '#f0faf6' : '#fef4f2'
                } else if (answered && word === current.data.correct) {
                  border = '3px solid var(--teal)'; bg = '#f0faf6'
                }
                return (
                  <div key={word} onClick={() => handleAnswer(word)} style={{ background: bg, borderRadius: '16px', padding: '16px 8px', textAlign: 'center', cursor: answered ? 'default' : 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', border, transition: noAnim ? 'none' : 'all 0.2s' }}>
                    <span style={{ fontSize: '32px', display: 'block', marginBottom: '4px' }}>{opt.emoji}</span>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>{word}</span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {feedback && (
          <div className={`feedback-banner ${feedback.type}`}>{feedback.text}</div>
        )}

        {showNext && (
          <button className="check-btn" onClick={() => nextAction.current?.()}>Siguiente →</button>
        )}

      </div>
    </div>
  )
}

export default SemanticScreen
