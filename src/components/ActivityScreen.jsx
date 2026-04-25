/**
 * ActivityScreen.jsx
 * Marco visual unificado para TODAS las pantallas de actividad clínica.
 *
 * Estructura fija (Framework):
 *   ┌─────────────────────────────┐
 *   │  Header sticky (tema activo) │
 *   │  [← volver]  Título  [📊]   │
 *   │  ▓▓▓▓▓▓░░░░░ barra          │
 *   ├─────────────────────────────┤
 *   │  ÁREA DE ESTÍMULO (arriba)  │  ← prompt-card, emoji, audio
 *   ├─────────────────────────────┤
 *   │  ÁREA DE RESPUESTA (centro) │  ← opciones, inputs, grids
 *   ├─────────────────────────────┤
 *   │  FEEDBACK + ACCIÓN (abajo)  │  ← banner + check-btn
 *   └─────────────────────────────┘
 *
 * Movimiento predecible (anclaje cognitivo para TEA/TEL):
 *   - Estímulo entra desde la derecha, sale por la izquierda
 *   - Feedback aparece desde abajo (no interrumpe estímulo)
 *   - Check-btn siempre en la misma posición absoluta
 *
 * Uso:
 *   import ActivityScreen from '../components/ActivityScreen'
 *
 *   export default function MinimalPairsScreen({ onBack, onNavigate }) {
 *     return (
 *       <ActivityScreen
 *         title="Palabras similares"
 *         componentType="fonologico"
 *         current={idx + 1}
 *         total={exercises.length}
 *         onBack={onBack}
 *         stimulus={<PromptCard ... />}
 *         response={<WordChoices ... />}
 *         feedback={feedback && <FeedbackBanner ... />}
 *         action={
 *           <button className="check-btn" onClick={handleNext}>
 *             Siguiente →
 *           </button>
 *         }
 *       />
 *     )
 *   }
 */

import { useEffect, useRef, useState } from 'react'
import ThemeManager, { useThemeColors } from './ThemeManager'

// Animación de transición del estímulo (CSS-only, sin Framer Motion)
const SLIDE_CSS = `
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(28px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutLeft {
  from { opacity: 1; transform: translateX(0); }
  to   { opacity: 0; transform: translateX(-28px); }
}
.stimulus-enter { animation: slideInRight 280ms cubic-bezier(0.16,1,0.3,1) both; }
.stimulus-exit  { animation: slideOutLeft 200ms cubic-bezier(0.7,0,1,1) both; }
`

/**
 * ActivityScreen — componente orquestador
 *
 * @param {object} props
 * @param {string}  props.title           - Título en el header
 * @param {string}  props.componentType   - tema clínico ('fonologico', etc.)
 * @param {string}  [props.activityId]    - alternativa a componentType para inferencia
 * @param {number}  props.current         - ejercicio actual (1-based)
 * @param {number}  props.total           - total de ejercicios
 * @param {func}    props.onBack          - handler del botón volver
 * @param {node}    props.stimulus        - área de estímulo (arriba)
 * @param {node}    props.response        - área de respuesta (centro)
 * @param {node}    [props.feedback]      - feedback condicional (aparece/desaparece)
 * @param {node}    props.action          - botón de acción (abajo)
 * @param {bool}    [props.stimulusKey]   - key para resetear la animación del estímulo
 */
export default function ActivityScreen({
  title,
  componentType,
  activityId,
  current = 1,
  total = 1,
  onBack,
  stimulus,
  response,
  feedback,
  action,
  stimulusKey,
}) {
  const colors = useThemeColors(componentType)
  const progress = Math.min((current / total) * 100, 100)
  const [animKey, setAnimKey] = useState(0)

  // Re-anima el estímulo al cambiar de ejercicio
  useEffect(() => {
    setAnimKey(k => k + 1)
  }, [stimulusKey, current])

  return (
    <ThemeManager componentType={componentType} activityId={activityId}>
      {/* Estilos de animación — inline para no depender de bundler */}
      <style>{SLIDE_CSS}</style>

      <div className="screen" style={{ background: '#f8faf9' }}>

        {/* ── Header sticky ── */}
        <div className="activity-header">
          <button className="back-btn" onClick={onBack} aria-label="Volver">
            ‹
          </button>
          <div style={{ flex: 1 }}>
            <div className="activity-title">{title}</div>
            <div style={{ fontSize: 11, color: colors.dark, fontWeight: 600, opacity: 0.7, marginTop: 1 }}>
              {current} / {total}
            </div>
          </div>
        </div>

        {/* ── Barra de progreso ── */}
        <div className="progress-track-thin">
          <div
            className="progress-fill-thin"
            style={{ width: `${progress}%`, background: colors.main }}
          />
        </div>

        {/* ── Game area ── */}
        <div className="game-area">

          {/* ÁREA DE ESTÍMULO — entra desde la derecha */}
          <div
            key={animKey}
            className="stimulus-enter"
            style={{ width: '100%' }}
          >
            {stimulus}
          </div>

          {/* ÁREA DE RESPUESTA — siempre visible, sin animación */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {response}
          </div>

          {/* FEEDBACK — aparece desde abajo */}
          {feedback && (
            <div
              className="anim-slide-up"
              style={{ width: '100%' }}
            >
              {feedback}
            </div>
          )}

          {/* Spacer para empujar el action al fondo */}
          <div style={{ flex: 1 }} />

          {/* ÁREA DE ACCIÓN — siempre abajo */}
          <div style={{ width: '100%' }}>
            {action}
          </div>

        </div>
      </div>
    </ThemeManager>
  )
}

/**
 * SuccessFeedback — feedback periférico para niños con TEA
 * Anima el borde de la pantalla en lugar de un pop-up.
 * No interrumpe el flujo visual central.
 *
 * @param {bool}   show     - true para mostrar el flash
 * @param {string} [theme]  - componentType para el color
 */
export function SuccessFeedback({ show, theme }) {
  const colors = useThemeColors(theme)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!show) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [show])

  if (!visible) return null

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        borderRadius: 0,
        border: `3px solid ${colors.main}`,
        pointerEvents: 'none',
        zIndex: 999,
        animation: 'successRing 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    />
  )
}

/**
 * Ejemplo completo de migración:
 *
 * ANTES (MinimalPairsScreen.jsx):
 * ─────────────────────────────────
 * return (
 *   <div className="screen">
 *     <div className="activity-header">
 *       <button className="back-btn" onClick={onBack}>‹</button>
 *       <span className="activity-title">Palabras similares</span>
 *     </div>
 *     <div className="progress-track-thin">
 *       <div className="progress-fill-thin" style={{ width: `${pct}%`, background: '#4aab8a' }} />
 *     </div>
 *     <div className="game-area">
 *       ... contenido ...
 *     </div>
 *   </div>
 * )
 *
 * DESPUÉS:
 * ─────────────────────────────────
 * import ActivityScreen from '../components/ActivityScreen'
 *
 * return (
 *   <ActivityScreen
 *     title="Palabras similares"
 *     componentType="fonologico"
 *     current={idx + 1}
 *     total={exercises.length}
 *     onBack={onBack}
 *     stimulusKey={idx}
 *     stimulus={
 *       <div className="prompt-card">
 *         <span className="prompt-emoji">{exercise.emoji}</span>
 *         <span className="prompt-word">{exercise.word}</span>
 *         <button className="play-btn" onClick={playAudio}>🔊</button>
 *       </div>
 *     }
 *     response={
 *       <div className="word-choices">
 *         {options.map(opt => (
 *           <div key={opt} className={`word-card ${selected === opt ? 'correct' : ''}`}
 *             onClick={() => handleSelect(opt)}>
 *             <span className="word-emoji">{opt.emoji}</span>
 *             <span className="word-text">{opt.word}</span>
 *           </div>
 *         ))}
 *       </div>
 *     }
 *     feedback={
 *       feedback && (
 *         <div className={`feedback-banner ${feedback}`}>
 *           {feedback === 'correct' ? '¡Muy bien! 🌟' : 'Inténtalo de nuevo'}
 *         </div>
 *       )
 *     }
 *     action={
 *       <button className="check-btn" onClick={handleNext} disabled={!selected}>
 *         {idx + 1 < exercises.length ? 'Siguiente →' : 'Ver resultado'}
 *       </button>
 *     }
 *   />
 * )
 */
